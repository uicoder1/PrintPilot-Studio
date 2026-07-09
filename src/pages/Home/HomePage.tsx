import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import StatusCard from "../../components/StatusCard";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar />

      <main className="flex-1 p-10">
        <Header />

        <StatusCard />
      </main>
    </div>
  );
} 