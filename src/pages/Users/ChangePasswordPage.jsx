import React, { useEffect, useState } from "react";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ChangePasswordPage = () => {
  const [oldpassword, setoldpassword] = useState(null);
  const [account, setAccount] = useState(null);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
    number: false,
  });

  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");

      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          console.log("gggg",user);
          setoldpassword(user?.Password);
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

  const validatePassword = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /[0-9]/.test(password),
    };
    setPasswordCriteria(criteria);
  };

  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if(name === "newPassword"){
      validatePassword(value)
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;

    if(oldPassword !== oldpassword){
      alert('Old password Incorrect')
      return;
    }
    // Validation: Ensure new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }

    try {
      let USER_ID = localStorage.getItem("USER_ID");
      if (localStorage.getItem("USER_ID")) {
        const userDocRef = doc(db, "Register_User", USER_ID); // Reference to the user's document
        // Update the password in Firestore
        await updateDoc(userDocRef, {
          Password: formData.newPassword, // Update the ⁠ Password ⁠ field
        });

        alert("Password updated successfully!");
      } else {
        alert("No user is logged in.");
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("Error updating password: " + error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-4 cursor-pointer">
        <IoReturnUpBackOutline onClick={() => window.history.back()} />Change Password</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
        {/* Old Password */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Old Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Enter old password"
            className="w-full p-2 border rounded"
            required
            maxLength={20}
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full p-2 border rounded"
            required
            maxLength={20}
          />
        </div>
        <div className="mt-2 mb-2">
          <p className={`text-sm ${passwordCriteria.length ? 'text-green-600' : 'text-red-600'}`}>
            ✔ At least 8 characters
          </p>
          <p className={`text-sm ${passwordCriteria.uppercase ? 'text-green-600' : 'text-red-600'}`}>
            ✔ At least one uppercase letter (A-Z)
          </p>
          <p className={`text-sm ${passwordCriteria.lowercase ? 'text-green-600' : 'text-red-600'}`}>
            ✔ At least one lowercase letter (a-z)
          </p>
          <p className={`text-sm ${passwordCriteria.specialChar ? 'text-green-600' : 'text-red-600'}`}>
            ✔ At least one special character (!@#$%^&*)
          </p>
          <p className={`text-sm ${passwordCriteria.number ? 'text-green-600' : 'text-red-600'}`}>
            ✔ At least one number (0-9)
          </p>
        </div>
        {/* Confirm New Password */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            className="w-full p-2 border rounded"
            required
            maxLength={20}
          />
        </div>
        <button
          type="submit"
          className="bg-pink-900 text-white px-4 py-2 rounded"
          disabled={
            (!passwordCriteria.length || 
            !passwordCriteria.lowercase || 
            !passwordCriteria.number || 
            !passwordCriteria.specialChar || 
            !passwordCriteria.uppercase)
          }
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
