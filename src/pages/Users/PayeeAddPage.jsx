import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import axios from "axios";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";

export const Emailsendfun = async (value, setOtpSent) => {
  try {
    const apiUrl = "http://localhost:8080/api/send-otp";
    const postResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        email: value?.Email,
        userName: value?.username,
      }),
    });

    console.log("POST response status:", postResponse);
    // Check if the response is successful
    if (!postResponse.ok) {
      throw new Error(`POST request failed: ${postResponse.statusText}`);
    }
    const postResult = await postResponse.json();
    console.log("Parsed POST result:", postResult);
    if (postResult.message === "OTP sent successfully") {
      alert("OTP sent successfully");
      localStorage.setItem("otptokendata", postResult?.token);
      setOtpSent(true);
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

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
    setPayeeForm({
      ...payeeForm,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    });
  };

  const handleSendOtp = async () => {
    if (
      payeeForm?.accountHolderName == "" ||
      payeeForm?.accountNumber == "" ||
      payeeForm?.bankName == "" ||
      payeeForm?.ifscCode == ""
    ) {
      alert("All fields are required");
    } else {
      if (payeeForm?.accountNumber?.length < 8) {
        alert("Account number is not valid");
      } else {
        if (payeeForm?.ifscCode == 11) {
          alert("IFSC code is not valid");
        } else {
          const USER_ID = localStorage.getItem("USER_ID");
          const userDocRef = doc(db, "Register_User", USER_ID);
          const querySnapshot = await getDoc(userDocRef);
          if (querySnapshot.exists()) {
            const user = querySnapshot.data();
            console.log("user?.phonenumber:", user?.phonenumber);
            Emailsendfun(user, setOtpSent);
          }
        }
      }
    }
  };

  const verifyOTP = async (data) => {
    try {
      const token = localStorage.getItem("otptokendata");
      if (!token) {
        console.error("Token not found in localStorage.");
        return;
      }
      const apiUrl = "http://localhost:8080/api/verify-otp";
      const postResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otp: data,
        }),
      });

      // Check if the request was successful
      if (!postResponse.ok) {
        throw new Error(`POST request failed: ${postResponse?.statusText}`);
      }

      const postResult = await postResponse.json();
      console.log("POST response:", postResult);

      // Check if the OTP is valid
      if (postResult === true) {
        const USER_ID = localStorage.getItem("USER_ID"); // Get user ID from localStorage

        if (!USER_ID) {
          console.error("User ID not found.");
          return;
        }

        const userid = uuidv4(); // Generate a unique ID

        // Save payee details to Firestore
        const payeeDocRef = doc(db, "payees", USER_ID, "data", userid);
        await setDoc(payeeDocRef, {
          Accountname: payeeForm?.accountHolderName,
          Accountnumber: payeeForm?.accountNumber,
          Bankname: payeeForm?.bankName,
          ifsccode: payeeForm?.ifscCode,
          userid: USER_ID,
          _id: userid,
        });
        alert("OTP verified successfully.");
        window.history.back()
      } else {
        alert("OTP is incorrect.");
      }
    } catch (error) {
      console.error("Error during verification:", error);
    }
  };

  return (
    <div className="p-4 mb-32">
      <h1 className="text-3xl font-bold flex items-center gap-4 cursor-pointer">
        <IoReturnUpBackOutline onClick={() => window.history.back()} />
        Add Payee
      </h1>
      <div className="bg-white p-4 rounded shadow-md mt-4">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={payeeForm.accountHolderName}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
            maxLength={25}
            max={25}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Account Number
          </label>
          <input
            type="number"
            name="accountNumber"
            value={payeeForm.accountNumber}
            onChange={(e) =>
              e.target.value.length <= 16 ? handlePayeeChange(e) : null
            }
            className="w-full p-2 border rounded"
            maxLength={16}
            max={16}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            name="ifscCode"
            value={payeeForm.ifscCode}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
            maxLength={11}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={payeeForm.bankName}
            onChange={handlePayeeChange}
            className="w-full p-2 border rounded"
            maxLength={30}
          />
        </div>

        {/* Display the "Add Payee" button only after OTP is sent */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            className="bg-pink-900 text-white px-4 py-2 rounded"
          >
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
              maxLength={6}
            />
            <button
              onClick={() => verifyOTP(otp)}
              className="bg-pink-900 text-white px-4 py-2 mt-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Show "Add Payee" button after OTP is entered and verified */}
        {/* {otpSent && !payeeAdded && (
          <div className="mt-4">
            <button
              onClick={handleVerifyOtpAndAddPayee}
              className="bg-pink-900 text-white px-4 py-2 rounded"
            >
              Add Payee
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PayeeAddPage;
