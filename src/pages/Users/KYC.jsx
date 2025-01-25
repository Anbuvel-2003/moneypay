  import React, { useEffect, useState } from "react";
  import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
  import { v4 as uuidv4 } from 'uuid';
  import { IoReturnUpBackOutline } from "react-icons/io5";

  const KYC = () => {
    const [userdata, setUserdata] = useState(null);
    const [account, setAccount] = useState(null)
    const [getdata, setgetdata] = useState(null)
    const [formData, setFormData] = useState({
      aadharNumber: "",
      PassportNumber:"",
      PanNumber:"",
      aadharFront: null,
      aadharBack: null,
      panCard: null,
      passport: null,
    });
    const [loading, setLoading] = useState(false)
    const db = getFirestore();

    const [verificationStatus, setVerificationStatus] = useState("Not Started");

    const getUserData = async () => {
      try {
        const USER_ID = localStorage.getItem("USER_ID");
        if (USER_ID) {
          const userDocRef = doc(db, "Register_User", USER_ID);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const user = userDoc.data();
            setUserdata(user);
            const accountDocRef = doc(db, "Account_data", USER_ID);
            const accountDoc = await getDoc(accountDocRef);
            if (accountDoc.exists()) {
              const account = accountDoc.data();
              console.log("Account Data:", account);
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

    const get_Data = async () => {
      try {
        // Retrieve USER_ID from localStorage
        const USER_ID = localStorage.getItem("USER_ID");
    
        if (!USER_ID) {
          console.log("USER_ID not found in localStorage");
          setgetdata(null);
          return;
        }
    
        // Reference to the "KYC" document in Firestore
        const kycDocRef = doc(db, "KYC", USER_ID);
    
        // Get the document snapshot
        const documentSnapshot = await getDoc(kycDocRef);
    
        if (documentSnapshot.exists()) {
          console.log("getdata", documentSnapshot.data());
          setgetdata(documentSnapshot.data()); // Assuming setgetdata is a state setter
        } else {
          console.log("No KYC data found for the user");
          setgetdata(null);
        }
      } catch (error) {
        console.log("Error in get_Data:", error);
        setgetdata(null);
      }
    };
  
    useEffect(() => {
      getUserData();
      get_Data()
    }, []);

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
    
    const uploadPanimg = async (filePath) => {
      return uploadImage(filePath, 'Pancard');
    };
    
    const uploadPassimg = async (filePath) => {
      return uploadImage(filePath, 'Passport');
    };
    
    const uploadAadharimg = async (filePath) => {
      return uploadImage(filePath, 'Aadhar');
    };
    
    const handleSubmit = async () => {
      try {
        setLoading(true)
        const panCardURL = await uploadPanimg(formData?.panCard); // Assuming panimg is a File or Blob object
        const aadharURL = await uploadAadharimg(formData?.aadharFront); // Assuming aadharimg is a File or Blob object
        const passportURL = await uploadPassimg(formData?.passport); // Assuming passimg is a File or Blob object
        console.log(panCardURL, aadharURL, passportURL,"231312");
        const userId = localStorage.getItem('USER_ID'); // Get user ID from local storage
    
        if (userId) {
          const kycData = {
            name: userdata?.username,
            PANCARD: panCardURL,
            AADHAR: aadharURL,
            PASSPORT: passportURL,
            is_Verified: false,
            userid: userId,
            pannumber: formData.PanNumber, // Assuming pancard is a string
            aadharnumber: formData.aadharNumber, // Assuming aadharcard is a string
            passportnumber: formData.PassportNumber, // Assuming passport is a string
          };
    
          // Firestore reference
          const kycDocRef = doc(db, 'KYC', userId);
          await setDoc(kycDocRef, kycData); // Upload the KYC data to Firestore
          console.log('KYC Data Uploaded');
          alert('KYC Updated Successfully')
          // Redirect or navigate to another page if needed
        } else {
          console.error('User ID not found');
        }
      } catch (error) {
        console.error('Error uploading KYC data:', error);
      }finally{
        setLoading(false)
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-pink-900 flex items-center gap-4 cursor-pointer">
          <IoReturnUpBackOutline onClick={() => window.history.back()} />
          KYC Verification
        </h1>
        {getdata != null ? (
          <div className="p-5 flex flex-col gap-5 bg-white rounded-md">
            <div className="flex flex-col gap-5 w-1/3">
              <h2
                className={`rounded-full w-fit px-2 text-md ${
                  getdata.is_Verified ? "bg-green-600" : "bg-slate-400"
                }`}
              >
                {getdata.is_Verified ? "Verified" : "Pending"}
              </h2>
              <div className="flex flex-col gap-2">
                <p className="flex justify-between">
                  <span>PAN Card Number:</span>
                  <span> {getdata.pannumber}</span>
                </p>
                <p className="flex justify-between">
                  <span>Aadhar Number:</span>
                  <span>{getdata.aadharnumber}</span>
                </p>
                <p className="flex justify-between">
                  <span>Passport Number:</span>
                  <span>{getdata.passportnumber}</span>
                </p>
              </div>
            </div>
            <div>
              {[
                {
                  key: "pan",
                  title: "PAN Card",
                  url: getdata.PANCARD,
                },
                {
                  key: "aadhar_card",
                  title: "AADHAR Card",
                  url: getdata.AADHAR,
                },
                {
                  key: "passport",
                  title: "Passport",
                  url: getdata.PASSPORT,
                },
              ].map((obj) => (
                <div className="flex flex-col gap-5">
                  <h3 className="font-semibold underline">{obj.title?.toUpperCase()}</h3>
                  <img src={obj.url} width={250}/>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              action={null}
              className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg"
            >
              {/* Aadhaar Number */}
              <div className="mb-4">
                <label
                  htmlFor="PanNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  PAN Card
                </label>
                <input
                  type="text"
                  id="PanNumber"
                  name="PanNumber"
                  value={formData.PanNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter PAN Card"
                  required
                  maxLength={10}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="aadharNumber"
                  className="block text-sm font-medium text-gray-700"
                >
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
                  maxLength={12}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="PassportNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Passport Number
                </label>
                <input
                  type="text"
                  id="PassportNumber"
                  name="PassportNumber"
                  value={formData.PassportNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter Passport Number"
                  required
                  maxLength={9}
                />
              </div>

              {/* Aadhaar Front */}
              <div className="mb-4">
                <label
                  htmlFor="aadharFront"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhaar Image
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

              {/* Aadhaar Back
          <div className="mb-4">
            <label
              htmlFor="aadharBack"
              className="block text-sm font-medium text-gray-700"
            >
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
          </div> */}

              {/* PAN Card */}
              <div className="mb-4">
                <label
                  htmlFor="panCard"
                  className="block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="passport"
                  className="block text-sm font-medium text-gray-700"
                >
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
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>
            </form>
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
          </>
        )}
      </div>
    );
  };

  export default KYC;
