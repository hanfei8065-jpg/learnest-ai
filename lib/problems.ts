// lib/problems.ts
export type Difficulty = "easy" | "medium" | "hard";
export type Grade = "G5" | "G6" | "G7";

export type Problem = {
  id: string;
  grade: Grade;
  difficulty: Difficulty;
  text: string;
};

export const problems: Problem[] = [
  // —— 五年级 G5 ——（各给 5 题示例，后续可继续往下加）
  { id: "G5E1", grade: "G5", difficulty: "easy", text: "计算：36 ÷ 6 =" },
  { id: "G5E2", grade: "G5", difficulty: "easy", text: "把 3/4 化成百分数。" },
  { id: "G5E3", grade: "G5", difficulty: "easy", text: "一个长方形长 8cm、宽 5cm，周长是多少？" },
  { id: "G5E4", grade: "G5", difficulty: "easy", text: "比较大小：0.6 □ 3/5" },
  { id: "G5E5", grade: "G5", difficulty: "easy", text: "把 2.5m 化为厘米。" },

  { id: "G5M1", grade: "G5", difficulty: "medium", text: "计算：2/3 + 1/6 =" },
  { id: "G5M2", grade: "G5", difficulty: "medium", text: "一个水箱装满需 120L，已装 45%。还需装多少升？" },
  { id: "G5M3", grade: "G5", difficulty: "medium", text: "长方形面积 96，长 12，求宽。" },
  { id: "G5M4", grade: "G5", difficulty: "medium", text: "把 0.375 化成最简分数。" },
  { id: "G5M5", grade: "G5", difficulty: "medium", text: "甲数是乙数的 1.25 倍，乙数为 48，甲数是多少？" },

  { id: "G5H1", grade: "G5", difficulty: "hard", text: "一个数的 3/8 比 24 大 6，这个数是多少？" },
  { id: "G5H2", grade: "G5", difficulty: "hard", text: "一个长方形长比宽多 4cm，面积为 140cm²，求长和宽。" },
  { id: "G5H3", grade: "G5", difficulty: "hard", text: "行程：甲从 A 到 B，速度 5km/h；乙从 B 到 A，速度 7km/h，同时出发，2 小时后两人相距多少公里？" },
  { id: "G5H4", grade: "G5", difficulty: "hard", text: "把 1÷(2+1/3) 的结果化为最简分数。" },
  { id: "G5H5", grade: "G5", difficulty: "hard", text: "一根绳子剪去 25% 后还剩 18m，原长多少米？" },

  // —— 六年级 G6 ——
  { id: "G6E1", grade: "G6", difficulty: "easy", text: "解方程：x + 7 = 19" },
  { id: "G6E2", grade: "G6", difficulty: "easy", text: "计算：(-3) + 8 =" },
  { id: "G6E3", grade: "G6", difficulty: "easy", text: "比例：12:18 化为最简比。" },
  { id: "G6E4", grade: "G6", difficulty: "easy", text: "圆的半径 5cm，周长约为多少（取 π≈3.14）？" },
  { id: "G6E5", grade: "G6", difficulty: "easy", text: "化简：3x + 2x =" },

  { id: "G6M1", grade: "G6", difficulty: "medium", text: "解方程：3x - 5 = 13" },
  { id: "G6M2", grade: "G6", difficulty: "medium", text: "一个数的 40% 是 28，这个数是多少？" },
  { id: "G6M3", grade: "G6", difficulty: "medium", text: "梯形上底 6、下底 10、高 4，面积是多少？" },
  { id: "G6M4", grade: "G6", difficulty: "medium", text: "分数乘法：3/5 × 2/3 =" },
  { id: "G6M5", grade: "G6", difficulty: "medium", text: "平均数：一组数 6、7、8、x 的平均数是 8，求 x。" },

  { id: "G6H1", grade: "G6", difficulty: "hard", text: "解：2(x - 3) = 5x - 9" },
  { id: "G6H2", grade: "G6", difficulty: "hard", text: "相遇问题：两地相距 72km，甲 6km/h、乙 8km/h 同时相向而行，几小时相遇？" },
  { id: "G6H3", grade: "G6", difficulty: "hard", text: "比与比例：A:B=2:3，B:C=9:8，求 A:C。" },
  { id: "G6H4", grade: "G6", difficulty: "hard", text: "化简： (x+2)(x-2) - (x-2)²" },
  { id: "G6H5", grade: "G6", difficulty: "hard", text: "一个长方体体积 240，底面积 30，求高。" },

  // —— 七年级 G7 ——
  { id: "G7E1", grade: "G7", difficulty: "easy", text: "开方：√144 的值。" },
  { id: "G7E2", grade: "G7", difficulty: "easy", text: "科学记数法：把 0.003 写成科学计数法。" },
  { id: "G7E3", grade: "G7", difficulty: "easy", text: "一次方程：解 2x = 18" },
  { id: "G7E4", grade: "G7", difficulty: "easy", text: "幂运算：3² × 3³ =" },
  { id: "G7E5", grade: "G7", difficulty: "easy", text: "不等式：判断 5 > -2 是否成立，并说明理由。" },

  { id: "G7M1", grade: "G7", difficulty: "medium", text: "解：4x - 7 = 2x + 11" },
  { id: "G7M2", grade: "G7", difficulty: "medium", text: "平方根：若 x²=0.81，x 取非负值，则 x=" },
  { id: "G7M3", grade: "G7", difficulty: "medium", text: "分式值：当 x=2 时，计算 (x+1)/(x-1) 的值。" },
  { id: "G7M4", grade: "G7", difficulty: "medium", text: "二元一次方程组：解 x+y=9, x-y=3" },
  { id: "G7M5", grade: "G7", difficulty: "medium", text: "勾股定理：直角三角形两条直角边 6、8，斜边长？" },

  { id: "G7H1", grade: "G7", difficulty: "hard", text: "化简： (2x-3)(x+4) - (x-1)(x+1)" },
  { id: "G7H2", grade: "G7", difficulty: "hard", text: "一次不等式：解并写出数轴表示：3x - 5 > 10" },
  { id: "G7H3", grade: "G7", difficulty: "hard", text: "函数：已知 y=2x+b 过点(3,7)，求 b；并求当 x=10 时的 y。" },
  { id: "G7H4", grade: "G7", difficulty: "hard", text: "方程：解 (x-2)/3 + (x+1)/2 = 5" },
  { id: "G7H5", grade: "G7", difficulty: "hard", text: "几何：等腰三角形顶角 40°，求底角。" },
];

export function listProblems(grade: Grade, difficulty: Difficulty) {
  return problems.filter(p => p.grade === grade && p.difficulty === difficulty);
}
