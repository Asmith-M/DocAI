//docai-frontend/components/upload/upload-instructions.jsx
"use client"

import { FileText, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function UploadInstructions() {
  const features = [
    {
      icon: FileText,
      title: "PDF Support",
      description: "Upload any PDF document up to 10MB in size",
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Your documents are processed securely and privately",
    },
    {
      icon: Zap,
      title: "Fast Analysis",
      description: "AI analysis completes in seconds, not minutes",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Guidelines</h3>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
              <feature.icon className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg">
        <p className="text-sm text-lavender-700 dark:text-lavender-300">
          <strong>Tip:</strong> For best results, ensure your PDF has clear, readable text. Scanned documents work too!
        </p>
      </div>
    </motion.div>
  )
}
