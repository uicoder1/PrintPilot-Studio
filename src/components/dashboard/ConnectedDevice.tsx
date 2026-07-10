import {
  Bluetooth,
  Cpu,
  HardDrive,
  CalendarClock,
  ChevronRight,
} from "lucide-react";

import { useApp } from "../../context/AppContext";

export default function ConnectedDevice() {
  const { connectedPrinterName, connectedPrinterId } = useApp();
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Connected Device
        </h2>

        <button className="rounded-xl bg-slate-800 p-2 hover:bg-slate-700 transition">
          <ChevronRight size={18} />
        </button>

      </div>

      <div className="mt-6 rounded-2xl bg-slate-800 p-5">

        <div className="flex items-center gap-4">

          <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                connectedPrinterId
                  ? "bg-green-500/15"
                  : "bg-slate-700"
              }`}
          >
            <Bluetooth
                className={
                  connectedPrinterId
                    ? "text-green-400"
                    : "text-slate-500"
                }
                size={32}
            />
          </div>

          <div>

            <h3 className="text-lg font-semibold text-white">
              {connectedPrinterName || "No Printer Connected"}
            </h3>

            <p className="text-sm text-slate-400">
              {connectedPrinterId
                ? "Thermal Bluetooth Printer"
                : "Connect a printer to start printing"}
            </p>

          </div>

        </div>

      </div>

      <div className="mt-6 space-y-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Cpu className="text-purple-400" size={18} />
            <span className="text-slate-400">
              Firmware
            </span>
          </div>

          <span className="text-white">
            v2.1.3
          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <HardDrive className="text-green-400" size={18} />
            <span className="text-slate-400">
              Paper Width
            </span>
          </div>

          <span className="text-white">
            57 mm
          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <CalendarClock className="text-orange-400" size={18} />
            <span className="text-slate-400">
              Last Connected
            </span>
          </div>

          <span className="text-white">
            {connectedPrinterId ? "Just Now" : "--"}
          </span>

        </div>

      </div>

    </div>
  );
}