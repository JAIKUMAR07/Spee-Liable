import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import QrScanner from "../qr_scanner/QrScanner";
const Layout = () => {
  return (
    <div cla>
      <Header />
      <QrScanner />
      <Footer />
    </div>
  );
};

export default Layout;
