import { useApp } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  Image,
  FileText,
  Tag,
  File,
  QrCode,
  Camera,
  StickyNote,
  WandSparkles,
} from "lucide-react";

const actions = [
  {
    title: "Image Print",
    subtitle: "Photos & Graphics",
    icon: Image,
    color: "from-sky-500 to-blue-600",
    page: "images",
  },
  {
    title: "Text Print",
    subtitle: "Notes & Documents",
    icon: FileText,
    color: "from-indigo-500 to-violet-600",
    page: "text",
  },
  {
    title: "Label Print",
    subtitle: "Barcode Labels",
    icon: Tag,
    color: "from-emerald-500 to-green-600",
    page: "labels",
  },
  {
    title: "PDF Print",
    subtitle: "Documents",
    icon: File,
    color: "from-orange-500 to-red-500",
    page: "documents",
  },
  {
    title: "QR Code",
    subtitle: "Generate QR",
    icon: QrCode,
    color: "from-cyan-500 to-sky-600",
    page: "qrcode",
  },
  {
    title: "Camera Scan",
    subtitle: "Scan & Print",
    icon: Camera,
    color: "from-pink-500 to-rose-600",
    page: "images",
  },
  {
    title: "Sticky Notes",
    subtitle: "Quick Notes",
    icon: StickyNote,
    color: "from-yellow-500 to-amber-500",
    page: "text",
  },
  {
    title: "AI Studio",
    subtitle: "Smart Printing",
    icon: WandSparkles,
    color: "from-purple-500 to-fuchsia-600",
    page: "dashboard",
  },
];

export default function QuickActions() {
  const { setPage } = useApp();
  return (
    <div className="grid grid-cols-4 gap-5">
      {actions.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.button
            key={item.title}
            onClick={() => setPage(item.page as any)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -6,
              scale: 1.03,
            }}
            whileTap={{ scale: 0.97 }}
            className="rounded-3xl bg-slate-800 p-6 text-left border border-slate-700 hover:border-sky-500 transition-all"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
            >
              <Icon className="text-white" size={26} />
            </div>

            <h2 className="mt-6 text-lg font-semibold text-white">
              {item.title}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {item.subtitle}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}