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
    const imageFile = (formData.get("file") ?? formData.get("image")) as File | null;

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json(
        { ok: false, error: "NO_IMAGE", message: "请以 multipart/form-data 上传图片，字段名 file" },
        { status: 400 }
      );
    }

    // 文件转 base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 调用 OpenAI 进行 OCR
    const ocrResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  '请精确识别这张图片中的数学题目文字，只返回题目内容，不要任何解释或额外文字。如果图片不是数学题，返回"NOT_MATH_PROBLEM"',
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await ocrResp.json();

    if (!ocrResp.ok) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_ERROR", message: data?.error?.message || "OpenAI 调用失败" },
        { status: ocrResp.status }
      );
    }

    const recognizedText: string | undefined = data?.choices?.[0]?.message?.content?.trim?.();

    if (!recognizedText || recognizedText === "NOT_MATH_PROBLEM") {
      return NextResponse.json(
        { ok: false, error: "NOT_MATH_PROBLEM", message: "未识别到有效的数学题目，请上传更清晰的图片" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, recognizedText });
  } catch (err: any) {
    console.error("OCR Error:", err);
    return NextResponse.json(
      { ok: false, error: "OCR_PROCESSING_ERROR", message: err?.message || "图片识别处理失败" },
      { status: 500 }
    );
  }
}
