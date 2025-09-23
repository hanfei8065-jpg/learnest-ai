// app/api/solve/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { problem, showSteps = true } = await req.json();
    
    if (!problem) {
      return NextResponse.json(
        { ok: false, error: "NO_PROBLEM", message: "请提供要解答的题目" },
        { status: 400 }
      );
    }
    
    // 调用OpenAI进行解题
    const solveResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是一个专业的数学老师。请按照以下要求解答数学题：
1. ${showSteps ? "详细展示解题步骤" : "直接给出答案和简要解释"}
2. 确保解答准确无误
3. 使用清晰的中文表达
4. 如果是方程题，验证答案的正确性`
          },
          {
            role: "user",
            content: `请解答以下数学题：${problem}`
          }
        ],
        temperature: 0.3, // 低温度确保准确性
        max_tokens: 1000
      })
    });
    
    const solveData = await solveResponse.json();
    
    if (!solveResponse.ok) {
      throw new Error(solveData.error?.message || "解题失败");
    }
    
    const solution = solveData.choices[0]?.message?.content;
    
    return NextResponse.json({
      ok: true,
      problem,
      solution,
      showSteps,
      model: "gpt-4o-mini"
    });
    
  } catch (error) {
    console.error("Solve Error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "SOLVE_PROCESSING_ERROR",
        message: "解题过程出现错误，请稍后重试" 
      },
      { status: 500 }
    );
  }
}