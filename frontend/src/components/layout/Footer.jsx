import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-slate-300 py-8 w-full mt-auto">
      <div className="container mx-auto px-4 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <h2 className="font-extrabold text-indigo-700 text-2xl tracking-tight">
            <img
              src="speeliable_logo.png"
              className="h-12 sm:h-15 w-auto object-contain"
              alt="Speeliable"
            />
          </h2>
        </div>

        <p className="text-sm">
          Empowering delivery workforces by automating manual planing
        </p>
        <div className="mt-6 pt-6 border-t border-slate-600 text-xs font-medium uppercase tracking-wider">
          © {new Date().getFullYear()} All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
