import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-500">Unauthorized Access</h1>
      <p className="text-gray-700 mt-2">
        You do not have permission to view this page.
      </p>
      <Link to="/" className="mt-4 text-blue-600 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
