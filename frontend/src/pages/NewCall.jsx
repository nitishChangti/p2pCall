import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getSocket } from "../socket/socketClient";
import { prepareMedia } from "../socket/webrtc";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { webrtcStore } from "../socket/webrtcStore";

export default function NewCall() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [targetUserId, setTargetUserId] = useState("");
  const [preparing, setPreparing] = useState(false);

  const handleCall = async () => {
    if (!user?._id || !targetUserId.trim() || preparing) return;

    try {
      setPreparing(true); // 🔴 start processing state

      // 1️⃣ Prepare camera & mic
      await prepareMedia();

      const socket = getSocket();
      if (!socket) {
        console.error("❌ Socket not connected");
        setPreparing(false);
        return;
      }

      const peerId = targetUserId.trim();
      webrtcStore.peerId = peerId;

      // 2️⃣ Send call request
      socket.emit("new-call", {
        callerId: user._id,
        receiverId: peerId,
        callType: "video",
      });   
      navigate(`/call/${peerId}`);

    } catch (err) {
      console.error("❌ Call preparation failed", err);
      setPreparing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold text-center tracking-wide">
        Start a New Call
      </h2>

      {/* Your User ID */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Your User ID
        </label>
        <input
          type="text"
          value={user?._id || ""}
          readOnly
          className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-300
                     text-sm cursor-not-allowed border border-slate-700"
        />
      </div>

      {/* Target User ID */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Enter User ID to Call
        </label>
        <input
          type="text"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="Paste user ID here"
          disabled={preparing}
          className="w-full px-3 py-2 rounded-md bg-slate-950 border
                     border-slate-700 text-sm text-white outline-none
                     focus:border-blue-500 focus:ring-2
                     focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Call Button */}
      <motion.button
        whileHover={!preparing ? { y: -2 } : {}}
        whileTap={!preparing ? { scale: 0.98 } : {}}
        transition={{ duration: 0.15 }}
        type="button"
        disabled={preparing}
        onClick={handleCall}
        className={`w-full py-2.5 rounded-md text-sm font-medium transition-shadow
          ${
            preparing
              ? "bg-green-600/60 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
          }`}
      >
        {preparing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Preparing call…
          </span>
        ) : (
          "Call"
        )}
      </motion.button>

      {/* Helper Text */}
      <p className="text-center text-xs text-slate-500">
        Enter the user ID of the person you want to call.
      </p>
    </motion.div>
  );
}
