// components/CoachBoxV2.tsx - 修改版
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

export default function CoachBoxV2({ initialUserMessage }: { initialUserMessage?: string }) {
  const [input, setInput] = useState("");
  const debounced = useDebouncedValue(input, 300);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<ChatMsg[]>([
    {
      role: "system",
      content: "You are a Socratic tutor for Learnest.ai. Guide students step-by-step.",
    },
  ]);

  const { isLoading, assistantText, requestId, send, cancel } = useChatStream();
  const bootedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [history, assistantText]);

  // 修改后的初始化逻辑
  useEffect(() => {
    if (bootedRef.current) return;
    if (!initialUserMessage) return;
    bootedRef.current = true;

    const nextHistory: ChatMsg[] = [
      ...history,
      { 
        role: "user", 
        content: `请基于这个题目引导我学习："${initialUserMessage}"。用苏格拉底式提问，不要直接给答案。` 
      },
    ];
    const trimmed = [nextHistory[0], ...nextHistory.slice(-10)];
    setHistory(trimmed);
    send(trimmed);
  }, [initialUserMessage]);

  const canSend = useMemo(
    () => !isLoading && input.trim().length > 0,
    [isLoading, input]
  );

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;

    const userMessage = input.trim();
    const nextHistory: ChatMsg[] = [
      ...history,
      { role: "user", content: userMessage },
    ];
    const trimmed = [nextHistory[0], ...nextHistory.slice(-10)];
    setHistory(trimmed);
    setInput("");
    await send(trimmed);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="ui-card flex flex-col gap-4 max-h-96 overflow-y-auto p-4">
        {history
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  m.role === "user"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-neutral-100 text-neutral-900">
              {assistantText}
              <span className="animate-pulse">▌</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="ui-field flex-1"
          placeholder="输入你的思路或卡点…（回车发送）"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="ui-btn"
          title={isLoading ? "正在思考…" : "发送"}
        >
          {isLoading ? "…" : "发送"}
        </button>
        {isLoading && (
          <button
            type="button"
            onClick={cancel}
            className="ui-btn"
            title="停止生成"
          >
            停止
          </button>
        )}
      </form>

      {requestId && (
        <p className="text-xs text-neutral-500 mt-1">Request ID: {requestId}</p>
      )}
    </div>
  );
}