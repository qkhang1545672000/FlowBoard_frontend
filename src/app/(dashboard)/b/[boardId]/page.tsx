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

// Components
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { ColumnComponent } from "@/components/board/column";
import { TaskCard } from "@/components/board/taskCard";
import { EmptyColumnComponent } from "@/components/board/EmptyColumnComponent";

// Hooks & Stores
import { useBoardDetail } from "@/hooks/useBoard";
import { useMoveTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";

// Types
import { Column, Task, ColumnLockType } from "@/types/column";

export default function BoardDetailPage() {
  // ==========================================
  // 1. STATE & HOOKS
  // ==========================================
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const user = useAuthStore((state) => state.user);
  const socket = useSocket();

  // API Mutate & Data Fetching
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { data: boardDetail, isLoading } = useBoardDetail(activeBoardId ?? "");

  // Drag and Drop Local States
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);

  // SSR Hydration State
  const [isMounted, setIsMounted] = useState(false);

  // ==========================================
  // 2. REALTIME SOCKET.IO LOGIC
  // ==========================================
  useEffect(() => {
    if (!socket || !activeBoardId) return;

    // 1. Hàm join room dùng chung
    const joinBoardRoom = () => {
      console.log("[Socket] Đang join vào board:", activeBoardId);
      socket.emit("join-board", activeBoardId);
    };

    // Kích hoạt join room nếu socket đã kết nối, đồng thời đăng ký lắng nghe sự kiện 'connect'
    if (socket.connected) {
      joinBoardRoom();
    }
    socket.on("connect", joinBoardRoom);

    // 2. Lắng nghe sự kiện di chuyển Task từ máy khác
    const handleTaskMoved = (data: {
      activeId: string;
      columnId: string;
      position: number;
    }) => {
      setColumns((prevCols) => {
        let movedTask: Task | null = null;

        // Xóa task khỏi cột cũ
        const updatedCols = prevCols.map((col) => {
          const taskIndex = col.tasks?.findIndex((t) => t.id === data.activeId);
          if (taskIndex !== undefined && taskIndex !== -1) {
            const tasks = [...col.tasks];
            [movedTask] = tasks.splice(taskIndex, 1);
            return { ...col, tasks };
          }
          return col;
        });

        if (!movedTask) return prevCols;

        // Cập nhật columnId & position mới
        movedTask = {
          ...movedTask,
          columnId: data.columnId,
          position: data.position,
        };

        // Thêm task vào cột mới và sort lại theo position
        return updatedCols.map((col) => {
          if (col.id === data.columnId) {
            const newTasks = [...(col.tasks || []), movedTask!].sort(
              (a, b) => a.position - b.position,
            );
            return { ...col, tasks: newTasks };
          }
          return col;
        });
      });
    };

    // 3. Lắng nghe sự kiện di chuyển Cột từ máy khác
    const handleColumnMoved = (data: { columns: Column[] }) => {
      setColumns(data.columns);
    };

    // 4. Lắng nghe sự kiện Tạo Cột Mới từ máy khác
    const handleColumnCreated = (data: { newColumn: Column }) => {
      setColumns((prevCols) => {
        const exists = prevCols.some((col) => col.id === data.newColumn.id);
        if (exists) return prevCols;

        const columnWithTasks = {
          ...data.newColumn,
          tasks: data.newColumn.tasks || [],
        };

        return [...prevCols, columnWithTasks];
      });
    };

    // 5. Lắng nghe sự kiện Xóa Cột từ máy khác
    const handleColumnDeleted = (data: { columnId: string }) => {
      console.log("Đã nhận sự kiện xóa cột ID:", data.columnId);
      setColumns((prevCols) => prevCols.filter((col) => col.id !== data.columnId));
    };

    // --- ĐĂNG KÝ LISTENERS ---
    socket.on("task-moved", handleTaskMoved);
    socket.on("column-moved", handleColumnMoved);
    socket.on("column-created", handleColumnCreated);
    socket.on("column-deleted", handleColumnDeleted);

    // --- CLEANUP LISTENERS KHI UNMOUNT HẶC ĐỔI BOARD ---
    return () => {
      if (socket.connected) {
        socket.emit("leave-board", activeBoardId);
      }
      socket.off("connect", joinBoardRoom);
      socket.off("task-moved", handleTaskMoved);
      socket.off("column-moved", handleColumnMoved);
      socket.off("column-created", handleColumnCreated);
      socket.off("column-deleted", handleColumnDeleted);
    };
  }, [socket, activeBoardId]);

  // ==========================================
  // 3. COMPUTED VALUES & EFFECTS
  // ==========================================

  // Kiểm tra vai trò người dùng (Admin hoặc Leader)
  const isOwn = useMemo(() => {
    if (!boardDetail?.members || !user?.id) return false;
    return boardDetail.members.some(
      (m) => m.user?.id === user.id && (m.role === "ADMIN" || m.role === "LEADER"),
    );
  }, [boardDetail, user]);

  // Danh sách ID cột dùng cho SortableContext
  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  // Cập nhật Local State khi dữ liệu từ API thay đổi
  useEffect(() => {
    if (boardDetail?.columns) {
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail?.columns]);

  // Đánh dấu component đã mount client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================
  // 4. DND-KIT SENSORS & COLLISION DETECTION
  // ==========================================

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

  // ==========================================
  // 5. DND-KIT EVENT HANDLERS
  // ==========================================

  const onDragStart = (event: DragStartEvent) => {
    const { current } = event.active.data;

    if (current?.type === "TASK") {
      const task = current.task as Task;
      const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === task.id));

      if (sourceColumn) {
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

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "TASK";
    if (!isActiveTask) return;

    const sourceColumn = columns.find((c) => c.tasks?.some((t) => t.id === activeId));
    if (sourceColumn) {
      const isSourceLocked =
        sourceColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
        sourceColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

      if (isSourceLocked && !isOwn) return;
    }

    const isOverTask = over.data.current?.type === "TASK";
    const isOverColumn = over.data.current?.type === "COLUMN";

    let targetColumn: Column | undefined;
    if (isOverTask) {
      targetColumn = columns.find((c) => c.tasks?.some((t) => t.id === overId));
    } else if (isOverColumn) {
      targetColumn = columns.find((c) => c.id === overId);
    }

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

      if (originalColumn) {
        const isSourceLocked =
          originalColumn.lock_type === ColumnLockType.FULLY_LOCKED ||
          originalColumn.lock_type === ColumnLockType.ONE_WAY_LOCKED;

        if (isSourceLocked && !isOwn) {
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

      // 1. Lưu thay đổi xuống Database
      moveTask({
        id: activeId,
        dto: {
          columnId: targetColumn.id,
          position: newPosition,
        },
      });

      // 2. Bắn sự kiện qua Socket cho các máy khác
      if (socket && activeBoardId) {
        socket.emit("move-task", {
          boardId: activeBoardId,
          activeId,
          columnId: targetColumn.id,
          position: newPosition,
        });
      }
    }

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
  };

  // ==========================================
  // 6. RENDER CONDITIONAL STATES
  // ==========================================

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

  // ==========================================
  // 7. MAIN RENDER
  // ==========================================
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
