(function () {
  "use strict";

  // DOM elements
  const enabledToggle = document.getElementById("enabled-toggle");
  const counterElement = document.getElementById("counter");

  // Initialize popup
  async function initialize() {
    try {
      // Load settings from storage
      const result = await browser.storage.local.get(["settings", "stats"]);

      // Set toggle state
      const settings = result.settings || { enabled: true };
      enabledToggle.checked = settings.enabled !== false;

      // Set counter value
      const stats = result.stats || { totalBlocked: 0 };
      counterElement.textContent = stats.totalBlocked || 0;

      // Set up event listeners
      enabledToggle.addEventListener("change", handleToggleChange);

      // Listen for storage changes (to update counter in real-time)
      browser.storage.onChanged.addListener(handleStorageChange);
    } catch (error) {
      console.error("[ShoptOut Popup] Error during initialization:", error);
    }
  }

  // Handle toggle change
  async function handleToggleChange(event) {
    try {
      const isEnabled = event.target.checked;

      // Get current settings
      const result = await browser.storage.local.get("settings");
      const settings = result.settings || {};

      // Update enabled state
      settings.enabled = isEnabled;

      // Save to storage
      await browser.storage.local.set({ settings });

      console.log(
        `[ShoptOut Popup] Extension ${isEnabled ? "enabled" : "disabled"}`,
      );
    } catch (error) {
      console.error("[ShoptOut Popup] Error updating settings:", error);
      // Revert toggle on error
      event.target.checked = !event.target.checked;
    }
  }

  // Handle storage changes (to update UI when data changes)
  function handleStorageChange(changes, areaName) {
    try {
      if (areaName !== "local") return;

      // Update counter if stats changed
      if (changes.stats && changes.stats.newValue) {
        const totalBlocked = changes.stats.newValue.totalBlocked || 0;
        counterElement.textContent = totalBlocked;
      }

      // Update toggle if settings changed
      if (changes.settings && changes.settings.newValue) {
        const isEnabled = changes.settings.newValue.enabled !== false;
        if (enabledToggle.checked !== isEnabled) {
          enabledToggle.checked = isEnabled;
        }
      }
    } catch (error) {
      console.error("[ShoptOut Popup] Error handling storage change:", error);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
