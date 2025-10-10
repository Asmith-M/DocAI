import { AboutHero } from "@/components/about/about-hero"
import { AIAgentsShowcase } from "@/components/about/AIAgentsShowcase"
import { MeetTheAgents } from "@/components/about/meet-the-agents"
import { TechTimeline } from "@/components/about/tech-timeline"
import { PageTransition } from "@/components/shared/page-transition"

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-lavender-soft relative overflow-hidden">

        <main className="relative">
          <AboutHero />

          <AIAgentsShowcase />

          <MeetTheAgents />

          <TechTimeline />
        </main>
      </div>
    </PageTransition>
  )
}
