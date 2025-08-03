"use client" // Keep this, it's a Next.js directive but harmless in Vite for client components.

import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom" // <--- CHANGE: Import useNavigate from react-router-dom

const KeyboardShortcutsContext = createContext()

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider")
  }
  return context
}

export function KeyboardShortcutsProvider({ children }) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const navigate = useNavigate() // <--- CHANGE: Use useNavigate hook

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        // Only allow Esc to work in inputs
        if (event.key === "Escape") {
          event.target.blur()
        }
        return
      }

      // Handle keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "k":
            event.preventDefault()
            // Clear chat functionality would go here
            window.dispatchEvent(
              new CustomEvent("show-toast", {
                detail: { type: "info", message: "Chat cleared (demo)" },
              }),
            )
            break
          case "/":
            event.preventDefault()
            setShowShortcuts(true)
            break
          case "u":
            event.preventDefault()
            navigate("/upload") // <--- CHANGE: Use navigate() instead of router.push()
            break
          case "h":
            event.preventDefault()
            navigate("/") // <--- CHANGE: Use navigate() instead of router.push()
            break
          case "d":
            event.preventDefault()
            // Toggle dark mode
            const isDark = document.documentElement.classList.contains("dark")
            if (isDark) {
              document.documentElement.classList.remove("dark")
              localStorage.setItem("theme", "light")
            } else {
              document.documentElement.classList.add("dark")
              localStorage.setItem("theme", "dark")
            }
            break
        }
      } else if (event.key === "Escape") {
        setShowShortcuts(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Add 'navigate' to the dependency array of useEffect
    // to ensure the effect re-runs if 'navigate' ever changes (though it typically doesn't)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate]) // <--- CHANGE: Add navigate to the dependency array

  return (
    <KeyboardShortcutsContext.Provider value={{ showShortcuts, setShowShortcuts }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}