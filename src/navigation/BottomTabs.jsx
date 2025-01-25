import React from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHistory,
  FaQrcode,
  FaGift, FaUserCircle
} from "react-icons/fa";

// Import pages
import HomePage from "../pages/Users/HomePage";
import HistoryPage from "../pages/Users/HistoryPage";
import QRScanPage from "../pages/Users/QRScanPage";
import RewardsPage from "../pages/Users/RewardsPage";
import ProfilePage from "../pages/Users/ProfilePage";
import YourProfilePage from "../pages/Users/YourProfilePage";
import AddAccountPage from "../pages/Users/AddAccountPage";
import ChangePasswordPage from "../pages/Users/ChangePasswordPage";
import FundTransferPage from "../pages/Users/FundTransferPage";
import KYC from "../pages/Users/KYC";
import PayeeAddPage from "../pages/Users/PayeeAddPage";
import AdminPanel from "../pages/Admin/AdminPanel";
import AdminHome from "../pages/Admin/AdminHome";
import AdminProfile from "../pages/Admin/AdminProfile";
import AdminSendMoney from "../pages/Admin/AdminSendMoney";
import VerifyKYC from "../pages/Admin/VerifyKYC";

const BottomTabs = () => {
  const location = useLocation();

  // Simulate user role (e.g., fetched from auth context or state)
  const userRole = "admin"; // Change this to "user" for regular user

  // Function to check if a tab is active
  const isActive = (path) => location.pathname === path;

  // Shared tabs for both admin and regular users
  const sharedTabs = [
    { path: "/homepage", label: "Home", icon: <FaHome size={24} /> },
    { path: "/history", label: "History", icon: <FaHistory size={24} /> },
    { path: "/qrscan", label: "QR Scan", icon: <FaQrcode size={24} /> },
    { path: "/rewards", label: "Rewards", icon: <FaGift size={24} /> },
  ];

  // Admin-specific tabs
  const adminTabs = [
    { path: "/homepage", label: "Home", icon: <FaHome size={24} /> },
    { path: "/history", label: "History", icon: <FaHistory size={24} /> },
    { path: "/qrscan", label: "QR Scan", icon: <FaQrcode size={24} /> },
    { path: "/rewards", label: "Rewards", icon: <FaGift size={24} /> },
    {
      path: "/profile",
      label: "Profile",
      icon: <FaUserCircle size={24} />,
    },
    // { path: "/Admin/Admin-panel", label: "Admin", icon: <FaCogs size={24} /> },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Routes Section */}
      <div className="flex-grow">
        <Routes>
          {/* Shared routes */}
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/qrscan" element={<QRScanPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/send-money" element={<FundTransferPage />} />
          <Route path="/your-profile" element={<YourProfilePage />} />
          <Route path="/add-account" element={<AddAccountPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/Kyc" element={<KYC />} />
          <Route path="/add-payee" element={<PayeeAddPage />} />

          {/* Admin-only routes */}
          <Route path="/Admin/Admin-home" element={<AdminHome />} />
          <Route path="/Admin/Admin-profile" element={<AdminProfile />} />
          <Route path="/Admin/Admin-panel" element={<AdminPanel />} />
          <Route path="/Admin/Admin-send-money" element={<AdminSendMoney />} />
          <Route path="/Admin/Verify-kyc" element={<VerifyKYC />} />
        </Routes>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 w-full bg-pink-900 shadow-lg border-t border-gray-200">
        <div className="flex justify-around py-2">
          {/* Render tabs based on role */}
          {(userRole === "admin" ? adminTabs : sharedTabs).map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center w-1/5 ${
                isActive(tab.path) ? "text-pink-700" : "text-gray-500"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  isActive(tab.path) ? "bg-pink-100" : ""
                } transition`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-xs mt-1 transition ${
                  isActive(tab.path) ? "font-medium text-white" : ""
                }`}
              >
                {tab.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTabs;
