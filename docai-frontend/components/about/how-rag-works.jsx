"use client"

import { Database, Search, MessageSquare, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function HowRAGWorks() {
  const steps = [
    {
      icon: Database,
      title: "Document Ingestion",
      description: "Your PDFs are processed and converted into searchable vector embeddings",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Search,
      title: "Intelligent Retrieval",
      description: "Our AI finds the most relevant sections based on your questions",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: MessageSquare,
      title: "Contextual Generation",
      description: "Advanced language models generate accurate answers using retrieved context",
      color: "text-lavender-500",
      bgColor: "bg-lavender-100 dark:bg-lavender-900/30",
    },
  ]

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How Multi-Agent RAG Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Retrieval-Augmented Generation (RAG) combines the power of information retrieval with advanced language
            generation for accurate, contextual responses
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </div>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-lavender-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
