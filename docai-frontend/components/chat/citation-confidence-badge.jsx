"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertTriangle, Minus } from "lucide-react"

export function CitationConfidenceBadge({ confidence = "high", showTooltip = true, className = "" }) {
  const [showTooltipState, setShowTooltipState] = useState(false)

  const confidenceConfig = {
    high: {
      icon: Check,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
      label: "High",
      symbol: "✓",
      tooltip: "High confidence - Answer verified by multiple sources with strong agreement",
    },
    medium: {
      icon: Minus,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      label: "Medium",
      symbol: "~",
      tooltip: "Medium confidence - Answer supported by sources but with some uncertainty",
    },
    low: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      label: "Low",
      symbol: "⚠️",
      tooltip: "Low confidence - Limited source verification, answer may need review",
    },
  }

  const config = confidenceConfig[confidence] || confidenceConfig.medium
  const IconComponent = config.icon

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium cursor-help ${config.bgColor} ${config.borderColor} ${config.color}`}
      >
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
        <span className="opacity-75">{config.symbol}</span>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && showTooltipState && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10"
          >
            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-normal">
              <div className="font-medium mb-1">{config.label} Confidence</div>
              <div className="opacity-90">{config.tooltip}</div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
