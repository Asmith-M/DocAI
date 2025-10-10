"use client"

import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Menu, X, Search } from "lucide-react"
import { DarkModeToggle } from "./dark-mode-toggle"
import { CommandMenu } from "./CommandMenu"
import { motion, AnimatePresence } from "framer-motion"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/chat", label: "Chat" },
    { href: "/about", label: "About" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      >
        {/* Frosted glass background with dark mode support */}
        <div 
          className="absolute inset-0 -z-10 bg-white/60 dark:bg-slate-900/60"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        />
        <div className="flex items-center justify-between h-14 px-8 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="relative p-2 bg-purple-600 rounded-full group-hover:bg-purple-700 transition-all duration-300 shadow-md overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/DocAI_Logo.png"
                alt="DocAI Logo"
                className="w-8 h-8 object-contain filter brightness-0 invert"
              />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              Noetic Vault
            </span>
          </NavLink>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className="relative px-4 py-2 text-sm font-medium transition-colors duration-300"
                >
                  {({ isActive }) => (
                    <>
                      <span className={`relative z-10 ${
                        isActive
                          ? "text-white"
                          : "text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-purple-600 rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Command Menu Button */}
            <button
              onClick={() => setCommandMenuOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors duration-300"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setCommandMenuOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </button>
            <DarkModeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? "close" : "open"}
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
            className="md:hidden mt-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-lg overflow-hidden"
          >
            <motion.div
              className="py-4 space-y-2 px-4"
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
                  <NavLink
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-300 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    }`}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Command Menu */}
      <CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
    </>
  )
}
