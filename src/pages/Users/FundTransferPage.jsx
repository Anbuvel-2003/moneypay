import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const FundTransferPage = () => {
  const [payeeList, setPayeeList] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [amount, setAmount] = useState("");
  const [dailyTransferAmount, setDailyTransferAmount] = useState(0);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState(""); // Added error state
  const [verificationId, setVerificationId] = useState(null);
  const transactionLimit = 20000;

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); // For navigation to the "Add Payee" page

  useEffect(() => {
    const fetchPayees = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("No user is currently logged in.");
        return;
      }

      const payeeSnapshot = await getDocs(collection(db, `users/${user.uid}/payees`));
      const fetchedPayees = payeeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPayeeList(fetchedPayees);

      if (fetchedPayees.length === 0) {
        setError("No payees found.");
      }
    };

    fetchPayees();
  }, [db, auth]);

  const handleSendOtp = (payee) => {
    if (!amount || !selectedPayee) {
      setError("Please select a payee and enter an amount.");
      return;
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Invalid amount. Please enter a valid number.");
      return;
    }

    if (transferAmount > transactionLimit - dailyTransferAmount) {
      setError("Transfer amount exceeds the daily limit of Rs. 20,000.");
      return;
    }

    setError(""); // Clear previous errors
    setSelectedPayee(payee);
    // Set up reCAPTCHA verifier for phone authentication
    window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA verified successfully.");
      },
    }, auth);

    const phoneNumber = payee.phoneNumber; // Assuming the payee object has a phoneNumber field
    const appVerifier = window.recaptchaVerifier;

    // Request OTP
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        setIsOtpSent(true); // OTP has been sent
        alert("OTP sent to the payee's phone number.");
      })
      .catch((error) => {
        setError("Error sending OTP. Please try again.");
        console.error(error);
      });
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    const credential = PhoneAuthProvider.credential(verificationId, otp);

    signInWithCredential(auth, credential)
      .then(() => {
        setDailyTransferAmount((prev) => prev + Number(amount));
        alert(`Money sent successfully to ${selectedPayee.accountHolderName}!`);
        setAmount("");
        setOtp("");
        setSelectedPayee(null);
        setIsOtpSent(false); // OTP verification is complete
      })
      .catch((error) => {
        setError("Invalid OTP. Please try again.");
        console.error(error);
      });
  };

  const handleAddPayee = () => {
    navigate("/add-payee"); // Navigate to the Add Payee page
  };

  return (
    <div className="p-4 relative max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Fund Transfer</h1>

      {/* Add Payee Button */}
      <button
        onClick={handleAddPayee}
        className="absolute bottom-4 right-4 bg-pink-900 text-white px-4 py-2 rounded-full shadow-md hover:bg-pink-700"
      >
        + Add Payee
      </button>

      {/* Displaying error message */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="mt-4">
        <h2 className="text-xl font-bold">Payee List</h2>
        <ul className="bg-white p-4 rounded shadow-md space-y-3">
          {payeeList.map((payee) => (
            <li
              key={payee.id}
              className="flex justify-between items-center py-2 border-b"
            >
              <span className="truncate">{payee.accountHolderName}</span>
              <button
                onClick={() => handleSendOtp(payee)}
                className="bg-pink-900 text-white px-4 py-2 rounded"
              >
                Transfer
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedPayee && (
        <div className="mt-8 bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold">
            Transfer to {selectedPayee.accountHolderName}
          </h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
            />
          </div>

          {/* OTP Verification */}
          {isOtpSent && (
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter OTP"
              />
            </div>
          )}

          <button
            onClick={isOtpSent ? handleVerifyOtp : null}
            className="bg-pink-900 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            {isOtpSent ? "Verify OTP and Transfer" : "Send OTP"}
          </button>

          {/* Add reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>
      )}
    </div>
  );
};

export default FundTransferPage;
