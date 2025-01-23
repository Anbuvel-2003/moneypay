import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaLock, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [adminDetails, setAdminDetails] = useState({
    name: "Loading...",
    email: "Loading...",
    profileImage: "../../images/icon.png", // Default placeholder image
    accountNumber: "•••• •••• •••• ••••", // Placeholder account number
    accountBalance: 0, // Placeholder balance
  });
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch admin details from Firestore
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "users", user.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            if (data.role === "admin") {
              setAdminDetails({
                name: data.username || "Admin",
                email: data.email || "No Email",
                profileImage: data.profileImage || "../../images/icon.png",
                accountNumber: data.accountNumber || "•••• •••• •••• ••••",
                accountBalance: data.accountBalance || 0,
              });
            } else {
              console.warn("User is not an admin.");
              navigate("/profile"); // Redirect if not an admin
            }
          } else {
            console.warn("Admin document not found.");
          }
        } catch (error) {
          console.error("Error fetching admin details:", error.message);
        }
      }
    };

    fetchAdminDetails();
  }, [user, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Admin logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `adminProfileImages/${user.uid}`);
      try {
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        // Update the admin's profile image in Firestore
        await updateDoc(doc(db, "users", user.uid), { profileImage: imageUrl });

        // Update state with the new profile image URL
        setAdminDetails((prevDetails) => ({
          ...prevDetails,
          profileImage: imageUrl,
        }));
      } catch (error) {
        console.error("Error uploading image:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center">
        <h1 className="text-xl font-bold">Admin Profile</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-pink-900 text-white p-6 flex items-center">
        <div className="rounded-full bg-white p-2 mr-4 relative">
          <img
            src={adminDetails.profileImage}
            alt="Admin Profile"
            className="rounded-full w-16 h-16 object-cover"
          />
          <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-pink-900 p-1 rounded-full cursor-pointer">
            <FaCamera size={20} className="text-white" />
          </label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold">{adminDetails.name}</h2>
          <p>{adminDetails.email}</p>
          <p className="text-sm text-gray-300">{adminDetails.accountNumber}</p>
          <p className="text-sm text-gray-300">
            Account Balance: ₹ {adminDetails.accountBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Options Section */}
      <div className="mt-4 mb-32">
        <div
          className="flex items-center p-4 bg-white shadow-md cursor-pointer"
          onClick={() => navigate("/your-profile")}
        >
          <FaUser className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">Your Profile</p>
        </div>
        <div
          className="flex items-center p-4 bg-white shadow-md cursor-pointer mt-2"
          onClick={() => navigate("/add-account")}
        >
          <FaPlus className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">Add Account</p>
        </div>

        {/* KYC Verification */}
        <div
          className="flex items-center p-4 bg-white shadow-md cursor-pointer mt-2"
          onClick={() => navigate("/Admin/Verify-kyc")}
        >
          <FaUser className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">KYC Verification</p>
        </div>

        <div
          className="flex items-center p-4 bg-white shadow-md cursor-pointer mt-2"
          onClick={() => navigate("/change-password")}
        >
          <FaLock className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">Change Password</p>
        </div>
        <div
          className="flex items-center p-4 bg-white shadow-md cursor-pointer mt-2"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">Log Out</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
