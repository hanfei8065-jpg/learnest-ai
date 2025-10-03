// app/api/solve/route.ts
// Accepts JSON or multipart/form-data (with optional image `file`).
// Normalizes to { question?: string, context?: string, options?: { showSteps?: boolean }, fileInfo?: {...} }

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- Types ----
type SolveRequest = {
  question?: string
  context?: string
  options?: {
    showSteps?: boolean
  }
  // 当收到图片上传时，提供一些元信息（不做实际 OCR，仅用于前端联调）
  fileInfo?: {
    filename: string
    size: number
    type?: string
  }
}

// ---- Utilities ----
const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function json(res: unknown, init?: number | ResponseInit) {
  const base: ResponseInit =
    typeof init === 'number' ? { status: init } : (init || {})
  const headers = new Headers(base.headers || {})
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, String(v)))
  return NextResponse.json(res as any, { ...base, headers })
}

function err(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return json({ ok: false, code, message, ...extra }, { status })
}

// Try to parse a string as JSON; if it fails, return null instead of throwing
function tryParseJSON<T = unknown>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

// ---- Body normalization ----
async function readSolveRequest(req: NextRequest): Promise<SolveRequest | null> {
  const ctype = req.headers.get('content-type') || ''

  // 1) JSON（理想路径）
  if (ctype.includes('application/json')) {
    let body: any
    try {
      body = await req.json()
    } catch {
      // 有些客户端头给了 application/json 但实际不是 JSON
      const raw = await req.text()
      body = tryParseJSON(raw)
      if (!body) return null
    }
    const question: string | undefined = (body.question ?? body.text)?.toString()
    const context: string | undefined = body.context?.toString()
    const showSteps: boolean | undefined = Boolean(body.options?.showSteps ?? body.showSteps)
    return { question, context, options: { showSteps } }
  }

  // 2) multipart/form-data（FlutterFlow、表单上传图片常用）
  if (ctype.includes('multipart/form-data')) {
    const form = await req.formData()

    // 优先读取文件信息（不做 OCR，只提供元数据，便于前端联调）
    const f = form.get('file')
    let fileInfo: SolveRequest['fileInfo'] | undefined
    if (f && typeof f === 'object' && 'arrayBuffer' in f) {
      const file = f as File
      const buf = await file.arrayBuffer()
      fileInfo = {
        filename: file.name || 'unknown',
        size: buf.byteLength,
        type: file.type || undefined,
      }
    }

    const question = (form.get('question') ?? form.get('text') ?? form.get('q'))?.toString()
    const context = form.get('context')?.toString()
    const showSteps =
      form.get('showSteps') != null
        ? String(form.get('showSteps')) === 'true'
        : undefined

    // 即使没有 question，只要有 file 也允许通过，让前端能先联调
    if (!question && !fileInfo) return null

    return { question, context, options: { showSteps }, fileInfo }
  }

  // 3) x-www-form-urlencoded
  if (ctype.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    const question = params.get('question') || params.get('text') || params.get('q') || undefined
    const context = params.get('context') || undefined
    const showSteps = params.get('showSteps') ? params.get('showSteps') === 'true' : undefined
    return { question, context, options: { showSteps } }
  }

  // 4) 原始文本（把整段文本当成 question）
  const raw = await req.text()
  if (!raw) return null
  const maybeJSON = tryParseJSON<any>(raw)
  if (maybeJSON && (maybeJSON.question || maybeJSON.text)) {
    const question = (maybeJSON.question ?? maybeJSON.text)?.toString()
    const context = maybeJSON.context?.toString()
    const showSteps = Boolean(maybeJSON.options?.showSteps ?? maybeJSON.showSteps)
    return { question, context, options: { showSteps } }
  }
  return { question: raw, context: undefined, options: { showSteps: false } }
}

// ---- Demo solver（用于端到端联调；之后可替换为真实 LLM/OCR）----
function solveDeterministic(input: SolveRequest) {
  const { question, context, options, fileInfo } = input

  // 生成一些稳定的“步骤”，前端可直接绑定 ListView 使用
  const steps: string[] = [
    'Parse the problem statement',
    'Identify knowns/unknowns',
    'Apply appropriate rules',
    'Compute and verify',
  ]

  // 如果带了文件，给出更友好的占位答案，便于你确认联通性
  const fileLine = fileInfo
    ? ` | file: ${fileInfo.filename} (${fileInfo.size} bytes${fileInfo.type ? ', ' + fileInfo.type : ''})`
    : ''

  return {
    ok: true,
    input: { question, context, options, fileInfo },
    answer: `Placeholder answer for: ${String(question ?? '(no question)').slice(0,160)}${fileLine}`,
    steps: options?.showSteps !== false ? steps : undefined, // 默认给 steps，除非显式禁用
  }
}

// ---- Route handlers ----
export async function POST(req: NextRequest) {
  try {
    const data = await readSolveRequest(req)
    if (!data) {
      return err(400, 'INVALID_BODY', '无法解析请求体。请以 JSON 发送 {question}，或以 multipart/form-data 发送 file/question。', {
        expected: {
          json: { question: '2x + 3 = 11，解 x', options: { showSteps: true } },
          formData: ['file=<image>', 'question=可选'],
        },
      })
    }

    // 基础校验：如果没有 question 但有 file，也允许（便于“拍题→占位答复”联调）
    const q = (data.question || '').trim()
    if (q.length > 4000) return err(413, 'QUESTION_TOO_LONG', '问题过长，请精简后再试。')

    // TODO: 将来在这里接入真实 OCR / LLM
    const result = solveDeterministic(data)
    return json(result)
  } catch (e: any) {
    const msg = (e?.message || '').toLowerCase()
    if (msg.includes('invalid json') || msg.includes('unexpected token')) {
      return err(400, 'INVALID_JSON', 'JSON 解析失败，请确认请求体是合法 JSON。')
    }
    console.error('[api/solve] Unhandled error:', e)
    return err(500, 'INTERNAL_ERROR', '服务器开小差了，请稍后重试。')
  }
}

// GET：健康检查（浏览器直接打开可见）
export async function GET() {
  return json({ ok: true, route: '/api/solve', hint: 'POST { question } or form-data { file } to solve' })
}

// 处理 CORS 预检
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
