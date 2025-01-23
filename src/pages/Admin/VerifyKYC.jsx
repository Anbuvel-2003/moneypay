import React, { useState, useEffect } from "react";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const VerifyKYC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all users and their KYC data
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

  // Handle KYC Verification
  const handleVerifyKYC = async (userId) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);

      // Update the KYC status to verified
      await updateDoc(userRef, {
        kycVerified: true, // Update this field in the user document
      });

      setSuccessMessage("KYC Verified successfully!");
      setErrorMessage("");

      // Fetch updated user list
      const userCollection = collection(db, "users");
      const userDocs = await getDocs(userCollection);
      const updatedUserList = userDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUserList);
    } catch (error) {
      setErrorMessage("Error verifying KYC. Please try again.");
      setSuccessMessage("");
      console.error("Error verifying KYC:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center">
        <h1 className="text-xl font-bold">Verify KYC</h1>
      </div>

      {/* Display Success or Error Messages */}
      {successMessage && (
        <p className="text-green-600 text-center mt-4">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 text-center mt-4">{errorMessage}</p>
      )}

      {/* User List */}
      <div className="mt-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-4 bg-white shadow-md mb-4"
          >
            <div className="mr-4">
              {/* Display user initials */}
              <div className="rounded-full bg-pink-900 text-white w-10 h-10 flex items-center justify-center">
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-lg font-bold">{user.username}</p>
              <p>{user.accountNumber}</p>
              {/* Show KYC Document Status */}
              <p className="text-sm text-gray-600">
                KYC Status:{" "}
                {user.kycVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-red-600">Pending</span>
                )}
              </p>

              {/* Display KYC details if available */}
              <div className="mt-2">
                <p><strong>PAN Card Number:</strong> {user.panCard || "Not Provided"}</p>
                <p><strong>Aadhar Card Number:</strong> {user.aadharCard || "Not Provided"}</p>
                <p><strong>Passport Number:</strong> {user.passportNumber || "Not Provided"}</p>
              </div>
            </div>

            {/* Verify Button */}
            {!user.kycVerified && (
              <button
                onClick={() => handleVerifyKYC(user.id)}
                disabled={loading}
                className="bg-pink-900 text-white py-2 px-4 rounded"
              >
                {loading ? "Verifying..." : "Verify KYC"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyKYC;
