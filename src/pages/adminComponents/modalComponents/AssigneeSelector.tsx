import React, { useEffect, useState } from "react";
import { Task } from "../CheckListModal";
import { Instructor } from "../../AdminPage";

interface AssigneeSelectorProps {
  handleSelectAll: (checked: boolean) => void;
  handleAssigneeChange: (
    taskId: string,
    subTaskId: string | null,
    assignees: string[],
  ) => void;
  instructors: Instructor[];
  selectAll: boolean;
  task: Task;
}

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  handleSelectAll,
  handleAssigneeChange,
  instructors,
  selectAll,
  task,
}) => {
  const [localSelectAll, setLocalSelectAll] = useState(selectAll);
  const [localAssignees, setLocalAssignees] = useState<string[]>(task.assignee);

  useEffect(() => {
    setLocalSelectAll(selectAll);
    setLocalAssignees(task.assignee);
  }, [selectAll, task.assignee]);

  useEffect(() => {
    if (localAssignees.length === 0) {
      setLocalSelectAll(true);
      setLocalAssignees(["everyone"]);
      handleSelectAll(true);
      handleAssigneeChange(task.id, null, ["everyone"]);
    }
  }, [localAssignees, handleSelectAll, handleAssigneeChange, task.id]);

  const handleInstructorChange = (instructorId: string, checked: boolean) => {
    let newAssignees;
    if (checked) {
      newAssignees = [
        ...localAssignees.filter((id) => id !== "everyone"),
        instructorId,
      ];
      setLocalSelectAll(false);
    } else {
      newAssignees = localAssignees.filter((id) => id !== instructorId);
    }
    setLocalAssignees(newAssignees);
    handleAssigneeChange(task.id, null, newAssignees);
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setLocalSelectAll(true);
      setLocalAssignees(["everyone"]);
      handleSelectAll(true);
      handleAssigneeChange(task.id, null, ["everyone"]);
    } else {
      setLocalSelectAll(false);
      setLocalAssignees([]);
      handleSelectAll(false);
      handleAssigneeChange(task.id, null, []);
    }
  };

  return (
    <div className="mt-4 flex flex-col overflow-y-auto max-h-[150px]">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox"
          checked={localSelectAll}
          onChange={(e) => handleSelectAllChange(e.target.checked)}
        />
        <span className="ml-2">Assign to Everyone</span>
      </label>
      {instructors.map((instructor) => (
        <label
          key={instructor.id}
          className="inline-flex items-center mt-2"
        >
          <input
            type="checkbox"
            className="form-checkbox"
            checked={localAssignees.includes(instructor.id)}
            onChange={(e) => {
              const isSelectAll = localSelectAll;
              if (isSelectAll) {
                setLocalSelectAll(false);
              }
              handleInstructorChange(instructor.id, e.target.checked);
            }}
          />
          <span className="ml-2">{instructor.name}</span>
        </label>
      ))}
    </div>
  );
};

export default AssigneeSelector;
