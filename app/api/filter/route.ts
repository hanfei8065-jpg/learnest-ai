// app/api/filter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { problems, type Problem } from "../../lib/problems";

export async function POST(req: NextRequest) {
  try {
    const { grade, difficulty, topic, count = 5 } = await req.json();
    
    let filtered = problems;
    
    // 年级筛选
    if (grade) {
      filtered = filtered.filter(p => p.grade === grade);
    }
    
    // 难度筛选  
    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }
    
    // 随机选择指定数量的题目
    const selected = [...filtered]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    return NextResponse.json({
      ok: true,
      problems: selected,
      total: filtered.length,
      filtered: selected.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: "FILTER_ERROR",
        message: "题目筛选失败，请稍后重试"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 返回可用的筛选选项
  return NextResponse.json({
    grades: [5, 6, 7],
    difficulties: ["easy", "medium", "hard"],
    totalProblems: problems.length
  });
}