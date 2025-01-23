import React, { useState, useEffect } from "react";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const AdminSendMoney = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, "users");
        const userDocs = await getDocs(userCollection);
        const userList = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, []);

  // Handle sending money
  const handleSendMoney = async () => {
    if (!selectedUser || !amount || isNaN(amount) || amount <= 0) {
      alert("Please select a user and enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", selectedUser.id);

      // Update user's account balance
      await updateDoc(userRef, {
        accountBalance: (selectedUser.accountBalance || 0) + parseFloat(amount),
      });

      setSuccessMessage(`₹${amount} sent to ${selectedUser.username} successfully!`);
      setAmount("");
      setSelectedUser(null);

      // Fetch updated user list
      const userCollection = collection(db, "users");
      const userDocs = await getDocs(userCollection);
      const updatedUserList = userDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUserList);
    } catch (error) {
      console.error("Error sending money:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center">
        <h1 className="text-xl font-bold">Add Money</h1>
      </div>

      {/* User List */}
      <div className="mt-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-4 bg-white shadow-md cursor-pointer ${
              selectedUser?.id === user.id ? "bg-pink-200" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="rounded-full bg-pink-900 text-white w-10 h-10 flex items-center justify-center mr-4">
              {/* Safely access charAt(0) */}
              {user.username ? user.username.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="text-lg font-bold">{user.username}</p> {/* Display username */}
              <p>{user.accountNumber}</p> {/* Display account number */}
            </div>
          </div>
        ))}
      </div>

      {/* Send Money Section */}
      {selectedUser && (
        <div className="mt-6 p-4 bg-white shadow-md">
          <h2 className="text-lg font-bold mb-4">Send Money to {selectedUser.username}</h2>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button
            onClick={handleSendMoney}
            disabled={loading}
            className="bg-pink-900 text-white py-2 px-4 rounded w-full"
          >
            {loading ? "Processing..." : "Send Money"}
          </button>
          {successMessage && (
            <p className="text-green-600 text-center mt-4">{successMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSendMoney;
