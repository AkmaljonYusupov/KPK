export default async function handler(req, res) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        ok: false,
        message: "TOKEN yoki CHAT_ID topilmadi",
        tokenFound: Boolean(BOT_TOKEN),
        chatIdFound: Boolean(CHAT_ID)
      });
    }

    const body = req.method === "POST" ? req.body : {};

    const action = body.action || "TEST";
    const user = body.user || {};
    const time = body.time || new Date().toLocaleString("uz-UZ");
    const page = body.page || "Test sahifa";

    const message = `
${action === "LOGIN" ? "✅ TIZIMGA KIRDI" : action === "LOGOUT" ? "🚪 TIZIMDAN CHIQDI" : "🧪 TEST XABAR"}

👤 Ism: ${user.name || "Test User"}
📧 Email: ${user.email || "test@gmail.com"}
🔐 Provider: ${user.provider || "test"}
🆔 UID: ${user.uid || "test-uid"}
🌐 Sahifa: ${page}
⏰ Vaqt: ${time}
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

    return res.status(tgData.ok ? 200 : 400).json({
      ok: tgData.ok,
      message: tgData.ok ? "Telegramga yuborildi" : "Telegramga yuborilmadi",
      telegram: tgData
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}