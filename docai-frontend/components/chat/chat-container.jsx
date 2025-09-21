"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Bot } from "lucide-react"
import { TypingIndicator } from "./typing-indicator"
import { VerifiedAnswerCard } from "./verified-answer-card"
import { ragQuery, startRagStreamFetch, cancelRagRequest } from "../../lib/api"

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
  const eventSourceRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Listen for global chat-send events from ChatInput
  useEffect(() => {
    const handler = async (e) => {
      const text = e?.detail?.text
      if (!text) return
      // Append user message
      setMessages((prev) => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }])
      setIsTyping(true)

      try {
        // Call ragStream to get streaming response using fetch
        const documentId = e?.detail?.documentId
        if (!documentId) {
          setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: "Error: Document ID is missing.", timestamp: new Date(), confidence: 'low' }])
          setIsTyping(false)
          return
        }

        const response = await startRagStreamFetch(documentId, text)
        eventSourceRef.current = response

        let botMessage = ''
        let messageId = Date.now() + 1
        let sources = []

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data.trim()) {
                  try {
                    const eventData = JSON.parse(data)
                    switch (eventData.type) {
                      case 'meta':
                        // Handle meta event if needed
                        break
                      case 'source':
                        sources.push(eventData.data)
                        break
                      case 'token':
                        botMessage += eventData.data
                        setMessages((prev) => {
                          // Replace last bot message or add new
                          const lastMessage = prev[prev.length - 1]
                          if (lastMessage && lastMessage.type === 'bot' && lastMessage.id === messageId) {
                            return [...prev.slice(0, -1), { ...lastMessage, content: botMessage, timestamp: new Date(), confidence: 'medium', sources }]
                          } else {
                            return [...prev, { id: messageId, type: 'bot', content: botMessage, timestamp: new Date(), confidence: 'medium', sources }]
                          }
                        })
                        break
                      case 'done':
                        setIsTyping(false)
                        // Update final message with verification result
                        setMessages((prev) => {
                          const lastMessage = prev[prev.length - 1]
                          if (lastMessage && lastMessage.type === 'bot' && lastMessage.id === messageId) {
                            return [...prev.slice(0, -1), { ...lastMessage, verification_result: eventData.data.verification_result }]
                          }
                          return prev
                        })
                        return
                      case 'error':
                        setIsTyping(false)
                        setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: `Error: ${eventData.data.message}`, timestamp: new Date(), confidence: 'low' }])
                        return
                      default:
                        break
                    }
                  } catch (err) {
                    console.error('Error parsing SSE event:', err)
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading stream:', error)
          setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: `Error: Streaming failed`, timestamp: new Date(), confidence: 'low' }])
          setIsTyping(false)
        }

        // Fallback: if no messages received after 30 seconds, show timeout error
        setTimeout(() => {
          if (isTyping) {
            setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: `Error: Streaming timeout`, timestamp: new Date(), confidence: 'low' }])
            setIsTyping(false)
          }
        }, 30000)
      } catch (error) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: `Error: ${error.message}`, timestamp: new Date(), confidence: 'low' }])
        setIsTyping(false)
      }
    }
    window.addEventListener('chat-send', handler)
    return () => window.removeEventListener('chat-send', handler)
  }, [])

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Message copied to clipboard!" },
      }),
    )
  }

  const stopGeneration = () => {
    if (eventSourceRef.current) {
      // For fetch streaming, we can't directly abort, but we can set a flag to stop processing
      eventSourceRef.current = null
      setIsTyping(false)
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: "Generation stopped.", timestamp: new Date(), confidence: 'low' }])
    }
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat with Documents</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions about your uploaded PDFs</p>
            </div>
            {isTyping && (
              <button
                onClick={stopGeneration}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                title="Stop generation"
              >
                Stop
              </button>
            )}
          </div>
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
                      verificationResult={message.verification_result}
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
