// components/sections/WhySection.tsx
import siteContent from '@/content/site-content.json'

type WhyCard = { title: string; description?: string; icon?: string }
type WhyContent = { heading?: string; subheading?: string; cards?: WhyCard[] }

const content: WhyContent = siteContent?.why as WhyContent

export default function WhySection() {
  const cards = content?.cards ?? []
  return (
    <section id="why" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold">{content?.heading ?? '为什么选择我们'}</h2>
        {content?.subheading ? <p className="text-gray-600 mt-2">{content.subheading}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {cards.map((card, idx) => (
            <div key={idx} className="rounded-lg border p-6 hover:shadow-sm transition">
              <div className="text-lg font-medium">{card.title}</div>
              {card?.description ? <p className="text-gray-600 mt-2">{card.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
