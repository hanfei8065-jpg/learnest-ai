'use client'

import { Container } from '@/components/ui/Container'

interface HeroProps {
  content: {
    badge: string
    title: string
    description: string
    primaryCta: {
      text: string
      href: string
    }
    secondaryCta: {
      text: string
      href: string
    }
  }
}

export function Hero({ content }: HeroProps) {
  return (
    <section id="hero" className="py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 mb-8">
            {content.badge}
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
            {content.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            {content.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 主要按钮 - 使用a标签 */}
            <a 
              href={content.primaryCta.href}
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {content.primaryCta.text}
            </a>
            
            {/* 次要按钮 - 使用a标签 */}
            <a 
              href={content.secondaryCta.href}
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {content.secondaryCta.text}
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}