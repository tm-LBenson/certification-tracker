import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const SignupPage: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const userRef = doc(db, "users", googleUser.uid);


      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {

        await setDoc(userRef, {
          email: googleUser.email,
          name: googleUser.displayName,
          role: "pending",
        });
      }


      navigate("/");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-4 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Sign In</h1>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
