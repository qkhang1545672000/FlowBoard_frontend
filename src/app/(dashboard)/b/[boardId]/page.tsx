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
import { ColumnComponent } from "@/components/board/column/column";
import { TaskCard } from "@/components/board/task/taskCard";
import { EmptyColumnComponent } from "@/components/board/column/EmptyColumnComponent";

// Lấy các móc (Hooks) và kho dữ liệu chung (Stores)
import { useBoardDetail } from "@/hooks/useBoard"; // Hook lấy chi tiết Bảng từ Server
import { useMoveTask } from "@/hooks/useTask"; // Hook gọi API lưu vị trí Thẻ mới vào Database
import { useMoveColumn } from "@/hooks/useColumn"; // Hook gọi API lưu vị trí Cột mới vào Database
import { useBoardStore } from "@/store/useBoardStore"; // Kho lưu ID bảng đang chọn
import { useAuthStore } from "@/store/useAuthStore"; // Kho lưu thông tin Tài khoản đang đăng nhập
import { useSocket } from "@/hooks/useSocket"; // Hook kết nối Realtime (Socket.io)
import { useBoardSocket } from "@/hooks/useBoardSocket"; // Hook lắng nghe người khác di chuyển thẻ/cột

// Lấy các định nghĩa kiểu dữ liệu (Types)
import { Column, Task, ColumnLockType } from "@/types/column";
import { useBoardPermission } from "@/components/board/useBoardPermission";
import { useTaskPermission } from "@/components/board/task/useTaskPermission";
import { useWorkspacePermission } from "@/components/workspace/useWorkspacePermission";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { BoardVisibility } from "@/types";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

export default function BoardDetailPage() {
  // --------------------------------------------------------------------------
  // 1. LẤY DỮ LIỆU TỪ KHO CHUNG (ZUSTAND & AUTH)
  // --------------------------------------------------------------------------
  const router = useRouter();
  const activeBoardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const setBoard = useBoardStore((state) => state.setActiveBoard) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";

  const user = useAuthStore((state) => state.user);
  const socket = useSocket();

  // --------------------------------------------------------------------------
  // 2. GỌI API LẤY DỮ LIỆU BẢNG & TẠO HÀM LƯU VỊ TRÍ
  // --------------------------------------------------------------------------
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { mutate: moveColumn } = useMoveColumn(activeBoardId || "");
  const { data: boardDetail, isLoading, error, isError } = useBoardDetail();
  useEffect(() => {
    // Chỉ xử lý khi có lỗi xảy ra và lỗi đó là từ Axios
    if (isError && isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      // 🛑 Nếu là lỗi 403 (Không có quyền truy cập)
      if (status === 403) {
        // 1. Hiển thị thông báo toast lỗi
        toast.error(serverMessage || "Bạn không có quyền truy cập vào board này!");
        setBoard({ id: "", slug: "" });
        // 2. Tự động quay lại trang trước đó
        router.back();
      }
    }
  }, [isError, error, router, setBoard]);
  // --------------------------------------------------------------------------
  // 3. QUẢN LÝ TRẠNG THÁI NỘI BỘ (LOCAL STATE)
  // --------------------------------------------------------------------------
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isUpdatingRef = useRef(false);

  // --------------------------------------------------------------------------
  // 4. KẾT NỐI REALTIME (SOCKET)
  // --------------------------------------------------------------------------
  const isDragging = Boolean(activeTask || activeColumn);
  useBoardSocket({ socket, activeBoardId, setColumns, isDragging });

  // --------------------------------------------------------------------------
  // 5. KIỂM TRA QUYỀN HẠN
  // --------------------------------------------------------------------------
  const { isOwn } = useBoardPermission(activeBoardId ?? "");
  const { isOwn: isOwnWorkspace } = useWorkspacePermission(workspaceId);

  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  // --------------------------------------------------------------------------
  // 6. ĐỒNG BỘ DỮ LIỆU TỪ SERVER VÀO STATE MÀN HÌNH
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (boardDetail?.columns && !isUpdatingRef.current) {
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // --------------------------------------------------------------------------
  // 7. CẤU HÌNH CẢM BIẾN (SENSORS)
  // --------------------------------------------------------------------------
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
      // Nếu đang kéo cột thì dùng rectIntersection trực tiếp để bắt va chạm ngang mượt mà
      if (activeColumn) return rectIntersection(args);

      const pointerCollisions = pointerWithin(args);
      if (!pointerCollisions.length) return [];

      const firstCollision = getFirstCollision(pointerCollisions, "id");
      return firstCollision ? pointerCollisions : rectIntersection(args);
    },
    [activeColumn],
  );

  // --------------------------------------------------------------------------
  // 9. BẮT ĐẦU KÉO (Drag Start)
  // --------------------------------------------------------------------------
  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { current } = event.active.data;

      if (current?.type === "TASK") {
        const task = current.task as Task;
        const isLeaderTask = task.members.some(
          (t) => t.role == "TASK_LEADER" && t.user.id == user?.id,
        );

        const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === task.id));

        if (sourceColumn) {
          const isSourceLocked =
            sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if (isSourceLocked && !isOwn && !isOwnWorkspace) {
            toast.error(
              "Thẻ nằm trong cột bị khóa. Bạn không thể di chuyển thẻ ra ngoài!",
            );
            setActiveTask(null);
            setSourceColumnId(null);
            return;
          }
          setSourceColumnId(sourceColumn.id);
        }

        if (!isLeaderTask && !isOwn && !isOwnWorkspace) {
          toast.error("Bạn không có quyền di chuyển công việc này!");
          setActiveTask(null);
          setSourceColumnId(null);
          return;
        }

        setActiveTask(task);
      }

      if (current?.type === "COLUMN") {
        setActiveColumn(current.column);
      }
    },
    [columns, isOwn, user?.id, isOwnWorkspace],
  );

  // --------------------------------------------------------------------------
  // 10. TRONG LÚC RÊ CHUỘT (Drag Over)
  // --------------------------------------------------------------------------
  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      const isActiveColumn = active.data.current?.type === "COLUMN";

      if (isActiveColumn) {
        setColumns((prevCols) => {
          const activeColIndex = prevCols.findIndex((c) => c.id === activeId);
          let overColIndex = prevCols.findIndex((c) => c.id === overId);
          if (overColIndex === -1) {
            overColIndex = prevCols.findIndex((c) =>
              c.tasks?.some((t) => t.id === overId),
            );
          }

          if (
            activeColIndex === -1 ||
            overColIndex === -1 ||
            activeColIndex === overColIndex
          ) {
            return prevCols;
          }

          return arrayMove(prevCols, activeColIndex, overColIndex);
        });
        return;
      }

      if (!activeTask) return;
      const isOverTask = over.data.current?.type === "TASK";
      const isOverColumn = over.data.current?.type === "COLUMN";

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

        const sourceCol = prevCols[activeColIndex];
        const isSourceLocked =
          sourceCol?.lock_type === ColumnLockType.FULLY_LOCKED ||
          sourceCol?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) return prevCols;

        const activeTaskIndex = prevCols[activeColIndex].tasks.findIndex(
          (t) => t.id === activeId,
        );

        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        if (activeColIndex !== overColIndex) {
          const targetColumn = prevCols[overColIndex];

          if (targetColumn.lock_type === ColumnLockType.FULLY_LOCKED && !isOwn) {
            return prevCols;
          }

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

  // --------------------------------------------------------------------------
  // 11. THẢ CHUỘT / KẾT THÚC KÉO (Drag End)
  // --------------------------------------------------------------------------
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const currentTask = activeTask;
      const currentColumn = activeColumn;

      setActiveTask(null);
      setActiveColumn(null);

      if (!over) {
        setSourceColumnId(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;
      const isActiveTask = active.data.current?.type === "TASK";
      const isActiveColumn = active.data.current?.type === "COLUMN";

      // --- XỬ LÝ KHI KÉO THẢ TASK ---
      if (isActiveTask && currentTask) {
        const targetColumn = columns.find((c) => c.tasks?.some((t) => t.id === activeId));

        if (!targetColumn) {
          setSourceColumnId(null);
          return;
        }

        const isMovingToDifferentColumn =
          sourceColumnId && sourceColumnId !== targetColumn.id;

        if (isMovingToDifferentColumn) {
          const sourceColObj = columns.find((c) => c.id === sourceColumnId);

          const isSourceLocked =
            sourceColObj?.lock_type === ColumnLockType.FULLY_LOCKED ||
            sourceColObj?.lock_type === ColumnLockType.ONE_WAY_LOCKED;

          if (isSourceLocked && !isOwn) {
            toast.error("Cột này đã bị khóa. Bạn không thể di chuyển thẻ ra ngoài!");

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

          if (!isOwn) {
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

            if (targetColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED) {
              const confirmMove = window.confirm(
                `Cột "${targetColumn.title}" là CỘT KHÓA 1 CHIỀU.\n\n` +
                  `Sau khi di chuyển vào, bạn sẽ KHÔNG THỂ TỰ KÉO RA ĐƯỢC NỮA.\n\n` +
                  `Bạn có chắc chắn muốn di chuyển thẻ vào cột này không?`,
              );

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

          isUpdatingRef.current = true;
          taskList[newIndex].position = newPosition;

          moveTask(
            {
              id: activeId,
              dto: { columnId: targetColumn.id, position: newPosition },
            },
            {
              onSettled: () => {
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 500);
              },
            },
          );

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

      // --- XỬ LÝ KHI KÉO THẢ CỘT (COLUMN) ---

      if (isActiveColumn && currentColumn) {
        setColumns((prevCols) => {
          const activeColIndex = prevCols.findIndex((c) => c.id === activeId);

          let overColIndex = prevCols.findIndex((c) => c.id === overId);

          if (overColIndex === -1) {
            overColIndex = prevCols.findIndex((c) =>
              c.tasks?.some((t) => t.id === overId),
            );
          }

          if (activeColIndex === -1 || overColIndex === -1) {
            return prevCols;
          }

          const newCols = arrayMove(prevCols, activeColIndex, overColIndex);

          const destinationCols = newCols.filter((c) => c.id !== activeId);
          let newPosition = 100.0;

          if (destinationCols.length === 0) {
            newPosition = 100.0;
          } else if (overColIndex === 0) {
            newPosition = destinationCols[0].position / 2;
          } else if (overColIndex >= destinationCols.length) {
            newPosition = destinationCols[destinationCols.length - 1].position + 100.0;
          } else {
            const prevPos = destinationCols[overColIndex - 1].position;
            const nextPos = destinationCols[overColIndex].position;
            newPosition = (prevPos + nextPos) / 2;
          }

          isUpdatingRef.current = true;

          moveColumn(
            {
              boardId: activeBoardId,
              columnId: activeId,
              position: newPosition,
            },
            {
              onSettled: () => {
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 500);
              },
            },
          );

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
    [
      activeTask,
      activeColumn,
      columns,
      moveTask,
      moveColumn,
      socket,
      activeBoardId,
      sourceColumnId,
      isOwn,
    ],
  );

  // --------------------------------------------------------------------------
  // 12. HIỂN THỊ MÀN HÌNH CHỜ & GIAO DIỆN CHÍNH
  // --------------------------------------------------------------------------
  if (isLoading)
    return (
      <LoadingModal
        isOpen={isLoading}
        message="Xin chờ trong giây lát"
        blurBackground={true}
      />
    );

  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
        <Header />
        <BoardBar
          boardTitle={boardDetail?.title ?? ""}
          visibility={boardDetail?.visibility ?? BoardVisibility.WORKSPACE}
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

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
      <Header />
      <BoardBar
        boardTitle={boardDetail?.title ?? ""}
        visibility={boardDetail?.visibility ?? BoardVisibility.WORKSPACE}
        members={[]}
        onOpenChat={() => {}}
        onOpenActivityLog={() => {}}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto items-start h-[calc(100vh-80px)]">
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            {columns.length === 0 && <EmptyColumnComponent />}

            {columns.map((column) => (
              <ColumnComponent key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>

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
