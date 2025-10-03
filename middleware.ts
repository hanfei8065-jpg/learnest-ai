import { NextRequest, NextResponse } from 'next/server'

// 这里是真正的中间件函数
export function middleware(req: NextRequest) {
  // 可以在这里加拦截逻辑，目前直接放行
  return NextResponse.next()
}

// 配置哪些路由启用中间件
export const config = {
  matcher: ['/api/:path*'],
}

