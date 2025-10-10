"use client"

import { MessageCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function ChatEmpty({ onSampleQuestionClick }) {
  return (
    <div className="text-center py-16 max-w-3xl mx-auto px-6">
      {/* Illustration */}
      <div className="relative mb-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30"
        >
          <MessageCircle className="w-16 h-16 text-white" />
        </motion.div>

        {/* Floating chat bubbles */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2 left-1/4 transform -translate-x-1/2"
        >
          <div className="w-8 h-6 bg-purple-400 rounded-full"></div>
        </motion.div>
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-6 right-1/4 transform translate-x-1/2"
        >
          <div className="w-6 h-4 bg-purple-500 rounded-full"></div>
        </motion.div>
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-4 left-1/3"
        >
          <div className="w-4 h-3 bg-purple-300 rounded-full"></div>
        </motion.div>

        {/* Sparkle effect */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-8 h-8 text-purple-400" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tight">
          Start a Conversation
        </h2>
      </motion.div>

      {/* Decorative element */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-300 dark:to-purple-600"></div>
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="font-medium">Powered by Multi-Agent AI</span>
        <Sparkles className="w-4 h-4 text-purple-500" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-purple-300 dark:to-purple-600"></div>
      </motion.div>
    </div>
  )
}
