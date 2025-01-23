import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { emailRegex } from "../../utils/regex";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";// Ensure firebaseConfig is correctly set up

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inactivityTimeout = useRef(null);

  const auth = getAuth();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const { role } = userDoc.data();
            if (role === "admin") {
              navigate("pages/Admin/Admin-home");
            } else if (role === "user") {
              navigate("/pages/HomePage");
            } else {
              setError("Unauthorized role. Please contact support.");
            }
          } else {
            setError("User data not found. Please contact support.");
          }
        } catch (err) {
          setError("An error occurred while fetching user data.");
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    try {
      const userQuery = query(
        collection(db, "Register_User"),
        where("Email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot?.empty) {
        const user = querySnapshot.docs[0].data();
        if (user?.Password == password) {
          console.log(user,"l,,,");
          localStorage.setItem("USER_ID", user?.id);
          navigate("/homepage");
        } else {
          alert("Incorrect password. Please try again.");
        }
      } else {
        alert("No user found with this email.");
      }
    } catch (err) {
      const errorMessages = {
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/too-many-requests":
          "Too many unsuccessful attempts. Please try again later.",
      };
      setError(errorMessages[err.code] || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevState) => !prevState);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    signOut(auth)
      .then(() => {
        alert("Logged out due to inactivity.");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error during logout:", error.message);
      });
  }, [auth]);

  // Reset inactivity timer
  // const resetInactivityTimer = useCallback(() => {
  //   if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
  //   inactivityTimeout.current = setTimeout(logout, 5 * 60 * 1000); // 5 minutes
  // }, [logout]);

  // // Add activity listeners
  // useEffect(() => {
  //   const handleActivity = () => resetInactivityTimer();

  //   window.addEventListener("mousemove", handleActivity);
  //   window.addEventListener("keypress", handleActivity);
  //   window.addEventListener("touchstart", handleActivity);

  //   resetInactivityTimer();

  //   return () => {
  //     window.removeEventListener("mousemove", handleActivity);
  //     window.removeEventListener("keypress", handleActivity);
  //     window.removeEventListener("touchstart", handleActivity);
  //     if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
  //   };
  // }, [resetInactivityTimer]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome Back</h1>
        <p className="text-center text-pink-900 mb-6">
          Sign in with your email and password
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                max={50}
                maxLength={50}
              />
            </div>
            {!(emailRegex.test(email)) && email.length > 5 && <p className="text-red-700 text-xs p-2">Enter Valid Email Address</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 text-white rounded-lg transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-800 hover:bg-pink-900"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-pink-900 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
