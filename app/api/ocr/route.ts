// app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { ok: false, error: "NO_IMAGE", message: "请上传图片文件" },
        { status: 400 }
      );
    }
    
    // 转换为base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    
    // 调用OpenAI Vision API进行OCR识别
    const ocrResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请精确识别这张图片中的数学题目文字，只返回题目内容，不要任何解释或额外文字。如果图片不是数学题，返回'NOT_MATH_PROBLEM'"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });
    
    const ocrData = await ocrResponse.json();
    
    if (!ocrResponse.ok) {
      throw new Error(ocrData.error?.message || "OCR识别失败");
    }
    
    const recognizedText = ocrData.choices[0]?.message?.content?.trim();
    
    if (!recognizedText || recognizedText === "NOT_MATH_PROBLEM") {
      return NextResponse.json(
        { 
          ok: false, 
          error: "NOT_MATH_PROBLEM",
          message: "未识别到有效的数学题目，请重新上传清晰的数学题图片" 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      ok: true,
      recognizedText,
      confidence: "high" // 可以基于响应质量添加置信度
    });
    
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "OCR_PROCESSING_ERROR",
        message: "图片识别处理失败，请稍后重试" 
      },
      { status: 500 }
    );
  }
}