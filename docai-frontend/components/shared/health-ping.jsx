"use client"

import { useEffect } from "react"
import { healthCheck } from "../../lib/api"

export function HealthPing() {
  useEffect(() => {
    const ping = async () => {
      try {
        await healthCheck()
        // Health check successful, no action needed
      } catch (error) {
        // Health check failed, optionally handle or log
        console.warn("Health check failed:", error.message)
      }
    }

    ping()
  }, [])

  return null
}
