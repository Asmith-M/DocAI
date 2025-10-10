"use client"

import { Shield, Zap, Lock } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"

export function WhyOffline() {
  const benefits = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description:
        "Your sensitive documents never leave your device. No data is sent to external servers, ensuring complete confidentiality.",
    },
    {
      icon: Zap,
      title: "Lightning Speed",
      description:
        "No network latency means instant responses. Process documents at the speed of your hardware with zero delays.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "Meet compliance requirements with air-gapped processing. Perfect for confidential documents and regulated industries.",
    },
  ]

  return (
    <section className="py-32 px-4 mb-24 bg-white/85 backdrop-blur-lg dark:bg-slate-900/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimationWrapper>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Why Offline Matters
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              In an age of data breaches and privacy concerns, offline processing
              isn't just a feature—it's a necessity for secure document
              intelligence
            </p>
          </div>
        </ScrollAnimationWrapper>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="group card-content backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-violet-200/50 dark:border-violet-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 flex flex-col items-center text-center">
                  {/* --- FIX --- Redundant classes 'block' and 'mx-auto' were removed */} 
                  <Icon className="w-16 h-16 text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform" />

                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </ScrollAnimationWrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
