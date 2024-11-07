import React from "react";
import { Task } from "../CheckListModal";

interface TaskItemProps {
  task: Task;
  taskIndex: number;
  onTaskChange: (index: number, value: string) => void;
  onSaveTask: (index: number) => void;
  onEditTask: (index: number) => void;
  addSubTask: (index: number) => void;
  subTasks: React.ReactNode;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  taskIndex,
  onTaskChange,
  onSaveTask,
  onEditTask,
  addSubTask,
  subTasks,
}) => (
  <div
    key={task.id}
    className="mt-4 relative"
  >
    <div className="relative">
      <input
        type="text"
        placeholder="Primary Task"
        className="border p-2 pr-40 rounded w-full"
        value={task.label}
        disabled={task.isSaved}
        onChange={(e) => onTaskChange(taskIndex, e.target.value)}
      />
      {!task.isSaved ? (
        <button
          onClick={() => onSaveTask(taskIndex)}
          className="px-4 py-2 bg-blue-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
        >
          Save Task
        </button>
      ) : (
        <button
          onClick={() => onEditTask(taskIndex)}
          className="px-4 py-2 bg-gray-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
        >
          Edit Task
        </button>
      )}
    </div>
    {task.isSaved && (
      <>
        {subTasks}
        <button
          onClick={() => addSubTask(taskIndex)}
          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Add Sub Task
        </button>
      </>
    )}
  </div>
);

export default TaskItem;
