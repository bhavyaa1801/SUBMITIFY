import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Analytics } from '@vercel/analytics/react'

// Ping backend on app load to wake it up early
  fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/health`)
    .catch(() => {}); 


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Analytics />

  </React.StrictMode>
);