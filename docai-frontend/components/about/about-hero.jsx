"use client"

import { Brain, Zap, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function AboutHero() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-gradient">DocAI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Revolutionizing document interaction through advanced AI technology and multi-agent retrieval systems
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              icon: Brain,
              title: "Advanced AI",
              description: "Powered by state-of-the-art language models and neural networks",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Get instant answers from your documents in milliseconds",
            },
            {
              icon: Shield,
              title: "Privacy First",
              description: "Your documents stay secure with offline processing capabilities",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-lavender-100 dark:bg-lavender-900/30 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-lavender-600 dark:text-lavender-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
