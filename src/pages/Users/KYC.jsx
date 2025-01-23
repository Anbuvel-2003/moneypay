import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const KYC = () => {
  const [formData, setFormData] = useState({
    aadharNumber: "",
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    passport: null,
  });

  const [verificationStatus, setVerificationStatus] = useState("Not Started");

  const storage = getStorage();
  const auth = getAuth();
  const user = auth.currentUser;

  // Handle file upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  // Handle text input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Upload document to Firebase Storage
  const uploadFile = async (file, fileName) => {
    if (!file) return null;

    const storageRef = ref(storage, `kyc/${user.uid}/${fileName}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.aadharNumber) {
      alert("Please enter your Aadhaar number.");
      return;
    }

    setVerificationStatus("In Process");

    try {
      // Upload all files
      const aadharFrontURL = await uploadFile(formData.aadharFront, "aadhar-front.jpg");
      const aadharBackURL = await uploadFile(formData.aadharBack, "aadhar-back.jpg");
      const panCardURL = await uploadFile(formData.panCard, "pan-card.jpg");
      const passportURL = await uploadFile(formData.passport, "passport.jpg");

      console.log("Documents uploaded successfully:", {
        aadharFrontURL,
        aadharBackURL,
        panCardURL,
        passportURL,
      });

      // Simulate verification process
      setTimeout(() => {
        setVerificationStatus("Verified");
        alert("Verification complete! Your KYC is now verified.");
      }, 15 * 60 * 1000); // 15 minutes
    } catch (error) {
      console.error("Error during KYC verification:", error);
      setVerificationStatus("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-pink-900">KYC Verification</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
        {/* Aadhaar Number */}
        <div className="mb-4">
          <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">
            Aadhaar Number
          </label>
          <input
            type="text"
            id="aadharNumber"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="Enter Aadhaar Number"
            required
          />
        </div>

        {/* Aadhaar Front */}
        <div className="mb-4">
          <label htmlFor="aadharFront" className="block text-sm font-medium text-gray-700">
            Aadhaar Front Image
          </label>
          <input
            type="file"
            id="aadharFront"
            name="aadharFront"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
            capture="environment"
            required
          />
        </div>

        {/* Aadhaar Back */}
        <div className="mb-4">
          <label htmlFor="aadharBack" className="block text-sm font-medium text-gray-700">
            Aadhaar Back Image
          </label>
          <input
            type="file"
            id="aadharBack"
            name="aadharBack"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
            capture="environment"
            required
          />
        </div>

        {/* PAN Card */}
        <div className="mb-4">
          <label htmlFor="panCard" className="block text-sm font-medium text-gray-700">
            PAN Card Image
          </label>
          <input
            type="file"
            id="panCard"
            name="panCard"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
            capture="environment"
          />
        </div>

        {/* Passport */}
        <div className="mb-4">
          <label htmlFor="passport" className="block text-sm font-medium text-gray-700">
            Passport Image
          </label>
          <input
            type="file"
            id="passport"
            name="passport"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
            capture="environment"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-pink-900 text-white p-2 rounded-md hover:bg-pink-700"
        >
          Submit for Verification
        </button>
      </form>

      {/* Verification Status */}
      <div className="mt-6 text-center">
        <p className="text-lg font-medium">
          Verification Status:{" "}
          <span
            className={`${
              verificationStatus === "Verified"
                ? "text-green-600"
                : verificationStatus === "In Process"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {verificationStatus}
          </span>
        </p>
      </div>
    </div>
  );
};

export default KYC;
