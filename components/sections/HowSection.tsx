import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { HowSection as HowSectionType } from '@/lib/types'
import * as LucideIcons from 'lucide-react'

interface HowSectionProps {
  content: HowSectionType
}

export function HowSection({ content }: HowSectionProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null
  }

  return (
    <section id="how" className="py-16 lg:py-24 bg-gray-50 scroll-mt-24">
      <Container>
        <SectionHeading
          heading={content.heading}
          subheading={content.subheading}
          className="mb-16"
        />
        
        {/* Mobile: Vertical layout */}
        <div className="md:hidden space-y-8">
          {content.steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                  <div className="text-indigo-600">
                    {getIcon(step.icon)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop: 2-column mosaic layout */}
        <div className="hidden md:grid grid-cols-2 gap-8 h-[600px]">
          {/* Left column - Step 1 (tall card) */}
          <Card className="row-span-2">
            <CardHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                  {content.steps[0].number}
                </div>
                <div className="text-indigo-600">
                  {getIcon(content.steps[0].icon)}
                </div>
              </div>
              <CardTitle className="text-2xl">{content.steps[0].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed text-lg">
                {content.steps[0].description}
              </p>
            </CardContent>
          </Card>

          {/* Right column - Steps 2 & 3 (stacked) */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                    {content.steps[1].number}
                  </div>
                  <div className="text-indigo-600">
                    {getIcon(content.steps[1].icon)}
                  </div>
                </div>
                <CardTitle className="text-xl">{content.steps[1].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {content.steps[1].description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                    {content.steps[2].number}
                  </div>
                  <div className="text-indigo-600">
                    {getIcon(content.steps[2].icon)}
                  </div>
                </div>
                <CardTitle className="text-xl">{content.steps[2].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {content.steps[2].description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  )
}
