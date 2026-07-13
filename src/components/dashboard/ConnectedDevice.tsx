import usePrinter from "../../hooks/usePrinter";
import {
  Bluetooth,
  Cpu,
  HardDrive,
  CalendarClock,
} from "lucide-react";

import { useApp } from "../../context/AppContext";

export default function ConnectedDevice() {
  const { setPage } = useApp();

const {
  loading,
  scanPrinters,
  connectPrinter,
  disconnectPrinter,
  scannedPrinters,
  connectedPrinterId,
  connectedPrinterName,
  printerSession,
} = usePrinter();

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Connected Device
        </h2>

        <button
          onClick={() => setPage("printer")}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition"
        >
          Manage
        </button>

      </div>

      <div className="mt-6 rounded-2xl bg-slate-800 p-5">

        <div className="flex items-center gap-4">

          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              printerSession.connected
                ? "bg-green-500/15"
                : "bg-slate-700"
            }`}
          >
            <Bluetooth
              className={
                printerSession.connected
                  ? "text-green-400"
                  : "text-slate-500"
              }
              size={32}
            />
          </div>

          <div>

            <h3 className="text-lg font-semibold text-white">
              {printerSession.name || "No Printer Connected"}
            </h3>

            <div
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  printerSession.connected
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {printerSession.connected ? "● Ready to Print" : "● No Active Connection"}
            </div>

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
            {printerSession.connected ? "Just Now" : "--"}
          </span>

        </div>

      </div>

      <div className="mt-8 border-t border-slate-800 pt-6">

  {!printerSession.connected && (

    <button
      onClick={scanPrinters}
      disabled={loading}
      className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
    >
      {loading ? "🔄 Scanning..." : "🔍 Scan for Printers"}
    </button>

  )}

  {scannedPrinters
    .filter((printer) => printer.id !== connectedPrinterId)
    .map((printer) => (

      <div
        key={printer.id}
        className="mt-4 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4"
      >

        <div>

          <h3 className="font-semibold text-white">
            {printer.name}
          </h3>

          <p className="text-sm text-slate-400">
            Bluetooth Device
          </p>

        </div>

        <button
          onClick={() => connectPrinter(printer)}
          className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
        >
          Connect
        </button>

      </div>

    ))}

  {printerSession.connected && (

    <div className="mt-4 flex gap-3">

      <button
        onClick={() =>
          disconnectPrinter({
            id: connectedPrinterId!,
            name: connectedPrinterName!,
          })
        }
        className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
      >
        Disconnect
      </button>

      <button
        onClick={() => setPage("images")}
        className="flex-1 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500"
      >
        Print Photo
      </button>

    </div>

  )}

</div>

    </div>
  );
}