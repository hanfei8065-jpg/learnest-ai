import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeaturesSection as FeaturesSectionType } from '@/lib/types'
import * as LucideIcons from 'lucide-react'

interface FeaturesSectionProps {
  content: FeaturesSectionType
}

export function FeaturesSection({ content }: FeaturesSectionProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null
  }

  return (
    <section id="features" className="py-16 lg:py-24 bg-white scroll-mt-24">
      <Container>
        <SectionHeading
          heading={content.heading}
          subheading={content.subheading}
          className="mb-16"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    {getIcon(feature.icon)}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
