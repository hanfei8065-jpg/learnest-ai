// app/page.tsx
import Hero from '@/components/sections/Hero'
import WhySection from '@/components/sections/WhySection'
import HowSection from '@/components/sections/HowSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import FaqSection from '@/components/sections/FaqSection'

export default function Page() {
  return (
    <main>
      <Hero />
      <WhySection />
      <HowSection />
      <FeaturesSection />
      <FaqSection />
    </main>
  )
}

