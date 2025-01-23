import React, { useState, useEffect } from "react";
import {
  FaUserEdit,
  FaTrashAlt,
  FaUserShield,
  FaPaperPlane,
  FaDownload,
  FaBolt,
  FaCreditCard,
  FaEllipsisH,
  FaFilm,
  FaMobileAlt,
  FaPlane,
  FaShoppingCart,
  FaTicketAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const AdminHome = () => {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);

      const fetchAdminData = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists() && docSnap.data().role === "admin") {
            setAdminData({
              username: docSnap.data().username || "Admin",
              accountBalance: docSnap.data().accountBalance || 0,
              accountNumber: docSnap.data().accountNumber || "•••• •••• •••• ••••",
            });
          } else {
            console.error("User is not an admin or data not found.");
            navigate("/"); // Redirect non-admin users
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAdminData();
    } else {
      console.error("User is not logged in.");
      navigate("/login");
    }
  }, [navigate]);

  const handleServiceClick = (serviceName) => {
    alert(`${serviceName} facility is not available in this country/territory.`);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center justify-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Admin Info */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-800">
            Hello, <span className="text-pink-900 font-bold">{adminData.username}</span>
          </p>
          <p className="text-gray-600">Admin Account Balance</p>
          <h2 className="text-xl font-bold text-gray-800">
            ₹ {adminData.accountBalance.toLocaleString()}
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
                onClick={() => navigate("/Admin/Admin-send-money")}
                className="flex-1 bg-pink-900 text-white py-2 mx-2 rounded-lg shadow-md flex items-center justify-center"
              >
                <FaDownload size={18} className="mr-2" />
                Add Money
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
            {`•••• •••• •••• ${adminData.accountNumber.slice(-4)}`}
          </p>
          <div className="mt-2">
            <p className="text-lg font-bold">
              ₹ {adminData.accountBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="p-4 mb-32">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Services</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Tickets", icon: <FaTicketAlt size={24} className="text-pink-900" /> },
            { name: "Electricity", icon: <FaBolt size={24} className="text-pink-900" /> },
            { name: "Recharge", icon: <FaMobileAlt size={24} className="text-pink-900" /> },
            { name: "Movie", icon: <FaFilm size={24} className="text-pink-900" /> },
            { name: "Flight", icon: <FaPlane size={24} className="text-pink-900" /> },
            { name: "Shopping", icon: <FaShoppingCart size={24} className="text-pink-900" /> },
            { name: "Card Payment", icon: <FaCreditCard size={24} className="text-pink-900" /> },
            { name: "More", icon: <FaEllipsisH size={24} className="text-pink-900" /> },
          ].map((service) => (
            <div
              key={service.name}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
              onClick={() => handleServiceClick(service.name)}
            >
              {service.icon}
              <p className="text-sm mt-2 text-gray-800">{service.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
