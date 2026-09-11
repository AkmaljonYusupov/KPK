import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ══════════════════════════════════════════════════════════════
   AI YORDAMCHI — SERVER TOMONI

   API kaliti faqat serverda qoladi va brauzerga hech qachon
   yuborilmaydi. Javob oqim (stream) ko'rinishida qaytariladi —
   foydalanuvchi matnni yozilayotgan paytda ko'radi.
══════════════════════════════════════════════════════════════ */

/** Modelni almashtirmoqchi bo'lsangiz shu qatorni o'zgartiring. */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

const MAX_TOKENS = 1500;

/** Suhbat tarixidan nechta xabar yuboriladi (kontekstni cheklab turamiz). */
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT = `Sen KPK Platform ta'lim platformasining AI yordamchisisan.
Platformada 4 ta bo'lim bor: 1-bo'lim boshlang'ich, 2-bo'lim o'rta,
3-bo'lim yuqori, 4-bo'lim eng yuqori daraja. Mavzular: HTML, CSS,
JavaScript, React va veb-dasturlash asoslari.

Qoidalar:
- Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber (o'zbek, ingliz yoki rus).
- Talaba darajasiga mos, sodda va aniq tushuntir. Ortiqcha atamalardan qoch.
- Iloji boricha qisqa kod misoli keltir.
- Javobni bo'limlarga ajrat, lekin uzun matn yozma — 250 so'zdan oshirma.
- Bilmasang, to'qib chiqarma, bilmasligingni ayt.
- Dasturlashga aloqasi yo'q savollarga qisqa javob berib, mavzuga qaytar.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPayload {
  messages?: ChatMessage[];
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as ChatMessage;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const messages = (payload.messages ?? []).filter(isValidMessage).slice(-HISTORY_LIMIT);

  if (messages.length === 0) {
    return NextResponse.json({ error: "empty-messages" }, { status: 400 });
  }

  let upstream: Response;

  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        stream: true,
      }),
    });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  /* ── SSE oqimini oddiy matn oqimiga aylantiramiz ── */
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;

            try {
              const event = JSON.parse(raw) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };

              if (event.type === "content_block_delta" && event.delta?.text) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              /* to'liq bo'lmagan bo'lak — keyingi aylanishda qo'shiladi */
            }
          }
        }
      } catch {
        /* ulanish uzildi — oqimni shunchaki yopamiz */
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}