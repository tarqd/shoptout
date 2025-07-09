// ShoptOut - Background Script
// Handles background tasks for the extension

(function () {
  "use strict";

  // Configuration
  const config = {
    debug: true, // Enable console logging
  };

  // Logging utility
  function log(message) {
    if (config.debug) {
      console.log(`[ShoptOut] ${message}`);
    }
  }

  // Initialize the extension
  function initialize() {
    log("Background script initialized");

    // Set default settings if they don't exist yet
    browser.storage.local.get("settings", function (result) {
      if (!result.settings) {
        const defaultSettings = {
          enabled: true,
          shopifyEnabled: true,
          squarespaceEnabled: true,
        };

        browser.storage.local.set({ settings: defaultSettings });
        log("Default settings initialized");
      }
    });
  }

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`Received message: ${JSON.stringify(message)}`);

    if (message.type === "CHECKBOX_UNCHECKED") {
      const platform = message.platform || "Unknown";
      const selector = message.selector || "Unknown";
      log(`Unchecked ${platform} checkbox (${selector}) on ${sender.url}`);
    } else if (message.type === "LOG") {
      log(message.message || "No message content");
    } else if (message.type === "CONTENT_READY") {
      log(`Content script ready on: ${message.url}`);
    }

    // Always return true to indicate async response
    return true;
  });

  // Listen for installation or updates
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      log("Extension installed");
      initialize();
    } else if (details.reason === "update") {
      log(
        `Extension updated from ${details.previousVersion} to ${browser.runtime.getManifest().version}`,
      );
    }
  });

  // Initialize on startup
  initialize();

  log(`Extension ready, version: ${browser.runtime.getManifest().version}`);
})();
