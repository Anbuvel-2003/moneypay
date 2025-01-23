import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, []);

  // Handle KYC verification
  const verifyKYC = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { kycVerified: true });
      alert("KYC Verified");
      setUsers(users.map(user => user.id === userId ? { ...user, kycVerified: true } : user));
    } catch (error) {
      console.error("Error verifying KYC:", error.message);
    }
  };

  // Handle money transfer
  const sendMoney = async () => {
    if (!selectedUser || !amount || isNaN(amount)) {
      alert("Please select a user and enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const transaction = {
        sender: "Admin",
        recipient: selectedUser.name,
        recipientId: selectedUser.id,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
      };

      // Save transaction to Firestore
      await updateDoc(doc(db, "users", selectedUser.id), {
        balance: (selectedUser.balance || 0) + parseFloat(amount),
      });

      alert("Money sent successfully!");
      setSelectedUser(null);
      setAmount("");
    } catch (error) {
      console.error("Error sending money:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* User List */}
      <div>
        <h2 className="text-lg font-bold mb-2">Users</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow-md border">
              <h3 className="text-gray-800 font-bold">{user.username}</h3>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">
                KYC: {user.kycVerified ? "Verified" : "Not Verified"}
              </p>
              <button
                className={`${
                  user.kycVerified
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-900"
                } text-white px-4 py-2 rounded mt-2`}
                onClick={() => verifyKYC(user.id)}
                disabled={user.kycVerified}
              >
                {user.kycVerified ? "KYC Verified" : "Verify KYC"}
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded mt-2 ml-2"
                onClick={() => setSelectedUser(user)}
              >
                Send Money
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Send Money Section */}
      {selectedUser && (
        <div className="bg-white p-4 mt-6 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Send Money</h2>
          <p>
            Sending to: <strong>{selectedUser.username}</strong>
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border rounded mt-2 mb-4"
          />
          <button
            onClick={sendMoney}
            className="bg-pink-900 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Money"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
