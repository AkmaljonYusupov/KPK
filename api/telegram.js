export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const BOT_TOKEN = process.env.8097143450:AAH11f4uz2ObC_8FG-HI8NOmPBuWeEPswkQ;
  const CHAT_ID = process.env.630353326;

  const { action, user, time } = req.body;

  const actionText = action === "LOGIN"
    ? "✅ TIZIMGA KIRDI"
    : "🚪 TIZIMDAN CHIQDI";

  const message = `
${actionText}

👤 Ism: ${user?.name || "Nomaʼlum"}
📧 Email: ${user?.email || "Nomaʼlum"}
🔐 Provider: ${user?.provider || "Nomaʼlum"}
🆔 UID: ${user?.uid || "Nomaʼlum"}
⏰ Vaqt: ${time}
`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false });
  }
}
