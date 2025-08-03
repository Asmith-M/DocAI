"use client"

import { motion } from "framer-motion"
import { Brain, Scale, PenTool } from "lucide-react"

export function MeetTheAgents() {
  const agents = [
    {
      name: "ChunkAgent",
      emoji: "🧠",
      icon: Brain,
      description: "Intelligently breaks long documents into digestible sections for optimal processing",
      example: "Splits a 100-page research paper into logical chapters and subsections",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      name: "RankerAgent",
      emoji: "⚖️",
      icon: Scale,
      description: "Prioritizes and ranks document sections based on relevance to your query",
      example: "Finds the most relevant paragraphs when you ask about 'methodology'",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      name: "GeneratorAgent",
      emoji: "✍️",
      icon: PenTool,
      description: "Crafts accurate, concise answers by synthesizing information from ranked sections",
      example: "Combines insights from multiple sources into a coherent, well-structured response",
      color: "text-lavender-500",
      bgColor: "bg-lavender-100 dark:bg-lavender-900/30",
      borderColor: "border-lavender-200 dark:border-lavender-800",
    },
  ]

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Meet the AI Agents</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Behind every intelligent response is a team of specialized AI agents working together to understand,
            analyze, and synthesize information from your documents
          </p>
        </motion.div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 ${agent.borderColor} hover:shadow-xl transition-all duration-300 group`}
            >
              {/* Agent Header */}
              <div className="text-center mb-6">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  {agent.emoji}
                </motion.div>
                <div
                  className={`w-12 h-12 ${agent.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <agent.icon className={`w-6 h-6 ${agent.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h3>
              </div>

              {/* Agent Description */}
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{agent.description}</p>

                {/* Example */}
                <div className={`p-4 ${agent.bgColor} rounded-lg border ${agent.borderColor}`}>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Example:</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{agent.example}"</p>
                </div>
              </div>

              {/* Specialty Badge */}
              <div className="mt-6 text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${agent.bgColor} ${agent.color}`}
                >
                  Specialty: {agent.name.replace("Agent", "")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Vertical Layout */}
        <div className="md:hidden space-y-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 ${agent.borderColor}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="text-3xl mb-2">{agent.emoji}</div>
                  <div className={`w-10 h-10 ${agent.bgColor} rounded-lg flex items-center justify-center`}>
                    <agent.icon className={`w-5 h-5 ${agent.color}`} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{agent.description}</p>
                  <div className={`p-3 ${agent.bgColor} rounded-lg border ${agent.borderColor}`}>
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{agent.example}"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agent Workflow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-lavender-50 to-blue-50 dark:from-lavender-900/20 dark:to-blue-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How They Work Together</h3>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center space-x-2">
                <span>🧠</span>
                <span>Chunk</span>
              </span>
              <span className="text-lavender-400">→</span>
              <span className="flex items-center space-x-2">
                <span>⚖️</span>
                <span>Rank</span>
              </span>
              <span className="text-lavender-400">→</span>
              <span className="flex items-center space-x-2">
                <span>✍️</span>
                <span>Generate</span>
              </span>
              <span className="text-lavender-400">→</span>
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>Your Answer</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
