"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { CitationConfidenceBadge } from "./citation-confidence-badge"
import { SourceSnippet } from "./source-snippet"
import { FeedbackWidget } from "./feedback-widget"

export function AnswerBubble({ message, onShowAgentTrail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getConfidenceLevel = () => {
    // Mock confidence calculation
    const confidence = Math.random()
    if (confidence > 0.8) return "high"
    if (confidence > 0.5) return "medium"
    return "low"
  }

  const confidenceLevel = getConfidenceLevel()

  return (
    <div className="flex justify-start mb-6 animate-fade-in-up">
      <div className="max-w-4xl">
        {/* Answer Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header with Confidence Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lavender-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
              <CitationConfidenceBadge level={confidenceLevel} />
            </div>

            <button
              onClick={() => onShowAgentTrail?.(message.text)}
              className="flex items-center space-x-2 text-sm text-lavender-600 hover:text-lavender-700 transition-colors"
              title="See how DocAI got this answer"
            >
              <Eye className="w-4 h-4" />
              <span>How I got this</span>
            </button>
          </div>

          {/* Answer Text */}
          <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {message.text || "Based on the document analysis, here's what I found..."}
            </p>
          </div>

          {/* Source Snippets */}
          {message.sources && message.sources.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Sources:</h4>
              {message.sources.map((source, index) => (
                <SourceSnippet key={index} source={source} highlightedPhrases={["key phrase", "important term"]} />
              ))}
            </div>
          )}

          {/* Feedback Widget */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <FeedbackWidget messageId={message.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
