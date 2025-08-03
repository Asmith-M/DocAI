import { AboutHero } from "@/components/about/about-hero"
import { HowRAGWorks } from "@/components/about/how-rag-works"
import { WhyOffline } from "@/components/about/why-offline"
import { TechTimeline } from "@/components/about/tech-timeline"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import { PageTransition } from "@/components/shared/page-transition"
import { MeetTheAgents } from "@/components/about/meet-the-agents"

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <main className="relative">
          <ScrollAnimationWrapper>
            <AboutHero />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <HowRAGWorks />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <WhyOffline />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <TechTimeline />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <MeetTheAgents />
          </ScrollAnimationWrapper>
        </main>
      </div>
    </PageTransition>
  )
}
