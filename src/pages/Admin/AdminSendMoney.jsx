import React, { useState, useEffect } from "react";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";

const AdminSendMoney = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reference the "Account_data" collection
        const querySnapshot = await getDocs(collection(db, "Account_data"));

        // Map through the documents to extract data
        const dataArray = querySnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id, // Include document ID
          ...documentSnapshot.data(), // Include document data
        }));

        console.log("Total users:", dataArray.length);
        setUsers(dataArray); // Replace `setdata` with your state setter function
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when the component mounts
  }, []);

  console.log(users, "users------>");

  const sendMoney = async (datas) => {
    try {
      const docId = uuidv4();
      const updateAmt = parseInt(datas.Balance) + parseInt(amount);
      const receiverDocRef = doc(db, "Account_data", datas?.id);
      await updateDoc(receiverDocRef, { Balance: updateAmt });
      const USER_ID = localStorage.getItem("USER_ID");
      if (!USER_ID) {
        console.log("User  ID not found");
        return;
      }
      const senderDocRef = doc(db, "Account_data", USER_ID);
      const senderDoc = await getDoc(senderDocRef);
      const senderData = senderDoc.data();
  
      const historyCollectionRef = collection(db, "History", datas?.id, "data");
      await addDoc(historyCollectionRef, {
        _id: docId,
        Amount: amount,
        From_data: senderData,
        data: new Date().toUTCString(),
        To_data: {
          Accountname: datas?.Accountdetails?.AccountName,
          Accountnumber: datas?.Accountdetails?.AccountNumber,
          _id: datas?.id,
        },
      });
      // setEnter(null);
      alert("Money added successfully");
      setSelectedUser()
    } catch (error) {
      console.error("Error sending money:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 mb-32">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center">
        <h1 className="text-xl font-bold">Add Money</h1>
      </div>

      {/* User List */}
      <div className="mt-4">
        {users.map((user) => (
          <>
            <div
              key={user.id}
              className={`flex items-center p-4 bg-white shadow-md cursor-pointer ${
                selectedUser?.id === user.id ? "bg-[#83184340]" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="rounded-full bg-pink-900 text-white w-10 h-10 flex items-center justify-center mr-4">
                {/* Safely access charAt(0) */}
                {user.Accountdetails.AccountName
                  ? user.Accountdetails.AccountName.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div>
                <p className="text-lg font-bold">
                  {user.Accountdetails.AccountName}
                </p>{" "}
                {/* Display username */}
                <p>{user.Accountdetails.AccountNumber}</p>{" "}
                {/* Display account number */}
              </div>
            </div>
            {selectedUser?.id == user?.id && (
              <div className="mt-6 p-4 bg-white shadow-md">
                <h2 className="text-lg font-bold mb-4">
                  Send Money to {selectedUser.Accountdetails.AccountName}
                </h2>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    e.target.value.length <= 12
                      ? setAmount(e.target.value)
                      : null
                  }
                  className="border p-2 w-full mb-4"
                />
                <button
                  onClick={() => sendMoney(selectedUser)}
                  disabled={loading}
                  className="bg-pink-900 text-white py-2 px-4 rounded w-full"
                >
                  {loading ? "Processing..." : "Send Money"}
                </button>
                {successMessage && (
                  <p className="text-green-600 text-center mt-4">
                    {successMessage}
                  </p>
                )}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default AdminSendMoney;
