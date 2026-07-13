import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useApp } from "../context/AppContext";

export default function usePrinterMonitor() {
  const {
    printerSession,
    setPrinterSession,
    setConnectedPrinterId,
    setConnectedPrinterName,
  } = useApp();

  useEffect(() => {
    if (!printerSession.connected || !printerSession.id) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const connected = await invoke<boolean>(
          "is_printer_connected",
          {
            id: printerSession.id,
          }
        );

        if (!connected) {
          setPrinterSession({
            id: null,
            name: null,
            connected: false,
          });

          setConnectedPrinterId(null);
          setConnectedPrinterName(null);

          console.log("Printer disconnected");
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [
    printerSession,
    setPrinterSession,
    setConnectedPrinterId,
    setConnectedPrinterName,
  ]);
}