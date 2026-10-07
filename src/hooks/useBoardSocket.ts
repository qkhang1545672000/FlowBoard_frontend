import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Socket } from "socket.io-client";
import { Column, Task } from "@/types/column";
import { ColumnLockType } from "@/types";

export interface LockedUser {
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface LockedTasksState {
  [taskId: string]: LockedUser;
}

interface UseBoardSocketProps {
  socket: Socket | null;
  activeBoardId: string | null;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  isDragging: boolean;
}

export const useBoardSocket = ({
  socket,
  activeBoardId,
  setColumns,
  isDragging,
}: UseBoardSocketProps) => {
  // State lưu danh sách các thẻ đang bị khóa bởi người dùng khác
  const [lockedTasks, setLockedTasks] = useState<LockedTasksState>({});

  // ⚡ TỐI ƯU 1: Dùng Ref cho isDragging để không cần đưa vào dependency của useEffect chính
  const isDraggingRef = useRef(isDragging);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // ⚡ TỐI ƯU 2: Bọc các hàm handler trong useCallback để giữ stable reference
  const handleTaskMoved = useCallback(
    (data: { activeId: string; columnId: string; position: number }) => {
      // Đọc trạng thái isDragging trực tiếp từ Ref mà không lo Stale Closure
      if (isDraggingRef.current) return;

      setColumns((prevCols) => {
        let movedTask: Task | null = null;

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

        movedTask = {
          ...movedTask,
          columnId: data.columnId,
          position: data.position,
        };

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
    },
    [setColumns],
  );

  const handleColumnMoved = useCallback(
    (data: { columns: Column[] }) => {
      if (!isDraggingRef.current) setColumns(data.columns);
    },
    [setColumns],
  );

  const handleColumnCreated = useCallback(
    (data: { newColumn: Column }) => {
      setColumns((prevCols) => {
        if (prevCols.some((col) => col.id === data.newColumn.id)) return prevCols;
        return [...prevCols, { ...data.newColumn, tasks: data.newColumn.tasks || [] }];
      });
    },
    [setColumns],
  );

  const handleTaskCreated = useCallback(
    (data: { columnId: string; newTask: Task }) => {
      setColumns((prevCols) => {
        // 1. Kiểm tra xem Cột chứa Task có tồn tại hay không
        const columnCurrent = prevCols.find((col) => col.id === data.columnId);
        if (!columnCurrent) return prevCols;

        // 2. Kiểm tra xem Task này đã có trong Cột chưa (tránh bị trùng do Socket/API)
        const isTaskExist = columnCurrent.tasks?.some((t) => t.id === data.newTask.id);
        if (isTaskExist) return prevCols;

        // 3. Cập nhật đúng Cột: Chèn Task mới vào mảng `tasks` của cột đó
        return prevCols.map((col) => {
          if (col.id === data.columnId) {
            return {
              ...col,
              tasks: [...(col.tasks || []), data.newTask], // ✅ Chèn Task vào mảng tasks của Cột
            };
          }
          return col;
        });
      });
    },
    [setColumns],
  );

  const handleLockColumn = useCallback(
    (data: { columnId: string; typeLock: ColumnLockType }) => {
      setColumns((prevCols) =>
        prevCols.map((col) =>
          col.id === data.columnId
            ? { ...col, lock_type: data.typeLock as ColumnLockType } // ✅ Cập nhật đúng thuộc tính lock_type
            : col,
        ),
      );
    },
    [setColumns],
  );

  const handleColumnDeleted = useCallback(
    (data: { columnId: string }) => {
      setColumns((prevCols) => prevCols.filter((col) => col.id !== data.columnId));
    },
    [setColumns],
  );

  const handleTaskLocked = useCallback(
    ({ taskId, lockedBy }: { taskId: string; lockedBy: LockedUser }) => {
      setLockedTasks((prev) => ({ ...prev, [taskId]: lockedBy }));
    },
    [],
  );

  const handleTaskUnlocked = useCallback(({ taskId }: { taskId: string }) => {
    setLockedTasks((prev) => {
      if (!prev[taskId]) return prev; // Tránh re-render thừa nếu task chưa từng bị khóa
      const updated = { ...prev };
      delete updated[taskId];
      return updated;
    });
  }, []);

  // ⚡ TỐI ƯU 3: useEffect quản lý Socket kết nối duy nhất theo activeBoardId & socket
  useEffect(() => {
    if (!socket || !activeBoardId) return;

    // Reset lại lockedTasks khi người dùng chuyển sang Board khác
    setLockedTasks({});

    const joinBoardRoom = () => {
      socket.emit("join-board", activeBoardId);
    };

    if (socket.connected) {
      joinBoardRoom();
    }
    socket.on("connect", joinBoardRoom);

    socket.on("task-moved", handleTaskMoved);
    socket.on("column-moved", handleColumnMoved);
    socket.on("column-created", handleColumnCreated);
    socket.on("column-deleted", handleColumnDeleted);
    socket.on("task-locked", handleTaskLocked);
    socket.on("task-unlocked", handleTaskUnlocked);
    socket.on("column-typeLock", handleLockColumn);
    socket.on("task-created", handleTaskCreated);

    return () => {
      if (socket.connected) {
        socket.emit("leave-board", activeBoardId);
      }
      socket.off("connect", joinBoardRoom);
      socket.off("task-moved", handleTaskMoved);
      socket.off("column-moved", handleColumnMoved);
      socket.off("column-created", handleColumnCreated);
      socket.off("column-deleted", handleColumnDeleted);
      socket.off("task-locked", handleTaskLocked);
      socket.off("task-unlocked", handleTaskUnlocked);
      socket.off("column-typeLock", handleLockColumn);
      socket.off("task-created", handleTaskCreated);
    };
  }, [
    socket,
    activeBoardId,
    handleTaskMoved,
    handleColumnMoved,
    handleColumnCreated,
    handleColumnDeleted,
    handleTaskLocked,
    handleTaskUnlocked,
    handleLockColumn,
    handleTaskCreated,
  ]);

  // ⚡ TỐI ƯU 4: Memoize giá trị trả về để tránh làm component gọi hook bị re-render vô cớ
  return useMemo(() => ({ lockedTasks }), [lockedTasks]);
};
