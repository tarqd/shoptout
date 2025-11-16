# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShoptOut is a Safari extension for iOS that automatically opts users out of newsletter subscriptions when shopping online. It currently supports Shopify and Squarespace websites by detecting and unchecking pre-selected marketing opt-in checkboxes.

## Project Structure

This is an iOS app with an embedded Safari Web Extension:

- **shoptout/** - iOS container app (Swift/UIKit)
  - `ViewController.swift` - Main view controller that loads a WebKit view displaying extension instructions
  - `AppDelegate.swift` & `SceneDelegate.swift` - Standard iOS app lifecycle
  - `Resources/` - Contains app assets (Main.html, icons, CSS)

- **shoptout Extension/** - Safari Web Extension
  - `SafariWebExtensionHandler.swift` - Native Swift handler that receives messages from the JavaScript extension
  - `Resources/` - Web extension files
    - `manifest.json` - Extension manifest (Manifest v3)
    - `content.js` - Main extension logic (runs on all pages)
    - `background.js` - Background script for message handling and settings
    - `popup.html/js/css` - Extension popup UI
    - `images/` - Extension icons and toolbar images

- **shoptoutTests/** - Unit tests
- **shoptoutUITests/** - UI tests

## Architecture

### Extension Flow
1. **Content Script** (`content.js`) runs on all web pages (`*://*/*`)
2. **Platform Detection**: Checks for Shopify (via `shop.app` preconnect link or shopify elements) or Squarespace (via commerce checkout script or squarespace elements)
3. **Checkbox Detection**:
   - Shopify: `#marketing_opt_in`, `input[name="checkout[buyer_accepts_marketing]"]`, `input[name="contact[accepts_marketing]"]`
   - Squarespace: `input[name="subscribeCheckbox"]` or newsletter-related checkboxes
4. **User Interaction Tracking**: Maintains a `userInteractedCheckboxes` Set to respect user choices - if user manually checks a box, it won't be unchecked again
5. **MutationObserver**: Watches for dynamically loaded checkboxes (common in SPAs)
6. **Native Messaging**: JavaScript can send messages to Swift handler via `nativeMessaging` permission

### Key Implementation Details
- Uses Safari's isolated JavaScript world (content scripts can't access page globals like `window.Shopify`)
- Relies on DOM selectors and HTML attributes for platform detection instead of JavaScript globals
- Event listeners use `event.isTrusted` to distinguish user interactions from programmatic changes
- Dispatches `change` events after unchecking to trigger any form validation logic

## Development Commands

### Building and Running
```bash
# Open the Xcode project
open shoptout.xcodeproj

# Build from command line (requires xcodebuild)
xcodebuild -project shoptout.xcodeproj -scheme shoptout -configuration Debug

# Run on simulator
xcodebuild -project shoptout.xcodeproj -scheme shoptout -destination 'platform=iOS Simulator,name=iPhone 15' build
```

### Testing
```bash
# Run all tests
xcodebuild test -project shoptout.xcodeproj -scheme shoptout -destination 'platform=iOS Simulator,name=iPhone 15'

# Run only unit tests
xcodebuild test -project shoptout.xcodeproj -scheme shoptout -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:shoptoutTests

# Run only UI tests
xcodebuild test -project shoptout.xcodeproj -scheme shoptout -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:shoptoutUITests
```

### Debugging
- **Extension Console**: Use Safari's Web Inspector to debug the extension (Developer menu > Show Web Inspector)
- **Native Logs**: Check Xcode console for NSLog output from `SafariWebExtensionHandler.swift`
- **Content Script Logs**: Enable `config.debug = true` in `content.js` to see detailed console logs

## Extension Development Notes

### Adding Support for New Platforms
1. Add platform detection function in `content.js` (e.g., `isNewPlatform()`)
2. Create corresponding handler function (e.g., `handleNewPlatform()`)
3. Add checkbox selectors specific to that platform
4. Call handler in `runExtension()` function
5. Update README.md to document the new platform

### Modifying Checkbox Behavior
- All checkbox interaction logic is in `content.js`
- User interaction tracking happens in event listeners (look for `userInteractedCheckboxes`)
- MutationObserver handles dynamically loaded content (see `setupMutationObserver()`)

### Web Extension Manifest
- Manifest v3 format
- Runs on all URLs (`*://*/*`) to catch all e-commerce sites
- Requires `nativeMessaging` permission for Swift communication
- Background script is a module type

## Privacy & Security
The extension is designed with privacy as a core principle:
- No external network requests
- No data collection or analytics
- No tracking of browsing behavior
- All processing happens locally on device
- Source code is transparent and auditable

## Common Gotchas
- Safari content scripts run in an isolated JavaScript world - they cannot access page `window` globals
- Must use DOM-based detection (link tags, script tags, HTML elements) instead of JavaScript object detection
- Event listeners must check `event.isTrusted` to distinguish real user events from programmatic ones
- The extension re-runs on DOM mutations, so state management (like `userInteractedCheckboxes`) must be maintained across runs
