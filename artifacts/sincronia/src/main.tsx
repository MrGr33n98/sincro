import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry, initPostHog } from "./lib/analytics";

// Initialize error tracking and analytics
initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(<App />);
