import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { IoReturnUpBackOutline } from "react-icons/io5";

const AddAccountPage = () => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const auth = getAuth();
  const user = localStorage.getItem('USER_ID');

  // Fetch accounts from Firestore
  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        try {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "accounts")
          );
          const fetchedAccounts = [];
          querySnapshot.forEach((doc) => {
            fetchedAccounts.push(doc.data());
          });
          setAccounts(fetchedAccounts);
        } catch (error) {
          console.error("Error fetching accounts:", error.message);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { accountNumber, confirmAccountNumber, accountHolderName, ifscCode, bankName } = formData;

    // Validation: Ensure account numbers match
    if (accountNumber !== confirmAccountNumber) {
      alert("Account numbers do not match. Please check again.");
      return;
    }

    if (!user) {
      alert("User is not logged in. Please log in and try again.");
      return;
    }

    setLoading(true);
    try {
      const accountData = {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid, "accounts", accountNumber), accountData);

      // Update UI
      setAccounts([...accounts, accountData]);
      setFormData({
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankName: "",
      });
      setShowForm(false);
      alert("Account added successfully!");
    } catch (error) {
      console.error("Error adding account:", error.message);
      alert("Failed to add account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-4 cursor-pointer">
        <IoReturnUpBackOutline onClick={() => window.history.back()} />
        Add Account
      </h1>

      {/* Display Existing Accounts */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Your Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts added yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded shadow-md border"
              >
                <h3 className="text-gray-800 font-bold">
                  {account.accountHolderName}
                </h3>
                <p className="text-gray-600">
                  Account: {account.accountNumber}
                </p>
                <p className="text-gray-600">Bank: {account.bankName}</p>
                <p className="text-gray-600">IFSC: {account.ifscCode}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Add Account Form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-pink-900 text-white px-4 py-2 rounded mb-4"
      >
        {showForm ? "Close Form" : "Add New Account"}
      </button>

      {/* Add Account Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 mb-32 rounded shadow-md"
        >
          {/* Account Holder Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter account holder name"
              className="w-full p-2 border rounded"
              required
              max={30}
              maxLength={30}
            />
          </div>

          {/* Account Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Account Number
            </label>
            <input
              type="number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={(e) =>
                e.target.value.length <= 16 ? handleChange(e) : null
              }
              placeholder="Enter account number"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* Confirm Account Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Confirm Account Number
            </label>
            <input
              type="number"
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={(e) =>
                e.target.value.length <= 16 ? handleChange(e) : null
              }
              placeholder="Re-enter account number"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* IFSC Code */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              className="w-full p-2 border rounded"
              required
              maxLength={20}
            />
          </div>

          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
              className="w-full p-2 border rounded"
              required
              maxLength={40}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-pink-900 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Adding Account..." : "Add Account"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddAccountPage;
