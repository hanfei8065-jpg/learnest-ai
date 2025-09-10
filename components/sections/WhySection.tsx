import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WhySection as WhySectionType } from '@/lib/types'
import * as LucideIcons from 'lucide-react'

interface WhySectionProps {
  content: WhySectionType
}

export function WhySection({ content }: WhySectionProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null
  }

  return (
    <section id="why" className="py-16 lg:py-24 bg-white">
      <Container>
        <SectionHeading
          heading={content.heading}
          subheading={content.subheading}
          className="mb-16"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.cards.map((card, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  {getIcon(card.icon)}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
