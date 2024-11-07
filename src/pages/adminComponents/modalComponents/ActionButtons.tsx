import React from "react";

interface ActionButtonsProps {
  handleCancel: () => void;
  handleSaveChecklist: () => void;
  checklistName: string;
  tasks: { isSaved: boolean }[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleCancel,
  handleSaveChecklist,
  checklistName,
  tasks,
}) => (
  <div className="mt-6 flex justify-between">
    <button
      onClick={handleCancel}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Cancel
    </button>
    <button
      onClick={handleSaveChecklist}
      className={`px-4 py-2 ${
        !checklistName || tasks.every((task) => !task.isSaved)
          ? "bg-gray-300"
          : "bg-green-500"
      } text-white rounded`}
      disabled={!checklistName || tasks.every((task) => !task.isSaved)}
    >
      Save Checklist
    </button>
  </div>
);

export default ActionButtons;
