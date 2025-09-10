import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { FaqSection as FaqSectionType } from '@/lib/types'

interface FaqSectionProps {
  content: FaqSectionType
}

export function FaqSection({ content }: FaqSectionProps) {
  return (
    <section id="faq" className="py-16 lg:py-24 bg-gray-50 scroll-mt-24">
      <Container>
        <SectionHeading
          heading={content.heading}
          subheading={content.subheading}
          className="mb-16"
        />
        
        <div className="max-w-3xl mx-auto">
          <Accordion items={content.questions} />
        </div>
      </Container>
    </section>
  )
}
