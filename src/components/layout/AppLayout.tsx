import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import HomePage from "../../pages/Home/HomePage";

import PrinterPage from "../../pages/Printer";
import ImagesPage from "../../pages/Images";
import TextPage from "../../pages/Text";
import DocumentsPage from "../../pages/Documents";
import LabelsPage from "../../pages/Labels";
import QRCodePage from "../../pages/QRCode";
import TemplatesPage from "../../pages/Templates";
import HistoryPage from "../../pages/History";
import SettingsPage from "../../pages/Settings";

import { useApp } from "../../context/AppContext";

export default function AppLayout() {
  const { page } = useApp();

  const renderPage = () => {
    switch (page) {
      case "printer":
        return <PrinterPage />;

      case "images":
        return <ImagesPage />;

      case "text":
        return <TextPage />;

      case "documents":
        return <DocumentsPage />;

      case "labels":
        return <LabelsPage />;

      case "qrcode":
        return <QRCodePage />;

      case "templates":
        return <TemplatesPage />;

      case "history":
        return <HistoryPage />;

      case "settings":
        return <SettingsPage />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}