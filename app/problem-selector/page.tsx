// app/problem-selector/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { problems } from "../lib/problems";

export default function ProblemSelectorPage() {
  const [selectedGrade, setSelectedGrade] = useState<5 | 6 | 7>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [seed, setSeed] = useState(0); // 用于“换一批”

  const filtered = useMemo(
    () => problems.filter(p => p.grade === selectedGrade && p.difficulty === selectedDifficulty),
    [selectedGrade, selectedDifficulty]
  );

  const randomized = useMemo(
    () => [...filtered].sort(() => Math.random() - 0.5).slice(0, 5),
    [filtered, seed]
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-light text-center mb-8">选择题目</h1>

      {/* 年级切换 */}
      <div className="flex justify-center gap-3 mb-6">
        {[5, 6, 7].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g as 5 | 6 | 7)}
            className={`px-4 py-2 rounded-lg border ${selectedGrade === g ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}
          >
            {g} 年级
          </button>
        ))}
      </div>

      {/* 难度切换 */}
      <div className="flex justify-center gap-3 mb-8">
        {[
          { key: "easy", label: "简单" },
          { key: "medium", label: "中等" },
          { key: "hard", label: "困难" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedDifficulty(key as "easy" | "medium" | "hard")}
            className={`px-4 py-2 rounded-lg border ${selectedDifficulty === key ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 统计 */}
      <p className="text-center text-neutral-500 mb-6">
        当前显示 {randomized.length}/{filtered.length} 道题
      </p>

      {/* 题目卡片 */}
      <div className="grid md:grid-cols-2 gap-4">
        {randomized.map((p, i) => (
          <Link
            key={i}
            href={`/problem-solver?q=${encodeURIComponent(p.text)}&g=${p.grade}&d=${p.difficulty}`}
            className="rounded-xl border p-6 bg-white shadow-sm hover:shadow-md transition"
          >
            {p.text}
          </Link>
        ))}
      </div>

      {/* 换一批 */}
      <div className="text-center mt-8">
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-6 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50"
        >
          换一批题
        </button>
      </div>
    </div>
  );
}



