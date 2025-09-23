"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChatStream, ChatMsg } from "@/app/hooks/useChatStream";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function CoachBox({ initialUserMessage }: { initialUserMessage?: string }) {
  const [input, setInput] = useState("");
  const debounced = useDebouncedValue(input, 300);

  const [history, setHistory] = useState<ChatMsg[]>([
    {
      role: "system",
      content:
        "你是 Learnest.ai 的苏格拉底风格学习伙伴。先复述学生的意思，只问一个问题，引导拆步；必要时才给下一小步提示。",
    },
  ]);

  const { isLoading, assistantText, requestId, send, cancel } = useChatStream();
  const bootedRef = useRef(false);

  // 如果传入了初始题目，则自动发出第一条用户消息
  useEffect(() => {
    if (bootedRef.current) return;
    if (!initialUserMessage) return;
    bootedRef.current = true;

    const nextHistory: ChatMsg[] = [
      ...history,
      { role: "user", content: initialUserMessage },
    ];
    const trimmed = [nextHistory[0], ...nextHistory.slice(-10)];
    setHistory(trimmed);

    // 触发首条对话
    send(trimmed);
    // 不把 assistantText 立即固化，留给用户继续互动
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserMessage]);

  const canSend = useMemo(
    () => !isLoading && input.trim().length > 0,
    [isLoading, input]
  );

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;

    const nextHistory: ChatMsg[] = [
      ...history,
      { role: "user", content: input.trim() },
    ];
    const trimmed = [nextHistory[0], ...nextHistory.slice(-10)];
    setHistory(trimmed);
    setInput("");
    await send(trimmed);
    if (assistantText) {
      setHistory((h) => [...h, { role: "assistant", content: assistantText }]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border p-3 min-h-[240px] bg-white/60">
        {history
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div key={i} className="mb-2 whitespace-pre-wrap leading-relaxed">
              <b className="mr-1">{m.role === "user" ? "我" : "学伴"}：</b>
              {m.content}
            </div>
          ))}
        {isLoading && (
          <div className="whitespace-pre-wrap leading-relaxed">
            <b className="mr-1">学伴：</b>
            {assistantText}
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 outline-none"
          placeholder="输入你的思路或卡点…（回车发送）"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-xl px-4 py-2 border disabled:opacity-50"
          title={isLoading ? "正在思考…" : "发送"}
        >
          {isLoading ? "…" : "发送"}
        </button>
        {isLoading && (
          <button
            type="button"
            onClick={cancel}
            className="rounded-xl px-3 py-2 border"
            title="停止生成"
          >
            停止
          </button>
        )}
      </form>

      {requestId && (
        <p className="text-xs text-gray-500 mt-1">请求ID：{requestId}</p>
      )}
    </div>
  );
}
