import { Toaster } from "react-hot-toast";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <App />

  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: "#0f172a",
        color: "#fff",
        border: "1px solid #334155",
      },
      success: {
        iconTheme: {
          primary: "#22c55e",
          secondary: "#fff",
        },
      },
      error: {
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fff",
        },
      },
    }}
  />
</StrictMode>
);