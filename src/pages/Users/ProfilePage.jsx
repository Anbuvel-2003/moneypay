import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaLock, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Ensure the correct path to your Firebase config
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    name: "Loading...",
    email: "Loading...",
    profileImage: "../../images/icon.png", // Default placeholder image
    accountNumber: "•••• •••• •••• ••••", // Placeholder account number
  });
  const [newProfileImage, setNewProfileImage] = useState(null); // For the uploaded image
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserDetails({
              name: data.username || "User",
              email: data.email || "No Email",
              profileImage: data.profileImage || "../../images/icon.png",
              accountNumber: data.accountNumber || "•••• •••• •••• ••••",
            });
          } else {
            console.warn("User document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate("/login"); // Redirect to login page
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
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      try {
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        // Update the user's profile image in Firestore
        await updateDoc(doc(db, "users", user.uid), { profileImage: imageUrl });

        // Update state with the new profile image URL
        setUserDetails((prevDetails) => ({
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
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-pink-900 text-white p-6 flex items-center">
        <div className="rounded-full bg-white p-2 mr-4 relative">
          <img
            src={userDetails.profileImage}
            alt="Profile"
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
          <h2 className="text-lg font-bold">{userDetails.name}</h2>
          <p>{userDetails.email}</p>
          <p className="text-sm text-gray-300">{userDetails.accountNumber}</p>
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
          onClick={() => navigate("/kyc")}
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

export default ProfilePage;
