"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe, Check } from "lucide-react"

export function LanguageSelector({ value, onChange }) {
  const [hoveredLang, setHoveredLang] = useState(null)

  const languages = [
    {
      code: "en",
      name: "English",
      flag: "🇬🇧",
      sample: "Ask me anything",
      tooltip: "Change language to English",
    },
    {
      code: "hi",
      name: "हिंदी",
      flag: "🇮🇳",
      sample: "मुझसे कुछ भी पूछें",
      tooltip: "Change language to Hindi",
    },
    {
      code: "mr",
      name: "मराठी",
      flag: "🇮🇳",
      sample: "मला काहीही विचारा",
      tooltip: "Change language to Marathi",
    },
  ]

  const currentLanguage = languages.find((lang) => lang.code === value) || languages[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
          <Globe className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
        </div>
      </div>

      {/* Language Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {languages.map((lang) => (
          <div key={lang.code} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(lang.code)}
              onMouseEnter={() => setHoveredLang(lang.code)}
              onMouseLeave={() => setHoveredLang(null)}
              className={`w-full p-4 rounded-xl border-2 transition-all relative ${
                value === lang.code
                  ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-lavender-300 dark:hover:border-lavender-400"
              }`}
              title={lang.tooltip}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">{lang.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{lang.code.toUpperCase()}</div>
                </div>
              </div>

              {value === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-lavender-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>

            {/* Tooltip */}
            {hoveredLang === lang.code && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-10"
              >
                {lang.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Live Preview:</div>
        <motion.div
          key={currentLanguage.sample}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium text-gray-900 dark:text-white"
        >
          "{currentLanguage.sample}"
        </motion.div>
      </div>
    </div>
  )
}
