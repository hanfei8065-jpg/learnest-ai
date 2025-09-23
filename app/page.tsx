// 全新首页代码 - 复制从这里开始
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-6 py-10 bg-neutral-50">
      <section className="max-w-lg mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light tracking-tight text-neutral-900">
            Math, mastered with method.
          </h1>
          <p className="text-lg text-neutral-600">
            Your AI learning companion, built in Silicon Valley.
          </p>
        </div>

        <Link
          href="/problem-solver"
          className="ui-btn mx-auto text-base px-8 py-4"
        >
          Begin Your Quest
        </Link>

        <div>
          <p className="text-sm text-neutral-400 mb-3">Alternatively, you can</p>
          <a
            href="#chat"
            className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4 transition"
          >
            bring your own problem
          </a>
        </div>
      </section>
    </main>
  );
}
// 复制到这里结束



