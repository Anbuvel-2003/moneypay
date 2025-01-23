import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; // Import Firebase configuration
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const HistoryPage = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDataAndTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = "USER_ID"; // Replace with actual user ID (e.g., from authentication)

        // Fetch user data
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (!userSnapshot.exists()) {
          throw new Error("User not found.");
        }

        const user = userSnapshot.data();
        setUserData(user);

        // Fetch transaction data
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", userId)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        const transactionsList = transactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch manual updates (received from "European Space Agency")
        const manualUpdates = user.manualUpdates || []; // If stored as an array in user document
        const formattedManualUpdates = manualUpdates.map((update) => ({
          type: "received",
          source: "European Space Agency",
          date: update.date,
          amount: update.amount,
        }));

        // Combine transactions and manual updates
        const combinedTransactions = [...transactionsList, ...formattedManualUpdates];

        // Sort by date (assuming date is in a comparable format like ISO 8601)
        combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(combinedTransactions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndTransactions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center justify-center">
        <h1 className="text-xl font-bold">Transaction History</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          {loading ? (
            <p>Loading user data...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <p className="text-gray-800">
                Hello, <span className="text-pink-900 font-bold">{userData.name}</span>
              </p>
              <p className="text-gray-600">Your Balance</p>
              <h2 className="text-xl font-bold text-gray-800">
                ₹ {userData.balance.toLocaleString()}
              </h2>
            </>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h2>
          {loading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map((transaction, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-md shadow-sm"
                >
                  <div className="flex flex-col">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === "received"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "received"
                        ? transaction.source === "European Space Agency"
                          ? "European Space Agency sent to you"
                          : "Money Received"
                        : "Money Withdrawn"}
                    </p>
                    <p className="text-gray-600 text-xs">Date: {transaction.date}</p>
                    {transaction.type === "withdrawn" && (
                      <p className="text-sm text-gray-600">
                        Transfer Account: {transaction.transferAccount}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === "received"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹ {transaction.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
