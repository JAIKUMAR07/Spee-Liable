import React, { useState, useEffect } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Define structure for a delivery person
const initialPerson = {
  name: "",
  location: [], // [lat, lng]
  address: "",
  mobile_number: "",
  available: "",
};
const QrScanner = () => {
  const [people, setPeople] = useState([]); // Array of full person objects from backend
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const regionId = "qr-code-region";

  // FETCH ALL STOPS FROM BACKEND ON COMPONENT MOUNT
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/delivery-stops`);
        setPeople(response.data);
      } catch (error) {
        console.error("Failed to fetch delivery stops:", error);
        alert("Could not load existing stops. Is the backend running?");
      }
    };
    fetchStops();
  }, []); // Empty dependency array means this runs once on mount

  // Toggle scanner
  const toggleScanning = () => setScanning((prev) => !prev);

  // MODIFIED: Handle successful QR scan -> Send to backend
  const handleScanSuccess = async (decodedText) => {
    try {
      // qr se pass hoga
      const parsedData = JSON.parse(decodedText);

      // Validate required fields  are checking
      if (!parsedData.name || !parsedData.location) {
        alert("Invalid QR data: missing name or location");
        return;
      }

      // Prepare the data for the backend
      // Convert array format [lat, lng] to object format {lat, lng} if needed
      let locationData;
      if (Array.isArray(parsedData.location)) {
        locationData = {
          lat: parsedData.location[0],
          lng: parsedData.location[1],
        };
      } else {
        locationData = parsedData.location; // Assume it's already {lat, lng}
      }

      const stopData = {
        name: parsedData.name,
        location: locationData,
        address: parsedData.address || "Unknown Address",
        mobile_number: parsedData.mobile_number || "N/A",
        available: parsedData.available || "unknown",
      };

      // POST the new stop to the backend
      const response = await axios.post(
        `${API_BASE_URL}/delivery-stops`,
        stopData
      );

      // If successful, update local state with the response from the server
      setPeople((prev) => [...prev, response.data]);
      alert(`${response.data.name} added successfully!`);

      setScanning(false);
    } catch (err) {
      console.error(err);
      if (err.response) {
        // Server responded with an error status (4xx, 5xx)
        alert(`Error: ${err.response.data.message}`);
      } else {
        // Other errors (network, etc.)
        alert(
          "Failed to add delivery stop. Please check your connection and backend server."
        );
      }
    }
  };

  // QR Scanner Effect (Camera)
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(regionId, {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(handleScanSuccess, (err) => console.warn(err));

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  // Image Upload Scan
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("upload-region");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error("Image scan failed", err);
      alert("Could not read QR from image.");
    } finally {
      // Clear upload input
      event.target.value = null;
    }
  };

  // MODIFIED: Add person manually -> Send to backend
  const addManually = async () => {
    if (!name.trim() || !manualAddress.trim()) {
      alert("Please enter both name and address.");
      return;
    }

    // // Mock location — in real app, use Google Maps Geocoding API
    // const mockedLocation = {
    //   lat: Math.random() * 0.002 + 12.97,
    //   lng: Math.random() * 0.002 + 77.59,
    // }; // Bangalore area

    try {
      const response = await axios.post(`${API_BASE_URL}/delivery-stops`, {
        name: name.trim(),
        //location: mockedLocation,
        address: manualAddress.trim(),
        mobile_number: "Not scanned",
        available: "unknown",
      });

      setPeople((prev) => [...prev, response.data]);
      setName("");
      setManualAddress("");
    } catch (error) {
      console.error("Error adding stop manually:", error);
      alert("Failed to add stop manually. Check backend connection.");
    }
  };

  // MODIFIED: Delete person -> Delete from backend
  const deletePerson = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/delivery-stops/${id}`);
      // If successful, remove the item from the local state
      setPeople((prev) => prev.filter((person) => person._id !== id));
    } catch (error) {
      console.error("Error deleting stop:", error);
      alert("Failed to delete stop.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Delivery Stop Manager
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={toggleScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {scanning ? "Stop Scanning" : "Scan QR (Camera)"}
        </button>

        <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition">
          Upload QR Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* Scanner View */}
      {scanning && <div id={regionId} className="mt-4" />}
      <div id="upload-region" style={{ display: "none" }} />

      {/* Manual Input Form */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Add Manually</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Enter Address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addManually}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            ➕ Add Person
          </button>
        </div>
      </div>

      {/* List of People (Show Only Names) */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-3">
          Delivery Stops ({people.length})
        </h3>
        {people.length > 0 ? (
          <ul className="space-y-2">
            {people.map((person, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100 group"
              >
                <span className="font-medium text-gray-800">{person.name}</span>
                <button
                  onClick={() => deletePerson(person._id, person.name)}
                  className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No stops added yet.</p>
        )}
      </div>

      {/* Done Button (Future: send to route optimizer) */}
      <button
        onClick={() => {
          console.log("Final Delivery List:", people);
          alert(`Ready to optimize route for ${people.length} stops!`);
        }}
        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        ✅ Optimize Route
      </button>
    </div>
  );
};

export default QrScanner;
