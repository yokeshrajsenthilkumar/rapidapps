import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Tailwind (Play CDN) uses class-based dark mode so the app's theme toggle works.
const tw = (window as any).tailwind;
if (tw) tw.config = { ...(tw.config || {}), darkMode: "class" };

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
