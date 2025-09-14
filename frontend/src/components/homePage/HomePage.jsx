import React from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
const Home = () => {
  return (
    <Layout>
      <div>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            Welcome to Speeliable
          </h1>
          <p className="text-gray-600 mb-10 text-center max-w-md">
            Scan QR codes from product labels, List out multiple addresses, and
            generate the most efficient travel route to visit them all
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            {/* QR Code Scanner Card */}
            <Link
              to="/qrpage"
              className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/128/12216/12216522.png"
                alt="Scan QR Codes"
                className="w-full h-3/4 object-contain p-4"
              />

              <h1 className="text-center text-lg font-semibold py-2">
                Scan for Adress{" "}
              </h1>
            </Link>

            {/* Map Explorer Card */}
            <Link
              to="/map"
              className="w-64 h-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
                alt="Explore Map"
                className="w-full h-3/4 object-contain p-4"
              />

              <h1 className="text-center text-lg font-semibold py-2">
                Start Delivery{" "}
              </h1>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
