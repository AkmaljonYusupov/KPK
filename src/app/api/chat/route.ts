import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   AI CHAT — OPENAI
   ========================================================= */

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const MAX_TOKENS = 1500;
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT = `Sen KPK Platform ta'lim platformasining AI yordamchisisan.

Platformada 4 ta bo'lim bor:
1-bo'lim — boshlang'ich
2-bo'lim — o'rta
3-bo'lim — yuqori
4-bo'lim — eng yuqori daraja

Mavzular:
HTML, CSS, JavaScript, React va veb-dasturlash asoslari.

Qoidalar:
- Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber.
- O'zbek, ingliz yoki rus tilida javob ber.
- Talaba darajasiga mos, sodda va aniq tushuntir.
- Ortiqcha atamalardan qoch.
- Kod yozganda doim markdown code block ishlat.
- Masalan: \`\`\`tsx
- Javobni bo'limlarga ajrat.
- 250 so'zdan oshirma.
- Bilmasang, to'qib chiqarma.
- Dasturlashga aloqasi yo'q savollarga qisqa javob ber.
`;

/* =========================================================
   TYPES
   ========================================================= */

type TextPart = {
  type: "text";
  text: string;
};

type ImagePart = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

type ContentPart = TextPart | ImagePart;

interface ChatMessage {
  role: "user" | "assistant";
  content: string | ContentPart[];
}

interface ChatPayload {
  messages?: unknown;
}

/* =========================================================
   IMAGE URL VALIDATION
   ========================================================= */

function isAllowedImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;

  return (
    url.startsWith("data:image/") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  );
}

/* =========================================================
   NORMALIZE MESSAGE
   ========================================================= */

function normalizeMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const message = value as any;

  if (
    message.role !== "user" &&
    message.role !== "assistant"
  ) {
    return null;
  }

  /* -------------------------------------------------------
     SIMPLE TEXT
     ------------------------------------------------------- */

  if (typeof message.content === "string") {
    const text = message.content.trim();

    if (!text) return null;

    return {
      role: message.role,
      content: text,
    };
  }

  /* -------------------------------------------------------
     CONTENT PARTS
     ------------------------------------------------------- */

  if (Array.isArray(message.content)) {
    const parts: ContentPart[] = [];

    for (const part of message.content) {
      if (!part || typeof part !== "object") {
        continue;
      }

      /* TEXT */

      if (
        part.type === "text" &&
        typeof part.text === "string" &&
        part.text.trim()
      ) {
        parts.push({
          type: "text",
          text: part.text,
        });

        continue;
      }

      /* IMAGE */

      if (
        part.type === "image_url" &&
        part.image_url &&
        isAllowedImageUrl(part.image_url.url)
      ) {
        /*
         IMPORTANT:
         Image inputni faqat USER messagega yuboramiz.
        */

        if (message.role === "user") {
          parts.push({
            type: "image_url",
            image_url: {
              url: part.image_url.url,
              detail: part.image_url.detail ?? "auto",
            },
          });
        }

        continue;
      }
    }

    if (parts.length === 0) {
      return null;
    }

    /*
     Assistant message ichida image yubormaymiz.
     Faqat text qoldiramiz.
    */

    if (message.role === "assistant") {
      const textParts = parts.filter(
        (part): part is TextPart =>
          part.type === "text"
      );

      if (textParts.length === 0) {
        return null;
      }

      return {
        role: "assistant",
        content: textParts,
      };
    }

    return {
      role: "user",
      content: parts,
    };
  }

  return null;
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  /* -------------------------------------------------------
     API KEY
     ------------------------------------------------------- */

  if (!apiKey) {
    console.error(
      "[api/chat] OPENAI_API_KEY mavjud emas"
    );

    return NextResponse.json(
      {
        error: "not-configured",
      },
      {
        status: 503,
      }
    );
  }

  /* -------------------------------------------------------
     JSON
     ------------------------------------------------------- */

  let payload: ChatPayload;

  try {
    payload = (await request.json()) as ChatPayload;
  } catch (error) {
    console.error(
      "[api/chat] JSON parse error:",
      error
    );

    return NextResponse.json(
      {
        error: "invalid-json",
      },
      {
        status: 400,
      }
    );
  }

  /* -------------------------------------------------------
     MESSAGES
     ------------------------------------------------------- */

  const rawMessages = Array.isArray(payload.messages)
    ? payload.messages
    : [];

  const messages = rawMessages
    .map(normalizeMessage)
    .filter(
      (message): message is ChatMessage =>
        message !== null
    )
    .slice(-HISTORY_LIMIT);

  /* -------------------------------------------------------
     EMPTY
     ------------------------------------------------------- */

  if (messages.length === 0) {
    console.error(
      "[api/chat] Valid messages topilmadi:",
      JSON.stringify(payload).slice(0, 2000)
    );

    return NextResponse.json(
      {
        error: "empty-messages",
        message: "Valid chat message topilmadi.",
      },
      {
        status: 400,
      }
    );
  }

  /* -------------------------------------------------------
     OPENAI REQUEST
     ------------------------------------------------------- */

  let upstream: Response;

  try {
    upstream = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model: MODEL,

          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },

            ...messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],

          max_tokens: MAX_TOKENS,

          stream: true,
        }),
      }
    );
  } catch (error) {
    console.error(
      "[api/chat] Network error:",
      error
    );

    return NextResponse.json(
      {
        error: "network",
      },
      {
        status: 502,
      }
    );
  }

  /* -------------------------------------------------------
     OPENAI ERROR
     ------------------------------------------------------- */

  if (!upstream.ok) {
    const detail = await upstream
      .text()
      .catch(() => "");

    console.error(
      `\n[api/chat] =========================`
    );

    console.error(
      `[api/chat] OpenAI ERROR: ${upstream.status}`
    );

    console.error(
      `[api/chat] MODEL: ${MODEL}`
    );

    console.error(
      `[api/chat] DETAIL: ${detail.slice(0, 3000)}`
    );

    console.error(
      `[api/chat] =========================\n`
    );

    return NextResponse.json(
      {
        error: "upstream",
        status: upstream.status,

        ...(process.env.NODE_ENV === "development"
          ? {
              detail: detail.slice(0, 3000),
            }
          : {}),
      },
      {
        status: 502,
      }
    );
  }

  /* -------------------------------------------------------
     STREAM BODY
     ------------------------------------------------------- */

  if (!upstream.body) {
    return NextResponse.json(
      {
        error: "empty-body",
      },
      {
        status: 502,
      }
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader =
        upstream.body!.getReader();

      let buffer = "";

      try {
        while (true) {
          const {
            done,
            value,
          } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines =
            buffer.split("\n");

          buffer =
            lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const raw =
              line.slice(5).trim();

            if (
              !raw ||
              raw === "[DONE]"
            ) {
              continue;
            }

            try {
              const event =
                JSON.parse(raw) as {
                  choices?: Array<{
                    delta?: {
                      content?: string;
                    };
                  }>;
                };

              const text =
                event
                  .choices?.[0]
                  ?.delta?.content;

              if (text) {
                controller.enqueue(
                  encoder.encode(text)
                );
              }
            } catch {
              /*
               Incomplete SSE chunk.
               Keyingi chunkda davom etadi.
              */
            }
          }
        }
      } catch (error) {
        console.error(
          "[api/chat] Stream error:",
          error
        );
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  /* -------------------------------------------------------
     RESPONSE
     ------------------------------------------------------- */

  return new Response(stream, {
    headers: {
      "Content-Type":
        "text/plain; charset=utf-8",

      "Cache-Control":
        "no-store, no-transform",

      "X-Model": MODEL,
    },
  });
}