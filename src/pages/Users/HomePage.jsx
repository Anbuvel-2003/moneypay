import React, { useState, useEffect } from "react";
import {
  FaPaperPlane,
  FaDownload,
  FaTicketAlt,
  FaBolt,
  FaMobileAlt,
  FaFilm,
  FaPlane,
  FaShoppingCart,
  FaCreditCard,
  FaEllipsisH,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore methods

const HomePage = () => {
  const [userData, setUserData] = useState(null); // Initially null to check loading state
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid); // Fetching data from Firestore

      const fetchUserData = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              username: data.username || "User",
              accountNumber: data.accountNumber || "•••• •••• •••• ••••",
              accountBalance: data.accountBalance || 0,
            });
          } else {
            console.error("No user data found.");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      };

      fetchUserData();
    } else {
      console.error("User is not logged in.");
    }
  }, []);

  const handleServiceClick = (serviceName) => {
    alert(`${serviceName} facility is not available in this country/territory.`);
  };

  if (!userData) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center justify-center">
        <h1 className="text-xl font-bold">MoneyPay</h1>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-800">
            Hello, <span className="text-pink-900 font-bold">{userData.username}</span>
          </p>
          <p className="text-gray-600">Your Account Balance</p>
          <h2 className="text-xl font-bold text-gray-800">
            ₹ {userData.accountBalance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Send & Received Buttons */}
      <div className="p-4 flex justify-between">
        <button
          onClick={() => navigate("/send-money")}
          className="flex-1 bg-pink-900 text-white py-2 mx-2 rounded-lg shadow-md flex items-center justify-center"
        >
          <FaPaperPlane size={18} className="mr-2" />
          Send Money
        </button>
        <button
          onClick={() => navigate("/history")}
          className="flex-1 bg-pink-900 text-white py-2 mx-2 rounded-lg shadow-md flex items-center justify-center"
        >
          <FaDownload size={18} className="mr-2" />
          Received
        </button>
      </div>

      {/* Debit Card */}
      <div className="p-4 relative">
        <img
          src="/images/card.png"
          alt="Debit Card"
          className="w-full rounded-lg shadow-md"
        />
        <div className="absolute top-16 left-10 text-white">
          <p className="text-lg font-bold">
            {`•••• •••• •••• ${userData.accountNumber.slice(-4)}`}
          </p>
          <div className="flex justify-between mt-2">
            <p className="text-sm">04/43</p>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold">
              ₹ {userData.accountBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="p-4 mb-32">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Services</h2>
              <div className="grid grid-cols-4 gap-4">
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaTicketAlt size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Tickets</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaBolt size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Electricity</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaMobileAlt size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Recharge</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaFilm size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Movie</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaPlane size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Flight</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaShoppingCart size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Shopping</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaCreditCard size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">Card Payment</p>
                </div>
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                  onClick={handleServiceClick}
                >
                  <FaEllipsisH size={24} className="text-pink-900" />
                  <p className="text-sm mt-2 text-gray-800">More</p>
                </div>
              </div>
            </div>
    </div>
  );
};

export default HomePage;
