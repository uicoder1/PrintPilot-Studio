import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  Image,
  Printer,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeBanner() {
  const {
  setPage,
  userName,
  profileImage,
} = useApp();
  

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const greetingEmoji =
    hour < 12
      ? "☀️"
      : hour < 17
      ? "🌤️"
      : "🌙";

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 px-8 py-6 shadow-xl"
    >
      {/* Top Row */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
         <div className="flex-1">

  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      className="h-10 w-10 rounded-full border-2 border-white/30 object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
      <Sparkles size={18} className="text-white" />
    </div>
  )}

  <span className="font-medium text-sky-100 text-lg">
    {greeting}, {userName} {greetingEmoji}
  </span>

</div>



        <p className="text-sm font-medium text-sky-100">
          {currentDate}
        </p>
      </div>

      {/* Title */}
      <h1 className="mt-3 text-4xl font-bold text-white">
        PrintPilot Studio
      </h1>

      {/* Bottom Row */}
      <div className="mt-3 flex items-end justify-between gap-8">
        {/* Left */}
        <div className="max-w-2xl">
          <p className="text-base leading-7 text-sky-100">
            Print images, documents, labels, text and QR codes
            <br />
            using your Bluetooth thermal printer.
          </p>
        </div>

        {/* Right */}
        <div className="group flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]">
          <button
            onClick={() => setPage("images")}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <Image size={16} className="text-sky-300" />
            Print Image
          </button>

          <button
            onClick={() => setPage("printer")}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <Printer size={16} className="text-emerald-300" />
            Printer
          </button>

          <button
            onClick={() => setPage("documents")}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <FileText size={16} className="text-amber-300" />
            Documents
          </button>
        </div>
      </div>
    </motion.div>
  );
}