import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { MediaTypeProvider } from "./contexts/MediaTypeContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import ConfirmProvider from "./contexts/ConfirmProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/TVShowList">
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <MediaTypeProvider>
              <ConfirmProvider>
                <App />
              </ConfirmProvider>
            </MediaTypeProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);