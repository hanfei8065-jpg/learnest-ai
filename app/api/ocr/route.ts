// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// GET: 健康检查
export async function GET() {
  return NextResponse.json(
    { ok: true, route: '/api/ocr', moved_to: '/api/solve', expect: 'POST(file|text)' },
    { headers: CORS_HEADERS }
  )
}

// POST: 透明转发到 /api/solve（307 保留方法和 body）
export async function POST(req: NextRequest) {
  return NextResponse.redirect(new URL('/api/solve', req.url), 307)
}

// 处理 CORS 预检
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
