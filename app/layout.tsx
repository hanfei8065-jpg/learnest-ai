export const metadata = {
  title: "Learnest.ai — 数学，有方法。",
  description: "苏格拉底式 AI 引导，来自硅谷。专注数学，夯实基础。",
  openGraph: {
    title: "Learnest.ai — 数学，有方法。",
    description: "苏格拉底式 AI 引导，来自硅谷。",
    type: "website",
    url: "https://learnest.ai",
  },
};

import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-white text-neutral-900 antialiased`}>
        {/* 顶部导航：加了 relative z-50，确保位于最上层并且可点击 */}
        <nav className="relative z-50 flex justify-between items-center p-6">
          {/* ✅ 品牌名用 Link，确保可点击返回首页 */}
          <Link
            href="/"
            prefetch
            aria-label="返回首页"
            className="text-xl font-medium tracking-tight cursor-pointer select-none rounded
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10"
          >
            Learnest.ai
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
            >
              登录
            </Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white
                         [box-shadow:inset_0_1px_0_rgba(255,255,255,.6),0_1px_2px_rgba(15,23,42,.06)]
                         hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,.9),0_6px_18px_rgba(15,23,42,.08)]
                         hover:bg-neutral-50 active:scale-[.98] transition"
            >
              注册
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
