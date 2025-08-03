"use client"

import { motion } from "framer-motion"
import { Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { CitationConfidenceBadge } from "./citation-confidence-badge"

export function VerifiedAnswerCard({ content, confidence = "high", timestamp, onCopy, onFeedback }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    onCopy?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="flex max-w-[80%] items-start space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>

        {/* Message Bubble */}
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl p-4">
          {/* Content */}
          <p className="text-sm leading-relaxed mb-3">{content}</p>

          {/* Confidence Badge */}
          <div className="flex items-center justify-between">
            <CitationConfidenceBadge confidence={confidence} />

            {/* Message Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback?.("positive")}
                className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback?.("negative")}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Timestamp */}
          {timestamp && <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{timestamp}</div>}
        </div>
      </div>
    </motion.div>
  )
}
