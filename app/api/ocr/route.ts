// app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 诊断：GET 用于确认路由是否挂载成功
export async function GET() {
  return NextResponse.json({ ok: true, route: "ocr", expect: "POST" });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "SERVER_MISCONFIG", message: "缺少 OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // 支持 file 或 image 两个字段名（前端推荐用 file）
    const formData = await req.formData();
    const imageFile = (formData.
