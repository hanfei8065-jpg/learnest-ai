// components/sections/FeaturesSection.tsx
import siteContent from '@/content/site-content.json'

type FeatureItem = { title: string; description?: string; icon?: string }
type FeaturesContent = { heading?: string; subheading?: string; features?: FeatureItem[] }

const content: FeaturesContent = siteContent?.features as FeaturesContent

export default function FeaturesSection() {
  const items = content?.features ?? []
  return (
    <section id="features" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold">{content?.heading ?? '主要特性'}</h2>
        {content?.subheading ? <p className="text-gray-600 mt-2">{content.subheading}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {items.map((f, idx) => (
            <div key={idx} className="rounded-lg border p-6 hover:shadow-sm transition">
              <div className="font-medium">{f.title}</div>
              {f?.description ? <p className="text-gray-600 mt-2">{f.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
