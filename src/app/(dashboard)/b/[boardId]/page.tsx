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
import { BoardVisibility } from "@/types";
import { Column, Task } from "@/types/column";
import { ColumnComponent } from "@/components/board/column";
import { TaskCard } from "@/components/board/taskCard";
import { useBoardDetail } from "@/hooks/useBoard";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner"; // Hoặc import { toast } from "react-hot-toast";
import { EmptyColumnComponent } from "@/components/board/EmptyColumnComponent";
import { useCreateColumn } from "@/hooks/useColumn";
import { useMoveTask } from "@/hooks/useTask";
// JSON Giả lập từ API backend NestJS

export default function BoardDetailPage() {
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const { mutate: moveTask } = useMoveTask(activeBoardId || "");
  const { data: boardDetail, isLoading } = useBoardDetail(activeBoardId ?? "");
  const user = useAuthStore((state) => state.user);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 1. Kiểm tra Client Mounting để fix lỗi Hydration Mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (boardDetail?.columns) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColumns(boardDetail.columns as Column[]);
    }
  }, [boardDetail]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columnsId = useMemo(() => columns?.map((col) => col.id), [columns]);

  // Cấu hình Sensor (Di chuyển tối thiểu 8px mới nhận diện Drag để tránh nhầm với Click)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Custom Thuật toán nhận diện va chạm mượt hơn cho Board Kanban
  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      // Nếu đang kéo Cột thì dùng thuật toán va chạm khối hình chữ nhật chuẩn
      if (activeColumn) {
        return rectIntersection(args);
      }

      // Xử lý va chạm khi kéo Task
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

  const onDragStart = (event: DragStartEvent) => {
    const { current } = event.active.data;

    // Nếu phần tử bắt đầu kéo là TASK
    if (current?.type === "TASK") {
      const task = current.task as Task;

      // Kiểm tra nếu task không có người thực hiện HOẶC người đang đăng nhập không phải assignee
      const isAssignee = task.assignee?.id === user?.id || task.assignee?.id === user?.id;

      if (!isAssignee) {
        toast.error("Bạn không có quyền di chuyển công việc này!");
        return; // Không set activeTask -> Ngăn hành động kéo
      }

      setActiveTask(task);
    }

    // Nếu là Cột (COLUMN)
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
    const isOverTask = over.data.current?.type === "TASK";

    if (!isActiveTask) return;

    // 1. Kéo Task qua Task khác (Cùng cột hoặc Khác cột)
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

        // Tạo bản sao mới của state để bảo đảm Immutability
        const updatedCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])],
        }));

        if (activeColIndex !== overColIndex) {
          const [movedTask] = updatedCols[activeColIndex].tasks.splice(
            activeTaskIndex,
            1,
          );
          console.log("movedTask", movedTask);
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

    // 2. Kéo Task vào vùng một Cột trống
    const isOverColumn = over.data.current?.type === "COLUMN";
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

    if (!over) return;

    const activeId = active.id as string;
    const isActiveTask = active.data.current?.type === "TASK";

    if (isActiveTask) {
      // Tìm cột hiện tại chứa activeTask sau khi kéo (đã cập nhật qua onDragOver)
      const targetColumn = columns.find((col) =>
        col.tasks?.some((t) => t.id === activeId),
      );

      if (!targetColumn) return;

      const taskList = targetColumn.tasks || [];
      const newIndex = taskList.findIndex((t) => t.id === activeId);

      if (newIndex === -1) return;

      let newPosition = 100.0;

      if (taskList.length === 1) {
        // Chỉ có 1 task trong cột
        newPosition = 100.0;
      } else if (newIndex === 0) {
        // Đứng đầu danh sách
        newPosition = taskList[1].position / 2;
      } else if (newIndex === taskList.length - 1) {
        // Đứng cuối danh sách
        newPosition = taskList[taskList.length - 2].position + 100.0;
      } else {
        // Đứng giữa 2 task
        const prevPosition = taskList[newIndex - 1].position;
        const nextPosition = taskList[newIndex + 1].position;
        newPosition = (prevPosition + nextPosition) / 2;
      }

      // Gán lại position tạm thời ở client state
      taskList[newIndex].position = newPosition;

      // Gọi API lưu xuống CSDL
      moveTask({
        id: activeId,
        dto: {
          columnId: targetColumn.id,
          position: newPosition,
        },
      });
    }
    // Thay đổi thứ tự Cột
    if (active.data.current?.type === "COLUMN") {
      setColumns((prevCols) => {
        const activeColIndex = prevCols.findIndex((c) => c.id === activeId);
        const overColIndex = prevCols.findIndex((c) => c.id === overId);
        return arrayMove(prevCols, activeColIndex, overColIndex);
      });

      // TODO: Bạn gọi API NestJS để lưu vị trí mới của Column tại đây
    }
  };
  if (isLoading) {
    return "loading";
  }

  // Tránh render DndContext phía Server để loại bỏ lỗi Hydration
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
              <ColumnComponent key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>

        {/* Portal hiển thị phần tử kéo (Drag Overlay) */}
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
