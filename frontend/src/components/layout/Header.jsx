import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  // navList Data
  const navList = (
    <ul className="flex space-x-3 text-black  font-bold text-md px-5 ">
      <li>
        <p>Home</p>
      </li>

      <li>
        <p>Qr-Scan</p>
      </li>

      <li>
        <p>Map</p>
      </li>
    </ul>
  );
  return (
    <nav className="bg-gradient-to-r from-sky-400 to-emerald-400  ">
      {/* main  */}
      <div className="lg:flex lg:justify-between items-center py-3 lg:px-3 ">
        {/* left  */}
        <div className="left py-3 lg:py-0">
          <h2 className=" font-bold text-black text-2xl text-center">
            SpeeLiable
          </h2>
        </div>

        {/* right  */}
        <div className="right flex justify-center mb-4 lg:mb-0">{navList}</div>

        {/* Search Bar  */}
      </div>
    </nav>
  );
};

export default Header;
