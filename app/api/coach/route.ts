// app/api/coach/route.ts - 修复版
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Agent from "agentkeepalive";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 5000;
const lastHitMap = new Map<string, number>();

const keepAliveAgent = new Agent.HttpsAgent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

type CoachPayload = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
};

function getSessionKey(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "anon";
  return ip;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  try {
    const sk = getSessionKey(req);
    const now = Date.now();
    const last = lastHitMap.get(sk) || 0;
    if (now - last < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        {
          ok: false,
          error: "TOO_FAST",
          message: "太快啦，想一想再发～",
          requestId,
        },
        { status: 429 }
      );
    }
    lastHitMap.set(sk, now);

    const body = (await req.json()) as CoachPayload;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.4;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);

    const openaiReq = () =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        // @ts-ignore - agent is needed for keep-alive
        agent: keepAliveAgent,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature,
          stream: false,
          messages: body.messages,
        }),
      });

    let res = await openaiReq().catch((e) => e);

    if (!(res instanceof Response) || !res.ok) {
      await new Promise((r) => setTimeout(r, 800));
      res = await openaiReq().catch((e) => e);
    }

    clearTimeout(t);

    if (!(res instanceof Response) || !res.ok || !res.body) {
      return NextResponse.json(
        {
          ok: false,
          error: "UPSTREAM_ERROR",
          message: "现在有点忙不过来，我先给你一个微提示：把题目拆成更小的步骤，先说你卡在第几步？",
          debug_error: res instanceof Response
            ? await safeReadText(res)
            : String((res as any)?.message || res),
          status: res instanceof Response ? res.status : 500,
          requestId,
        },
        { status: 200 }
      );
    }

    const headers = new Headers({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Request-Id": requestId,
    });

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL",
        message: "我这边短路了一下，先给你一个微提示：把已知信息列出来，我们逐条验证。",
        debug_error: String(err?.message || err),
        requestId,
      },
      { status: 200 }
    );
  } finally {
    // console.log("coach_done", { requestId, ms: Date.now() - startedAt });
  }
}

async function safeReadText(res: Response) {
  try {
    const txt = await res.text();
    return txt.slice(0, 2000);
  } catch {
    return "<unreadable>";
  }
}