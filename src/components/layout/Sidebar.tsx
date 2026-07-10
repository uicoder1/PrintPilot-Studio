import { useApp } from "../../context/AppContext";
import {
  House,
  Printer,
  Image,
  FileText,
  FolderOpen,
  Tag,
  QrCode,
  LayoutTemplate,
  History,
  Settings,
} from "lucide-react";

const menu = [
  { icon: House, title: "Dashboard", page: "dashboard" },
  { icon: Printer, title: "Printer", page: "printer" },
  { icon: Image, title: "Images", page: "images" },
  { icon: FileText, title: "Text", page: "text" },
  { icon: FolderOpen, title: "Documents", page: "documents" },
  { icon: Tag, title: "Labels", page: "labels" },
  { icon: QrCode, title: "QR Code", page: "qrcode" },
  { icon: LayoutTemplate, title: "Templates", page: "templates" },
  { icon: History, title: "History", page: "history" },
  { icon: Settings, title: "Settings", page: "settings" },
];

export default function Sidebar() {
  const { page, setPage } = useApp();

  return (
    <aside className="w-72 bg-[#0B1120] border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="px-7 py-8">
        <h1 className="text-3xl font-bold text-white">
          Print<span className="text-sky-400">Pilot</span>
        </h1>

        <p className="text-slate-400 text-sm mt-2">
          Professional Thermal Printing
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => setPage(item.page as any)}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 mb-2 transition-all duration-200 ${
                page === item.page
                  ? "bg-sky-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-5">
        <div className="rounded-xl bg-slate-900 p-4">

          <p className="text-green-400 text-sm font-semibold">
            ● Printer Ready
          </p>

          <p className="text-slate-400 text-xs mt-2">
            PrintPilot Studio v1.0
          </p>

        </div>
      </div>

    </aside>
  );
}