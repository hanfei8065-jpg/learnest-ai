// app/api/coach_admin/route.ts - 修复版
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Agent from "agentkeepalive";

export const runtime = "nodejs";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const keepAliveAgent = new Agent.HttpsAgent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

const PRICE = {
  inputPerM: 5,
  outputPerM: 15,
};

type CoachPayload = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
};

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  const token = req.headers.get("x-admin-token") || "";
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED", requestId },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as CoachPayload;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      // @ts-ignore - agent is needed for keep-alive
      agent: keepAliveAgent,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: body.temperature ?? 0.4,
        stream: false,
        messages: body.messages,
        max_tokens: body.max_tokens ?? 500,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "UPSTREAM_ERROR",
          status: res.status,
          requestId,
          debug_error: typeof data === "string" ? data.slice(0, 2000) : data,
        },
        { status: 200 }
      );
    }

    const usage = data?.usage || {};
    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;

    const cost =
      (promptTokens / 1_000_000) * PRICE.inputPerM +
      (completionTokens / 1_000_000) * PRICE.outputPerM;

    return NextResponse.json(
      {
        ok: true,
        requestId,
        usage,
        estimatedCostUSD: Number(cost.toFixed(6)),
        choices: data?.choices ?? [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL",
        requestId,
        debug_error: String(err?.message || err),
      },
      { status: 200 }
    );
  }
}