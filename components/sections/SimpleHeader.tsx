'use client'

import { Container } from '@/components/ui/Container'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

export function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              {siteConfig.name}
            </span>
          </div>

          {/* 简单的导航链接 */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              登录
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              注册
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}