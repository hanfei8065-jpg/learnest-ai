import { Container } from '@/components/ui/Container'
import { FooterSection } from '@/lib/types'

interface FooterProps {
  content?: FooterSection
}

export function Footer({ content }: FooterProps) {
  const defaultContent = {
    copyright: "© 2025 Learnest.AI. All rights reserved.",
    links: [
      { label: "核心能力", href: "#features" },
      { label: "使用流程", href: "#how" },
      { label: "常见问题", href: "#faq" },
      { label: "开始体验", href: "#get-started" }
    ]
  }

  const footerContent = content || defaultContent

  return (
    <footer className="bg-white border-t border-gray-200">
      <Container>
        <div className="py-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-600">{footerContent.copyright}</p>
              <nav className="flex flex-wrap items-center justify-center space-x-6">
                {footerContent.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            {/* 完全移除 onClick 的按钮 */}
            <a
              href="#get-started"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              开始体验
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}