import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Ensure correct path to your Firebase config

const YourProfilePage = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.username || "");
            setEmail(userData.email || "");
            setPhoneNumber(userData.mobile || ""); // Assuming 'mobile' is the field in Firestore
          } else {
            console.warn("User document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    try {
      // Update user displayName in Firebase Authentication
      if (user) {
        await updateProfile(user, { displayName: name });
      }

      // Update user data in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: name,
        mobile: phoneNumber,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <form onSubmit={handleUpdateProfile} className="bg-white p-4 rounded shadow-md">
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* Mobile Number Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Mobile Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your mobile number"
          />
        </div>

        {/* Save Changes Button */}
        <button
          type="submit"
          className="bg-pink-900 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default YourProfilePage;
