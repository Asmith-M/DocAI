"use client"

import { motion } from "framer-motion"
import { CheckCircle, Zap } from "lucide-react" // Using Zap for the final milestone

export function TechTimeline() {
  const milestones = [
    {
      date: "July 2025",
      title: "Phase 1: Blueprint & Foundation",
      description: "Kicked off the project by gathering requirements and establishing the core architecture. The initial frontend user interface was developed during this phase.",
      status: "completed",
    },
    {
      date: "August 2025",
      title: "Phase 2: Core Engine Development",
      description: "Focused on building the brains of the operation. The backend services, database, and the initial multi-agent AI pipeline were engineered and brought online.",
      status: "completed",
    },
    {
      date: "Late Aug - Early Sept 2025",
      title: "Phase 3: System Integration",
      description: "A critical phase where the frontend, backend, and AI pipeline were seamlessly connected. This brought the application together into a cohesive, functional unit.",
      status: "completed",
    },
    {
      date: "September 2025",
      title: "Phase 4: Testing & Refinement",
      description: "Conducted comprehensive testing to identify and resolve bugs. The system was refined based on performance metrics and feedback to ensure stability and efficiency.",
      status: "completed",
    },
    {
      date: "October 2025",
      title: "Phase 5: Deployment & Launch",
      description: "Successfully deployed the application to the live environment. Final checks were performed and maintenance protocols were established for long-term success.",
      status: "completed",
    },
  ]

  return (
    <section className="py-24 px-4 relative bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Project Development Roadmap</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our 12-week journey from initial concept to final deployment.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <motion.div
            className="absolute left-8 top-0 w-0.5 bg-purple-200 dark:bg-purple-800"
            style={{ left: 'calc(2rem - 1px)' }} // precise centering of the line on the dot
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            viewport={{ once: true }}
          />

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
                  className="w-16 h-16 rounded-full flex items-center justify-center z-10 shrink-0 bg-white dark:bg-gray-800"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 ${
                    milestone.status === "completed"
                      ? "bg-purple-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                    {index === milestones.length - 1 ? (
                        <Zap className="w-8 h-8 text-white" />
                    ) : (
                        <CheckCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                        {milestone.date}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        Completed
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