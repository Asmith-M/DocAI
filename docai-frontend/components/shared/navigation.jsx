"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { DarkModeToggle } from "./dark-mode-toggle"
import { motion, AnimatePresence } from "framer-motion"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/chat", label: "Chat" },
    { href: "/about", label: "About" },
    { href: "/settings", label: "Settings" },
  ]

  const isActive = (href) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-lavender-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative p-2 bg-lavender-500 rounded-xl group-hover:bg-lavender-600 transition-all duration-300 shadow-md overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/DocAI_Logo.png" 
                alt="DocAI Logo" 
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-lavender-600 dark:group-hover:text-lavender-400 transition-colors duration-300">
                DocAI
              </span>
              <motion.div 
                className="h-0.5 bg-lavender-500 rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.href}
                  className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl group ${
                    isActive(item.href)
                      ? "text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-900/30 shadow-sm"
                      : "text-gray-600 hover:text-lavender-600 dark:text-gray-300 dark:hover:text-lavender-400 hover:bg-lavender-50 dark:hover:bg-lavender-900/10"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-lavender-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-lavender-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
            ))}
            
            <div className="ml-4 pl-4 border-l border-lavender-200 dark:border-gray-700">
              <DarkModeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <DarkModeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-gray-600 hover:text-lavender-600 dark:text-gray-300 dark:hover:text-lavender-400 rounded-xl hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-lavender-200/50 dark:border-gray-700/50 bg-lavender-50/50 dark:bg-lavender-900/10 backdrop-blur-sm"
            >
              <motion.div 
                className="py-6 space-y-2 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl group ${
                        isActive(item.href)
                          ? "text-lavender-700 bg-lavender-100 dark:text-lavender-300 dark:bg-lavender-900/40 shadow-sm"
                          : "text-gray-600 hover:text-lavender-600 hover:bg-lavender-50 dark:text-gray-300 dark:hover:text-lavender-400 dark:hover:bg-lavender-900/20"
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive(item.href) && (
                        <motion.div
                          className="w-2 h-2 bg-lavender-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      )}
                      
                      {/* Mobile hover effect */}
                      <div className="absolute inset-0 bg-lavender-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}