export interface BluetoothDeviceInfo {
  id: string;
  name: string;
}

export async function scanPrinters(): Promise<BluetoothDeviceInfo[]> {
  console.log("Scanning for printers...");

  return [];
}