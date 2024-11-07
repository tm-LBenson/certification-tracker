import React from "react";

interface ChecklistNameInputProps {
  checklistName: string;
  isNameSaved: boolean;
  onSave: () => void;
  onEdit: () => void;
  onNameChange: (value: string) => void;
}

const ChecklistNameInput: React.FC<ChecklistNameInputProps> = ({
  checklistName,
  isNameSaved,
  onSave,
  onEdit,
  onNameChange,
}) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Checklist Name"
      className="border p-2 pr-40 rounded mt-2 w-full"
      onChange={(e) => {
        onNameChange(e.target.value);
      }}
      value={checklistName}
    />
    {!isNameSaved ? (
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
      >
        Save Name
      </button>
    ) : (
      <button
        onClick={onEdit}
        className="px-4 py-2 bg-gray-500 text-white h-[38px] rounded absolute right-0.5 bottom-0.5"
      >
        Edit Name
      </button>
    )}
  </div>
);

export default ChecklistNameInput;
