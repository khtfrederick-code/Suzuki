import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { CommerceProvider } from "./context/CommerceContext";
import "./styles/global.css";
import "./styles/commerce.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <CommerceProvider>
      <App />
    </CommerceProvider>
  </StrictMode>,
);
