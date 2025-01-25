import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Import Firestore methods
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash, faUser, faPhone } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig"; // Ensure this path points to your Firebase config
import { emailRegex } from "../../utils/regex";
import { v4 as uuidv4 } from "uuid";

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const generateRandomAccountNumber = () => {
    return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation checks
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const userid = uuidv4();
      async function generateRandomNumber(length) {
        if (length !== 14 && length !== 16 && length !== 3) {
          throw new Error("Length must be 14 or 16");
        }
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(100);
        const digits = Array.from({ length }, () =>
          Math.floor(Math.random() * 10)
        ).join("");
        console.log("Generated Random Number:", digits, "max", length);
        return parseInt(digits);
      }
      async function generateExpiryDate() {
        const currentDate = new Date();
        const randomYear =
          currentDate.getFullYear() + Math.floor(Math.random() * 16) + 15;
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        const expiryDate = `${randomMonth
          .toString()
          .padStart(2, "0")}/${randomYear.toString().slice(-2)}`;
        console.log("expiryDate", expiryDate);
        return expiryDate;
      }
      const Register_User = {
        id: userid,
        Email: email,
        Password: password,
        phonenumber: parseInt(mobile),
        username: username,
        Is_Admin: false,
      };
      const Account_data = {
        id: userid,
        // useRef: firestore().collection('Register_User').doc(userid),
        paylist: [],
        Balance: 0,
        Accountdetails: {
          AccountNumber: await generateRandomNumber(14),
          AccountName: username,
          AccountType: "Savings",
          AccountStatus: "Active",
          Cvv: await generateRandomNumber(3),
          ExpiryDate: await generateExpiryDate(),
          Cardnumber: await generateRandomNumber(16),
        },
      };
      const userDocRef = doc(db, "Register_User", userid);
      await setDoc(userDocRef, Register_User);
      const AccountDocRef = doc(db, "Account_data", userid);
      await setDoc(AccountDocRef, Account_data);
      console.log("Document written with ID: ", userDocRef.id);
      console.log("Document written with ID: ", AccountDocRef.id);
      console.log("AccountDocRef", AccountDocRef);
      if (AccountDocRef?.id && userDocRef?.id) {
        navigate("/Homescreen");
      }
    } catch (error) {
      console.log("Catch in signup", error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md my-32">
        <h1 className="text-2xl font-bold text-center mb-4">Create Your Account</h1>
        <p className="text-center text-pink-900 mb-6">Sign up and start using our platform!</p>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
        <form onSubmit={handleSignup}>
          {/* Username Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                max={20}
                maxLength={20}
              />
            </div>
          </div>

          {/* Mobile Number Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                type="number"
                placeholder="Mobile Number"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={mobile}
                onChange={(e) => e.target.value.length <=10 ? setMobile(e.target.value) : null}
                required
                maxLength={10}
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!(emailRegex.test(email)) && email.length > 5 && <p className="text-red-700 text-xs p-2">Enter Valid Email Address</p>}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-pink-900 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-2 bg-pink-800 text-white rounded-lg hover:bg-pink-900 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-pink-900 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
