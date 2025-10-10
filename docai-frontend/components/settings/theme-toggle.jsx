"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon, Palette } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const [isChanging, setIsChanging] = useState(false)

  const handleToggle = () => {
    setIsChanging(true)

    setTimeout(() => {
      toggleTheme()

      // Show success toast
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            type: "success",
            message: `Switched to ${isDark ? "light" : "dark"} mode`,
          },
        }),
      )

      setIsChanging(false)
    }, 150)
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="section-title">Theme</h3>
            <p className="section-subtitle">
              {isDark ? "Dark mode is active" : "Light mode is active"}
            </p>
          </div>
        </div>

        {/* Animated Toggle Switch */}
        <motion.button
          onClick={handleToggle}
          className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
            isDark ? "bg-purple-600" : "bg-gray-300"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
            animate={{
              x: isDark ? 32 : 0,
              rotate: isChanging ? 180 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <motion.div
              animate={{
                scale: isChanging ? [1, 1.2, 1] : 1,
                rotate: isDark ? 0 : 180,
              }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-yellow-500" />}
            </motion.div>
          </motion.div>

          {/* Glow effect */}
          {isChanging && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-400 opacity-30"
              initial={{ scale: 1 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.button>
      </div>

      {/* Theme Preview */}
      <div className="absolute z-50 mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-lg left-0 right-0">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-4 h-4 bg-gray-900 dark:bg-white rounded"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {isDark ? "Dark theme colors" : "Light theme colors"}
          </span>
        </div>
      </div>
    </div>
  )
}
