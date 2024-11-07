import React, { useState, useEffect } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import ChecklistModal, { Task } from "./CheckListModal";
import { db } from "../../firebase";
import { Instructor } from "../AdminPage";

export interface Checklist {
  id: string;
  name: string;
  tasks: Task[];
  assignedInstructors?: string[];
}
interface ChecklistManagerProps {
  instructors: Instructor[];
}

const ChecklistManager: React.FC<ChecklistManagerProps> = ({ instructors }) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null,
  );

  useEffect(() => {
    const fetchChecklists = async () => {
      const querySnapshot = await getDocs(collection(db, "checklists"));
      const loadedChecklists = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Checklist[];
      setChecklists(loadedChecklists);
    };

    fetchChecklists();
  }, []);

  const handleDeleteChecklist = async (id: string) => {
    try {
      // Delete checklist from Firestore
      await deleteDoc(doc(db, "checklists", id));
      setChecklists(checklists.filter((checklist) => checklist.id !== id));

      // Delete associated tasks from all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const updatedAssignedTasks = userData.assignedTasks?.filter(
          (task: any) => task.originId !== id,
        );
        if (updatedAssignedTasks.length !== userData.assignedTasks?.length) {
          await updateDoc(doc(db, "users", userDoc.id), {
            assignedTasks: updatedAssignedTasks,
          });
        }
      });
    } catch (error) {
      console.error(
        "Error deleting checklist and associated user tasks:",
        error,
      );
    }
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setModalOpen(true);
  };

  const handleAddChecklist = () => {
    setSelectedChecklist(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSaveChecklist = (checklist: Checklist) => {
    if (selectedChecklist) {
      const updatedChecklists = checklists.map((c) =>
        c.id === checklist.id ? checklist : c,
      );
      setChecklists(updatedChecklists);
    } else {
      setChecklists([...checklists, checklist]);
    }
    closeModal();
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Manage Checklists
      </h2>
      <button
        onClick={handleAddChecklist}
        className="mb-4 px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 focus:outline-none"
      >
        Add New Checklist
      </button>
      <ul className="space-y-2">
        {checklists.map((checklist) => (
          <li
            key={checklist.id}
            className="flex justify-between items-center border-b border-gray-200 py-2"
          >
            <span>{checklist.name}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditChecklist(checklist)}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteChecklist(checklist.id || "")}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {checklists.length === 0 && <p>No checklists found.</p>}
      {modalOpen && (
        <ChecklistModal
          isOpen={modalOpen}
          onClose={closeModal}
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          instructors={instructors}
        />
      )}
    </div>
  );
};

export default ChecklistManager;
