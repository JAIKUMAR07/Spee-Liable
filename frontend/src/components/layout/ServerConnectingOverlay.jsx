import React, { useState } from "react";
import { Server, RefreshCw, Hourglass } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ServerConnectingOverlay = () => {
  const { isWakingUp, checkServerConnection } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isWakingUp) return null;

  const handleManualRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    if (checkServerConnection) {
      await checkServerConnection();
    }
    setTimeout(() => setIsRetrying(false), 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1120]/95 backdrop-blur-md animate-fadeIn p-4 selection:bg-cyan-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

      {/* Server Graphic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-cyan-400/20 blur-[60px] rounded-full animate-pulse" />
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
          <Server className="w-14 h-14 sm:w-16 sm:h-16 text-cyan-400 animate-pulse" strokeWidth={1.5} />
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </div>
        </div>
      </div>

      {/* Connection Badge */}
      <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/90 border border-slate-700 rounded-full shadow-xl mb-4">
        <Hourglass className="w-5 h-5 text-amber-400 animate-spin" />
        <span className="text-base font-semibold text-slate-100 tracking-wide">
          Connecting with server...
        </span>
      </div>

      {/* Helper message */}
      <p className="text-slate-400 text-xs sm:text-sm text-center max-w-sm leading-relaxed mb-6">
        The backend server is offline or waking up from inactivity. Connection will be established automatically when online.
      </p>

      {/* Manual Retry Button */}
      <button
        onClick={handleManualRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-slate-700 transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin text-cyan-400" : ""}`} />
        {isRetrying ? "Checking Server..." : "Retry Connection Now"}
      </button>
    </div>
  );
};

export default ServerConnectingOverlay;
