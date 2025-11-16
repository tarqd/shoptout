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
        var success = false
        var errorMessage: String?

        defer {
            // Always send a response back to the extension
            let response = NSExtensionItem()
            let responseData: [String: Any] = [
                "success": success,
                "error": errorMessage as Any
            ]

            if #available(iOS 15.0, macOS 12.0, *) {
                response.userInfo = [SFExtensionMessageKey: responseData]
            } else {
                response.userInfo = ["message": responseData]
            }

            context.completeRequest(returningItems: [response], completionHandler: nil)
        }

        // Validate input items
        guard let item = context.inputItems.first as? NSExtensionItem else {
            NSLog("[ShoptOut Error] No input items received")
            errorMessage = "No input items"
            return
        }

        // Get the message data
        let message: Any?
        if #available(iOS 15.0, macOS 12.0, *) {
            message = item.userInfo?[SFExtensionMessageKey]
        } else {
            message = item.userInfo?["message"]
        }

        guard message != nil else {
            NSLog("[ShoptOut Error] No message in userInfo")
            errorMessage = "No message data"
            return
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
                    success = true

                case "LOG":
                    if let content = messageDict["message"] as? String {
                        NSLog("[ShoptOut] %@", content)
                    }
                    success = true

                default:
                    NSLog("[ShoptOut Warning] Unknown message type: %@", type)
                    success = true // Still consider it successful, just unknown
                }
            } else {
                NSLog("[ShoptOut Warning] Message dictionary has no type field")
                success = true // No type field, but message was received
            }
        } else {
            NSLog("[ShoptOut Warning] Message is not a dictionary: %@", String(describing: message))
            success = true // Message received, even if not in expected format
        }
    }
}
