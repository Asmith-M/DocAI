"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Zap, Clock } from "lucide-react"

export function ModelSwitcher({ value, onChange }) {
  const [hoveredModel, setHoveredModel] = useState(null)

  const models = [
    {
      id: "mistral-7b",
      name: "Mistral 7B",
      description: "Better quality, slower",
      icon: Brain,
      latency: 85,
      quality: 95,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: "llama-3",
      name: "LLaMA 3",
      description: "Faster, lightweight",
      icon: Zap,
      latency: 95,
      quality: 80,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="section-title">AI Model</h3>
          <p className="section-subtitle">Choose your preferred AI model</p>
        </div>
      </div>

      {/* Model Options */}
      <div className="space-y-3">
        {models.map((model) => (
          <div key={model.id} className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(model.id)}
              onMouseEnter={() => setHoveredModel(model.id)}
              onMouseLeave={() => setHoveredModel(null)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                value === model.id
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${model.bgColor} rounded-lg`}>
                    <model.icon className={`w-5 h-5 ${model.color}`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{model.description}</div>
                  </div>
                </div>

                {/* Benchmark Bars */}
                <div className="flex flex-col space-y-1 min-w-0 w-24">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-green-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${model.latency}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-purple-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${model.quality}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {value === model.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full"
                />
              )}
            </motion.button>

            {/* Detailed Tooltip */}
            {hoveredModel === model.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs p-3 rounded-lg whitespace-nowrap z-10 shadow-lg"
              >
                <div className="space-y-1">
                  <div>Speed: {model.latency}%</div>
                  <div>Quality: {model.quality}%</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
