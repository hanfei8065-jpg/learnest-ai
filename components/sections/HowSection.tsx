// components/sections/HowSection.tsx
import siteContent from '@/content/site-content.json'

type Step = { number?: string; title: string; description?: string; icon?: string }
type HowContent = { heading?: string; subheading?: string; steps?: Step[] }

const content: HowContent = siteContent?.how as HowContent

export default function HowSection() {
  const steps = content?.steps ?? []
  return (
    <section id="how" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold">{content?.heading ?? '如何使用'}</h2>
        {content?.subheading ? <p className="text-gray-600 mt-2">{content.subheading}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {steps.map((step, idx) => (
            <div key={idx} className="rounded-lg bg-white border p-6">
              <div className="text-2xl font-bold mb-2">{step?.number ?? idx + 1}</div>
              <div className="font-medium">{step.title}</div>
              {step?.description ? <p className="text-gray-600 mt-2">{step.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
