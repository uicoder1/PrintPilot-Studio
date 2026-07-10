import { motion } from "framer-motion";
import Logo from "../../assets/PrintPilot.png";

interface SplashScreenProps {
  message?: string;
}

export default function SplashScreen({
  message = "Initializing PrintPilot Studio...",
}: SplashScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
      <div className="text-center">

        
        <motion.img
            src={Logo}
          alt="PrintPilot"
          className="mx-auto w-36"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.h1
          className="mt-8 text-4xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          PrintPilot Studio
        </motion.h1>

        <p className="mt-3 text-slate-400">
          {message}
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-sky-500"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-sky-500 [animation-delay:150ms]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-sky-500 [animation-delay:300ms]"></div>
        </div>

      </div>
    </div>
  );
}