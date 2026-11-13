"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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

// Lấy các thành phần giao diện (UI)
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { ColumnComponent } from "@/components/board/column/column";
import { TaskCard } from "@/components/board/task/taskCard";
import { EmptyColumnComponent } from "@/components/board/column/EmptyColumnComponent";
import { BoardChatModal } from "@/components/board/BoardChatModal"; // 👈 Import Modal Chat mới

// Lấy các hooks và stores
import { useBoardDetail } from "@/hooks/useBoard";
import { useMoveTask } from "@/hooks/useTask";
import { useMoveColumn } from "@/hooks/useColumn";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import { Column, Task, ColumnLockType } from "@/types/column";
import { useBoardPermission } from "@/components/board/useBoardPermission";
import { useWorkspacePermission } from "@/components/workspace/useWorkspacePermission";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { BoardVisibility } from "@/types";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

export default function BoardDetailPage() {
  const router = useRouter();
  const activeBoardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const setBoard = useBoardStore((state) => state.setActiveBoard) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";

  const user = useAuthStore((state) => state.user);
  const socket = useSocket();

  // 💬 STATE QUẢN LÝ ĐÓNG/MỞ MODAL CHAT
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { mutate: moveColumn } = useMoveColumn(activeBoardId || "");
  const { data: boardDetail, isLoading, error, isError } = useBoardDetail();

  useEffect(() => {
    if (isError && isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (status === 403) {
        toast.error(serverMessage || "Bạn không có quyền truy cập vào board này!");
        setBoard({ id: "", slug: "" });
        router.back();
      }
    }
  }, [isError, error, router, setBoard]);

  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isUpdatingRef = useRef(false);

  const isDragging = Boolean(activeTask || activeColumn);
  useBoardSocket({ socket, activeBoardId, setColumns, isDragging });

  const { isOwn } = useBoardPermission(activeBoardId ?? "");
  const { isOwn: isOwnWorkspace } = useWorkspacePermission(workspaceId);

  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  useEffect(() => {
    if (boardDetail?.columns && !isUpdatingRef.current) {
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

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
      const isActiveTask = active.data.current?.type === "TASK";
      const isActiveColumn = active.data.current?.type === "COLUMN";

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
            setSourceColumnId(null);
            return;
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

      if (isActiveColumn && currentColumn) {
        setColumns((prevCols) => {
          const activeColIndex = prevCols.findIndex((c) => c.id === activeId);
          let overColIndex = prevCols.findIndex((c) => c.id === over.id);
          if (overColIndex === -1) {
            overColIndex = prevCols.findIndex((c) =>
              c.tasks?.some((t) => t.id === over.id),
            );
          }
          if (activeColIndex === -1 || overColIndex === -1) return prevCols;

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
            { boardId: activeBoardId, columnId: activeId, position: newPosition },
            {
              onSettled: () => {
                setTimeout(() => {
                  isUpdatingRef.current = false;
                }, 500);
              },
            },
          );

          if (socket && activeBoardId) {
            socket.emit("move-column", { boardId: activeBoardId, columns: newCols });
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

      {/* Thanh BoardBar với sự kiện bấm nút mở Chat Modal */}
      <BoardBar
        boardTitle={boardDetail?.title ?? ""}
        visibility={boardDetail?.visibility ?? BoardVisibility.WORKSPACE}
        members={[]}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenActivityLog={() => console.log("Activity log opened")}
      />

      {/* Giao diện Kanban Board chính */}
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

      {/* MODAL CHAT TÁCH RIÊNG */}
      <BoardChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        boardTitle={boardDetail?.title ?? "Board Chat"}
        boardId={activeBoardId}
        socket={socket}
        user={user}
      />
    </div>
  );
}
