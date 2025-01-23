import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import axios from "axios";

const PayeeAddPage = () => {
  const [payeeForm, setPayeeForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [payeeAdded, setPayeeAdded] = useState(false);

  const auth = getAuth();
  const functions = getFunctions();

  const handlePayeeChange = (e) => {
    const { name, value } = e.target;
    setPayeeForm({ ...payeeForm, [name]: value });
  };

  const handleSendOtp = async () => {
    if (!Object.values(payeeForm).every((field) => field.trim() !== "")) {
      alert("All fields are mandatory.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("No user logged in.");
      return;
    }

    const sendOtp = httpsCallable(functions, "sendOtp");
    try {
      await sendOtp({ email: user.email });
      alert("OTP sent to your registered email.");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtpAndAddPayee = async () => {
    const verifyOtpAndAddPayee = httpsCallable(functions, "verifyOtpAndAddPayee");
    try {
      await verifyOtpAndAddPayee({ otp, payeeData: payeeForm });
      alert("Payee added successfully!");
      setPayeeAdded(true); // Mark payee as added
      setPayeeForm({ accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "" });
      setOtp("");
      setOtpSent(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.message || "Failed to verify OTP.");
    }
  };

  // send otp function

  const sendOtp = async (email, action) => {
    try {
      const response = await axios.post("http://localhost:5000/api/otp/send", {
        email,
        action,
      });
      console.log(response.data);
      return response.data.otpId; // Save OTP ID for verification
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // verify otp function

  const verifyOtp = async (otpId, otp) => {
    try {
      const response = await axios.post("http://localhost:5000/api/otp/verify", {
        otpId,
        otp,
      });
      console.log(response.data);
      return response.data.message;
    } catch (error) {
      console.error(error.response.data);
    }
  };
  

  return (
    <div className="p-4 mb-32">
      <h1 className="text-3xl font-bold">Add Payee</h1>
      <div className="bg-white p-4 rounded shadow-md mt-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Account Holder Name</label>
          <input
            type="text"
            name="accountHolderName"
            value={payeeForm.accountHolderName}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={payeeForm.accountNumber}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">IFSC Code</label>
          <input
            type="text"
            name="ifscCode"
            value={payeeForm.ifscCode}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={payeeForm.bankName}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Display the "Add Payee" button only after OTP is sent */}
        {!otpSent ? (
          <button onClick={handleSendOtp} className="bg-pink-900 text-white px-4 py-2 rounded">
            Send OTP
          </button>
        ) : (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Verify OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter OTP"
            />
            <button
              onClick={handleVerifyOtpAndAddPayee}
              className="bg-pink-900 text-white px-4 py-2 mt-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Show "Add Payee" button after OTP is entered and verified */}
        {otpSent && !payeeAdded && (
          <div className="mt-4">
            <button
              onClick={handleVerifyOtpAndAddPayee}
              className="bg-pink-900 text-white px-4 py-2 rounded"
            >
              Add Payee
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayeeAddPage;
