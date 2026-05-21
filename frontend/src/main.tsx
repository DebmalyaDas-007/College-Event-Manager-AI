import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";

import { ClerkProvider } from "@clerk/react";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);