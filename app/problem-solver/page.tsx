// app/problem-solver/page.tsx
import ProblemSelector from "@/components/ProblemSelector";

export default function ProblemSolverPage() {
  return (
    <main className="min-h-screen w-full px-6 py-10 md:px-10 lg:px-16">
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">系统出题 · 开始练习</h1>
        <p className="text-sm text-gray-500">
          选择年级、难度和知识点后，系统会先出一道题，并用一句话引导你迈出第一步。
        </p>
        <ProblemSelector />
      </section>
    </main>
  );
}

