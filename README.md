# ShoptOut - Safari Extension

A Safari extension for iOS that automatically opts you out of newsletter subscriptions when shopping online.

## Overview

ShoptOut is a lightweight Safari extension that automatically unchecks newsletter subscription checkboxes on e-commerce websites, saving you from unwanted marketing emails. It currently supports:

- **Shopify** websites (detects checkboxes with ID "marketing_opt_in")
- **Squarespace** websites (detects checkboxes with name "subscribeCheckbox")

## Features

- 🔍 Automatically detects Shopify and Squarespace websites
- ✅ Finds and unchecks newsletter subscription boxes
- 🔄 Works with dynamically loaded content
- 📊 Tracks how many opt-outs you've blocked
- 🎚️ Easy on/off toggle in the extension popup
- 🌓 Full dark mode support
- 🔒 Privacy-focused - runs entirely on your device with no data collection

## Installation

1. Download from the App Store (coming soon)
2. Open the ShoptOut app
3. Follow the instructions to enable the Safari extension
4. Start browsing worry-free!

### Manual Installation (Development)

1. Clone this repository
2. Open the project in Xcode
3. Build and run on your iOS device
4. Enable the extension in Safari settings

## How It Works

ShoptOut runs as a Safari Web Extension that:

1. Detects when you're on a supported e-commerce platform by checking for platform-specific global variables
2. Automatically finds newsletter subscription checkboxes
3. Unchecks them so you don't receive unwanted marketing emails
4. Detects if you checked the box yourself and let's you proceed if you like


## Privacy

ShoptOut respects your privacy:
- No data collection
- No external servers
- No tracking
- All processing happens locally on your device

Read our full [Privacy Policy](PRIVACY.md) and [Terms of Service](TERMS.md).

## Support

Having issues or questions? Contact us at:
- **Email**: shoptout@tarq.io
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/tarqd/shoptout/issues)

## Future Improvements

- Support for additional e-commerce platforms (WooCommerce, BigCommerce, etc.)
- Custom rules for specific websites
- Per-site whitelist/blacklist
- Enhanced statistics and analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Legal

- [Privacy Policy](PRIVACY.md)
- [Terms of Service](TERMS.md)

### Hosting Legal Documents

For App Store compliance, these documents need to be publicly accessible. To host them on GitHub Pages:

1. Enable GitHub Pages in your repository settings
2. Set source to main branch / root directory
3. Privacy Policy will be available at: `https://tarqd.github.io/shoptout/PRIVACY.html`
4. Terms of Service will be available at: `https://tarqd.github.io/shoptout/TERMS.html`

Alternatively, use a simple static hosting service like Netlify or Vercel.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
