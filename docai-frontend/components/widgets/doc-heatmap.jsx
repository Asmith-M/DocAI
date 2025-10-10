"use client"

import { useState } from "react"
import { FileText } from "lucide-react"

export function DocHeatmap({ position = "left", onPageClick, className = "" }) {
  const [hoveredPage, setHoveredPage] = useState(null)

  // Mock data for page activity
  const pageData = Array.from({ length: 24 }, (_, i) => ({
    page: i + 1,
    // Changed Math.random() to ensure activity is always in the low range (0 to 0.4)
    activity: Math.random() * 0.4,
    references: Math.floor(Math.random() * 5),
    snippet: `Sample text from page ${i + 1}. This shows the content that was referenced in the AI response...`,
  }))

  const getHeatColor = (activity) => {
    if (activity > 0.8) return "bg-red-500"
    if (activity > 0.6) return "bg-orange-500"
    if (activity > 0.4) return "bg-yellow-500"
    if (activity > 0.2) return "bg-green-500"
    return "bg-gray-300 dark:bg-gray-600"
  }

  const getHeatIntensity = (activity) => {
    return Math.max(0.3, activity)
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="mb-4 text-center p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-lavender-500" />
          <span className="section-title text-sm">Page Activity</span>
        </div>
        <div className="section-subtitle text-xs">Heat map</div>
      </div>

      {/* Heatmap */}
      <div className="space-y-2 max-h-96 overflow-y-auto px-2">
        {pageData.map((page) => (
          <div
            key={page.page}
            className="relative group"
            onMouseEnter={() => setHoveredPage(page.page)}
            onMouseLeave={() => setHoveredPage(null)}
          >
            <button
              onClick={() => onPageClick?.(page.page)}
              className={`w-full h-7 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-bento ${getHeatColor(page.activity)}`}
              style={{ opacity: getHeatIntensity(page.activity) }}
              title={`Page ${page.page} - ${page.references} references`}
            >
              <span className="sr-only">Page {page.page}</span>
            </button>

            {/* Page Number Label */}
            <div className="absolute left-1 top-0 h-full flex items-center">
              <span className="text-xs font-medium text-white mix-blend-difference">{page.page}</span>
            </div>

            {/* Hover Tooltip */}
            {hoveredPage === page.page && (
              <div className="absolute left-full ml-3 top-0 z-10 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl text-xs">
                <div className="font-semibold mb-1 text-gray-900 dark:text-white">Page {page.page}</div>
                <div className="text-gray-600 dark:text-gray-400 mb-2">
                  {page.references} reference{page.references !== 1 ? "s" : ""}
                </div>
                <div className="text-gray-500 dark:text-gray-400 line-clamp-3">{page.snippet}</div>
                <div className="mt-2 text-lavender-600 dark:text-lavender-400 text-xs font-medium">Click to jump to page</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">Activity Level</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Low</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <span className="text-gray-500 dark:text-gray-400">High</span>
        </div>
      </div>
    </div>
  )
}