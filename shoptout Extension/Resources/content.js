// ShoptOut - Safari Extension
// Automatically opts out of newsletter subscriptions on Shopify and Squarespace sites

(function () {
  "use strict";

  // Configuration
  const config = {
    runInterval: 1000, // Run check every 1 second
    debug: false, // Set to true to enable console logging during development
  };
  let alreadyRan = false;

  // Track checkboxes that the user has interacted with
  const userInteractedCheckboxes = new Set();

  // Logging utility
  function log(message) {
    if (config.debug) {
      console.log(`[ShoptOut] ${message}`);
    }
  }

  // Error logging utility
  function logError(message, error) {
    console.error(`[ShoptOut Error] ${message}`, error);
  }

  // Check if extension is enabled
  async function isExtensionEnabled() {
    try {
      const result = await browser.storage.local.get("settings");
      const settings = result.settings || { enabled: true };
      return settings.enabled !== false;
    } catch (error) {
      logError("Error checking extension enabled state", error);
      return true; // Default to enabled if we can't check
    }
  }

  // Update stats counter
  async function incrementCounter() {
    try {
      const result = await browser.storage.local.get("stats");
      const stats = result.stats || { totalBlocked: 0 };
      stats.totalBlocked = (stats.totalBlocked || 0) + 1;
      await browser.storage.local.set({ stats });
      log(`Total blocked: ${stats.totalBlocked}`);
    } catch (error) {
      logError("Error updating stats", error);
    }
  }

  // Note: Safari content scripts can't reliably detect globals due to isolated world
  // These functions are kept for backward compatibility but we don't rely on them anymore
  function isShopify() {
    try {
      if (!document || !document.querySelector) {
        return false;
      }

      // Look for Shopify-specific link element
      const hasShopifyLink =
        document.querySelector(
          'link[rel="preconnect"][href="https://shop.app"]',
        ) !== null;

      // Fallback to other indicators if the link isn't found
      const hasShopifyElements =
        document.querySelector(
          '[id*="shopify"], [class*="shopify"], [data-shopify]',
        ) !== null;

      const result = hasShopifyLink || hasShopifyElements;
      log(
        `Shopify detection: ${result} (link: ${hasShopifyLink}, elements: ${hasShopifyElements})`,
      );
      return result;
    } catch (error) {
      logError("Error in Shopify detection", error);
      return false;
    }
  }

  function isSquarespace() {
    try {
      if (!document || !document.querySelector) {
        return false;
      }

      // Look for Squarespace-specific script elements using attribute selector
      const hasSquarespaceScript =
        document.querySelector(
          'script[src*="https://assets.squarespace.com/commerce-checkout"]',
        ) !== null;

      // Fallback to other indicators if the script isn't found
      const hasSquarespaceElements =
        document.querySelector('[id*="squarespace"], [class*="squarespace"]') !==
        null;

      const result = hasSquarespaceScript || hasSquarespaceElements;
      log(
        `Squarespace detection: ${result} (script: ${hasSquarespaceScript}, elements: ${hasSquarespaceElements})`,
      );
      return result;
    } catch (error) {
      logError("Error in Squarespace detection", error);
      return false;
    }
  }

  // Handle newsletter checkboxes that match Shopify patterns
  function handleShopify() {
    try {
      if (!document) {
        return false;
      }

      log("Looking for Shopify-style newsletter checkboxes");

      // Find marketing opt-in checkboxes by various common selectors
      const marketingCheckbox =
        document.getElementById("marketing_opt_in") ||
        document.querySelector(
          'input[name="checkout[buyer_accepts_marketing]"]',
        ) ||
        document.querySelector('input[name="contact[accepts_marketing]"]');

      if (marketingCheckbox) {
        // First, attach event listeners to track user interactions if not already done
        if (!userInteractedCheckboxes.has(marketingCheckbox)) {
          marketingCheckbox.addEventListener("change", function (event) {
            if (event.isTrusted) {
              userInteractedCheckboxes.add(this);
              log("User changed marketing checkbox state to: " + this.checked);
            }
          });

          marketingCheckbox.addEventListener("click", function (event) {
            if (event.isTrusted) {
              userInteractedCheckboxes.add(this);
              log("User clicked on marketing checkbox");
            }
          });
        }

        // Only uncheck if it's currently checked AND user hasn't interacted with it
        if (
          marketingCheckbox.checked &&
          !userInteractedCheckboxes.has(marketingCheckbox)
        ) {
          log("Found marketing opt-in checkbox - unchecking");
          marketingCheckbox.checked = false;

          // Dispatch change event to ensure any event listeners detect the change
          const event = new Event("change", { bubbles: true });
          marketingCheckbox.dispatchEvent(event);

          // Increment counter
          incrementCounter();

          return true;
        } else if (
          marketingCheckbox.checked &&
          userInteractedCheckboxes.has(marketingCheckbox)
        ) {
          log("User has interacted with this checkbox - leaving it checked");
        }
      }

      return false;
    } catch (error) {
      logError("Error in handleShopify", error);
      return false;
    }
  }

  // Handle newsletter checkboxes that match Squarespace patterns
  function handleSquarespace() {
    try {
      if (!document) {
        return false;
      }

      log("Looking for Squarespace-style newsletter checkboxes");

      // Try to find subscribe checkboxes by various selectors
      const subscribeCheckboxes =
        document.getElementsByName("subscribeCheckbox").length > 0
          ? document.getElementsByName("subscribeCheckbox")
          : document.querySelectorAll(
              'input[type="checkbox"][name*="newsletter"], input[type="checkbox"][id*="newsletter"]',
            );
      let unchecked = false;

      for (const checkbox of subscribeCheckboxes) {
        // First, attach event listeners to track user interactions if not already done
        if (!userInteractedCheckboxes.has(checkbox)) {
          checkbox.addEventListener("change", function (event) {
            if (event.isTrusted) {
              userInteractedCheckboxes.add(this);
              log("User changed subscribe checkbox state to: " + this.checked);
            }
          });

          checkbox.addEventListener("click", function (event) {
            if (event.isTrusted) {
              userInteractedCheckboxes.add(this);
              log("User clicked on subscribe checkbox");
            }
          });
        }

        // Only uncheck if it's currently checked AND user hasn't interacted with it
        if (checkbox.checked && !userInteractedCheckboxes.has(checkbox)) {
          log("Found subscribe checkbox - unchecking");
          checkbox.checked = false;

          // Dispatch change event to ensure any event listeners detect the change
          const event = new Event("change", { bubbles: true });
          checkbox.dispatchEvent(event);

          // Increment counter
          incrementCounter();

          unchecked = true;
        } else if (checkbox.checked && userInteractedCheckboxes.has(checkbox)) {
          log("User has interacted with this checkbox - leaving it checked");
        }
      }

      return unchecked;
    } catch (error) {
      logError("Error in handleSquarespace", error);
      return false;
    }
  }

  // Main function to run the extension logic
  async function runExtension() {
    try {
      // Check if extension is enabled
      const enabled = await isExtensionEnabled();
      if (!enabled) {
        log("Extension is disabled, skipping");
        return false;
      }

      log("Running extension logic");

      let actioned = false;

      // Now that we have more reliable detection, only run handlers on matching sites
      if (isShopify()) {
        log("Running Shopify handler");
        actioned = handleShopify();
      }

      if (isSquarespace()) {
        log("Running Squarespace handler");
        actioned = handleSquarespace() || actioned;
      }

      // If no platform detected, try both handlers as fallback
      if (!actioned && !isShopify() && !isSquarespace()) {
        log("No platform detected, trying both handlers as fallback");
        actioned = handleShopify();
        actioned = handleSquarespace() || actioned;
      }

      return actioned;
    } catch (error) {
      logError("Error in runExtension", error);
      return false;
    }
  }

  // Setup MutationObserver to detect DOM changes
  function setupMutationObserver() {
    try {
      if (!document || !document.body) {
        logError("Cannot setup MutationObserver: document.body not available", null);
        return null;
      }

      const observer = new MutationObserver((mutations) => {
        try {
          // Only run if there are childList changes (new elements added)
          const shouldRun = mutations.some(
            (mutation) =>
              mutation.type === "childList" && mutation.addedNodes.length > 0,
          );

          if (shouldRun && !alreadyRan) {
            // Check for any newsletter checkboxes that were added
            const checkboxFound = runExtension();

            if (checkboxFound) {
              alreadyRan = true;
              log("Successfully found and handled newsletter checkboxes");
              // Disconnect observer after successful detection to improve performance
              if (observer) {
                observer.disconnect();
                log("MutationObserver disconnected after successful detection");
              }
            }
          }
        } catch (error) {
          logError("Error in MutationObserver callback", error);
        }
      });

      // Start observing the document body for DOM changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      log("MutationObserver set up");
      return observer;
    } catch (error) {
      logError("Error setting up MutationObserver", error);
      return null;
    }
  }

  // Initial run and setup
  function initialize() {
    try {
      log("Extension initialized");

      // Run immediately to detect and handle existing checkboxes
      // Event listeners are set up automatically when checkboxes are found
      const initialResult = runExtension();

      if (initialResult) {
        alreadyRan = true;
        log("Successfully unchecked newsletter checkboxes on initial run");
      } else {
        log(
          "No newsletter checkboxes found or modified on initial run - will keep watching for new ones",
        );
      }

      // Set up mutation observer to detect DOM changes regardless of initial result
      setupMutationObserver();
    } catch (error) {
      logError("Error during initialization", error);
    }
  }

  // Start the extension once the page is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
