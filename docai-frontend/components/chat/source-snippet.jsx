"use client"

import { useState } from "react"
import { FileText, ExternalLink } from "lucide-react"

export function SourceSnippet({ source, highlightedPhrases = [] }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const highlightText = (text, phrases) => {
    if (!phrases.length) return text

    let highlightedText = text
    phrases.forEach((phrase) => {
      const regex = new RegExp(`(${phrase})`, "gi")
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
      )
    })
    return highlightedText
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-lavender-500">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {source?.filename || "Document.pdf"}
          </span>
          <span className="text-xs text-gray-500">Page {source?.page || 1}</span>
        </div>

        <button className="text-lavender-600 hover:text-lavender-700 transition-colors" title="Open source document">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div
        className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: highlightText(
              source?.text ||
                "This is a sample source snippet that would contain the relevant text from the document...",
              highlightedPhrases,
            ),
          }}
        />

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 max-w-xs">
            Highlighted phrases show exact matches with the AI response
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">Confidence: {source?.confidence || "85"}% match</div>
    </div>
  )
}
