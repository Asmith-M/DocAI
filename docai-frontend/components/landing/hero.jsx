"use client"

// CHANGE: Import Link from react-router-dom
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { ARIAButton } from "@/components/shared/aria-button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-lavender-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-lavender-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center px-4 py-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-full text-lavender-700 dark:text-lavender-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI Technology
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
        >
          Chat with Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-500 to-lavender-700">
            {" "}
            Documents
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Upload your PDFs and have intelligent conversations with your documents. Get instant answers, summaries, and
          insights powered by advanced AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* CHANGE: Use 'to' prop instead of 'href' */}
          <Link to="/upload">
            <ARIAButton className="bg-lavender-500 hover:bg-lavender-600 text-white px-8 py-4 text-lg group">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </ARIAButton>
          </Link>

          {/* CHANGE: Use 'to' prop instead of 'href' */}
          <Link to="/about">
            <ARIAButton
              variant="outline"
              className="border-lavender-300 text-lavender-600 hover:bg-lavender-50 dark:border-lavender-400 dark:text-lavender-400 dark:hover:bg-lavender-900/20 px-8 py-4 text-lg"
            >
              Learn More
            </ARIAButton>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}