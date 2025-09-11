// components/sections/Hero.tsx
import Link from 'next/link'
import siteContent from '@/content/site-content.json'

type CTA = { text: string; href: string }
type HeroContent = {
  badge?: string
  title?: string
  description?: string
  primaryCta?: CTA
  secondaryCta?: CTA
}

const content: HeroContent = siteContent?.hero as HeroContent

export default function Hero() {
  return (
    <section className="py-20 text-center">
      {content?.badge ? (
        <span className="inline-block rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-sm mb-4">
          {content.badge}
        </span>
      ) : null}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        {content?.title ?? '欢迎使用'}
      </h1>

      {content?.description ? (
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{content.description}</p>
      ) : null}

      <div className="mt-8 flex items-center justify-center gap-3">
        {content?.primaryCta ? (
          <Link
            href={content.primaryCta.href}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
          >
            {content.primaryCta.text}
          </Link>
        ) : null}
        {content?.secondaryCta ? (
          <Link
            href={content.secondaryCta.href}
            className="inline-flex items-center rounded-md border px-4 py-2 text-gray-900 hover:bg-gray-50 transition"
          >
            {content.secondaryCta.text}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
