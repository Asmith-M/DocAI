"use client"

import { Database, Search, MessageSquare, ArrowRight } from "lucide-react"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"

export function HowRAGWorks() {
  const steps = [
    {
      icon: Database,
      title: "Document Ingestion",
      description: "Your PDFs are processed and converted into searchable vector embeddings for intelligent analysis",
    },
    {
      icon: Search,
      title: "Intelligent Retrieval",
      description: "Our AI agents find the most relevant sections based on your questions using advanced ranking algorithms",
    },
    {
      icon: MessageSquare,
      title: "Contextual Generation",
      description: "Advanced language models generate accurate, contextual answers using retrieved document context",
    },
  ]

  return (
    <section className="py-32 px-4 mb-24 bg-white/85 backdrop-blur-lg dark:bg-slate-900/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimationWrapper>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              How Multi-Agent RAG Works
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              Retrieval-Augmented Generation combines the power of information retrieval with advanced language generation for accurate, contextual responses
            </p>
          </div>
        </ScrollAnimationWrapper>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <ScrollAnimationWrapper delay={index * 0.1}>
                  <div className="group backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-violet-200/50 dark:border-violet-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 h-full flex flex-col items-center text-center">
                    <Icon className="w-16 h-16 text-violet-600 dark:text-violet-400 mb-6 block mx-auto group-hover:scale-110 transition-transform" />

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">{step.description}</p>
                  </div>
                </ScrollAnimationWrapper>

                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-violet-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
