import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Rasm yaratish sekin — Vercel'da standart 10s yetmaydi. */
export const maxDuration = 60;

/* ══════════════════════════════════════════════════════════════
   RASM YARATISH — SERVER TOMONI (OpenAI Images)

   Suhbat modeli (gpt-4o-mini) rasmni TUSHUNADI, lekin CHIZA
   OLMAYDI. Rasm yaratish alohida endpoint orqali bo'ladi:
   https://api.openai.com/v1/images/generations

   Javob base64 ko'rinishida qaytariladi — brauzer uni to'g'ridan
   to'g'ri <img src="data:image/png;base64,..."> sifatida ko'rsatadi.
══════════════════════════════════════════════════════════════ */

/** gpt-image-1 sifatliroq, lekin ba'zi akkauntlarda tashkilotni
 *  tasdiqlashni talab qiladi. dall-e-3 hamma uchun ochiq. */
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

interface ImagePayload {
  prompt?: string;
  /** "1024x1024" | "1024x1536" | "1536x1024" */
  size?: string;
}

const ALLOWED_SIZES = ["1024x1024", "1024x1536", "1536x1024", "1792x1024", "1024x1792"];

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  let payload: ImagePayload;
  try {
    payload = (await request.json()) as ImagePayload;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const prompt = (payload.prompt ?? "").trim();

  if (prompt.length < 2) {
    return NextResponse.json({ error: "empty-prompt" }, { status: 400 });
  }

  const size = ALLOWED_SIZES.includes(payload.size ?? "") ? payload.size : "1024x1024";

  // dall-e-* modellari uchun formatni alohida so'rash kerak,
  // gpt-image-1 esa har doim base64 qaytaradi.
  const body: Record<string, unknown> = { model: MODEL, prompt, n: 1, size };
  if (MODEL.startsWith("dall-e")) body.response_format = "b64_json";

  let upstream: Response;

  try {
    upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error(`[api/image] OpenAI ${upstream.status}:`, detail.slice(0, 500));

    return NextResponse.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }

  const result = (await upstream.json().catch(() => null)) as {
    data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
  } | null;

  const first = result?.data?.[0];

  if (!first?.b64_json && !first?.url) {
    return NextResponse.json({ error: "empty-result" }, { status: 502 });
  }

  return NextResponse.json({
    image: first.b64_json ? `data:image/png;base64,${first.b64_json}` : first.url,
    revisedPrompt: first.revised_prompt ?? null,
  });
}