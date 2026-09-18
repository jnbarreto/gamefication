import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/literata/400-italic.css";

import App from "./App";
import { AvatarProvider } from "./lib/avatars/AvatarProvider";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ConfirmDialogProvider } from "./lib/confirm/ConfirmDialogProvider";
import i18n from "./lib/i18n/config";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { applyTheme, getStoredTheme } from "./lib/theme/theme";
import "./index.css";

applyTheme(getStoredTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <AvatarProvider>
            <ConfirmDialogProvider>
              <App />
            </ConfirmDialogProvider>
          </AvatarProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>,
);
