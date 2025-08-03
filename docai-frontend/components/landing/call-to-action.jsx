"use client"

// CHANGE: Import Link from react-router-dom
import { Link } from "react-router-dom"
import { ArrowRight, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { ARIAButton } from "@/components/shared/aria-button" // <--- Ensure this path is correct if not already. This is likely okay.

export function CallToAction() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4">
              <FileText className="w-8 h-8" />
            </div>
            <div className="absolute top-8 right-8">
              <FileText className="w-6 h-6" />
            </div>
            <div className="absolute bottom-8 left-8">
              <FileText className="w-10 h-10" />
            </div>
            <div className="absolute bottom-4 right-4">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Documents?</h2>

            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who are already chatting with their documents. Upload your first PDF and
              experience the future of document interaction.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {/* CHANGE: Use 'to' prop instead of 'href' */}
              <Link to="/upload">
                <ARIAButton className="bg-white text-lavender-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold group">
                  Start Now - It's Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </ARIAButton>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}