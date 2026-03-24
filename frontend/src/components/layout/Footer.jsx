import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 lg:px-8">
        <img
          src="speeliable_logo.png"
          className="h-10 w-auto object-contain"
          alt="Speeliable"
        />
        <p className="max-w-xl text-sm text-slate-600">
          Empowering delivery workforces with clear routes, fast updates, and
          reliable customer communication.
        </p>
        <p className="text-xs font-semibold tracking-wide text-slate-500">
          © {new Date().getFullYear()} Speeliable. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
