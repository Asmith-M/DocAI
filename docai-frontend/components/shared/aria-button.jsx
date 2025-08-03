"use client"

import { motion } from "framer-motion"

export function ARIAButton({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-lavender-500 hover:bg-lavender-600 text-white focus:ring-lavender-500",
    outline:
      "border-2 border-lavender-500 text-lavender-600 hover:bg-lavender-500 hover:text-white focus:ring-lavender-500",
    ghost: "text-lavender-600 hover:bg-lavender-50 dark:hover:bg-lavender-900/20 focus:ring-lavender-500",
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  )
}
