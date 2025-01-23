import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/Auth/LoginScreen";
import SignupScreen from "./components/Auth/SignupScreen";
import BottomTabs from "./navigation/BottomTabs";
import "./index.css";

const App = () => {
  const [loading, setLoading] = useState(
    !sessionStorage.getItem("splashScreenShown") // Check if splash screen has already been shown
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Manage authentication state

  // Check Firebase authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Update authentication state based on user presence
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Handle splash screen timeout
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("splashScreenShown", "true"); // Prevent splash screen from showing again
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return <SplashScreen />; // Show splash screen if loading is true
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <LoginScreen setIsAuthenticated={setIsAuthenticated} />
            }
          />

          {/* Signup Route */}
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/" /> : <SignupScreen />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={isAuthenticated ? <BottomTabs /> : <Navigate to="/login" />}
          />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
