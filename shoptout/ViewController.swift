//
//  ViewController.swift
//  shoptout
//
//  Created by Christopher Tarquini on 7/8/25.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        self.webView.scrollView.isScrollEnabled = true
        self.webView.scrollView.bounces = true

        // Let iOS automatically handle safe areas
        if #available(iOS 11.0, *) {
            self.webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        }

        self.webView.configuration.userContentController.add(self, name: "controller")

        // Load Main.html with proper error handling
        guard let htmlURL = Bundle.main.url(forResource: "Main", withExtension: "html"),
              let resourceURL = Bundle.main.resourceURL else {
            NSLog("[ShoptOut Error] Failed to load Main.html: Resource not found in bundle")
            // Show error to user
            showResourceError()
            return
        }

        self.webView.loadFileURL(htmlURL, allowingReadAccessTo: resourceURL)
    }

    private func showResourceError() {
        let errorHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: -apple-system; padding: 20px; text-align: center; }
                h1 { color: #ff3b30; }
            </style>
        </head>
        <body>
            <h1>Error</h1>
            <p>Unable to load application resources. Please reinstall ShoptOut.</p>
        </body>
        </html>
        """
        self.webView.loadHTMLString(errorHTML, baseURL: nil)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Override point for customization.
    }

    func userContentController(
        _ userContentController: WKUserContentController, didReceive message: WKScriptMessage
    ) {
        // Handle messages from JavaScript if needed
        if let body = message.body as? [String: Any] {
            NSLog("[ShoptOut App] Received message from webView: %@", body.description)
        }
    }
}
