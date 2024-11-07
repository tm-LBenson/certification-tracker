import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

interface SubTask {
  id: string;
  label: string;
  completed: boolean;
}

interface Task {
  id: string;
  label: string;
  completed: boolean;
  subTasks?: SubTask[];
}

interface AssignedTask {
  originId: string;
  name: string;
  tasks: Task[];
}

const InstructorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [username, setUsername] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (id) {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as {
            assignedTasks: AssignedTask[];
            name: string;
          };
          setUsername(userData.name);
          setAssignedTasks(userData.assignedTasks || []);
        }
      }
    };

    fetchAssignedTasks();
  }, [id, db]);

  const handleTaskCheck = async (assignedTaskId: string, taskId: string) => {
    if (!isEditMode) return;

    const updatedTasks = assignedTasks.map((assignedTask) => {
      if (assignedTask.originId === assignedTaskId) {
        const updatedTaskList = assignedTask.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        );
        return { ...assignedTask, tasks: updatedTaskList };
      }
      return assignedTask;
    });

    setAssignedTasks(updatedTasks);

    if (id) {
      // Update Firestore
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        assignedTasks: updatedTasks,
      });
    }
  };

  const handleSubTaskCheck = async (
    assignedTaskId: string,
    taskId: string,
    subTaskId: string,
  ) => {
    if (!isEditMode) return;

    const updatedTasks = assignedTasks.map((assignedTask) => {
      if (assignedTask.originId === assignedTaskId) {
        const updatedTaskList = assignedTask.tasks.map((task) => {
          if (task.id === taskId) {
            const updatedSubTasks = task.subTasks?.map((subTask) =>
              subTask.id === subTaskId
                ? { ...subTask, completed: !subTask.completed }
                : subTask,
            );
            return { ...task, subTasks: updatedSubTasks };
          }
          return task;
        });
        return { ...assignedTask, tasks: updatedTaskList };
      }
      return assignedTask;
    });

    setAssignedTasks(updatedTasks);

    if (id) {
      // Update Firestore
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        assignedTasks: updatedTasks,
      });
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-6xl mx-auto">
      <Link
        to="/"
        className="mb-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Home
      </Link>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Assigned Tasks for {username}
      </h2>
      <div className="flex items-center mb-6">
        <label
          htmlFor="editMode"
          className="mr-2 font-medium text-gray-700"
        >
          Edit Mode
        </label>
        <input
          id="editMode"
          type="checkbox"
          checked={isEditMode}
          onChange={() => setIsEditMode(!isEditMode)}
          className="form-checkbox"
        />
      </div>
      {assignedTasks.length === 0 ? (
        <p className="text-gray-700">No tasks assigned.</p>
      ) : (
        assignedTasks.map((assignedTask) => (
          <div
            key={assignedTask.originId}
            className="mb-10"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {assignedTask.name}
            </h3>
            <ul className="mt-4 space-y-4">
              {assignedTask.tasks.map((task) => (
                <li
                  key={task.id}
                  className="ml-4"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        handleTaskCheck(assignedTask.originId, task.id)
                      }
                      className="form-checkbox mt-1"
                      disabled={!isEditMode}
                    />
                    <div>
                      <h4
                        className={`text-lg font-medium ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.label}
                      </h4>
                      {task.subTasks && task.subTasks.length > 0 && (
                        <ul className="ml-6 mt-2 space-y-2">
                          {task.subTasks?.map((subTask) => (
                            <li
                              key={subTask.id}
                              className="flex items-start space-x-3"
                            >
                              <input
                                type="checkbox"
                                checked={subTask.completed}
                                onChange={() =>
                                  handleSubTaskCheck(
                                    assignedTask.originId,
                                    task.id,
                                    subTask.id,
                                  )
                                }
                                className="form-checkbox mt-1"
                                disabled={!isEditMode}
                              />
                              <span
                                className={`text-base ${
                                  subTask.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {subTask.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default InstructorDetail;
