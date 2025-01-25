import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, collection, setDoc, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { IoReturnUpBackOutline } from "react-icons/io5";

const AddAccountPage = () => {
  const [formData, setFormData] = useState({
    Accountname: "",
    Accountnumber: "",
    confirmAccountnumber: "",
    ifsccode: "",
    Bankname: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Fetch accounts from Firestore
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const USER_ID = localStorage.getItem("USER_ID");
    if (USER_ID) {
      try {
        const querySnapshot = await getDocs(
          collection(db, "Account", USER_ID, "data")
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    const {
      Accountname,
      Accountnumber,
      confirmAccountnumber,
      Bankname,
      ifsccode,
    } = formData;

    // Validation: Ensure all fields are filled
    if (!Accountname || !Accountnumber || !Bankname || !ifsccode) {
      alert("All fields are required");
      return;
    }

    // Validation: Ensure Accountnumber is valid
    if (Accountnumber.length < 8) {
      alert("Account number is not valid");
      return;
    }

    // Validation: Ensure IFSC code is valid
    if (ifsccode.length !== 11) {
      alert("IFSC code is not valid");
      return;
    }

    // Validation: Ensure account numbers match
    if (Accountnumber !== confirmAccountnumber) {
      alert("Account numbers do not match");
      return;
    }

    setLoading(true); // Show loading indicator

    const USER_ID = localStorage.getItem("USER_ID"); // Retrieve USER_ID from localStorage
    const userid = uuidv4(); // Generate a unique ID for the account

    try {
      const accountData = {
        Accountname,
        Accountnumber,
        Bankname,
        ifsccode,
        userid: USER_ID,
        _id: userid,
      };

      console.log("Account Data:", accountData);

      // Save account data to Firestore
      await setDoc(
        doc(collection(db, "Account", USER_ID, "data"), userid),
        accountData
      );

      // Reset form and notify user
      setFormData({
        Accountname: "",
        Accountnumber: "",
        confirmAccountnumber: "",
        Bankname: "",
        ifsccode: "",
      });
      alert("Account added successfully!");
      setShowForm(false);
      fetchAccounts();
    } catch (error) {
      console.error("Error adding account:", error.message);
    } finally {
      setLoading(false); // Hide loading indicator
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
                  {account?.Accountname}
                </h3>
                <p className="text-gray-600">
                  Account: {account?.Accountnumber}
                </p>
                <p className="text-gray-600">Bank: {account?.Bankname}</p>
                <p className="text-gray-600">IFSC: {account?.ifsccode}</p>
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
              name="Accountname"
              value={formData.Accountname}
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
              type="text"
              name="Accountnumber"
              value={formData.Accountnumber}
              onChange={handleChange}
              placeholder="Enter account number"
              className="w-full p-2 border rounded"
              required
              maxLength={16}
            />
          </div>
          {/* Confirm Account Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Confirm Account Number
            </label>
            <input
            maxLength={16}
              type="number"
              name="confirmAccountnumber"
              value={formData.confirmAccountnumber}
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
              name="ifsccode"
              value={formData.ifsccode}
              maxLength={11}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Bank Name
            </label>
            <input
              type="text"
              name="Bankname"
              value={formData.Bankname}
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
