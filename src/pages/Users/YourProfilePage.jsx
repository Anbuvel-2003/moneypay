import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { db } from "../../firebaseConfig"; // Ensure correct path to your Firebase config

const YourProfilePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [userdata, setUserdata] = useState(null);
  const [account, setAccount] = useState(null);
  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");

      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          console.log("User Data in profile:", user);
          setUserdata(user);
          const accountDocRef = doc(db, "Account_data", USER_ID);
          const accountDoc = await getDoc(accountDocRef);
          if (accountDoc.exists()) {
            const account = accountDoc.data();
            console.log("Account Data: in PRofile", account);
            setAccount(account);
          } else {
            console.log("No account data found for this user.");
          }
        } else {
          console.log("No user data found for this user ID.");
        }
      } else {
        console.log("USER_ID not found in localStorage.");
      }
    } catch (error) {
      console.error("Error in getUserData:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    try {

      
    } catch (error) {
    console.log("CATCH IN HANDLEUPDATEPROFILE", error);
      
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-4 cursor-pointer"><IoReturnUpBackOutline onClick={() => window.history.back()}/> Your Profile</h1>
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
            max={30}
            maxLength={30}
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
            maxLength={10}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your mobile number"
            max={10}
            maxLength={10}
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
