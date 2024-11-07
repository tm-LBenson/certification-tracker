// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { auth } from "../firebase";

interface AuthContextType {
  user: User | null;
  role: "admin" | "instructor" | "pending" | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "instructor" | "pending" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // If user does not exist, create a new entry with status 'pending'
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            role: "pending",
            assignedTasks: [],
          });
        }

        if (docSnap.exists() && docSnap.data().role) {
          setRole(docSnap.data().role as "admin" | "instructor" | "pending");
        } else {
          setRole("pending");
        }

        // Fetch tasks assigned to 'everyone' and assign them to the user if not already assigned
        const globalChecklistsRef = collection(db, "checklists");
        const everyoneQuery = query(
          globalChecklistsRef,
          where("assignedInstructors", "array-contains", "everyone"),
        );
        const everyoneSnapshot = await getDocs(everyoneQuery);

        const userAssignedTasks = docSnap.exists()
          ? docSnap.data().assignedTasks || []
          : [];

        const newAssignedTasks = [];
        for (const checklistDoc of everyoneSnapshot.docs) {
          const checklistData = checklistDoc.data();
          const isAlreadyAssigned = userAssignedTasks.some(
            (task: any) => task.originId === checklistDoc.id,
          );
          if (!isAlreadyAssigned) {
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

        if (newAssignedTasks.length > 0) {
          await setDoc(userRef, {
            ...docSnap.data(),
            assignedTasks: [...userAssignedTasks, ...newAssignedTasks],
          });
        }

        setUser(user);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);
export { useAuth };
