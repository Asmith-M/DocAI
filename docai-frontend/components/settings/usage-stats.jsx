"use client"

import { motion } from "framer-motion"
import { BarChart3, FileText, MessageSquare, Clock } from "lucide-react"

export function UsageStats() {
  const stats = [
    {
      label: "PDFs Processed",
      value: 127,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      change: "+12 this week",
    },
    {
      label: "AI Queries",
      value: 1543,
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      change: "+89 this week",
    },
    {
      label: "Hours Saved",
      value: 24.5,
      icon: Clock,
      color: "text-lavender-500",
      bgColor: "bg-lavender-100 dark:bg-lavender-900/30",
      change: "+3.2 this week",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
          <BarChart3 className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
        </div>
        <div>
          <h3 className="section-title">Usage Statistics</h3>
          <p className="section-subtitle">Your Noetic Vault activity overview</p>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{stat.label}</div>
                <div className="text-sm text-green-600 dark:text-green-400">{stat.change}</div>
              </div>
            </div>

            <div className="text-right">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {typeof stat.value === "number" && stat.value % 1 !== 0 ? stat.value.toFixed(1) : stat.value}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Visualization */}
      <div className="mt-4 p-4 bg-gradient-to-r from-lavender-50 to-blue-50 dark:from-lavender-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly Progress</div>
        <div className="flex space-x-1">
          {[65, 78, 45, 89, 92, 67, 84].map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex-1 bg-lavender-400 rounded-sm min-h-[4px]"
              style={{ maxHeight: "40px" }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
