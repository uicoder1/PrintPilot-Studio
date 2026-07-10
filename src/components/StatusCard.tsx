import { useState } from "react";
import {
  scanPrinters,
  connectPrinter,
  printText,
} from "../services/printer.service";
import type { PrinterDevice } from "../types/printer";

export default function StatusCard() {
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedId, setConnectedId] = useState("");
  const [printing, setPrinting] = useState(false);

  async function handleScan() {
    try {
      setLoading(true);
      const result = await scanPrinters();
      setDevices(result);
    } catch (err) {
      console.error(err);
      alert("Failed to scan printers");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(device: PrinterDevice) {
    try {
      const result = await connectPrinter(device.id);

      alert(result);

      setConnectedId(device.id);
    } catch (err) {
  console.error(err);
  alert(String(err));
}
  }

  async function handlePrintTest() {
    try {
      setPrinting(true);
      const result = await printText(connectedId, "Hello PrintPilot");
      alert(result);
    } catch (err) {
      console.error(err);
      alert(String(err));
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Printer Status
      </h2>

      <p className="mb-6">
        {connectedId
          ? "🟢 Connected"
          : "🔴 Disconnected"}
      </p>

      {connectedId && (
        <button
          onClick={handlePrintTest}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg px-5 py-3 mb-6 ml-3"
        >
          {printing ? "Printing..." : "Print Test (Hello PrintPilot)"}
        </button>
      )}

      <button
        onClick={handleScan}
        className="bg-green-600 hover:bg-green-700 rounded-lg px-5 py-3 mb-6"
      >
        {loading ? "Scanning..." : "Scan for Printer"}
      </button>

      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex justify-between items-center bg-slate-700 rounded-lg p-3"
          >
            <div>
              <div className="font-medium">
                {device.name}
              </div>

              <div className="text-xs text-slate-300">
                {device.id}
              </div>
            </div>

            <button
              onClick={() => handleConnect(device)}
              className={`px-4 py-2 rounded-lg ${
                connectedId === device.id
                  ? "bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {connectedId === device.id
                ? "Connected"
                : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}