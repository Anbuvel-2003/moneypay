import React, { useState, useEffect } from "react";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Switch } from "@radix-ui/react-switch";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";

const VerifyKYC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all users and their KYC data
  const getData = async () => {
    try {
      // Reference the "KYC" collection
      const querySnapshot = await getDocs(collection(db, "KYC"));

      // Map through the documents to extract data
      const dataArray = querySnapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id, // Include the document ID
        ...documentSnapshot.data(), // Spread the document data
      }));

      console.log("Total users:", dataArray.length);
      console.log("Fetched Data:", dataArray);

      // Update state (assuming you're using useState for state management)
      setUsers(dataArray); // Replace ⁠ setdata ⁠ with your actual state updater function
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    getData();
  }, []);

  // Handle KYC Verification
  const handleVerifyKYC = async (userId) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);

      // Update the KYC status to verified
      await updateDoc(userRef, {
        kycVerified: true, // Update this field in the user document
      });

      setSuccessMessage("KYC Verified successfully!");
      setErrorMessage("");

      // Fetch updated user list
      const userCollection = collection(db, "users");
      const userDocs = await getDocs(userCollection);
      const updatedUserList = userDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUserList);
    } catch (error) {
      setErrorMessage("Error verifying KYC. Please try again.");
      setSuccessMessage("");
      console.error("Error verifying KYC:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getChange = async (val, id) => {
    try {
      // Reference the specific document in the "KYC" collection
      const docRef = doc(db, "KYC", id);
  
      // Update the ⁠ is_Verified ⁠ field
      await updateDoc(docRef, {
        is_Verified: val,
      });
  
      // Re-fetch the data after the update
      getData(); // Ensure ⁠ getData ⁠ is your function for fetching the updated data
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Header */}
      <div className="bg-pink-900 text-white p-4 flex items-center">
        <h1 className="text-xl font-bold">Verify KYC</h1>
      </div>

      {/* Display Success or Error Messages */}
      {successMessage && (
        <p className="text-green-600 text-center mt-4">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 text-center mt-4">{errorMessage}</p>
      )}

      {/* User List */}
      <div className="mt-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-4 bg-white shadow-md mb-4"
          >
            <div className="mr-4">
              {/* Display user initials */}
              <div className="rounded-full bg-pink-900 text-white w-10 h-10 flex items-center justify-center">
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-lg font-bold">{user.username}</p>
              <p>{user.accountNumber}</p>
              {/* Show KYC Document Status */}
              <p className="text-sm text-gray-600">
                KYC Status:{" "}
                {user.is_Verified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-red-600">Pending</span>
                )}
              </p>

              {/* Display KYC details if available */}
              <div className="mt-2">
                <p>
                  <strong>PAN Card Number:</strong>{" "}
                  {user.pannumber || "Not Provided"}
                </p>
                <p>
                  <strong>Aadhar Card Number:</strong>{" "}
                  {user.aadharnumber || "Not Provided"}
                </p>
                <p>
                  <strong>Passport Number:</strong>{" "}
                  {user.passportnumber || "Not Provided"}
                </p>
              </div>
            </div>
            {user?.is_Verified ? (
              <FaToggleOn className="text-4xl text-[#831743] cursor-pointer" onClick={() => getChange(false, user?.userid)}/>
            ) : (
              <FaToggleOff className="text-4xl text-[#831743] cursor-pointer" onClick={() => getChange(true, user?.userid)}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyKYC;
