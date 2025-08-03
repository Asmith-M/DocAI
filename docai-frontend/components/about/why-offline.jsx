"use client"

import { Shield, Zap, Lock } from "lucide-react"
import { motion } from "framer-motion"

export function WhyOffline() {
  const benefits = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your sensitive documents never leave your device. No data is sent to external servers.",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Zap,
      title: "Lightning Speed",
      description: "No network latency means instant responses. Process documents at the speed of your hardware.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Meet compliance requirements with air-gapped processing. Perfect for confidential documents.",
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Why Offline Matters</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            In an age of data breaches and privacy concerns, offline processing isn't just a feature—it's a necessity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
