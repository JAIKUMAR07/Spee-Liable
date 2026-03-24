import React from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import { useAuth } from "../../context/AuthContext";

const cardBase =
  "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md";

const Home = () => {
  const { user } = useAuth();

  const getRoleSpecificContent = () => {
    if (!user) return null;

    if (user.role === "driver") {
      return {
        title: "Driver Dashboard",
        subtitle:
          "Scan packages, optimize routes, and manage all assigned delivery stops.",
      };
    }

    if (user.role === "customer") {
      return {
        title: "Customer Portal",
        subtitle:
          "Track packages, update availability status, and manage notifications.",
      };
    }

    if (user.role === "admin") {
      return {
        title: "Admin Panel",
        subtitle:
          "Control users, monitor operations, and maintain delivery workflows.",
      };
    }

    return null;
  };

  const content = getRoleSpecificContent();

  const roleCards = {
    driver: [
      {
        to: "/qrpage",
        title: "Scan Packages",
        icon: "https://cdn-icons-png.flaticon.com/128/12216/12216522.png",
      },
      {
        to: "/map",
        title: "Delivery Routes",
        icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
      },
      {
        to: "/delivery-management",
        title: "Manage Deliveries",
        icon: "https://cdn-icons-png.flaticon.com/512/3063/3063512.png",
      },
    ],
    customer: [
      {
        to: "/customer-dashboard",
        title: "My Dashboard",
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827344.png",
      },
      {
        to: "/customer-dashboard?tab=notifications",
        title: "Notifications",
        icon: "https://cdn-icons-png.flaticon.com/512/565/565422.png",
      },
    ],
    admin: [
      {
        to: "/user-management",
        title: "User Management",
        icon: "https://cdn-icons-png.flaticon.com/512/1077/1077063.png",
      },
    ],
    guest: [
      {
        to: "/login",
        title: "Login",
        icon: "https://cdn-icons-png.flaticon.com/512/565/565422.png",
      },
      {
        to: "/register",
        title: "Register",
        icon: "https://cdn-icons-png.flaticon.com/512/1000/1000997.png",
      },
    ],
  };

  const cards = user ? roleCards[user.role] || [] : roleCards.guest;

  return (
    <Layout>
      <section className="min-h-[calc(100vh-132px)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Welcome to SpeeLiable
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
              {content?.subtitle ||
                "Smart delivery operations with faster scans, route optimization, and real-time updates."}
            </p>

            {content && (
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-emerald-700">{content.title}</h2>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link key={card.to} to={card.to} className={cardBase}>
                  <div className="mb-4 flex justify-center">
                    <img
                      src={card.icon}
                      alt={card.title}
                      className="h-16 w-16 object-contain transition group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-center text-base font-bold text-slate-800 sm:text-lg">
                    {card.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
