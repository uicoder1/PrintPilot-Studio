import {
  Bluetooth,
  BatteryFull,
  Activity,
  Wifi,
} from "lucide-react";

export default function PrinterStatus() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Printer Status
        </h2>

        <div className="flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">
            Online
          </span>
        </div>

      </div>

      <div className="mt-8 space-y-5">

        <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-4">

          <div className="flex items-center gap-3">
            <Bluetooth className="text-sky-400" />
            <span className="text-slate-300">
              Device
            </span>
          </div>

          <span className="font-semibold text-white">
            X5h-9B81
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-4">

          <div className="flex items-center gap-3">
            <BatteryFull className="text-green-400" />
            <span className="text-slate-300">
              Battery
            </span>
          </div>

          <span className="font-semibold text-green-400">
            92%
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-4">

          <div className="flex items-center gap-3">
            <Activity className="text-orange-400" />
            <span className="text-slate-300">
              Temperature
            </span>
          </div>

          <span className="font-semibold text-white">
            Normal
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-4">

          <div className="flex items-center gap-3">
            <Wifi className="text-cyan-400" />
            <span className="text-slate-300">
              Connection
            </span>
          </div>

          <span className="font-semibold text-green-400">
            Stable
          </span>

        </div>

      </div>

    </div>
  );
}