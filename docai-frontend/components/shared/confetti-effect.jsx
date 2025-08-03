"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ConfettiEffect({ trigger, onComplete }) {
  const [particles, setParticles] = useState([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      createParticles()

      const timer = setTimeout(() => {
        setIsActive(false)
        setParticles([])
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, isActive, onComplete])

  const createParticles = () => {
    const newParticles = []
    const colors = ["#B57EDC", "#a855f7", "#9333ea", "#c19aff", "#d7c1ff"]

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2,
        },
      })
    }
    setParticles(newParticles)
  }

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                rotate: particle.rotation,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: particle.x + particle.velocity.x * 100,
                y: window.innerHeight + 100,
                rotate: particle.rotation + 720,
                scale: 0.5,
                opacity: 0,
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "0%",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
