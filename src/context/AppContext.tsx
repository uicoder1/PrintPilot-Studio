import { createContext, useContext, useState } from "react";

type Page =
  | "dashboard"
  | "printer"
  | "images"
  | "text"
  | "documents"
  | "labels"
  | "qrcode"
  | "templates"
  | "history"
  | "settings";
  
interface AppContextType {
  page: Page;
  setPage: (page: Page) => void;

  connectedPrinterId: string | null;
  setConnectedPrinterId: (id: string | null) => void;

  connectedPrinterName: string | null;
  setConnectedPrinterName: (name: string | null) => void;
}

const AppContext = createContext<AppContextType>({
  connectedPrinterName: null,
  setConnectedPrinterName: () => {},
  page: "dashboard",
  setPage: () => {},
  connectedPrinterId: null,
  setConnectedPrinterId: () => {},
});

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [page, setPage] = useState<Page>("dashboard");

  const [connectedPrinterId, setConnectedPrinterId] =
    useState<string | null>(null);

  const [connectedPrinterName, setConnectedPrinterName] =
  useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        connectedPrinterId,
        setConnectedPrinterId,
        connectedPrinterName,
        setConnectedPrinterName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}