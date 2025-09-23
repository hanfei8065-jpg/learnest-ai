// app/lib/problems.ts
export type Problem = {
    grade: 5 | 6 | 7;
    difficulty: "easy" | "medium" | "hard";
    text: string;
  };
  
  export const problems: Problem[] = [
    /* ===================== 五年级 ===================== */
    // 简单
    { grade: 5, difficulty: "easy", text: "解方程：x + 7 = 12" },
    { grade: 5, difficulty: "easy", text: "解方程：2x + 6 = 14" },
    { grade: 5, difficulty: "easy", text: "解方程：3x + 4 = 19" },
    { grade: 5, difficulty: "easy", text: "解方程：4x + 5 = 21" },
    { grade: 5, difficulty: "easy", text: "解方程：2x + 3 = 9" },
    { grade: 5, difficulty: "easy", text: "解方程：3x + 6 = 21" },
    { grade: 5, difficulty: "easy", text: "解方程：4x + 8 = 28" },
    { grade: 5, difficulty: "easy", text: "解方程：x + 15 = 27" },
    { grade: 5, difficulty: "easy", text: "解方程：2x + 10 = 22" },
    { grade: 5, difficulty: "easy", text: "解方程：5x + 5 = 30" },
    // 中等
    { grade: 5, difficulty: "medium", text: "解方程：3x - 4 = 17" },
    { grade: 5, difficulty: "medium", text: "解方程：4x + 7 = 39" },
    { grade: 5, difficulty: "medium", text: "解方程：5x - 3 = 22" },
    { grade: 5, difficulty: "medium", text: "解方程：6x + 5 = 41" },
    { grade: 5, difficulty: "medium", text: "解方程：7x - 8 = 27" },
    { grade: 5, difficulty: "medium", text: "解方程：8x + 9 = 57" },
    { grade: 5, difficulty: "medium", text: "解方程：9x - 6 = 39" },
    { grade: 5, difficulty: "medium", text: "解方程：4x - 9 = 7" },
    { grade: 5, difficulty: "medium", text: "解方程：3x + 11 = 35" },
    { grade: 5, difficulty: "medium", text: "解方程：2x - 12 = 8" },
    // 困难
    { grade: 5, difficulty: "hard", text: "解方程：-3x + 12 = 0" },
    { grade: 5, difficulty: "hard", text: "解方程：-4x - 8 = 12" },
    { grade: 5, difficulty: "hard", text: "解方程：-5x + 7 = -18" },
    { grade: 5, difficulty: "hard", text: "解方程：-6x - 9 = -21" },
    { grade: 5, difficulty: "hard", text: "解方程：-7x + 14 = -7" },
    { grade: 5, difficulty: "hard", text: "解方程：-8x - 5 = -29" },
    { grade: 5, difficulty: "hard", text: "解方程：-9x + 3 = -24" },
    { grade: 5, difficulty: "hard", text: "解方程：-2x - 11 = -1" },
    { grade: 5, difficulty: "hard", text: "解方程：-5x + 20 = -5" },
    { grade: 5, difficulty: "hard", text: "解方程：-4x - 13 = -1" },
  
    /* ===================== 六年级 ===================== */
    // 简单
    { grade: 6, difficulty: "easy", text: "解方程：x + 18 = 25" },
    { grade: 6, difficulty: "easy", text: "解方程：2x + 9 = 19" },
    { grade: 6, difficulty: "easy", text: "解方程：3x + 12 = 33" },
    { grade: 6, difficulty: "easy", text: "解方程：4x + 6 = 30" },
    { grade: 6, difficulty: "easy", text: "解方程：5x + 10 = 35" },
    { grade: 6, difficulty: "easy", text: "解方程：2x + 14 = 24" },
    { grade: 6, difficulty: "easy", text: "解方程：3x + 9 = 27" },
    { grade: 6, difficulty: "easy", text: "解方程：4x + 16 = 40" },
    { grade: 6, difficulty: "easy", text: "解方程：x + 28 = 41" },
    { grade: 6, difficulty: "easy", text: "解方程：2x + 22 = 40" },
    // 中等
    { grade: 6, difficulty: "medium", text: "解方程：6x - 11 = 25" },
    { grade: 6, difficulty: "medium", text: "解方程：7x + 8 = 64" },
    { grade: 6, difficulty: "medium", text: "解方程：8x - 9 = 47" },
    { grade: 6, difficulty: "medium", text: "解方程：9x + 15 = 96" },
    { grade: 6, difficulty: "medium", text: "解方程：10x - 13 = 57" },
    { grade: 6, difficulty: "medium", text: "解方程：6x + 19 = 67" },
    { grade: 6, difficulty: "medium", text: "解方程：7x - 21 = 28" },
    { grade: 6, difficulty: "medium", text: "解方程：8x + 17 = 81" },
    { grade: 6, difficulty: "medium", text: "解方程：9x - 14 = 49" },
    { grade: 6, difficulty: "medium", text: "解方程：5x + 23 = 68" },
    // 困难
    { grade: 6, difficulty: "hard", text: "解方程：-6x + 25 = -7" },
    { grade: 6, difficulty: "hard", text: "解方程：-7x - 18 = -46" },
    { grade: 6, difficulty: "hard", text: "解方程：-8x + 11 = -53" },
    { grade: 6, difficulty: "hard", text: "解方程：-9x - 27 = -90" },
    { grade: 6, difficulty: "hard", text: "解方程：-10x + 9 = -41" },
    { grade: 6, difficulty: "hard", text: "解方程：-11x - 16 = -71" },
    { grade: 6, difficulty: "hard", text: "解方程：-12x + 28 = -20" },
    { grade: 6, difficulty: "hard", text: "解方程：-7x - 35 = -84" },
    { grade: 6, difficulty: "hard", text: "解方程：-5x + 32 = -3" },
    { grade: 6, difficulty: "hard", text: "解方程：-9x - 13 = -58" },
  
    /* ===================== 七年级 ===================== */
    // 简单
    { grade: 7, difficulty: "easy", text: "解方程：2x + 5 = 13" },
    { grade: 7, difficulty: "easy", text: "解方程：3x + 7 = 28" },
    { grade: 7, difficulty: "easy", text: "解方程：4x + 9 = 33" },
    { grade: 7, difficulty: "easy", text: "解方程：5x + 6 = 41" },
    { grade: 7, difficulty: "easy", text: "解方程：6x + 8 = 44" },
    { grade: 7, difficulty: "easy", text: "解方程：7x + 12 = 61" },
    { grade: 7, difficulty: "easy", text: "解方程：8x + 10 = 66" },
    { grade: 7, difficulty: "easy", text: "解方程：9x + 14 = 77" },
    { grade: 7, difficulty: "easy", text: "解方程：10x + 11 = 71" },
    { grade: 7, difficulty: "easy", text: "解方程：11x + 13 = 90" },
    // 中等
    { grade: 7, difficulty: "medium", text: "解方程：6x - 17 = 31" },
    { grade: 7, difficulty: "medium", text: "解方程：7x + 19 = 82" },
    { grade: 7, difficulty: "medium", text: "解方程：8x - 21 = 43" },
    { grade: 7, difficulty: "medium", text: "解方程：9x + 23 = 104" },
    { grade: 7, difficulty: "medium", text: "解方程：10x - 29 = 61" },
    { grade: 7, difficulty: "medium", text: "解方程：11x + 27 = 138" },
    { grade: 7, difficulty: "medium", text: "解方程：12x - 25 = 71" },
    { grade: 7, difficulty: "medium", text: "解方程：13x + 31 = 170" },
    { grade: 7, difficulty: "medium", text: "解方程：14x - 33 = 67" },
    { grade: 7, difficulty: "medium", text: "解方程：15x + 35 = 200" },
    // 困难
    { grade: 7, difficulty: "hard", text: "解方程：-12x + 41 = -7" },
    { grade: 7, difficulty: "hard", text: "解方程：-13x - 29 = -92" },
    { grade: 7, difficulty: "hard", text: "解方程：-14x + 17 = -111" },
    { grade: 7, difficulty: "hard", text: "解方程：-15x - 39 = -174" },
    { grade: 7, difficulty: "hard", text: "解方程：-16x + 23 = -89" },
    { grade: 7, difficulty: "hard", text: "解方程：-17x - 27 = -116" },
    { grade: 7, difficulty: "hard", text: "解方程：-18x + 37 = -47" },
    { grade: 7, difficulty: "hard", text: "解方程：-19x - 41 = -150" },
    { grade: 7, difficulty: "hard", text: "解方程：-20x + 33 = -127" },
    { grade: 7, difficulty: "hard", text: "解方程：-21x - 25 = -109" },
  ];
  