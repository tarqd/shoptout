// ShoptOut - Safari Extension
// Automatically opts out of newsletter subscriptions on Shopify and Squarespace sites

(function () {
  "use strict";

  // Configuration
  const config = {
    runInterval: 1000, // Run check every 1 second
    debug: true, // Set to true to enable console logging
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

  // Note: Safari content scripts can't reliably detect globals due to isolated world
  // These functions are kept for backward compatibility but we don't rely on them anymore
  function isShopify() {
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
  }

  function isSquarespace() {
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
  }

  // Handle newsletter checkboxes that match Shopify patterns
  function handleShopify() {
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

        return true;
      } else if (
        marketingCheckbox.checked &&
        userInteractedCheckboxes.has(marketingCheckbox)
      ) {
        log("User has interacted with this checkbox - leaving it checked");
      }
    }

    return false;
  }

  // Handle newsletter checkboxes that match Squarespace patterns
  function handleSquarespace() {
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

        unchecked = true;
      } else if (checkbox.checked && userInteractedCheckboxes.has(checkbox)) {
        log("User has interacted with this checkbox - leaving it checked");
      }
    }

    return unchecked;
  }

  // Setup event listeners to detect user interaction with checkboxes
  function setupCheckboxEventListeners() {
    // For Shopify
    const marketingCheckbox = document.getElementById("marketing_opt_in");
    if (marketingCheckbox) {
      marketingCheckbox.addEventListener("change", function (event) {
        // Only track user-initiated events, not programmatic ones
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

    // For Squarespace
    const subscribeCheckboxes = document.getElementsByName("subscribeCheckbox");
    for (const checkbox of subscribeCheckboxes) {
      checkbox.addEventListener("change", function (event) {
        // Only track user-initiated events, not programmatic ones
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

    log("Event listeners set up for checkboxes");
  }

  // Main function to run the extension logic
  function runExtension() {
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
  }

  // Setup MutationObserver to detect DOM changes
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
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
        }
      }
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    log("MutationObserver set up");
  }

  // Initial run and setup
  function initialize() {
    log("Extension initialized");

    // Set up event listeners for checkboxes that might already exist
    setupCheckboxEventListeners();

    // Run immediately
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
  }

  // Start the extension once the page is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
