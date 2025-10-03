// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// 如果你想更严谨，可以把 '*' 换成白名单数组里命中才返回对应 Origin。
// 先用 '*' 把 FlutterFlow Test Mode、Heroku 代理等全部放行，尽快跑通。
const ALLOW_ORIGIN = '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export function middleware(req: NextRequest) {
  // 处理预检
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // 给后续 API 响应补上 CORS 头
  const res = NextResponse.next()
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

// 仅作用于 /api/*
export const config = {
  matcher: '/api/:path*',
}
