import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl"
      >
        {/* App Title */}
        <h1 className="text-xl font-semibold text-center mb-6 tracking-wide">
          P2P<span className="text-blue-500">Call</span>
        </h1>

        {/* Child Route Content */}
        <Outlet />
      </motion.div>
    </div>
  );
}
