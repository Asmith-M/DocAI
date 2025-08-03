"use client"

import { MessageCircle } from "lucide-react"

export function FollowUpChips({ suggestions = [], onChipClick }) {
  if (!suggestions.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="w-4 h-4 text-lavender-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Follow-up questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onChipClick?.(suggestion)}
            className="inline-flex items-center px-3 py-2 bg-lavender-50 dark:bg-lavender-900 text-lavender-700 dark:text-lavender-300 rounded-full text-sm hover:bg-lavender-100 dark:hover:bg-lavender-800 transition-colors border border-lavender-200 dark:border-lavender-700"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
