// components/sections/FaqSection.tsx
'use client'

import siteContent from '@/content/site-content.json'

type QA = { question: string; answer: string }
type FaqContent = {
  heading?: string
  subheading?: string
  questions?: QA[]
}

const content: FaqContent = siteContent?.faq as FaqContent

export default function FaqSection() {
  const qa = content?.questions ?? []

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center">{content?.heading ?? '常见问题'}</h2>
        {content?.subheading ? <p className="text-gray-600 mt-2 text-center">{content.subheading}</p> : null}

        <div className="mt-8 space-y-3">
          {qa.map((item, idx) => (
            <details key={idx} className="rounded-lg bg-white border p-4">
              <summary className="cursor-pointer font-medium list-none">{item.question}</summary>
              <p className="text-gray-600 mt-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
