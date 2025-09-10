import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SimpleHeader } from '@/components/sections/SimpleHeader'
import { Footer } from '@/components/sections/Footer'
import siteContent from '@/content/site-content.json'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: siteContent.meta.title,
  description: siteContent.meta.description,
  keywords: Array.isArray(siteContent?.meta?.keywords) 
    ? siteContent.meta.keywords
    : (siteContent?.meta?.keywords?.split?.(',') ?? []),
  openGraph: {
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteContent.meta.title,
    description: siteContent.meta.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SimpleHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}