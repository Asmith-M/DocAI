"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export function TechTimeline() {
  const milestones = [
    {
      year: "2023",
      title: "Foundation",
      description: "Initial research and development of offline RAG architecture",
      status: "completed",
    },
    {
      year: "2024",
      title: "Multi-Agent System",
      description: "Implementation of advanced multi-agent retrieval and generation pipeline",
      status: "completed",
    },
    {
      year: "2024",
      title: "Performance Optimization",
      description: "Achieved sub-second response times with optimized vector search algorithms",
      status: "completed",
    },
    {
      year: "2025",
      title: "Enterprise Features",
      description: "Advanced security features and enterprise-grade document processing",
      status: "in-progress",
    },
  ]

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Journey</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            The evolution of DocAI from concept to cutting-edge reality
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-lavender-200 dark:bg-lavender-800" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative flex items-start"
              >
                {/* Timeline dot */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                    milestone.status === "completed"
                      ? "bg-lavender-500"
                      : "bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800"
                  }`}
                >
                  {milestone.status === "completed" ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-8 flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-sm font-semibold text-lavender-600 dark:text-lavender-400 bg-lavender-100 dark:bg-lavender-900/30 px-3 py-1 rounded-full">
                        {milestone.year}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          milestone.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {milestone.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
