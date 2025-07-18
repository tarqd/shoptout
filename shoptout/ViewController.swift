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
        self.webView.scrollView.isScrollEnabled = false
        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(
            Bundle.main.url(forResource: "Main", withExtension: "html")!,
            allowingReadAccessTo: Bundle.main.resourceURL!)
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
