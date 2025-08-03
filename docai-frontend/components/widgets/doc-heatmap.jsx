"use client"

import { useState } from "react"
import { FileText } from "lucide-react"

export function DocHeatmap({ position = "left", onPageClick, className = "" }) {
  const [hoveredPage, setHoveredPage] = useState(null)

  // Mock data for page activity
  const pageData = Array.from({ length: 24 }, (_, i) => ({
    page: i + 1,
    activity: Math.random(),
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
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <FileText className="w-4 h-4 text-lavender-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Activity</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Heat map</div>
      </div>

      {/* Heatmap */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {pageData.map((page) => (
          <div
            key={page.page}
            className="relative group"
            onMouseEnter={() => setHoveredPage(page.page)}
            onMouseLeave={() => setHoveredPage(null)}
          >
            <button
              onClick={() => onPageClick?.(page.page)}
              className={`w-full h-6 rounded transition-all duration-200 hover:scale-105 ${getHeatColor(page.activity)}`}
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
              <div className="absolute left-full ml-2 top-0 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                <div className="font-medium mb-1">Page {page.page}</div>
                <div className="text-gray-300 mb-2">
                  {page.references} reference{page.references !== 1 ? "s" : ""}
                </div>
                <div className="text-gray-400 line-clamp-3">{page.snippet}</div>
                <div className="mt-2 text-lavender-400 text-xs">Click to jump to page</div>

                {/* Arrow */}
                <div className="absolute left-0 top-3 -ml-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">Activity Level</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Low</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
          </div>
          <span className="text-gray-500">High</span>
        </div>
      </div>
    </div>
  )
}
