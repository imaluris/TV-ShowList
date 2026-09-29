import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { MediaTypeProvider } from "./contexts/MediaTypeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/TVShowList">
      <AuthProvider>
        <MediaTypeProvider>
          <App />
        </MediaTypeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);