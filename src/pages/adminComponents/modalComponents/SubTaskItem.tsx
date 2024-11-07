import React from "react";
import { SubTask } from "../CheckListModal";

interface SubTaskItemProps {
  subTask: SubTask;
  subTaskIndex: number;
  taskIndex: number;
  onSubTaskChange: (
    taskIndex: number,
    subTaskIndex: number,
    value: string,
  ) => void;
  onSaveSubTask: (taskIndex: number, subTaskIndex: number) => void;
  onEditSubTask: (taskIndex: number, subTaskIndex: number) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  subTaskIndex,
  taskIndex,
  onSubTaskChange,
  onSaveSubTask,
  onEditSubTask,
}) => (
  <div
    key={subTask.id}
    className="mt-2 relative"
  >
    <input
      type="text"
      placeholder="Sub Task"
      className="border p-2 pr-40 rounded w-full"
      value={subTask.label}
      disabled={subTask.isSaved}
      onChange={(e) => onSubTaskChange(taskIndex, subTaskIndex, e.target.value)}
    />
    {!subTask.isSaved ? (
      <button
        onClick={() => onSaveSubTask(taskIndex, subTaskIndex)}
        className="px-4 py-2 bg-blue-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
      >
        Save Sub Task
      </button>
    ) : (
      <button
        onClick={() => onEditSubTask(taskIndex, subTaskIndex)}
        className="px-4 py-2 bg-gray-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
      >
        Edit Sub Task
      </button>
    )}
  </div>
);

export default SubTaskItem;
