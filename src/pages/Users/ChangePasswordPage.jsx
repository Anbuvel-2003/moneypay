import React, { useState } from "react";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;

    // Validation: Ensure new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Reauthenticate the user with their current credentials
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);
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
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
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
          />
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
          />
        </div>

        <button
          type="submit"
          className="bg-pink-900 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
