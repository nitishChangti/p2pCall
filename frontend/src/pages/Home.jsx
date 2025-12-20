import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="bg-slate-950 text-white overflow-x-hidden">
      {/* ================= HERO / BANNER ================= */}
      <section className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl px-6"
        >
          <h2 className="text-5xl font-bold leading-tight">
            Secure <span className="text-blue-500">Peer-to-Peer</span>
            <br />
            Video Calling
          </h2>

          <p className="mt-6 text-slate-400 text-lg">
            Built using WebRTC, React, Node.js and Socket.IO.
            No media server. Direct browser-to-browser communication.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to={isAuthenticated ? "/profile" : "/signup"}
              className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 transition transform hover:scale-105"
            >
              Get Started
            </Link>

            <a
              href="#features"
              className="px-6 py-3 rounded border border-slate-700 hover:bg-slate-800 transition"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="py-24 bg-slate-900 border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-center"
          >
            Features
          </motion.h3>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="p-6 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-600 hover:shadow-xl transition"
              >
                <h4 className="text-xl font-medium mb-3">
                  {feature.title}
                </h4>
                <p className="text-slate-400 text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} P2PCall. All rights reserved.
          </p>

          <div className="flex gap-4 text-slate-400 text-sm">
            <span className="hover:text-white transition cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-white transition cursor-pointer">
              Terms
            </span>
            <span className="hover:text-white transition cursor-pointer">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: "Pure P2P Connection",
    desc: "Direct browser-to-browser communication using WebRTC. No media server involved.",
  },
  {
    title: "Secure & Private",
    desc: "End-to-end encrypted media streams. Your data never passes through a server.",
  },
  {
    title: "Modern Stack",
    desc: "Built with React, Redux Toolkit, Socket.IO, and Node.js for scalability.",
  },
];
