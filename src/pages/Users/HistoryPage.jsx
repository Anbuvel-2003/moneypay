import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; // Import Firebase configuration
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import dayjs from "dayjs";

const HistoryPage = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");

      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserData(user);
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

  const getdata = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");
      if (USER_ID) {
        try {
          const userDocRef = doc(db, "History", USER_ID);
          const dataCollectionRef = collection(userDocRef, "data");
          const q = query(dataCollectionRef, orderBy("data", "desc"));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => doc.data());
          console.log("data", data);
          const sortedData = data.sort(
            (a, b) => new Date(b.data) - new Date(a.data)
          );
          setTransactions(sortedData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("User ID not found in localStorage.");
      }
    } catch (error) {
      console.log("CATCH IN GETDATA", error);
    }finally{
      setLoading(false)
    }
  };

  console.log(transactions,"23123");

  useEffect(() => {
    getdata();
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
                Hello,{" "}
                <span className="text-pink-900 font-bold">
                  {account?.Accountdetails?.AccountName}
                </span>
              </p>
              <p className="text-gray-600">Your Balance</p>
              <h2 className="text-xl font-bold text-gray-800">
                ₹ {account?.Balance?.toLocaleString('en-IN')}
              </h2>
            </>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Transaction History
          </h2>
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
                  className="flex justify-between items-center p-3 border rounded-md shadow-sm h-24"
                >
                  <div className="flex gap-5 items-center w-2/3 h-full">
                    <div className="w-1/12 justify-center flex bg-[#831743] h-full rounded-full items-center text-2xl text-white">
                      <p className="uppercase">
                        {(transaction.To_data?._id ==
                        localStorage.getItem("USER_ID")
                          ? transaction.From_data?.Accountdetails.AccountName
                          : transaction.To_data?.Accountname
                        ).charAt(0)}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p>
                        {transaction.To_data?._id ==
                        localStorage.getItem("USER_ID")
                          ? transaction.From_data?.Accountdetails.AccountName
                          : transaction.To_data?.Accountname}
                      </p>
                      <p>
                        {transaction.To_data?._id ==
                        localStorage.getItem("USER_ID")
                          ? transaction.From_data?.Accountdetails.AccountNumber
                          : transaction.To_data.Accountnumber}
                      </p>
                      <p className="text-gray-600 text-xs">
                        Date: {dayjs(transaction.data).format("DD-MM-YYYY")}
                      </p>
                      {transaction.type === "withdrawn" && (
                        <p className="text-sm text-gray-600">
                          Transfer Account: {transaction.Amount}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      transaction.To_data?._id ==
                      localStorage.getItem("USER_ID")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹ {parseInt(transaction?.Amount)?.toLocaleString("en-IN")}
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
