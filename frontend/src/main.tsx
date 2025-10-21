import { allDefined } from "@awesome.me/webawesome/dist/webawesome.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/index.css";

// Import Web Awesome components needed by hanko-auth web component
import "@awesome.me/webawesome/dist/components/dropdown/dropdown.js";
import "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

// Import Hanko auth web component
import "../auth-libs/web-component/dist/hanko-auth.esm.js";

// Set Hanko URL for authentication
window.HANKO_URL =
  import.meta.env.VITE_HANKO_URL || "https://dev.login.hotosm.org";

// Ensure all WebAwesome components are loaded before rendering
await allDefined();

// add providers here
function Root() {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
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
