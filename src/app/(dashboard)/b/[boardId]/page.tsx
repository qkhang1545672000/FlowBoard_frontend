"use client"; // Báo cho Next.js biết file này chạy ở phía người dùng (Browser) chứ không phải phía Máy chủ (Server)

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
// Lấy các công cụ kéo thả từ thư viện @dnd-kit
import {
  DndContext, // Khung quản lý toàn bộ việc kéo thả
  DragOverlay, // Tạo hình ảnh "bóng" (preview) di chuyển theo con chuột khi đang kéo
  PointerSensor, // Bắt sự kiện chuột/chạm
  useSensor,
  useSensors,
  DragStartEvent, // Kiểu dữ liệu sự kiện khi BẮT ĐẦU kéo
  DragOverEvent, // Kiểu dữ liệu sự kiện khi ĐANG RÊ chuột qua vị trí khác
  DragEndEvent, // Kiểu dữ liệu sự kiện khi THẢ chuột ra
  defaultDropAnimationSideEffects, // Hiệu ứng mượt mà khi thả vật thể vào vị trí
  CollisionDetection, // Kiểu dữ liệu thuật toán va chạm
  getFirstCollision, // Tìm điểm va chạm đầu tiên
  pointerWithin, // Kiểm tra con trỏ chuột nằm trong vùng nào
  rectIntersection, // Kiểm tra hình chữ nhật của vật kéo đè lên vùng nào
} from "@dnd-kit/core";
import {
  SortableContext, // Khung giúp sắp xếp thứ tự các phần tử (Cột hoặc Thẻ)
  arrayMove, // Hàm phụ trợ di chuyển phần tử từ vị trí A sang vị trí B trong Mảng
  horizontalListSortingStrategy, // Chiến lược sắp xếp các Cột theo chiều ngang
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom"; // Công cụ giúp vẽ giao diện "chui" ra ngoài body (dùng cho DragOverlay)
import { toast } from "sonner"; // Thư viện hiển thị thông báo bong bóng (Popup thông báo lỗi/thành công)

// Lấy các thành phần giao diện (UI)
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { ColumnComponent } from "@/components/board/column";
import { TaskCard } from "@/components/board/taskCard";
import { EmptyColumnComponent } from "@/components/board/EmptyColumnComponent";

// Lấy các móc (Hooks) và kho dữ liệu chung (Stores)
import { useBoardDetail } from "@/hooks/useBoard"; // Hook lấy chi tiết Bảng từ Server
import { useMoveTask } from "@/hooks/useTask"; // Hook gọi API lưu vị trí Thẻ mới vào Database
import { useBoardStore } from "@/store/useBoardStore"; // Kho lưu ID bảng đang chọn
import { useAuthStore } from "@/store/useAuthStore"; // Kho lưu thông tin Tài khoản đang đăng nhập
import { useSocket } from "@/hooks/useSocket"; // Hook kết nối Realtime (Socket.io)
import { useBoardSocket } from "@/hooks/useBoardSocket"; // Hook lắng nghe người khác di chuyển thẻ/cột

// Lấy các định nghĩa kiểu dữ liệu (Types)
import { Column, Task, ColumnLockType } from "@/types/column";
import { useBoardPermission } from "@/components/board/useBoardPermission";

export default function BoardDetailPage() {
  // --------------------------------------------------------------------------
  // 1. LẤY DỮ LIỆU TỪ KHO CHUNG (ZUSTAND & AUTH)
  // --------------------------------------------------------------------------
  // Lấy ID của bảng hiện tại (VD: "board-123")
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  // Lấy thông tin người dùng đang đăng nhập (VD: { id: "user-1", name: "Nam" })
  const user = useAuthStore((state) => state.user);
  // Lấy đối tượng socket để gửi tín hiệu trực tiếp sang máy người dùng khác
  const socket = useSocket();

  // --------------------------------------------------------------------------
  // 2. GỌI API LẤY DỮ LIỆU BẢNG & TẠO HÀM LƯU VỊ TRÍ
  // --------------------------------------------------------------------------
  // Hàm `moveTask` dùng để gửi request lưu vị trí thẻ mới xuống Database
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  // Lấy dữ liệu chi tiết của Bảng (Cột, Thẻ, Thành viên) và trạng thái đang tải (`isLoading`)
  const { data: boardDetail, isLoading } = useBoardDetail(activeBoardId ?? "");

  // --------------------------------------------------------------------------
  // 3. QUẢN LÝ TRẠNG THÁI NỘI BỘ (LOCAL STATE)
  // --------------------------------------------------------------------------
  // Danh sách các Cột (chứa các Thẻ) hiển thị trên màn hình
  const [columns, setColumns] = useState<Column[]>([]);
  // Cột đang được cầm kéo (nếu đang kéo Cột)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  // Thẻ đang được cầm kéo (nếu đang kéo Thẻ)
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // ID của Cột ban đầu chứa Thẻ trước khi người dùng đặt tay kéo
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  // Đánh dấu giao diện phía Client đã sẵn sàng (tránh lỗi lệch giao diện SSR của Next.js)
  const [isMounted, setIsMounted] = useState(false);

  // Dùng Ref làm "Công tắc khóa" chốt chặn: Khi đang gửi vị trí mới lên server,
  // không cho phép useEffect ghi đè dữ liệu cũ từ server về gây giật lag giao diện.
  const isUpdatingRef = useRef(false);

  // --------------------------------------------------------------------------
  // 4. KẾT NỐI REALTIME (SOCKET)
  // --------------------------------------------------------------------------
  // Đang kéo nếu đang cầm Thẻ hoặc đang cầm Cột
  const isDragging = Boolean(activeTask || activeColumn);

  // Lắng nghe người dùng khác kéo thả: Nếu có ai cập nhật, màn hình mình tự đổi theo
  useBoardSocket({ socket, activeBoardId, setColumns, isDragging });

  // --------------------------------------------------------------------------
  // 5. KIỂM TRA QUYỀN HẠN
  // --------------------------------------------------------------------------
  // Check xem tài khoản hiện tại có phải là ADMIN hoặc LEADER của Bảng này không
  const { isOwn } = useBoardPermission(activeBoardId ?? "");

  // Tạo mảng danh sách ID của các cột (VD: ["col-1", "col-2", "col-3"]) để đưa vào SortableContext
  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  // --------------------------------------------------------------------------
  // 6. ĐỒNG BỘ DỮ LIỆU TỪ SERVER VÀO STATE MÀN HÌNH
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Chỉ cập nhật từ Server nếu "Công tắc khóa" đang tắt (tức không trong lúc vừa kéo thả)
    if (boardDetail?.columns && !isUpdatingRef.current) {
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);

  // Đánh dấu component đã được render trên Trình duyệt
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // --------------------------------------------------------------------------
  // 7. CẤU HÌNH CẢM BIẾN (SENSORS)
  // --------------------------------------------------------------------------
  // Giúp phân biệt cú click chuột bình thường và hành động cố tình kéo.
  // Phải di chuyển chuột tối thiểu 8px thì mới tính là BẮT ĐẦU KÉO (tránh trót tay bấm nhầm)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // --------------------------------------------------------------------------
  // 8. THUẬT TOÁN PHÁT HIỆN VA CHẠM (COLLISION DETECTION)
  // --------------------------------------------------------------------------
  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      // Nếu đang kéo Cột -> Dùng thuật toán so sánh diện tích đè lên nhau (rectIntersection)
      if (activeColumn) return rectIntersection(args);

      // Nếu đang kéo Thẻ -> Ưu tiên dùng thuật toán con trỏ chuột đang nằm trong ô nào (pointerWithin)
      const pointerCollisions = pointerWithin(args);
      if (!pointerCollisions.length) return [];

      const firstCollision = getFirstCollision(pointerCollisions, "id");
      return firstCollision ? pointerCollisions : rectIntersection(args);
    },
    [activeColumn],
  );

  // --------------------------------------------------------------------------
  // 9. BẮT ĐẦU KÉO (Drag Start - Ngay khi vừa nhấc vật thể lên)
  // --------------------------------------------------------------------------
  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { current } = event.active.data; // Lấy dữ liệu đính kèm của vật thể vừa nhấc lên

      // --- TRƯỜNG HỢP 1: KÉO THẺ (TASK) ---
      if (current?.type === "TASK") {
        const task = current.task as Task;
        // Tìm Cột chứa Thẻ này
        const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === task.id));

        if (sourceColumn) {
          // CHẶN 1: Cột ban đầu bị KHÓA HOÀN TOÀN hoặc KHÓA 1 CHIỀU -> Người thường không thể kéo ra ngoài
          const isSourceLocked =
            sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if (isSourceLocked && !isOwn) {
            toast.error(
              "Thẻ nằm trong cột bị khóa. Bạn không thể di chuyển thẻ ra ngoài!",
            );
            setActiveTask(null);
            setSourceColumnId(null);
            return; // Dừng ngay, không cho kéo tiếp
          }
          // Lưu lại ID của cột xuất phát
          setSourceColumnId(sourceColumn.id);
        }

        // CHẶN 2: Thẻ này được phân công cho người khác (và người kéo không phải Admin/Leader)
        if (task.assignee?.id !== user?.id && !isOwn) {
          toast.error("Bạn không có quyền di chuyển công việc này!");
          setActiveTask(null);
          setSourceColumnId(null);
          return; // Dừng ngay, không cho kéo
        }

        // Đủ điều kiện -> Cho phép gắp Thẻ lên
        setActiveTask(task);
      }

      // --- TRƯỜNG HỢP 2: KÉO CỘT (COLUMN) ---
      if (current?.type === "COLUMN") {
        setActiveColumn(current.column);
      }
    },
    [columns, isOwn, user?.id],
  );

  // --------------------------------------------------------------------------
  // 10. TRONG LÚC RÊ CHUỘT (Drag Over - Cập nhật tạm giao diện xem trước / Preview)
  // --------------------------------------------------------------------------
  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeTask) return; // Nếu rê ra ngoài khung hoặc không kéo thẻ -> Bỏ qua

      const activeId = active.id; // ID thẻ đang kéo
      const overId = over.id; // ID vật thể (thẻ hoặc cột) đang bị rê qua
      if (activeId === overId) return; // Nếu đang đè lên chính nó -> Không làm gì

      const isActiveTask = active.data.current?.type === "TASK";
      if (!isActiveTask) return;

      const isOverTask = over.data.current?.type === "TASK";
      const isOverColumn = over.data.current?.type === "COLUMN";

      // Cập nhật giao diện tạm thời trên màn hình để người dùng thấy Thẻ tự nhảy vị trí
      setColumns((prevCols) => {
        // Tìm chỉ số (Index) của Cột chứa thẻ đang kéo
        const activeColIndex = prevCols.findIndex((c) =>
          c.tasks?.some((t) => t.id === activeId),
        );
        let overColIndex = -1;

        // Tìm chỉ số (Index) của Cột đang bị rê chuột đè lên
        if (isOverTask) {
          overColIndex = prevCols.findIndex((c) => c.tasks?.some((t) => t.id === overId));
        } else if (isOverColumn) {
          overColIndex = prevCols.findIndex((c) => c.id === overId);
        }

        if (activeColIndex === -1 || overColIndex === -1) return prevCols;

        // KIỂM TRA Khóa Cột Nguồn
        const sourceCol = prevCols[activeColIndex];
        const isSourceLocked =
          sourceCol?.lock_type === ColumnLockType.FULLY_LOCKED ||
          sourceCol?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) return prevCols;

        // KIỂM TRA Khóa Cột Đích: Nếu Cột đích bị "Khóa hoàn toàn" -> Chặn không cho nhảy Preview vào
        const targetColumn = prevCols[overColIndex];
        if (
          activeColIndex !== overColIndex &&
          targetColumn.lock_type === ColumnLockType.FULLY_LOCKED &&
          !isOwn
        ) {
          return prevCols;
        }

        // LƯU Ý: Với Cột "Khóa 1 chiều" (ONE_WAY_LOCKED), hệ thống VẪN CHO PHÉP thẻ nhảy tạm sang
        // để khi người dùng buông chuột (Drag End) mới hiện Bảng hỏi xác nhận!

        const activeTaskIndex = prevCols[activeColIndex].tasks.findIndex(
          (t) => t.id === activeId,
        );

        // Tạo bản sao mảng dữ liệu để không biến đổi trực tiếp state cũ
        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        // Trường hợp A: Rê thẻ sang CỘT KHÁC
        if (activeColIndex !== overColIndex) {
          // Bốc thẻ ra khỏi cột cũ
          const [movedTask] = updatedCols[activeColIndex].tasks.splice(
            activeTaskIndex,
            1,
          );
          // Gắn ID cột mới cho thẻ
          movedTask.columnId = targetColumn.id;

          // Xác định vị trí chèn mới
          const overTaskIndex = isOverTask
            ? updatedCols[overColIndex].tasks.findIndex((t) => t.id === overId)
            : updatedCols[overColIndex].tasks.length;

          // Nhét thẻ vào cột mới
          updatedCols[overColIndex].tasks.splice(overTaskIndex, 0, movedTask);
        }
        // Trường hợp B: Đổi vị trí các thẻ TRONG CÙNG 1 CỘT
        else if (isOverTask) {
          const overTaskIndex = updatedCols[overColIndex].tasks.findIndex(
            (t) => t.id === overId,
          );
          // Đáo đổi vị trí 2 thẻ trong mảng
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

  // --------------------------------------------------------------------------
  // 11. THẢ CHUỘT / KẾT THÚC KÉO (Drag End - Xác nhận hành động & Lưu DB)
  // --------------------------------------------------------------------------
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const currentTask = activeTask;
      setActiveColumn(null);
      setActiveTask(null);

      if (!over || !currentTask) {
        setSourceColumnId(null);
        return;
      }

      const activeId = active.id as string;
      const isActiveTask = active.data.current?.type === "TASK";

      if (isActiveTask) {
        // Tìm Cột Đích hiện tại chứa Task (đã dịch chuyển tạm trong onDragOver)
        const targetColumn = columns.find((c) => c.tasks?.some((t) => t.id === activeId));

        if (!targetColumn) {
          setSourceColumnId(null);
          return;
        }

        // KIỂM TRA KHI CHUYỂN SANG CỘT KHÁC
        const isMovingToDifferentColumn =
          sourceColumnId && sourceColumnId !== targetColumn.id;

        if (isMovingToDifferentColumn) {
          const sourceColObj = columns.find((c) => c.id === sourceColumnId);

          // 1. Chặn kéo ra khỏi Cột Khóa
          const isSourceLocked =
            sourceColObj?.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColObj?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if (isSourceLocked && !isOwn) {
            toast.error("Cột này đã bị khóa. Bạn không thể di chuyển thẻ ra ngoài!");

            // Rollback về Cột Nguồn trong Local State
            setColumns((prevCols) => {
              const updatedCols = prevCols.map((col) => ({
                ...col,
                tasks: [...(col.tasks || [])],
              }));
              const tColIdx = updatedCols.findIndex((c) => c.id === targetColumn.id);
              const sColIdx = updatedCols.findIndex((c) => c.id === sourceColumnId);

              if (tColIdx !== -1 && sColIdx !== -1) {
                const tIdx = updatedCols[tColIdx].tasks.findIndex(
                  (t) => t.id === activeId,
                );
                if (tIdx !== -1) {
                  const [mTask] = updatedCols[tColIdx].tasks.splice(tIdx, 1);
                  mTask.columnId = sourceColumnId;
                  updatedCols[sColIdx].tasks.push(mTask);
                }
              }
              return updatedCols;
            });

            setSourceColumnId(null);
            return;
          }

          // 2. Kiểm tra Cột Đích
          if (!isOwn) {
            // Cột Khóa hoàn toàn
            if (targetColumn.lock_type === ColumnLockType.FULLY_LOCKED) {
              toast.error("Cột này đã bị khóa hoàn toàn. Bạn không thể chuyển thẻ vào!");

              setColumns((prevCols) => {
                const updatedCols = prevCols.map((col) => ({
                  ...col,
                  tasks: [...(col.tasks || [])],
                }));
                const tColIdx = updatedCols.findIndex((c) => c.id === targetColumn.id);
                const sColIdx = updatedCols.findIndex((c) => c.id === sourceColumnId);

                if (tColIdx !== -1 && sColIdx !== -1) {
                  const tIdx = updatedCols[tColIdx].tasks.findIndex(
                    (t) => t.id === activeId,
                  );
                  if (tIdx !== -1) {
                    const [mTask] = updatedCols[tColIdx].tasks.splice(tIdx, 1);
                    mTask.columnId = sourceColumnId;
                    updatedCols[sColIdx].tasks.push(mTask);
                  }
                }
                return updatedCols;
              });

              setSourceColumnId(null);
              return;
            }

            // Cột Khóa 1 chiều -> BẬT BẢNG HỎI XÁC NHẬN
            if (targetColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED) {
              const confirmMove = window.confirm(
                `Cột "${targetColumn.title}" là CỘT KHÓA 1 CHIỀU.\n\n` +
                  `Sau khi di chuyển vào, bạn sẽ KHÔNG THỂ TỰ KÉO RA ĐƯỢC NỮA.\n\n` +
                  `Bạn có chắc chắn muốn di chuyển thẻ vào cột này không?`,
              );

              // NẾU BẤM NO / CANCEL -> Tráo thẻ ngược trở lại Cột Nguồn trực tiếp trong State
              if (!confirmMove) {
                setColumns((prevCols) => {
                  const updatedCols = prevCols.map((col) => ({
                    ...col,
                    tasks: [...(col.tasks || [])],
                  }));

                  const targetColIdx = updatedCols.findIndex(
                    (c) => c.id === targetColumn.id,
                  );
                  const sourceColIdx = updatedCols.findIndex(
                    (c) => c.id === sourceColumnId,
                  );

                  if (targetColIdx !== -1 && sourceColIdx !== -1) {
                    const taskIndex = updatedCols[targetColIdx].tasks.findIndex(
                      (t) => t.id === activeId,
                    );
                    if (taskIndex !== -1) {
                      const [movedTask] = updatedCols[targetColIdx].tasks.splice(
                        taskIndex,
                        1,
                      );
                      movedTask.columnId = sourceColumnId;
                      updatedCols[sourceColIdx].tasks.push(movedTask);
                    }
                  }
                  return updatedCols;
                });

                setSourceColumnId(null);
                return;
              }
            }
          }
        }

        // NẾU BẤM YES HOẶC DI CHUYỂN HỢP LỆ: TÍNH POSITION MỚI & LƯU DB
        const taskList = targetColumn.tasks || [];
        const newIndex = taskList.findIndex((t) => t.id === activeId);

        if (newIndex !== -1) {
          const destinationTasks = taskList.filter((t) => t.id !== activeId);
          let newPosition = 100.0;

          if (destinationTasks.length === 0) {
            newPosition = 100.0;
          } else if (newIndex === 0) {
            newPosition = destinationTasks[0].position / 2;
          } else if (newIndex >= destinationTasks.length) {
            newPosition = destinationTasks[destinationTasks.length - 1].position + 100.0;
          } else {
            const prevPos = destinationTasks[newIndex - 1].position;
            const nextPos = destinationTasks[newIndex].position;
            newPosition = (prevPos + nextPos) / 2;
          }

          // Bật cờ khóa để useEffect không ghi đè dữ liệu cũ trong lúc chờ API hoàn tất
          isUpdatingRef.current = true;

          // Cập nhật vị trí mới cho Task
          taskList[newIndex].position = newPosition;

          // 1. Gọi API di chuyển Task
          moveTask(
            {
              id: activeId,
              dto: { columnId: targetColumn.id, position: newPosition },
            },
            {
              onSettled: () => {
                // Tắt cờ khóa sau 500ms
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 500);
              },
            },
          );

          // 2. Phát Socket cho các Client khác
          if (socket && activeBoardId) {
            socket.emit("move-task", {
              boardId: activeBoardId,
              activeId,
              columnId: targetColumn.id,
              position: newPosition,
            });
          }
        }
      }

      // KÉO THẢ CỘT
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

  // --------------------------------------------------------------------------
  // 12. HIỂN THỊ MÀN HÌNH CHỜ & GIAO DIỆN CHÍNH
  // --------------------------------------------------------------------------
  // Nếu API chưa tải xong dữ liệu Bảng -> Hiển thị chữ "loading"
  if (isLoading) return "loading";

  // Nếu code chưa chạy xong ở Browser -> Hiển thị khung chờ Skeleton mờ mờ
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

  // GIAO DIỆN CHÍNH CỦA BẢNG KEO THẢ (RENDER CHÍNH)
  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
      {/* Header top của ứng dụng */}
      <Header />
      {/* Thanh công cụ hiển thị thông tin Bảng */}
      <BoardBar
        boardTitle={boardDetail?.title ?? ""}
        visibility={boardDetail?.visibility ?? "WORKSPACE"}
        members={[]}
        onOpenChat={() => {}}
        onOpenActivityLog={() => {}}
      />

      {/* Bao bọc toàn bộ khu vực kéo thả bằng DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}>
        {/* Vùng chứa các Cột có thể sắp xếp ngang */}
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto items-start h-[calc(100vh-80px)]">
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            {/* Nếu không có cột nào -> Hiển thị ô trống */}
            {columns.length === 0 && <EmptyColumnComponent />}

            {/* Duyệt qua từng cột để hiển thị */}
            {columns.map((column) => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>

        {/* Cửa sổ Portal tạo lớp màng Overlay cho vật thể bay theo con chuột khi đang kéo */}
        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.5" } }, // Làm mờ nhẹ vật gốc
                }),
              }}>
              {/* Bóng xem trước của Cột khi kéo Cột */}
              {activeColumn && <ColumnComponent column={activeColumn} isOverlay />}
              {/* Bóng xem trước của Thẻ khi kéo Thẻ */}
              {activeTask && <TaskCard task={activeTask} isOverlay />}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
}
