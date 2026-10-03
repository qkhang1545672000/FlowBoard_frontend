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
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { Column, Task, ColumnLockType } from "@/types/column";
import { ColumnComponent } from "@/components/board/column";
import { TaskCard } from "@/components/board/taskCard";
import { useBoardDetail } from "@/hooks/useBoard";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { EmptyColumnComponent } from "@/components/board/EmptyColumnComponent";
import { useMoveTask } from "@/hooks/useTask";

export default function BoardDetailPage() {
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { data: boardDetail, isLoading } = useBoardDetail(activeBoardId ?? "");
  const user = useAuthStore((state) => state.user);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Lưu lại cột ban đầu trước khi bắt đầu kéo để phục vụ rollback nếu kéo sai
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);

  // Kiểm tra quyền Admin / Leader
  const isOwn = useMemo(() => {
    if (!boardDetail?.members || !user?.id) return false;
    return boardDetail.members.some(
      (m) => m.user?.id === user.id && (m.role === "ADMIN" || m.role === "LEADER"),
    );
  }, [boardDetail, user]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (boardDetail?.columns) {
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (activeColumn) {
        return rectIntersection(args);
      }

      const pointerCollisions = pointerWithin(args);
      if (!pointerCollisions.length) return [];

      const firstCollision = getFirstCollision(pointerCollisions, "id");
      if (firstCollision) {
        return pointerCollisions;
      }

      return rectIntersection(args);
    },
    [activeColumn],
  );

  // Xử lý đổi 3 trạng thái khóa cột
  const handleToggleLock = (columnId: string, nextLockType: ColumnLockType) => {
    if (!isOwn) {
      toast.error("Chỉ Admin hoặc Leader mới có quyền đổi trạng thái khóa!");
      return;
    }

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, lock_type: nextLockType } : col,
      ),
    );
  };

  // 1. Bắt đầu kéo
  const onDragStart = (event: DragStartEvent) => {
    const { current } = event.active.data;

    if (current?.type === "TASK") {
      const task = current.task as Task;
      const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === task.id));

      if (sourceColumn) {
        // Kiểm tra điều kiện khóa cột nguồn (FULL_LOCKED hoặc ONE_WAY_LOCKED)
        const isSourceLocked =
          sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
          sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) {
          toast.error("Cột này đã bị khóa. Bạn không thể di chuyển thẻ ra ngoài!");
          return;
        }

        setSourceColumnId(sourceColumn.id);
      }

      const isAssignee = task.assignee?.id === user?.id;
      if (!isAssignee && !isOwn) {
        toast.error("Bạn không có quyền di chuyển công việc này!");
        return;
      }

      setActiveTask(task);
    }

    if (current?.type === "COLUMN") {
      setActiveColumn(current.column);
    }
  };

  // 2. Trong quá trình kéo
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "TASK";
    if (!isActiveTask) return;

    // Lấy thông tin cột xuất phát (nguồn)
    const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === activeId));

    // Nếu cột nguồn bị khóa (FULL hoặc ONE_WAY) và người dùng không phải Admin/Leader -> Ngăn không cho di chuyển sang cột khác
    if (sourceColumn) {
      const isSourceLocked =
        sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
        sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

      if (isSourceLocked && !isOwn) {
        return; // Dừng không cập nhật State cột
      }
    }

    const isOverTask = over.data.current?.type === "TASK";
    const isOverColumn = over.data.current?.type === "COLUMN";

    let targetColumn: Column | undefined;
    if (isOverTask) {
      targetColumn = columns.find((c) => c.tasks?.some((t) => t.id === overId));
    } else if (isOverColumn) {
      targetColumn = columns.find((c) => c.id === overId);
    }

    // Nếu cột đích bị khóa FULLY_LOCKED -> Không cho di chuyển vào
    if (
      targetColumn &&
      targetColumn.lock_type === ColumnLockType.FULLY_LOCKED &&
      !isOwn
    ) {
      return;
    }

    if (isActiveTask && isOverTask) {
      setColumns((prevCols) => {
        const activeColIndex = prevCols.findIndex((c) =>
          c.tasks?.some((t) => t.id === activeId),
        );
        const overColIndex = prevCols.findIndex((c) =>
          c.tasks?.some((t) => t.id === overId),
        );

        if (activeColIndex === -1 || overColIndex === -1) return prevCols;

        const activeTaskIndex = prevCols[activeColIndex].tasks.findIndex(
          (t) => t.id === activeId,
        );
        const overTaskIndex = prevCols[overColIndex].tasks.findIndex(
          (t) => t.id === overId,
        );

        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        if (activeColIndex !== overColIndex) {
          const [movedTask] = updatedCols[activeColIndex].tasks.splice(
            activeTaskIndex,
            1,
          );
          movedTask.columnId = updatedCols[overColIndex].id;
          updatedCols[overColIndex].tasks.splice(overTaskIndex, 0, movedTask);
        } else {
          updatedCols[activeColIndex].tasks = arrayMove(
            updatedCols[activeColIndex].tasks,
            activeTaskIndex,
            overTaskIndex,
          );
        }

        return updatedCols;
      });
    }

    if (isActiveTask && isOverColumn) {
      setColumns((prevCols) => {
        const activeColIndex = prevCols.findIndex((c) =>
          c.tasks?.some((t) => t.id === activeId),
        );
        const overColIndex = prevCols.findIndex((c) => c.id === overId);

        if (activeColIndex === -1 || overColIndex === -1) return prevCols;

        const activeTaskIndex = prevCols[activeColIndex].tasks.findIndex(
          (t) => t.id === activeId,
        );

        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        const [movedTask] = updatedCols[activeColIndex].tasks.splice(activeTaskIndex, 1);
        movedTask.columnId = updatedCols[overColIndex].id;
        updatedCols[overColIndex].tasks.push(movedTask);

        return updatedCols;
      });
    }
  };

  // 3. Khi thả thẻ
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveColumn(null);
    setActiveTask(null);

    if (!over) {
      setSourceColumnId(null);
      return;
    }

    const activeId = active.id as string;
    const isActiveTask = active.data.current?.type === "TASK";

    if (isActiveTask) {
      const originalColumn = boardDetail?.columns?.find((col) =>
        col.tasks?.some((t) => t.id === activeId),
      );

      const targetColumn = columns.find((col) =>
        col.tasks?.some((t) => t.id === activeId),
      );

      if (!targetColumn) {
        setSourceColumnId(null);
        return;
      }

      // Kiểm tra lại khóa cột nguồn khi thả thẻ
      if (originalColumn) {
        const isSourceLocked =
          originalColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
          originalColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) {
          // Hoàn tác lại vị trí ban đầu
          if (boardDetail?.columns) setColumns(boardDetail.columns as Column[]);
          setSourceColumnId(null);
          return;
        }
      }

      if (originalColumn && originalColumn.id !== targetColumn.id) {
        if (targetColumn.lock_type === ColumnLockType.FULLY_LOCKED && !isOwn) {
          toast.error("Cột này đã bị khóa hoàn toàn. Bạn không thể chuyển thẻ vào!");
          if (boardDetail?.columns) setColumns(boardDetail.columns as Column[]);
          setSourceColumnId(null);
          return;
        }

        if (targetColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED && !isOwn) {
          const confirmMove = window.confirm(
            `Cột "${targetColumn.title}" là cột khóa 1 chiều. Sau khi chuyển vào, bạn sẽ KHÔNG THỂ TỰ KÉO RA ĐƯỢC NỮA. Bạn có chắc chắn muốn di chuyển không?`,
          );

          if (!confirmMove) {
            if (boardDetail?.columns) setColumns(boardDetail.columns as Column[]);
            setSourceColumnId(null);
            return;
          }
        }
      }

      const taskList = targetColumn.tasks || [];
      const newIndex = taskList.findIndex((t) => t.id === activeId);

      if (newIndex === -1) {
        setSourceColumnId(null);
        return;
      }

      let newPosition = 100.0;

      if (taskList.length === 1) {
        newPosition = 100.0;
      } else if (newIndex === 0) {
        newPosition = taskList[1].position / 2;
      } else if (newIndex === taskList.length - 1) {
        newPosition = taskList[taskList.length - 2].position + 100.0;
      } else {
        const prevPosition = taskList[newIndex - 1].position;
        const nextPosition = taskList[newIndex + 1].position;
        newPosition = (prevPosition + nextPosition) / 2;
      }

      taskList[newIndex].position = newPosition;

      moveTask({
        id: activeId,
        dto: {
          columnId: targetColumn.id,
          position: newPosition,
        },
      });
    }

    if (active.data.current?.type === "COLUMN") {
      setColumns((prevCols) => {
        const activeColIndex = prevCols.findIndex((c) => c.id === activeId);
        const overColIndex = prevCols.findIndex((c) => c.id === over.id);
        return arrayMove(prevCols, activeColIndex, overColIndex);
      });
    }

    setSourceColumnId(null);
  };

  if (isLoading) {
    return "loading";
  }

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
              <ColumnComponent
                key={column.id}
                column={column}
                onToggleLock={handleToggleLock}
              />
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
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  isOverlay
                  columnLockType={
                    columns.find((c) => c.tasks?.some((t) => t.id === activeTask.id))
                      ?.lock_type
                  }
                />
              )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
}
