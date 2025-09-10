import { Hero } from '@/components/sections/Hero'
import { WhySection } from '@/components/sections/WhySection'
import { HowSection } from '@/components/sections/HowSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { FaqSection } from '@/components/sections/FaqSection'
import siteContent from '@/content/site-content.json'

export default function HomePage() {
  return (
    <main>
      <div id="get-started" className="scroll-mt-24" />
      <Hero content={siteContent.hero} />
      <WhySection content={siteContent.why} />
      <HowSection content={siteContent.how} />
      <FeaturesSection content={siteContent.features} />
      <FaqSection content={siteContent.faq} />
    </main>
  )
}