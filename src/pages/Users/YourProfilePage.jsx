import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 
const YourProfilePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const getUserData = async () => {
    try {
      const USER_ID = localStorage.getItem("USER_ID");

      if (USER_ID) {
        const userDocRef = doc(db, "Register_User", USER_ID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user = userDoc.data();
          console.log("User Data in profile:", user);
          setName(user.username);
          setEmail(user.Email);
          setPhoneNumber(user.phonenumber);
          const accountDocRef = doc(db, "Account_data", USER_ID);
          const accountDoc = await getDoc(accountDocRef);
          if (accountDoc.exists()) {
            const account = accountDoc.data();
            console.log("Account Data: in PRofile", account);
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

  const handleUpdateProfile = async (e) => {
    console.log("Enter function");
      const USER_ID = localStorage.getItem("USER_ID");
  
    if (USER_ID) {
      try {
        const userDocRef = doc(db, "Register_User", USER_ID);
  
        // Update the user's profile information
        await updateDoc(userDocRef, {
          username: name, // Make sure `name` is defined in your component
          phonenumber: phoneNumber, // Ensure `phoneNumber` is defined
        });
        console.log("User profile updated");
  
        // Reference to the account data document in Firestore
        const accountDocRef = doc(db, "Account_data", USER_ID);
  
        // Fetch account data to update the relevant fields
        const accountDoc = await getDoc(accountDocRef);
  
        if (accountDoc.exists()) {
          const accountData = accountDoc.data();
          console.log("Account Data:", accountData);
  
          // Update account details
          await updateDoc(accountDocRef, {
            Accountdetails: {
              AccountName: name,
              AccountNumber: accountData?.Accountdetails?.AccountNumber || "",
              AccountStatus: accountData?.Accountdetails?.AccountStatus || "",
              AccountType: accountData?.Accountdetails?.AccountType || "",
              Cardnumber: accountData?.Accountdetails?.Cardnumber || "",
              Cvv: accountData?.Accountdetails?.Cvv || "",
              ExpiryDate: accountData?.Accountdetails?.ExpiryDate || "",
            },
          });
  
          console.log("Account details updated successfully");
          alert("Profile updated successfully");
        } else {
          console.log("No account data found for this user ID.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    } else {
      console.log("User ID not found in localStorage.");
      alert("User ID not found. Please log in again.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white p-4 rounded shadow-md"
      >
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) =>{console.log("name",e?.target?.value),
             setName(e.target.value)}}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* Mobile Number Field */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            maxLength={10}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your mobile number"
          />
        </div>

        {/* Save Changes Button */}
        <button
          type="submit"
          className="bg-pink-900 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default YourProfilePage;
