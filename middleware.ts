// middleware.ts  —— 最小可用版，只给 /api/* 加 CORS，其他路径不动
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // 只处理 /api/* 路径
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.headers.set('Access-Control-Max-Age', '86400')
    return res
  }
  // 其他页面不做处理
  return NextResponse.next()
}

// 让中间件仅匹配 /api/*
export const config = {
  matcher: ['/api/:path*'],
}
