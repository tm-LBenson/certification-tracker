// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminPage, { Instructor } from "./pages/AdminPage";
import InstructorPage from "./pages/InstructorPage";

import SignupPage from "./pages/SignupPage";
import InstructorList from "./pages/adminComponents/InstructorList";
import InstructorDetail from "./pages/adminComponents/InstructorDetail";
import Navbar from "./Navbar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: Array<"admin" | "instructor" | "pending">;
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(role!)) {
    return (
      <Navigate
        to="/signup"
        replace
      />
    );
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { role } = useAuth();

  switch (role) {
    case "admin":
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    case "instructor":
      return (
        <Navigate
          to="/instructor"
          replace
        />
      );
    case "pending":
      return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-yellow-50 text-center">
          <div className="bg-yellow-100 p-6 rounded-md shadow-md max-w-lg">
            <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
              Registration Pending
            </h2>
            <p className="text-gray-700">
              Your registration is pending approval. Please wait for an
              administrator to review your account.
            </p>
          </div>
        </div>
      );
    default:
      return <SignupPage />;
  }
};

const App: React.FC = () => {
  useEffect(() => {
    const rolesQuery = query(
      collection(db, "users"),
      where("role", "==", "instructor"),
    );

    const fetchInstructors = async () => {
      const querySnapshot = await getDocs(rolesQuery);
      const fetchedInstructors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role,
      }));
      setInstructors(fetchedInstructors);
    };

    fetchInstructors();
  }, []);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  return (
    <AuthProvider>
      <Navbar />
      <Router>
        <Routes>
          <Route
            path="/"
            element={<RoleBasedRedirect />}
          />
          <Route
            path="/signup"
            element={<SignupPage />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage instructors={instructors} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructors"
            element={
              <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                <InstructorList instructors={instructors} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructors/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                <InstructorDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
