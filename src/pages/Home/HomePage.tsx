import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import QuickActions from "../../components/dashboard/QuickActions";
import PrinterStatus from "../../components/dashboard/PrinterStatus";
import ConnectedDevice from "../../components/dashboard/ConnectedDevice";
import RecentPrints from "../../components/dashboard/RecentPrints";
import Statistics from "../../components/dashboard/Statistics";

export default function HomePage() {
  return (
    <div className="space-y-6">

      <WelcomeBanner />

      <QuickActions />

      <div className="grid grid-cols-2 gap-6">

        <PrinterStatus />

        <ConnectedDevice />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <RecentPrints />

        <Statistics />

      </div>

    </div>
  );
}