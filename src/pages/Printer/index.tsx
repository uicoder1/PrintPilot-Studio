import usePrinter from "../../hooks/usePrinter";

export default function Printer() {
  const {
    loading,
    scanPrinters,
    connectPrinter,
    disconnectPrinter,
    scannedPrinters,
    connectedPrinterId,
    connectedPrinterName,
  } = usePrinter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Printer Management
          </h1>

          <p className="mt-1 text-slate-400">
            Manage and monitor your Bluetooth thermal printers.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Status
          </p>

          <p className="mt-1 font-semibold text-green-400">
            {connectedPrinterId ? "🟢 Connected" : "⚪ No Printer"}
          </p>
        </div>
      </div>

      <button
        onClick={scanPrinters}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
      >
        {loading ? "🔄 Scanning..." : "🔍 Scan for Printers"}
      </button>

      {connectedPrinterId && (
        <div className="rounded-3xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-slate-900 p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🖨️</div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Connected Printer
              </h2>

              <p className="text-green-400">Ready to print</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Status
              </p>

              <p className="mt-1 font-semibold text-green-400">
                Connected
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Printer
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {connectedPrinterName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Connection
              </p>

              <p className="mt-1 text-white">
                Bluetooth BLE
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() =>
                disconnectPrinter({
                  id: connectedPrinterId!,
                  name: connectedPrinterName!,
                })
              }
              className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-500"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {scannedPrinters
          .filter((printer) => printer.id !== connectedPrinterId)
          .map((printer) => (
            <div
              key={printer.id}
              className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-3xl">
                  🖨️
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {printer.name}
                  </h2>

                  <p className="text-sm text-slate-400">
                    Available Bluetooth Device
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {printer.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => connectPrinter(printer)}
                className="rounded-xl bg-sky-600 px-5 py-2 text-white hover:bg-sky-500"
              >
                Connect
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}