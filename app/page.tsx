import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { AboutSection } from "@/components/landing/about-section"
import { Footer } from "@/components/footer"

export default function Page() {
  console.log("[v0] Landing page rendering")
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
