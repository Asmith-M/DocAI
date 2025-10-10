import Hero from "@/components/landing/hero"
import HowItWorks from "@/components/landing/how-it-works"
import FeatureShowcase from "@/components/landing/FeatureShowcase"
import CallToAction from "@/components/landing/call-to-action"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import PlexusBackground from "@/components/ui/PlexusBackground"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <PlexusBackground />

      <main className="relative" style={{ zIndex: 1 }}>
        <ScrollAnimationWrapper>
          <Hero />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <FeatureShowcase />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <HowItWorks />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <CallToAction />
        </ScrollAnimationWrapper>
      </main>
    </div>
  )
}
