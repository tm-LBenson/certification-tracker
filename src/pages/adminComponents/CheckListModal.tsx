import React, { useState, useEffect } from "react";
import Modal from "../../Modal";
import ChecklistNameInput from "./modalComponents/ChecklistNameInput";
import TaskItem from "./modalComponents/TaskItem";
import SubTaskItem from "./modalComponents/SubTaskItem";
import ActionButtons from "./modalComponents/ActionButtons";
import AssigneeSelector from "./modalComponents/AssigneeSelector";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Instructor } from "../AdminPage";

export interface SubTask {
  id: string;
  label: string;
  completed: boolean;
  isSaved: boolean;
}

export interface Task {
  id: string;
  label: string;
  completed: boolean;
  subTasks?: SubTask[];
  assignee: string[];
  isSaved: boolean;
}

interface Checklist {
  id: string;
  name: string;
  tasks: Task[];
}

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: Checklist | null;
  onSave: (checklist: Checklist) => void;
  instructors: Instructor[];
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  onClose,
  checklist,
  onSave,
  instructors,
}) => {
  const [checklistName, setChecklistName] = useState("");
  const [isNameSaved, setIsNameSaved] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignedInstructors, setAssignedInstructors] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (checklist) {
      setChecklistName(checklist.name);
      setIsNameSaved(true);
      setTasks(checklist.tasks);
      setAssignedInstructors(checklist.tasks[0]?.assignee || []);
      setSelectAll(assignedInstructors.includes("everyone"));
    } else {
      resetFields();
    }
  }, [checklist]);

  const handleSaveChecklistName = () => {
    setIsNameSaved(true);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        label: "",
        subTasks: [],
        completed: false,
        isSaved: false,
        assignee: [],
      },
    ]);
  };

  const addSubTask = (taskIndex: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subTasks?.push({
      id: Date.now().toString(),
      label: "",
      completed: false,
      isSaved: false,
    });
    setTasks(updatedTasks);
  };

  const handleSaveChecklist = async () => {
    const { id, ...checklistDataWithoutId } = {
      id: checklist?.id,
      name: checklistName,
      tasks: tasks.map((task) => ({
        ...task,
        subTasks: task?.subTasks?.map((subTask) => ({
          ...subTask,
        })),
      })),
      assignedInstructors,
    };

    try {
      if (checklist?.id) {
        const checklistDoc = doc(db, "checklists", checklist.id);
        await updateDoc(checklistDoc, checklistDataWithoutId);
        onSave({ id: checklist.id, ...checklistDataWithoutId });
      } else {
        const docRef = await addDoc(
          collection(db, "checklists"),
          checklistDataWithoutId,
        );
        onSave({ id: docRef.id, ...checklistDataWithoutId });
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
    }
  };

  const resetFields = () => {
    setChecklistName("");
    setIsNameSaved(false);
    setTasks([]);
    setAssignedInstructors([]);
    setSelectAll(false);
  };

  const handleCancel = () => {
    resetFields();
    onClose();
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setAssignedInstructors(["everyone"]);
    } else {
      setAssignedInstructors([]);
    }
  };

  const handleAssigneeChange = (assignees: string[]) => {
    if (!selectAll) {
      setAssignedInstructors(assignees);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
    >
      <div className="p-4 bg-white rounded-lg">
        <h2 className="text-xl font-bold">
          {checklist ? "Edit Checklist" : "Create New Checklist"}
        </h2>

        <ChecklistNameInput
          checklistName={checklistName}
          isNameSaved={isNameSaved}
          onSave={handleSaveChecklistName}
          onEdit={() => setIsNameSaved(false)}
          onNameChange={(value) => {
            setIsNameSaved(false);
            setChecklistName(value);
          }}
        />

        {isNameSaved && (
          <>
            <AssigneeSelector
              handleSelectAll={handleSelectAllChange}
              handleAssigneeChange={(_, __, assignees) =>
                handleAssigneeChange(assignees)
              }
              instructors={instructors}
              selectAll={selectAll}
              task={{
                id: "checklist",
                label: "",
                subTasks: [],
                completed: false,
                isSaved: true,
                assignee: assignedInstructors,
              }}
            />

            <button
              onClick={addTask}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Add Task
            </button>

            {tasks.map((task, taskIndex) => (
              <TaskItem
                key={task.id}
                task={task}
                taskIndex={taskIndex}
                onTaskChange={(index, value) => {
                  const updatedTasks = [...tasks];
                  updatedTasks[index].label = value;
                  setTasks(updatedTasks);
                }}
                onSaveTask={(index) => {
                  const updatedTasks = [...tasks];
                  updatedTasks[index].isSaved = true;
                  setTasks(updatedTasks);
                }}
                onEditTask={(index) => {
                  const updatedTasks = [...tasks];
                  updatedTasks[index].isSaved = false;
                  setTasks(updatedTasks);
                }}
                addSubTask={addSubTask}
                subTasks={task.subTasks?.map((subTask, subTaskIndex) => (
                  <SubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    subTaskIndex={subTaskIndex}
                    taskIndex={taskIndex}
                    onSubTaskChange={(taskIndex, subTaskIndex, value) => {
                      const updatedTasks = [...tasks];
                      if (updatedTasks[taskIndex].subTasks) {
                        updatedTasks[taskIndex].subTasks[subTaskIndex].label =
                          value;
                        setTasks(updatedTasks);
                      }
                    }}
                    onSaveSubTask={(taskIndex, subTaskIndex) => {
                      const updatedTasks = [...tasks];
                      if (updatedTasks[taskIndex].subTasks) {
                        updatedTasks[taskIndex].subTasks[subTaskIndex].isSaved =
                          true;
                        setTasks(updatedTasks);
                      }
                    }}
                    onEditSubTask={(taskIndex, subTaskIndex) => {
                      const updatedTasks = [...tasks];
                      if (updatedTasks[taskIndex].subTasks) {
                        updatedTasks[taskIndex].subTasks[subTaskIndex].isSaved =
                          false;
                        setTasks(updatedTasks);
                      }
                    }}
                  />
                ))}
              />
            ))}

            <ActionButtons
              handleCancel={handleCancel}
              handleSaveChecklist={handleSaveChecklist}
              checklistName={checklistName}
              tasks={tasks}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChecklistModal;
