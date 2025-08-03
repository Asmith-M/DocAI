"use client"

import { MessageCircle, Lightbulb, Search, FileText } from "lucide-react"

export function ChatEmpty({ onSampleQuestionClick }) {
  const sampleQuestions = [
    "What are the main points in this document?",
    "Can you summarize the key findings?",
    "What obligations are mentioned here?",
    "Are there any important dates or deadlines?",
  ]

  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-lavender-100 to-purple-100 dark:from-lavender-900 dark:to-purple-900 rounded-full flex items-center justify-center">
          <MessageCircle className="w-16 h-16 text-lavender-500" />
        </div>

        {/* Floating chat bubbles */}
        <div className="absolute top-2 left-1/4 transform -translate-x-1/2">
          <div className="w-8 h-6 bg-lavender-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
        </div>
        <div className="absolute top-6 right-1/4 transform translate-x-1/2">
          <div className="w-6 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        <div className="absolute bottom-4 left-1/3">
          <div className="w-4 h-3 bg-lavender-300 rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
      </div>

      {/* Content */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start a conversation</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Ask questions about your uploaded documents. I'll analyze the content and provide detailed answers with
        citations.
      </p>

      {/* Sample Questions */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Lightbulb className="w-4 h-4 text-lavender-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Try asking:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSampleQuestionClick?.(question)}
              className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-lavender-300 dark:hover:border-lavender-600 hover:bg-lavender-50 dark:hover:bg-lavender-900 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <Search className="w-4 h-4 text-lavender-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-lavender-700 dark:group-hover:text-lavender-300">
                  {question}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="w-10 h-10 bg-lavender-100 dark:bg-lavender-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Search className="w-5 h-5 text-lavender-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Smart Search</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Find relevant information instantly</p>
        </div>

        <div>
          <div className="w-10 h-10 bg-lavender-100 dark:bg-lavender-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FileText className="w-5 h-5 text-lavender-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Source Citations</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Every answer includes references</p>
        </div>

        <div>
          <div className="w-10 h-10 bg-lavender-100 dark:bg-lavender-900 rounded-lg flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5 text-lavender-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Natural Chat</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Ask follow-up questions naturally</p>
        </div>
      </div>
    </div>
  )
}
