//
//  SafariWebExtensionHandler.swift
//  shoptout Extension
//
//  Created by Christopher Tarquini on 7/8/25.
//

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem

        // Get the message data
        let message: Any?
        if #available(iOS 15.0, macOS 12.0, *) {
            message = item?.userInfo?[SFExtensionMessageKey]
        } else {
            message = item?.userInfo?["message"]
        }

        // Log the message using NSLog for Xcode console visibility
        NSLog("[ShoptOut] Received message: %@", String(describing: message))

        // If the message is a dictionary, extract and log more details
        if let messageDict = message as? [String: Any] {
            if let type = messageDict["type"] as? String {
                NSLog("[ShoptOut] Message type: %@", type)

                // Log specific information based on message type
                switch type {
                case "CHECKBOX_UNCHECKED":
                    let platform = messageDict["platform"] as? String ?? "unknown"
                    let selector = messageDict["selector"] as? String ?? "unknown"
                    NSLog("[ShoptOut] Unchecked %@ checkbox (%@)", platform, selector)

                case "LOG":
                    if let content = messageDict["message"] as? String {
                        NSLog("[ShoptOut] %@", content)
                    }

                default:
                    break
                }
            }
        }

        // Send a response back to the extension
        let response = NSExtensionItem()
        if #available(iOS 15.0, macOS 12.0, *) {
            response.userInfo = [SFExtensionMessageKey: ["success": true]]
        } else {
            response.userInfo = ["message": ["success": true]]
        }

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
