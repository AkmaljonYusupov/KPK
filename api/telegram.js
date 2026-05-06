export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Only POST method allowed"
    });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        ok: false,
        message: "Telegram token yoki chat ID topilmadi"
      });
    }

    const { action, user, time } = req.body;

    const actionText =
      action === "LOGIN"
        ? "✅ TIZIMGA KIRDI"
        : "🚪 TIZIMDAN CHIQDI";

    const message = `
${actionText}

👤 Ism: ${user?.name || "Nomaʼlum"}
📧 Email: ${user?.email || "Nomaʼlum"}
🔐 Provider: ${user?.provider || "Nomaʼlum"}
🆔 UID: ${user?.uid || "Nomaʼlum"}
⏰ Vaqt: ${time || new Date().toLocaleString("uz-UZ")}
`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      }
    );

    const data = await telegramResponse.json();

    if (!data.ok) {
      return res.status(500).json({
        ok: false,
        telegram: data
      });
    }

    return res.status(200).json({
      ok: true,
      telegram: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}
