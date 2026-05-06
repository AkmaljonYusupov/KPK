export default async function handler(req, res) {
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
        message: "TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID topilmadi"
      });
    }

    const { action, user, time } = req.body;

    const message = `
${action === "LOGIN" ? "✅ TIZIMGA KIRDI" : "🚪 TIZIMDAN CHIQDI"}

👤 Ism: ${user?.name || "Nomaʼlum"}
📧 Email: ${user?.email || "Nomaʼlum"}
🔐 Provider: ${user?.provider || "Nomaʼlum"}
🆔 UID: ${user?.uid || "Nomaʼlum"}
⏰ Vaqt: ${time || new Date().toLocaleString("uz-UZ")}
`;

    const tgResponse = await fetch(
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

    const tgData = await tgResponse.json();

    return res.status(200).json({
      ok: tgData.ok,
      telegram: tgData
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}
