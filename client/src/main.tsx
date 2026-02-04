import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import "@fontsource/vazirmatn";
import "@fontsource/poppins";
import "@fontsource/playfair-display";

createRoot(document.getElementById("root")!).render(<App />);
