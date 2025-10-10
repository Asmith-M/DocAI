"use client"

import { MessageCircle } from "lucide-react"

export function FollowUpChips({ suggestions = [], onChipClick }) {
  if (!suggestions.length) return null

  return (
    <div className="bento-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-lavender-500" />
        <span className="text-xs font-semibold text-lavender-700 dark:text-lavender-300 font-display">Follow-up questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onChipClick?.(suggestion)}
            className="inline-flex items-center px-3 py-1 bg-lavender-100 dark:bg-lavender-800 text-lavender-700 dark:text-lavender-300 rounded-bento text-xs font-medium hover:bg-lavender-200 dark:hover:bg-lavender-700 transition-all duration-300 hover:scale-105 border border-lavender-200 dark:border-lavender-700 shadow-bento"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
