"use client";

import { useState } from "react";
import { Globe, Monitor, FileText, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { DarkModeToggle } from "@/components/shared/dark-mode-toggle";

export function SettingsPanel() {
  const [language, setLanguage] = useState("en");
  const [model, setModel] = useState("gpt-4");
  const [viewMode, setViewMode] = useState("card");

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
  ];

  const models = [
    {
      id: "gpt-4",
      name: "GPT-4",
      description: "Most capable model for complex tasks",
    },
    {
      id: "gpt-3.5",
      name: "GPT-3.5 Turbo",
      description: "Fast and efficient for most queries",
    },
    {
      id: "claude",
      name: "Claude",
      description: "Excellent for analysis and reasoning",
    },
  ];

  const viewModes = [
    { id: "card", name: "Card View", icon: "📋" },
    { id: "table", name: "Table View", icon: "-" },
  ];

  return (
    <div className="space-y-8">
      {/* Language Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-6 h-6 text-lavender-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Language
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-4 rounded-lg border-2 transition-all ${
                language === lang.code
                  ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-lavender-300 dark:hover:border-lavender-400"
              }`}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {lang.name}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Model Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Monitor className="w-6 h-6 text-lavender-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Model
          </h3>
        </div>

        <div className="space-y-3">
          {models.map((modelOption) => (
            <button
              key={modelOption.id}
              onClick={() => setModel(modelOption.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                model === modelOption.id
                  ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-lavender-300 dark:hover:border-lavender-400"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {modelOption.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {modelOption.description}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-lavender-500" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Toggle between light and dark mode
              </p>
            </div>
          </div>
          <DarkModeToggle />
        </div>
      </motion.div>

      {/* View Mode Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-lavender-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Document View Mode
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                viewMode === mode.id
                  ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-lavender-300 dark:hover:border-lavender-400"
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {mode.name}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
