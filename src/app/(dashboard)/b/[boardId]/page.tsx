"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  CollisionDetection,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { toast } from "sonner";

// Các thành phần giao diện (UI Components)
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { ColumnComponent } from "@/components/board/column";
import { TaskCard } from "@/components/board/taskCard";
import { EmptyColumnComponent } from "@/components/board/EmptyColumnComponent";

// Custom Hooks & Global Stores
import { useBoardDetail } from "@/hooks/useBoard";
import { useMoveTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { useBoardSocket } from "@/hooks/useBoardSocket";

// Khai báo kiểu dữ liệu (Types)
import { Column, Task, ColumnLockType } from "@/types/column";

export default function BoardDetailPage() {
  // 1. LẤY DỮ LIỆU TỪ GLOBAL STORES (Zustand & Auth)
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const user = useAuthStore((state) => state.user);
  const socket = useSocket();

  // 2. KẾT NỐI API BẰNG TANSTACK QUERY HOOKS
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { data: boardDetail, isLoading } = useBoardDetail(activeBoardId ?? "");

  // 3. QUẢN LÝ TRẠNG THÁI LOCAL (State dùng cho Kéo thả DnD-Kit)
  const [columns, setColumns] = useState<Column[]>([]); // Lưu danh sách các Cột và Task đang hiển thị
  const [activeColumn, setActiveColumn] = useState<Column | null>(null); // Cột đang được giữ/kéo
  const [activeTask, setActiveTask] = useState<Task | null>(null); // Task đang được giữ/kéo
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null); // Cột ban đầu của Task trước khi kéo
  const [isMounted, setIsMounted] = useState(false); // Đánh dấu Client-side đã sẵn sàng (ngừa lỗi SSR Hydration)

  // ----------------------------------------------------------------------------------
  // 4. LẮNG NGHE SOCKET REALTIME (Cập nhật giao diện tức thì khi người khác thao tác)
  // ----------------------------------------------------------------------------------
  const isDragging = Boolean(activeTask || activeColumn);

  /**
   * [VÍ DỤ VỀ REALTIME SOCKET]:
   * Bạn A và Bạn B cùng mở 1 Board.
   * - Bạn A kéo Task 1 từ "Cần làm" sang "Đã xong".
   * - Socket phát đi sự kiện `move-task`.
   * - Custom hook `useBoardSocket` của Bạn B nhận được dữ liệu và cập nhật trực tiếp `setColumns`,
   *   giúp màn hình Bạn B tự dịch chuyển Task 1 sang "Đã xong" ngay lập tức mà KHÔNG cần F5.
   * - `isDragging` truyền vào để chặn Socket ghi đè làm giật thẻ khi Bạn B CŨNG đang giữ chuột kéo thẻ khác.
   */
  useBoardSocket({ socket, activeBoardId, setColumns, isDragging });

  // 5. KIỂM TRA QUYỀN HẠN CỦA USER (ADMIN / LEADER)
  const isOwn = useMemo(() => {
    if (!boardDetail?.members || !user?.id) return false;
    return boardDetail.members.some(
      (m) => m.user?.id === user.id && (m.role === "ADMIN" || m.role === "LEADER"),
    );
  }, [boardDetail, user]);

  // Lấy ra danh sách các ID của cột để truyền vào SortableContext của DnD-Kit
  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  // ----------------------------------------------------------------------------------
  // 6. ĐỒNG BỘ DỮ LIỆU TỪ SERVERS (TanStack Query) VÀO STATE LOCAL
  // ----------------------------------------------------------------------------------
  /**
   * [ĐOẠN NÀY LẮNG NGHE DỮ LIỆU TỪ SERVER]:
   * Lắng nghe biến `boardDetail`. Khi TanStack Query refetch dữ liệu mới (hoặc khi đổi Board),
   * hàm `setColumns` sẽ chèn toàn bộ danh sách Cột/Task mới nhất vào State local để DnD-Kit vẽ lại.
   */
  useEffect(() => {
    if (boardDetail?.columns) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);

  // Đánh dấu component đã mounted trên trình duyệt (Xử lý React Portal)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // ----------------------------------------------------------------------------------
  // 7. CẤU HÌNH SENSORS (Cảm biến kéo thả của DnD-Kit)
  // ----------------------------------------------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Yêu cầu con trỏ chuột di chuyển ít nhất 8px mới tính là "Kéo" (Tránh bị nhầm khi chỉ Click chuột)
      activationConstraint: { distance: 8 },
    }),
  );

  // 8. THUẬT TOÁN PHÁT HIỆN VA CHẠM (Custom Collision Detection)
  // Giúp phát hiện chính xác con trỏ chuột đang nằm trên Cột nào hay Task nào
  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (activeColumn) return rectIntersection(args);

      const pointerCollisions = pointerWithin(args);
      if (!pointerCollisions.length) return [];

      const firstCollision = getFirstCollision(pointerCollisions, "id");
      return firstCollision ? pointerCollisions : rectIntersection(args);
    },
    [activeColumn],
  );

  // ----------------------------------------------------------------------------------
  // 9. BẮT ĐẦU KÉO (Drag Start)
  // ----------------------------------------------------------------------------------
  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { current } = event.active.data;

      // Xử lý khi đối tượng bắt đầu kéo là TASK
      if (current?.type === "TASK") {
        const task = current.task as Task;
        const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === task.id));

        // Kiểm tra 1: Cột chứa Task có bị khóa không?
        if (sourceColumn) {
          const isSourceLocked =
            sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if (isSourceLocked && !isOwn) {
            toast.error("Cột này đã bị khóa. Bạn không thể di chuyển thẻ ra ngoài!");
            setActiveTask(null);
            setSourceColumnId(null);
            return;
          }
          setSourceColumnId(sourceColumn.id);
        }

        // Kiểm tra 2: User có phải người phụ trách Task (Assignee) hoặc ADMIN không?
        if (task.assignee?.id !== user?.id && !isOwn) {
          toast.error("Bạn không có quyền di chuyển công việc này!");
          setActiveTask(null);
          setSourceColumnId(null);
          return;
        }

        setActiveTask(task); // Đặt Task vào trạng thái "Đang kéo" để hiện hiệu ứng nổi (Overlay)
      }

      // Xử lý khi đối tượng bắt đầu kéo là CỘT (COLUMN)
      if (current?.type === "COLUMN") {
        setActiveColumn(current.column);
      }
    },
    [columns, isOwn, user?.id],
  );

  // ----------------------------------------------------------------------------------
  // 10. TRONG LÚC ĐANG KÉO (Drag Over - Thay đổi vị trí tạm thời trên UI)
  // ----------------------------------------------------------------------------------
  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeTask) return; // Nếu bị khóa ở DragStart thì hủy ngay

      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      const isActiveTask = active.data.current?.type === "TASK";
      if (!isActiveTask) return;

      const isOverTask = over.data.current?.type === "TASK";
      const isOverColumn = over.data.current?.type === "COLUMN";

      // Cập nhật mảng State local `columns` ngay lập tức để người dùng thấy thẻ bay qua cột mới
      setColumns((prevCols) => {
        const activeColIndex = prevCols.findIndex((c) =>
          c.tasks?.some((t) => t.id === activeId),
        );
        let overColIndex = -1;

        if (isOverTask) {
          overColIndex = prevCols.findIndex((c) => c.tasks?.some((t) => t.id === overId));
        } else if (isOverColumn) {
          overColIndex = prevCols.findIndex((c) => c.id === overId);
        }

        if (activeColIndex === -1 || overColIndex === -1) return prevCols;

        // Kiểm tra Cột nguồn bị khóa
        const sourceCol = prevCols[activeColIndex];
        const isSourceLocked =
          sourceCol?.lock_type === ColumnLockType.FULLY_LOCKED ||
          sourceCol?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) return prevCols;

        // Kiểm tra Cột đích bị khóa -> Bỏ qua không cho rớt vào
        const targetColumn = prevCols[overColIndex];
        const isTargetLocked =
          targetColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
          targetColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (activeColIndex !== overColIndex && isTargetLocked && !isOwn) {
          return prevCols;
        }

        const activeTaskIndex = prevCols[activeColIndex].tasks.findIndex(
          (t) => t.id === activeId,
        );

        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        // Chuyển Task sang Cột khác
        if (activeColIndex !== overColIndex) {
          const [movedTask] = updatedCols[activeColIndex].tasks.splice(
            activeTaskIndex,
            1,
          );
          movedTask.columnId = targetColumn.id;

          const overTaskIndex = isOverTask
            ? updatedCols[overColIndex].tasks.findIndex((t) => t.id === overId)
            : updatedCols[overColIndex].tasks.length;

          updatedCols[overColIndex].tasks.splice(overTaskIndex, 0, movedTask);
        } else if (isOverTask) {
          // Sắp xếp lại thứ tự Task trong CÙNG MỘT CỘT
          const overTaskIndex = updatedCols[overColIndex].tasks.findIndex(
            (t) => t.id === overId,
          );
          updatedCols[activeColIndex].tasks = arrayMove(
            updatedCols[activeColIndex].tasks,
            activeTaskIndex,
            overTaskIndex,
          );
        }

        return updatedCols;
      });
    },
    [activeTask, isOwn],
  );

  // ----------------------------------------------------------------------------------
  // 11. THẢ CHUỘT / KẾT THÚC KÉO (Drag End - Tính toán position chuẩn & Lưu vào DB)
  // ----------------------------------------------------------------------------------
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const currentTask = activeTask;
      setActiveColumn(null); // Reset trạng thái thả
      setActiveTask(null);

      if (!over || !currentTask) {
        setSourceColumnId(null);
        return;
      }

      const activeId = active.id as string;
      const isActiveTask = active.data.current?.type === "TASK";

      if (isActiveTask) {
        const targetColumn = columns.find((col) =>
          col.tasks?.some((t) => t.id === activeId),
        );
        if (!targetColumn) {
          setSourceColumnId(null);
          return;
        }

        // Kiểm tra an toàn lần cuối
        if (sourceColumnId && sourceColumnId !== targetColumn.id) {
          const sourceColObj = columns.find((c) => c.id === sourceColumnId);
          const isSourceLocked =
            sourceColObj?.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColObj?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          const isTargetLocked =
            targetColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
            targetColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if ((isSourceLocked || isTargetLocked) && !isOwn) {
            setSourceColumnId(null);
            return;
          }
        }

        // ==============================================================================
        // THUẬT TOÁN TÍNH POSITION (SẮP XẾP CHUẨN TỪNG TẠO ĐỘ)
        // ==============================================================================
        /**
         * [VÍ DỤ CHI TIẾT CÁCH TÍNH POSITION]:
         * Giả sử Cột Đích đang có 2 Task:
         *   - Task A (position: 100)
         *   - Task B (position: 200)
         *
         * TH 1: Bạn kéo Task X vào CỘT TRỐNG:
         *   => gán newPosition = 100.0
         *
         * TH 2: Bạn kéo Task X lên ĐẦU DANH SÁCH (Đứng trước Task A):
         *   => newPosition = Task A / 2 = 100 / 2 = 50.0
         *
         * TH 3: Bạn kéo Task X xuống CUỐI DANH SÁCH (Đứng sau Task B):
         *   => newPosition = Task B + 100 = 200 + 100 = 300.0
         *
         * TH 4: Bạn chèn Task X vào GIỮA Task A và Task B:
         *   => newPosition = (Position A + Position B) / 2 = (100 + 200) / 2 = 150.0
         *
         * LỢI ÍCH: Với thuật toán này, khi di chuyển 1 Task, bạn CHỈ CẦN cập nhật position
         * cho ĐÚNG 1 TASK ĐÓ vào DB, thay vì phải ghi đè lại index của toàn bộ hàng trăm Task!
         */
        const taskList = targetColumn.tasks || [];
        const newIndex = taskList.findIndex((t) => t.id === activeId);

        if (newIndex === -1) {
          setSourceColumnId(null);
          return;
        }

        // Lọc danh sách loại bỏ chính Task đang kéo
        const destinationTasks = taskList.filter((t) => t.id !== activeId);

        let newPosition = 100.0;

        if (destinationTasks.length === 0) {
          newPosition = 100.0; // TH 1: Cột trống
        } else if (newIndex === 0) {
          newPosition = destinationTasks[0].position / 2; // TH 2: Chèn lên đầu
        } else if (newIndex >= destinationTasks.length) {
          newPosition = destinationTasks[destinationTasks.length - 1].position + 100.0; // TH 3: Chèn xuống cuối
        } else {
          const prevPos = destinationTasks[newIndex - 1].position;
          const nextPos = destinationTasks[newIndex].position;
          newPosition = (prevPos + nextPos) / 2; // TH 4: Chèn vào giữa
        }

        // Gán vị trí mới cho Task hiện tại
        taskList[newIndex].position = newPosition;

        // 1. Gọi API gửi vị trí mới xuống cơ sở dữ liệu
        moveTask({
          id: activeId,
          dto: { columnId: targetColumn.id, position: newPosition },
        });

        // 2. Phát tín hiệu Socket cho các client (người dùng khác) đồng bộ theo
        if (socket && activeBoardId) {
          socket.emit("move-task", {
            boardId: activeBoardId,
            activeId,
            columnId: targetColumn.id,
            position: newPosition,
          });
        }
      }

      // Kéo thả CỘT (COLUMN)
      if (active.data.current?.type === "COLUMN") {
        setColumns((prevCols) => {
          const activeColIndex = prevCols.findIndex((c) => c.id === activeId);
          const overColIndex = prevCols.findIndex((c) => c.id === over.id);
          const newCols = arrayMove(prevCols, activeColIndex, overColIndex);

          if (socket && activeBoardId) {
            socket.emit("move-column", {
              boardId: activeBoardId,
              columns: newCols,
            });
          }

          return newCols;
        });
      }

      setSourceColumnId(null);
    },
    [activeTask, columns, moveTask, socket, activeBoardId, sourceColumnId, isOwn],
  );

  // Giao diện khi đang tải dữ liệu API
  if (isLoading) return "loading";

  // Giao diện Skeleton khi ở Server-Side Rendering (tránh lệch giao diện khi Hydrate)
  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
        <Header />
        <BoardBar
          boardTitle={boardDetail?.title ?? ""}
          visibility={boardDetail?.visibility ?? "WORKSPACE"}
          members={[]}
          onOpenChat={() => {}}
          onOpenActivityLog={() => {}}
        />
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto items-start h-[calc(100vh-80px)]">
          <div className="w-80 h-96 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------------
  // 12. GIAO DIỆN CHÍNH (RENDER BOARD KANBAN)
  // ----------------------------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
      <Header />
      <BoardBar
        boardTitle={boardDetail?.title ?? ""}
        visibility={boardDetail?.visibility ?? "WORKSPACE"}
        members={[]}
        onOpenChat={() => {}}
        onOpenActivityLog={() => {}}
      />

      {/* Bọc toàn bộ khu vực Kanban vào DndContext để kích hoạt kéo thả */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto items-start h-[calc(100vh-80px)]">
          {/* Quản lý danh sách các cột có thể sắp xếp nằm ngang */}
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            {columns.length === 0 && <EmptyColumnComponent />}
            {columns.map((column) => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>

        {/* DragOverlay: Tạo ra một thẻ "bóng" bay theo con trỏ chuột trong lúc kéo */}
        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.5" } },
                }),
              }}>
              {activeColumn && <ColumnComponent column={activeColumn} isOverlay />}
              {activeTask && <TaskCard task={activeTask} isOverlay />}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
}
