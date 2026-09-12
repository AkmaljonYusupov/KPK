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
══════════════════════════════════════════════════════════════ */

/* Har bir OpenAI loyihasida turli modellar ochiq bo'ladi. Shuning
   uchun bitta modelga tayanmaymiz: ro'yxat bo'yicha ketma-ket
   urinamiz va birinchi ishlagani bilan davom etamiz.
   .env.local dagi OPENAI_IMAGE_MODEL birinchi bo'lib sinaladi. */
const MODEL_CANDIDATES = Array.from(
  new Set(
    [
      process.env.OPENAI_IMAGE_MODEL,
      "gpt-image-1",
      "gpt-image-1-mini",
      "dall-e-3",
      "dall-e-2",
    ].filter(Boolean) as string[]
  )
);

/** Model mavjud emasligini bildiruvchi xatomi? Shunday bo'lsa keyingisiga o'tamiz. */
function isModelMissing(detail: string): boolean {
  return (
    detail.includes("does not exist") ||
    detail.includes("model_not_found") ||
    detail.includes("must be verified") ||
    detail.includes("does not have access")
  );
}

interface ImagePayload {
  prompt?: string;
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

  // 1024x1024 — barcha modellar qo'llab-quvvatlaydigan yagona o'lcham
  const size = ALLOWED_SIZES.includes(payload.size ?? "") ? payload.size : "1024x1024";

  // response_format YUBORILMAYDI: OpenAI uni endi qabul qilmaydi
  // ("Unknown parameter: 'response_format'"). Model o'zi qaysi
  // formatda qaytarsa — quyida ikkalasini ham qo'llab-quvvatlaymiz.

  /* Modellarni ketma-ket sinaymiz. "Model mavjud emas" xatosida
     keyingisiga o'tamiz, boshqa xatoda darhol to'xtaymiz — masalan
     balans tugagan bo'lsa qayta urinishdan foyda yo'q. */
  let upstream: Response | null = null;
  let lastStatus = 502;
  let lastDetail = "";

  for (const model of MODEL_CANDIDATES) {
    let response: Response;

    try {
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, prompt, n: 1, size }),
      });
    } catch {
      return NextResponse.json({ error: "network" }, { status: 502 });
    }

    if (response.ok) {
      console.log(`[api/image] ishlatilgan model: ${model}`);
      upstream = response;
      break;
    }

    lastStatus = response.status;
    lastDetail = await response.text().catch(() => "");
    console.error(`[api/image] ${model} → ${response.status}:`, lastDetail.slice(0, 300));

    // Model yo'q bo'lsa — keyingisini sinaymiz, aks holda to'xtaymiz
    if (!isModelMissing(lastDetail)) break;
  }

  if (!upstream) {
    let message = "";
    try {
      const parsed = JSON.parse(lastDetail) as { error?: { message?: string; code?: string } };
      message = parsed.error?.message ?? parsed.error?.code ?? "";
    } catch {
      message = lastDetail.slice(0, 200);
    }

    return NextResponse.json(
      { error: "upstream", status: lastStatus, message, tried: MODEL_CANDIDATES },
      { status: 502 }
    );
  }

  const result = (await upstream.json().catch(() => null)) as {
    data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
  } | null;

  const first = result?.data?.[0];

  if (!first?.b64_json && !first?.url) {
    return NextResponse.json({ error: "empty-result" }, { status: 502 });
  }

  // Base64 bo'lsa — to'g'ridan-to'g'ri ishlatamiz.
  if (first.b64_json) {
    return NextResponse.json({
      image: `data:image/png;base64,${first.b64_json}`,
      revisedPrompt: first.revised_prompt ?? null,
    });
  }

  /* URL kelgan bo'lsa uni serverda yuklab, base64 ga o'giramiz.
     Ikki sabab bor:
       1. OpenAI havolasi ~1 soatdan keyin o'chadi;
       2. boshqa domendagi rasmni "Yuklab olish" tugmasi saqlay olmaydi. */
  try {
    const file = await fetch(first.url!, { cache: "no-store" });
    if (!file.ok) throw new Error(String(file.status));

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.headers.get("content-type") ?? "image/png";

    return NextResponse.json({
      image: `data:${type};base64,${buffer.toString("base64")}`,
      revisedPrompt: first.revised_prompt ?? null,
    });
  } catch {
    // Yuklab bo'lmasa — hech bo'lmasa havolaning o'zini beramiz.
    return NextResponse.json({
      image: first.url,
      revisedPrompt: first.revised_prompt ?? null,
    });
  }
}