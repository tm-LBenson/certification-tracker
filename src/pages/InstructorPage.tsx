import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

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

const InstructorPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchOrCreateUserTasks = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as { assignedTasks: AssignedTask[] };
          const userAssignedTasks = userData.assignedTasks || [];

          // Fetch all checklists assigned to "everyone"
          const globalChecklistsRef = collection(db, "checklists");
          const everyoneSnapshot = await getDocs(globalChecklistsRef);

          const newAssignedTasks = [...userAssignedTasks];
          for (const checklistDoc of everyoneSnapshot.docs) {
            const checklistData = checklistDoc.data();
            const isAlreadyAssigned = userAssignedTasks.some(
              (task) => task.originId === checklistDoc.id,
            );
            if (
              !isAlreadyAssigned &&
              checklistData.assignedInstructors.includes("everyone")
            ) {
              newAssignedTasks.push({
                originId: checklistDoc.id,
                name: checklistData.name,
                tasks: checklistData.tasks.map((task: any) => ({
                  id: task.id,
                  label: task.label,
                  completed: false,
                  subTasks: task.subTasks
                    ? task.subTasks.map((subTask: any) => ({
                        id: subTask.id,
                        label: subTask.label,
                        completed: false,
                      }))
                    : [],
                })),
              });
            }
          }

          if (newAssignedTasks.length > userAssignedTasks.length) {
            // Update Firestore if there are new tasks to be assigned
            await setDoc(userRef, {
              ...userSnap.data(),
              assignedTasks: newAssignedTasks,
            });
          }

          setAssignedTasks(newAssignedTasks);
        }
      }
    };

    if (!loading) {
      fetchOrCreateUserTasks();
    }
  }, [user, loading, db]);

  const handleTaskCheck = async (assignedTaskId: string, taskId: string) => {
    if (user) {
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

      // Update Firestore
      const userRef = doc(db, "users", user.uid);
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
    if (user) {
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

      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        assignedTasks: updatedTasks,
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Assigned Tasks
      </h2>
      <ul className="space-y-6">
        {assignedTasks.length === 0 && (
          <p className="text-gray-500">No assigned tasks found.</p>
        )}

        {assignedTasks.map((assignedTask) => (
          <li
            key={assignedTask.originId}
            className="bg-gray-50 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-bold mb-4">{assignedTask.name}</h3>
            {assignedTask.tasks && assignedTask.tasks.length > 0 && (
              <ul className="ml-6 mt-4 space-y-4">
                {assignedTask.tasks.map((task) => (
                  <li key={task.id}>
                    <h4 className="text-lg font-semibold flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          handleTaskCheck(assignedTask.originId, task.id)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 mr-3"
                      />
                      {task.label}
                    </h4>
                    {task.subTasks && task.subTasks.length > 0 && (
                      <ul className="ml-8 mt-2 space-y-2">
                        {task.subTasks.map((subTask) => (
                          <li
                            key={subTask.id}
                            className="flex items-center"
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
                              className="form-checkbox h-3.5 w-3.5 text-blue-600 mr-3"
                            />
                            <span className="text-sm">{subTask.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorPage;
