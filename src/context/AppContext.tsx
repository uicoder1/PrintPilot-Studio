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

type Theme = "dark" | "light";

interface PrinterSession {
  id: string | null;
  name: string | null;
  connected: boolean;
}

interface PrinterDevice {
  id: string;
  name: string;
}

interface AppContextType {
  page: Page;
  setPage: (page: Page) => void;

  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  toggleTheme: () => void;

  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;

  profileImage: string;
  setProfileImage: React.Dispatch<React.SetStateAction<string>>;

  printerSession: PrinterSession;
  setPrinterSession: React.Dispatch<React.SetStateAction<PrinterSession>>;

  scannedPrinters: PrinterDevice[];
  setScannedPrinters: React.Dispatch<React.SetStateAction<PrinterDevice[]>>;

  connectedPrinterId: string | null;
  setConnectedPrinterId: (id: string | null) => void;

  connectedPrinterName: string | null;
  setConnectedPrinterName: (name: string | null) => void;
}

const AppContext = createContext<AppContextType>({
  page: "dashboard",
  setPage: () => {},

  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},

  userName: "Anshu",
  setUserName: () => {},

  profileImage: "",
  setProfileImage: () => {},

  printerSession: {
    id: null,
    name: null,
    connected: false,
  },
  setPrinterSession: () => {},

  scannedPrinters: [],
  setScannedPrinters: () => {},

  connectedPrinterId: null,
  setConnectedPrinterId: () => {},

  connectedPrinterName: null,
  setConnectedPrinterName: () => {},
});

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [page, setPage] = useState<Page>("dashboard");

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const [userNameState, setUserNameState] = useState(() => {
    return localStorage.getItem("userName") || "Anshu";
  });

  const setUserName: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    const newValue =
      typeof value === "function"
        ? value(userNameState)
        : value;

    localStorage.setItem("userName", newValue);
    setUserNameState(newValue);
  };

  const [profileImageState, setProfileImageState] = useState(() => {
    return localStorage.getItem("profileImage") || "";
  });

  const setProfileImage: React.Dispatch<
    React.SetStateAction<string>
  > = (value) => {
    const newValue =
      typeof value === "function"
        ? value(profileImageState)
        : value;

    localStorage.setItem("profileImage", newValue);
    setProfileImageState(newValue);
  };

  const [connectedPrinterId, setConnectedPrinterId] =
    useState<string | null>(null);

  const [connectedPrinterName, setConnectedPrinterName] =
    useState<string | null>(null);

  const [printerSession, setPrinterSession] =
    useState<PrinterSession>({
      id: null,
      name: null,
      connected: false,
    });

  const [scannedPrinters, setScannedPrinters] =
    useState<PrinterDevice[]>([]);

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,

        theme,
        setTheme,
        toggleTheme,

        userName: userNameState,
        setUserName,

        profileImage: profileImageState,
        setProfileImage,

        printerSession,
        setPrinterSession,

        scannedPrinters,
        setScannedPrinters,

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