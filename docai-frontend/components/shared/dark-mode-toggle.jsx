// src/components/shared/dark-mode-toggle.jsx
"use client"

import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeContext"

export function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      <motion.div initial={false} animate={{ rotate: isDark ? 180 : 0 }} transition={{ duration: 0.3 }}>
        {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
      </motion.div>
    </motion.button>
  )
}
