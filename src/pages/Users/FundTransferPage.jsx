import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import {
  getAuth
} from "firebase/auth";
import {
  getFirestore,
  collection, onSnapshot,
  getDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { Emailsendfun } from "./PayeeAddPage";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

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
  const [userdata, setUserdata] = useState(null);
  const [account, setAccount] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); // For navigation to the "Add Payee" page

  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");
      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserdata(user);
          const accountDocRef = doc(db, "Account_data", USER_ID);
          const accountDoc = await getDoc(accountDocRef);
          if (accountDoc.exists()) {
            const account = accountDoc.data();
            console.log("Account Data:", account);
            setAccount(account);
          } else {
            console.log("No account data found for this user.");
          }
        } else {
          console.log("No user data found for this user ID.");
        }
      } else {
        console.log("USER_ID not found in localStorage.");
      }
    } catch (error) {
      console.error("Error in getUserData:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const getMyAccounts = async () => {
    try {
      // Retrieve the user ID from localStorage
      const USER_ID = localStorage.getItem("USER_ID");
      if (USER_ID) {
        // Reference the 'data' subcollection under 'payees' for the specific USER_ID
        const payeesCollectionRef = collection(db, "payees", USER_ID, "data");
        // Listen to real-time updates using onSnapshot
        const unsubscribe = onSnapshot(payeesCollectionRef, (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => doc.data());
          setPayeeList(data); // Update the state with the fetched data
          console.log("Payees data:", data);
        });
        // Optionally return the unsubscribe function to clean up the listener
        return unsubscribe;
      } else {
        console.log("User ID not found in localStorage.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error.message);
    }
  };

  useEffect(() => {
    getMyAccounts();
  }, []);

  const Addaccountfun = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID"); // Retrieve USER_ID from localStorage
  
      if (!USER_ID) {
        console.error("User ID not found");
        setLoader(false);
        return;
      }
  
      // Fetch user details
      const userDocRef = doc(db, "Register_User", USER_ID);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const user = userDocSnap.data();
        console.log("user?.phonenumber", user?.phonenumber);
  
        // Fetch daily transaction details
        const dailyDocRef = doc(db, "daily_transaction", USER_ID);
        const dailyDocSnap = await getDoc(dailyDocRef);
  
        if (dailyDocSnap.exists()) {
          const data = dailyDocSnap.data();
          console.log("data", data?.limit);
          const currentDate = moment().format("MMM Do YY");
          console.log("currentDate", currentDate);
  
          const dailyLimit = data?.limit?.find((item) => item.date === currentDate);
          console.log("dailyLimit", dailyLimit);
  
          if (!dailyLimit) {
            // Create initial daily transaction limit
            await setDoc(dailyDocRef, {
              limit: [
                {
                  amount: 0,
                  date: currentDate,
                },
              ],
            });
  
            await checkTotalAmount(USER_ID, user);
          } else {
            const updatedAmount = parseInt(dailyLimit.amount) + parseInt(amount);
            if (updatedAmount <= 20000) {
              await checkTotalAmount(USER_ID, user);
            } else {
              alert("Completed Your Transfer Limit per day, Please Contact your Admin");
            }
          }
        } else {
          // Set up a new daily transaction limit
          await setDoc(dailyDocRef, {
            limit: [
              {
                amount: 0,
                date: moment().format("MMM Do YY"),
              },
            ],
          });
  
          await checkTotalAmount(USER_ID, user);
          setIsOtpSent(true)
        }
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error in Addaccountfun:", error);
    }
  };
  
  const checkTotalAmount = async (USER_ID, user) => {
    try {
      const totalAmountDocRef = doc(db, "Total_Amount", USER_ID);
      const totalAmountDocSnap = await getDoc(totalAmountDocRef);
  
      if (totalAmountDocSnap.exists()) {
        const totalAmountData = totalAmountDocSnap.data();
        console.log("totalAmountData", totalAmountData);
  
        const total = parseInt(totalAmountData?.total || 0) + parseInt(amount);
        console.log("total", total);
  
        if (total <= 100000) {
          Emailsendfun(user, setIsOtpSent); // Call your email-sending function
          console.log("Transaction is within limits");
        } else {
          alert("Completed Your Transfer Limit, Please Contact your Admin");
        }
      } else {
        Emailsendfun(user, setIsOtpSent); // Call your email-sending function if no total amount exists
      }
    } catch (error) {
      console.error("Error in checkTotalAmount:", error);
    }
  };

  async function transferPayee(payee) {
    try {
      setSelectedPayee(payee);
    } catch (error) {}
  }

  async function sendOTPToUser(){
    try {
      if(amount > 20000){
        alert('Amount should not be greater than 20,000')
      }
      else{
        if(amount <= account.Balance){
          Addaccountfun()
        }
        else{
          alert('Insufficient Balance In Account');
        }
      }
    } catch (error) {
      
    }
  }

  const Verify = async (data) => {
    try {
      setOtploader(true); // Assuming you have a loader state
      const tokendata = localStorage.getItem("tokendata"); // Get token from localStorage

      if (!tokendata) {
        toast.error("Token not found");
        setOtploader(false);
        return;
      }

      const apiUrl = "http://localhost:8080/api/verify-otp";
      const postResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokendata}`,
        },
        body: JSON.stringify({ otp: data }),
      });

      if (!postResponse.ok) {
        const errorMessage = await postResponse.text();
        toast.error(`Error: ${errorMessage}`);
        throw new Error(`POST request failed: ${postResponse.statusText}`);
      }

      const postResult = await postResponse.json();
      console.log("POST response:", postResult);

      if (postResult === true) {
        const USER_ID = localStorage.getItem("USER_ID");

        if (!USER_ID) {
          toast.error("User ID not found");
          setOtploader(false);
          return;
        }

        const userid = uuidv4();

        // Fetch daily transaction
        const dailyDocRef = doc(db, "daily_transaction", USER_ID);
        const dailyDocSnap = await getDoc(dailyDocRef);

        if (dailyDocSnap.exists()) {
          const totalamount = dailyDocSnap.data();
          const currentDate = moment().format("MMM Do YY");
          const todayLimit = totalamount?.limit?.find(
            (item) => item.date === currentDate
          );
          if (todayLimit) {
            const updatedAmount =
              parseInt(todayLimit.amount) + parseInt(amount);

            // Update daily transaction limit
            await setDoc(dailyDocRef, {
              limit: [
                {
                  amount: updatedAmount,
                  date: currentDate,
                },
              ],
            });

            // Add transaction to history
            const historyDocRef = doc(db, "History", USER_ID, "data", userid);
            await setDoc(historyDocRef, {
              From_data: account,
              To_data: Details,
              Amount: amount,
              _id: userid,
              data: new Date().toUTCString(),
            });

            // Update account balance
            const updatedBalance = account?.Balance - amount;
            const accountDocRef = doc(db, "Account_data", USER_ID);
            await updateDoc(accountDocRef, { Balance: updatedBalance });

            // Fetch and update total amount
            const totalAmountDocRef = doc(db, "Total_Amount", USER_ID);
            const totalAmountDocSnap = await getDoc(totalAmountDocRef);

            if (totalAmountDocSnap.exists()) {
              const totalAmountData = totalAmountDocSnap.data();
              const total =
                parseInt(totalAmountData?.total) + parseInt(amount);

              await updateDoc(totalAmountDocRef, { total });
              alert("Transfer successful");
            } else {
              await setDoc(totalAmountDocRef, { total: parseInt(amount) });
              alert("Transfer successful");
            }
          } else {
            alert("Transaction limit not found for today");
          }
        } else {
          alert("Daily transaction data not found");
        }

        setOtploader(false);
      } else {
        toast.error("Invalid OTP");
        setOtploader(false);
      }
    } catch (error) {
      console.error("Error in Verify function:", error);
      toast.error("Something went wrong. Please try again.");
      setOtploader(false);
    }
  };

  const handleAddPayee = () => {
    navigate("/add-payee"); // Navigate to the Add Payee page
  };

  const verifyOTP = async () => {
    try {
      const tokendata = localStorage.getItem("otptokendata"); // Get token from localStorage
  
      if (!tokendata) {
        alert("Token not found");
        return;
      }
  
      const apiUrl = "http://localhost:8080/api/verify-otp";
      const postResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokendata}`,
        },
        body: JSON.stringify({ otp }),
      });
  
      if (!postResponse.ok) {
        const errorMessage = await postResponse.text();
        toast.error(`Error: ${errorMessage}`);
        throw new Error(`POST request failed: ${postResponse.statusText}`);
      }
  
      const postResult = await postResponse.json();
      console.log("POST response:", postResult);
  
      if (postResult === true) {
        const USER_ID = localStorage.getItem("USER_ID");
  
        if (!USER_ID) {
          alert("User ID not found");
          return;
        }
  
        const userid = uuidv4(); // Generate a unique ID for the transaction
  
        // Fetch daily transaction
        const dailyDocRef = doc(db, "daily_transaction", USER_ID);
        const dailyDocSnap = await getDoc(dailyDocRef);
  
        if (dailyDocSnap.exists()) {
          const totalamount = dailyDocSnap.data();
          console.log("Total daily transaction:", totalamount);
  
          const currentDate = moment().format("MMM Do YY");
          const todayLimit = totalamount?.limit?.find(
            (item) => item.date === currentDate
          );
  
          if (todayLimit) {
            console.log("Today's transaction limit:", todayLimit);
            const updatedAmount = parseInt(todayLimit.amount) + parseInt(amount);
  
            // Update daily transaction limit
            await setDoc(dailyDocRef, {
              limit: [
                {
                  amount: updatedAmount,
                  date: currentDate,
                },
              ],
            });
  
            // Add transaction to history
            const historyDocRef = doc(
              db,
              "History",
              USER_ID,
              "data",
              userid
            );
            await setDoc(historyDocRef, {
              From_data: account,
              To_data: selectedPayee,
              Amount: amount,
              _id: userid,
              data: new Date().toUTCString(),
            });
  
            // Update account balance
            const updatedBalance = account?.Balance - amount;
            const accountDocRef = doc(db, "Account_data", USER_ID);
            await updateDoc(accountDocRef, { Balance: updatedBalance });
  
            // Fetch and update total amount
            const totalAmountDocRef = doc(db, "Total_Amount", USER_ID);
            const totalAmountDocSnap = await getDoc(totalAmountDocRef);
  
            if (totalAmountDocSnap.exists()) {
              const totalAmountData = totalAmountDocSnap.data();
              const total = parseInt(totalAmountData?.total) + parseInt(amount);
  
              await updateDoc(totalAmountDocRef, { total });
              alert("Transfer successful");
              setSelectedPayee(null)
              setAmount(null)
              setOtp(null)
            } else {
              await setDoc(totalAmountDocRef, { total: parseInt(amount) });
              alert("Transfer successful");
              setSelectedPayee(null)
              setAmount(null)
              setOtp(null)
            }
          } else {
            alert("Transaction limit not found for today");
          }
        } else {
          alert("Daily transaction data not found");
        }
  
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("Error in Verify function:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 relative max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Fund Transfer</h1>

      {/* Add Payee Button */}
      <button
        onClick={handleAddPayee}
        className="absolute right-4 bg-pink-900 text-white px-4 py-2 rounded-full shadow-md hover:bg-pink-700"
      >
        + Add Payee
      </button>

      {/* Displaying error message */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="mt-4 mb-8">
        <h2 className="text-xl font-bold">Payee List</h2>
        <ul className="bg-white p-4 rounded space-y-3 flex flex-col gap-4 mt-8">
          {payeeList.map((payee) => (
            <>
              <li
                key={payee._id}
                className={`flex justify-between items-center p-8 shadow-lg rounded-md`}
              >
                <div className="flex flex-col gap-2">
                  <span className="truncate font-semibold">
                    Account Name: {payee.Accountname}
                  </span>
                  <span className="truncate">
                    Account Number: {payee.Accountnumber}
                  </span>
                  <span className="truncate">Bank Name: {payee.Bankname}</span>
                  <span className="truncate">IFSC Code: {payee.ifsccode}</span>
                </div>
                <button
                  onClick={() => transferPayee(payee)}
                  className="bg-pink-900 text-white px-4 py-2 rounded"
                >
                  Transfer
                </button>
              </li>
              {selectedPayee && (
                <div className="mt-8 bg-white p-4 rounded shadow-md">
                  <h2 className="text-xl font-bold">
                    Transfer to {selectedPayee.Accountname}
                  </h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter amount"
                      disabled={!isOtpSent}
                    />
                  </div>

                  {/* OTP Verification */}
                  {isOtpSent && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-bold mb-2">
                        Enter OTP
                      </label>
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
                    onClick={isOtpSent ? verifyOTP : sendOTPToUser}
                    className="bg-pink-900 text-white px-4 py-2 rounded w-full sm:w-auto"
                  >
                    {isOtpSent ? "Verify OTP and Transfer" : "Send OTP"}
                  </button>

                  {/* Add reCAPTCHA container */}
                  <div id="recaptcha-container"></div>
                </div>
              )}
            </>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FundTransferPage;
