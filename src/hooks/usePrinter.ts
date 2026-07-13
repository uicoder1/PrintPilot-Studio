import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";

interface PrinterDevice {
  id: string;
  name: string;
}

export default function usePrinter() {
  const {
    connectedPrinterId,
    setConnectedPrinterId,
    connectedPrinterName,
    setConnectedPrinterName,
    printerSession,
    setPrinterSession,
    scannedPrinters,
    setScannedPrinters,
  } = useApp();

  const [loading, setLoading] = useState(false);

  const scanPrinters = async () => {
  try {
    setLoading(true);

    const devices = await invoke<PrinterDevice[]>("scan_printers");

    setScannedPrinters(devices);
  } catch (err) {
    console.error(err);

    const message = String(err).toLowerCase();

    if (
      message.includes("bluetooth") ||
      message.includes("adapter") ||
      message.includes("powered off")
    ) {
      toast("📶 Bluetooth is turned off.\nPlease enable Bluetooth and try again.", {
        icon: "⚠️",
        duration: 4000,
      });
    } else {
      toast.error("Failed to scan printers");
    }
  } finally {
    setLoading(false);
  }
};

  const connectPrinter = async (printer: PrinterDevice) => {
    try {
      await invoke("connect_printer", {
        id: printer.id,
      });

      setConnectedPrinterId(printer.id);
      setConnectedPrinterName(printer.name);

      setPrinterSession({
        id: printer.id,
        name: printer.name,
        connected: true,
      });

      toast.success(`Connected to ${printer.name}`);
    } catch (err) {
      console.error("SCAN ERROR:", err);
      toast.error(String(err));
      toast.error("Connection failed");
    }
  };

  const disconnectPrinter = async (printer: PrinterDevice) => {
    try {
      await invoke("disconnect_printer", {
        id: printer.id,
      });

      setConnectedPrinterId(null);
      setConnectedPrinterName(null);

      setPrinterSession({
        id: null,
        name: null,
        connected: false,
      });

      toast.success(`${printer.name} Disconnected`);
    } catch (err) {
      console.error(err);
      toast.error("Disconnect failed");
    }
  };

  return {
    loading,
    scanPrinters,
    connectPrinter,
    disconnectPrinter,
    scannedPrinters,
    printerSession,
    connectedPrinterId,
    connectedPrinterName,
  };
}