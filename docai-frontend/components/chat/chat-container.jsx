"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, Square } from "lucide-react";
import { TypingIndicator } from "./typing-indicator";
import { VerifiedAnswerCard } from "./verified-answer-card";
import { startRagStreamFetch, streamNDJSON, cancelRagRequest } from "../../lib/api";

export function ChatContainer({ isTyping, onTypingChange }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm ready to help you with your documents. What would you like to know?",
      timestamp: new Date(),
      confidence: "high",
    },
  ]);
  const [currentSources, setCurrentSources] = useState([]);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const stopGeneration = () => {
    if (eventSourceRef.current) {
      cancelRagRequest(eventSourceRef.current);
      eventSourceRef.current = null;
      onTypingChange(false);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "info", message: "Generation stopped." },
        })
      );
    }
  };

  // Listen for global chat-send events from ChatInput
  useEffect(() => {
    const handler = async (e) => {
      const text = e?.detail?.text;
      if (!text) return;

      // Append user message
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "user", content: text, timestamp: new Date() },
      ]);
      onTypingChange(true);

      // Add a placeholder for the bot's response
      const botMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          type: "bot",
          content: "",
          timestamp: new Date(),
          sources: [],
          verification_result: null,
        },
      ]);

      try {
        const documentId = e?.detail?.documentId;
        if (!documentId) {
          throw new Error("Document ID is missing. Please select a document.");
        }

        const lang = e?.detail?.lang;
        const response = await startRagStreamFetch(documentId, text, { lang });
        eventSourceRef.current = response.controller;

        await streamNDJSON(response, (event) => {
          switch (event.type) {
            case "meta":
              // You could use this for metadata if needed
              break;
            case "source":
              setCurrentSources((prev) => [...prev, event.data]);
              window.dispatchEvent(
                new CustomEvent("update-sources", {
                  detail: { sources: [event.data] },
                })
              );
              break;
            case "token":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, content: msg.content + event.data }
                    : msg
                )
              );
              break;
            case "done":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? {
                        ...msg,
                        verification_result: event.data.verification_result,
                      }
                    : msg
                )
              );
              onTypingChange(false);
              eventSourceRef.current = null;
              break;
            default:
              break;
          }
        });
      } catch (error) {
        console.error("Error in chat query:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: `Error: ${error.message}`,
                  confidence: "low",
                }
              : msg
          )
        );
        onTypingChange(false);
        eventSourceRef.current = null;
      }
    };

    window.addEventListener("chat-send", handler);
    return () => {
      window.removeEventListener("chat-send", handler);
      stopGeneration(); // Stop any ongoing generation when component unmounts
    };
  }, []); // Empty dependency array means this runs once on mount

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Message copied to clipboard!" },
      })
    );
  };

  return (
    <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Messages - with auto-scroll */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
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
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                {message.type === "bot" ? (
                  <VerifiedAnswerCard
                    content={message.content}
                    confidence={message.confidence || "medium"}
                    timestamp={message.timestamp?.toLocaleTimeString()}
                    verificationResult={message.verification_result}
                    onCopy={() => copyMessage(message.content)}
                    onFeedback={(type) =>
                      console.log(`Feedback: ${type} for message ${message.id}`)
                    }
                  />
                ) : (
                  <div className="rounded-2xl p-4 bg-purple-600 dark:bg-purple-500 text-white">
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

      {/* Stop Generation Button */}
      {isTyping && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={stopGeneration}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <Square className="w-4 h-4" />
            Stop Generation
          </button>
        </div>
      )}
    </div>
  );
}
