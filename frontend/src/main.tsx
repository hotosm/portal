import { allDefined } from "@awesome.me/webawesome/dist/webawesome.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

// Import Hanko auth web component
import "../auth-libs/web-component/dist/hanko-auth.esm.js";

// Set Hanko URL for authentication
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || "https://dev.login.hotosm.org";

// Ensure all WebAwesome components are loaded before rendering
// TODO check
await allDefined();

// add providers here
function Root() {
  return (
    <StrictMode>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StrictMode>
  );
}

function AppContent() {
  return <App />;
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(<Root />);
