import { invoke } from "@tauri-apps/api/core";
import type { PrinterDevice } from "../types/printer";

export async function scanPrinters(): Promise<PrinterDevice[]> {
  return await invoke("scan_printers");
}

export async function connectPrinter(id: string): Promise<string> {
  return await invoke("connect_printer", { id });
}

export async function printText(id: string, text: string): Promise<string> {
  return await invoke("print_text", { id, text });
}