import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-8 shadow-xl"
    >
      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 text-sky-100">

            <Sparkles size={20} />

            <span>Welcome Back</span>

          </div>

          <h1 className="mt-4 text-4xl font-bold text-white">
            PrintPilot Studio
          </h1>

          <p className="mt-2 text-sky-100">
            Professional Thermal Printing Software
          </p>

        </div>

        <div className="hidden md:block">

          <div className="rounded-3xl bg-white/10 px-8 py-6 backdrop-blur">

            <p className="text-sky-100 text-sm">
              Printer
            </p>

            <h2 className="text-2xl font-bold text-white mt-1">
              Connected
            </h2>

            <p className="text-sky-100 mt-2">
              Ready to Print
            </p>

          </div>

        </div>

      </div>
    </motion.div>
  );
}