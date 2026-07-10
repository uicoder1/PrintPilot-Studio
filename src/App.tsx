import { AppProvider } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import { useEffect, useState } from "react";
import SplashScreen from "./components/layout/SplashScreen";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}