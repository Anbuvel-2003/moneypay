import React from 'react';

const QRScanPage = () => {
  // Function to show the popup when clicked
  const handleClick = () => {
    alert("This facility is not available in this country/territory.");
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-900">QR Scan Page</h1>
      <p className="mt-2 text-lg text-gray-700">Scan QR codes here.</p>

      {/* Button that triggers the popup */}
      <button
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-pink-900 text-white rounded-lg shadow-md"
      >
        Click to Test Popup
      </button>
    </div>
  );
};

export default QRScanPage;
