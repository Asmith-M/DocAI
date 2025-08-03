import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CallToAction } from "@/components/landing/call-to-action"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import { PageTransition } from "@/components/shared/page-transition"

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <main className="relative">
          <ScrollAnimationWrapper>
            <Hero />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <HowItWorks />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <CallToAction />
          </ScrollAnimationWrapper>
        </main>
      </div>
    </PageTransition>
  )
}
