"use client"

import { motion } from "framer-motion"

export function ScrollAnimationWrapper({ children, className = "", delay = 0, duration = 0.8 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
