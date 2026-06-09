// SPDX-License-Identifier: MIT

import { initLang, scheduleI18nFallback, translateStaticText } from "./locales/i18n.js";
import { applyStoredDisplayStyle } from "./core/theme.js";

import { initSettingsPage } from "./pages/settings-page.js";
import { initIndexPage } from "./pages/index-page.js";


function initApp() {
  applyStoredDisplayStyle();
  initLang();
  translateStaticText();
  scheduleI18nFallback();
  initSettingsPage();
  initIndexPage();
}

// Wait for the DOM to be fully loaded before initializing the app
document.addEventListener("DOMContentLoaded", initApp);
