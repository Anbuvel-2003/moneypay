import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaLock, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Ensure the correct path to your Firebase config
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    name: "Loading...",
    email: "Loading...",
    profileImage: "../../images/icon.png", // Default placeholder image
    accountNumber: "•••• •••• •••• ••••", // Placeholder account number
  });
  const [userdata, setUserdata] = useState(null);
  const [account, setAccount] = useState(null);
  const [profileimage, setprofileimage] = useState(null);
  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");

      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          console.log("User Data in profile:", user);
          setUserdata(user);
          const accountDocRef = doc(db, "Account_data", USER_ID);
          const accountDoc = await getDoc(accountDocRef);
          if (accountDoc.exists()) {
            const account = accountDoc.data();
            console.log("Account Data: in PRofile", account);
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

  console.log(userdata,"userdata12345");

  useEffect(() => {
    getUserData();
    get_profile();
  }, []);
  // Handle logout
  const handleLogout = async () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
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
      uploadImage(file, "user_profile")
    }
  };

  const get_profile = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");  
      if (!USER_ID) {
        console.log("USER_ID not found in localStorage");
        setprofileimage(null); // Assuming setprofileimage is a state setter
        return;
      }
  
      // Reference to the "user_profile" document in Firestore
      const profileDocRef = doc(db, "user_profile", USER_ID);
  
      // Fetch the document snapshot
      const documentSnapshot = await getDoc(profileDocRef);
  
      if (documentSnapshot.exists()) {
        console.log("setprofileimage", documentSnapshot.data());
        setprofileimage(documentSnapshot.data()); // Update state with profile data
      } else {
        console.log("No profile image found");
        setprofileimage(null); // Handle the case where no data exists
      }
    } catch (error) {
      console.log("Error in get_profile:", error);
      setprofileimage(null); // Handle errors by resetting the profile image
    }
  };

  const uploadImage = async (filePath, folderName) => {
    try {
      const filename = uuidv4(); 
      const storage = getStorage(); 
      const imageRef = ref(storage, `${folderName}/images/${filename}.jpg`); 
      const file = filePath; 
      const uploadTask = uploadBytesResumable(imageRef, file);
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // You can add progress reporting here if needed
          },
          (error) => {
            console.error('Error uploading file:', error);
            reject(error); // Reject promise if error occurs
          },
          async () => {
            // Once the upload is complete, get the download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File uploaded successfully:', downloadURL);
              const USER_ID = localStorage.getItem("USER_ID");
              updateProfile(USER_ID, downloadURL);
              resolve(downloadURL); // Resolve with the URL
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file and storing URL:', error);
      throw error;
    }
  };

  const updateProfile = async (USER_ID, PROFILE) => {
    try {
      const profileDocRef = doc(db, "user_profile", USER_ID);
        await setDoc(profileDocRef, {
        profile: PROFILE,
        user_id: USER_ID,
      });
        alert("User profile updated successfully"); // Replace ToastAndroid with an alert or toast
        get_profile();
    } catch (error) {
      console.error("Error updating user profile:", error);
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
            src={profileimage == null ? userDetails.profileImage : profileimage?.profile}
            alt="Profile"
            className="rounded-full w-16 h-16 object-cover"
          />
          <label
            htmlFor="file-upload"
            className="absolute bottom-0 right-0 bg-pink-900 p-1 rounded-full cursor-pointer"
          >
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
          <h2 className="text-lg font-bold">{userdata?.username}</h2>
          <p>{userdata?.Email}</p>
          <p className="text-sm text-gray-300">
            Account Number: {account?.Accountdetails?.AccountNumber}
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
          <p className="text-gray-800">
            <i class="fi fi-tr-left"></i>Your Profile
          </p>
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
          onClick={() =>
            navigate(`/${userdata.Is_Admin ? "Admin/Verify-kyc" : "kyc"}`)
          }
        >
          <FaUser className="text-pink-900 mr-4" size={20} />
          <p className="text-gray-800">
            {userdata?.Is_Admin ? "Admin KYC Verification" : "KYC Verification"}
          </p>
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
          <p className="text-gray-800" onClick={handleLogout}>
            Log Out
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
