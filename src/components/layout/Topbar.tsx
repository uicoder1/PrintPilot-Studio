import {
  Bell,
  Search,
  Sun,
  Bluetooth,
  BatteryFull,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Topbar() {
  const { connectedPrinterId, connectedPrinterName } = useApp();
  return (
    <header className="h-20 border-b border-slate-800 bg-[#0F172A] px-8 flex items-center justify-between">

      {/* Left */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          PrintPilot Studio
        </h1>

        <p className="text-slate-400 text-sm">
          Professional Thermal Printing Software
        </p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">

          <Search size={18} />

          <input
            className="bg-transparent outline-none w-52 text-sm"
            placeholder="Search..."
          />

        </div>

        <div
           className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            connectedPrinterId
              ? "bg-green-500/20 text-green-400"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          <Bluetooth size={18} />

          <div className="flex flex-col leading-tight">
             <span className="text-sm font-medium">
              {connectedPrinterId ? "Connected" : "No Printer"}
            </span>

            <span className="text-xs opacity-80">
              {connectedPrinterName || "Connect a printer"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">

          <BatteryFull size={18} />

          100%

        </div>

        <button className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">

          <Bell size={18} />

        </button>

        <button className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">

          <Sun size={18} />

        </button>

      </div>

    </header>
  );
}