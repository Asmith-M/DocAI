"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Bot } from "lucide-react"
import { TypingIndicator } from "./typing-indicator"
import { VerifiedAnswerCard } from "./verified-answer-card"

export function ChatContainer() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm ready to help you with your documents. What would you like to know?",
      timestamp: new Date(),
      confidence: "high",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Message copied to clipboard!" },
      }),
    )
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat with Documents</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions about your uploaded PDFs</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start space-x-3`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? "bg-lavender-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  {message.type === "bot" ? (
                    <VerifiedAnswerCard
                      content={message.content}
                      confidence={message.confidence || "medium"}
                      timestamp={message.timestamp?.toLocaleTimeString()}
                      onCopy={() => copyMessage(message.content)}
                      onFeedback={(type) => console.log(`Feedback: ${type} for message ${message.id}`)}
                    />
                  ) : (
                    <div
                      className={`rounded-2xl p-4 ${
                        message.type === "user"
                          ? "bg-lavender-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}
