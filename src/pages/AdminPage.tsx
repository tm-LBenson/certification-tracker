import React, { useState, useEffect } from "react";
import InstructorList from "./adminComponents/InstructorList";
import ChecklistManager from "./adminComponents/ChecklistManager";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Modal from "../Modal";
import { useAuth } from "../context/AuthContext";

export interface Instructor {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AdminPageProps {
  instructors: Instructor[];
}

const AdminPage: React.FC<AdminPageProps> = ({ instructors }) => {
  const [pendingUsers, setPendingUsers] = useState<Instructor[]>([]);
  const [allUsers, setAllUsers] = useState<Instructor[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAllUsersModalOpen, setIsAllUsersModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const currentUser = useAuth().user;
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Instructor[];
      const pending = usersData.filter((user) => user.role === "pending");
      const filteredUsers = usersData.filter(
        (user) => user.email !== currentUser?.email,
      );
      setPendingUsers(pending);
      setAllUsers(filteredUsers);
    };

    fetchUsers();
  }, [db, currentUser]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    setAllUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      const userRef = doc(db, "users", userToDelete);
      await deleteDoc(userRef);
      setPendingUsers((prev) =>
        prev.filter((user) => user.id !== userToDelete),
      );
      setAllUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      setUserToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddUser = async () => {
    if (newUserEmail) {
      await addDoc(collection(db, "users"), {
        email: newUserEmail,
        role: "pending",
      });
      setNewUserEmail("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Admin Dashboard
      </h2>
      <div className="mb-10">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Instructor List
        </h3>
        <InstructorList instructors={instructors} />
      </div>
      <div className="mb-10">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Checklist Manager
        </h3>
        <ChecklistManager instructors={instructors} />
      </div>
      <div className="mb-10">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Pending Users
        </h3>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-700">No pending users.</p>
        ) : (
          <ul className="space-y-4">
            {pendingUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between"
              >
                <span className="text-lg text-gray-900">{user.email}</span>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleRoleChange(user.id, "admin")}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Set as Admin
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, "instructor")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Set as Instructor
                  </button>
                  <button
                    onClick={() => confirmDeleteUser(user.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-10">
        <button
          onClick={() => setIsAllUsersModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Manage All Users
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">Add New User</h3>
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Enter user email"
            className="px-4 py-2 border rounded w-full"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add User
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Confirm Delete
        </h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete this user?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isAllUsersModalOpen}
        onClose={() => setIsAllUsersModalOpen(false)}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">All Users</h3>
        {allUsers.length === 0 ? (
          <p className="text-gray-700">No users available.</p>
        ) : (
          <ul className="space-y-4">
            {allUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between"
              >
                <span className="text-lg text-gray-900">{user.email}</span>
                <div className="flex space-x-4">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleRoleChange(user.id, "admin")}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Set as Admin
                    </button>
                  )}
                  {user.role !== "instructor" && (
                    <button
                      onClick={() => handleRoleChange(user.id, "instructor")}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Set as Instructor
                    </button>
                  )}
                  <button
                    onClick={() => confirmDeleteUser(user.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

export default AdminPage;
