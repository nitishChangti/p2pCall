import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function NewCall() {
  const { user } = useSelector((state) => state.auth);

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
          placeholder="Paste user ID here"
          className="w-full px-3 py-2 rounded-md bg-slate-950 border
                     border-slate-700 text-sm text-white outline-none
                     focus:border-blue-500 focus:ring-2
                     focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Call Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        type="button"
        className="w-full py-2.5 rounded-md bg-green-600 hover:bg-green-700
                   text-sm font-medium transition-shadow
                   hover:shadow-lg"
      >
        Call
      </motion.button>

      {/* Helper Text */}
      <p className="text-center text-xs text-slate-500">
        Enter the user ID of the person you want to call.
      </p>
    </motion.div>
  );
}
