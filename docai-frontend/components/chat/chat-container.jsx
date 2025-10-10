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

  // Rule-based intent router
  const checkRuleBasedResponse = (text) => {
    const lowerText = text.toLowerCase().trim();
    
    // Rule 1: Greeting
    const greetings = ['hey', 'hello', 'hi', 'hola', 'greetings'];
    if (greetings.some(greeting => lowerText === greeting || lowerText.startsWith(greeting + ' '))) {
      return {
        response: "Hello! I'm ready to help you analyze your documents. Feel free to ask a question or use one of the Quick Actions below to get started.",
        sources: null
      };
    }
    
    // Rule 2: Application Identity
    const identityTriggers = [
      'what is noetic vault',
      'tell me about noetic vault',
      'what\'s noetic vault',
      'about noetic vault',
      'noetic vault info'
    ];
    if (identityTriggers.some(trigger => lowerText.includes(trigger))) {
      return {
        response: "Noetic Vault is a RAG-based, multi-agent system designed to be fully offline. It addresses the need for a secure and intelligent question-answering system for your documents.",
        sources: [{
          type: "internal_knowledge",
          documentName: "noetic_vault_blackbook.pdf",
          location: "Pages 1-3 (Introduction)"
        }]
      };
    }
    
    return null;
  };

  // Listen for global chat-send events from ChatInput
  useEffect(() => {
    const handler = async (e) => {
      const text = e?.detail?.text
      if (!text) return
      // Append user message
      setMessages((prev) => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }])
      
      // Check for rule-based responses
      const ruleResponse = checkRuleBasedResponse(text);
      if (ruleResponse) {
        setIsTyping(true);
        // Simulate typing delay for better UX
        setTimeout(() => {
          setMessages((prev) => [...prev, { 
            id: Date.now() + 1, 
            type: 'bot', 
            content: ruleResponse.response, 
            timestamp: new Date(), 
            confidence: 'high',
            sources: ruleResponse.sources 
          }]);
          
          // Dispatch sources to SourcePanel if available
          if (ruleResponse.sources) {
            window.dispatchEvent(
              new CustomEvent('update-sources', {
                detail: { sources: ruleResponse.sources }
              })
            );
          }
          
          setIsTyping(false);
        }, 800);
        return;
      }

      setIsTyping(true)

      try {
        // Call ragStream to get streaming response using fetch
        const documentId = e?.detail?.documentId
        if (!documentId) {
          setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', content: "Error: Document ID is missing.", timestamp: new Date(), confidence: 'low' }])
          setIsTyping(false)
          return
        }

        // Get language settings from ChatInput (assuming they are stored in a global state or passed via event)
        const lang = e?.detail?.lang
        const auto_detect = e?.detail?.auto_detect

        const response = await startRagStreamFetch(documentId, text, { lang, auto_detect })
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
    <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Messages - with auto-scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ scrollBehavior: 'smooth' }}>
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-purple-600 dark:bg-purple-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                      className="rounded-2xl p-4 bg-purple-600 dark:bg-purple-500 text-white"
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

      {/* Stop button when typing */}
      {isTyping && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center bg-white/50 dark:bg-gray-800/50">
          <button
            onClick={stopGeneration}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors font-medium"
            title="Stop generation"
          >
            Stop Generation
          </button>
        </div>
      )}
    </div>
  )
}
