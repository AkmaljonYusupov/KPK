import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfmybIJBQjvVPMXBJqnST2kLH7LDKc_Gs",
  authDomain: "kpk-platform.firebaseapp.com",
  projectId: "kpk-platform",
  storageBucket: "kpk-platform.firebasestorage.app",
  messagingSenderId: "825526667791",
  appId: "1:825526667791:web:82933a1cfb1a9d9161f17a",
  measurementId: "G-W02BY5MCFB"
};

// ═══════════════════════════════════════════════════════
// TELEGRAM CONFIG — shu ikki qiymatni o'zgartiring
const TELEGRAM_BOT_TOKEN = "8600474887:AAH8OeZ9pDlpBS_tviQ0zMIOfc2emzjpwNE";
const TELEGRAM_CHAT_ID   = "529092761";
// ═══════════════════════════════════════════════════════

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

const continueAuthBtn = document.getElementById("continueAuthBtn");

/* ─── TRANSLATION ─────────────────────────────────────────────────────────── */

function getLang() {
  return localStorage.getItem("kpk-lang") || "uz";
}

const authTexts = {
  uz: {
    loginSuccessTitle: "Kirish tasdiqlandi",
    loginSuccessText: "Tizimga muvaffaqiyatli kirildi.",
    logoutSuccessTitle: "Chiqish tasdiqlandi",
    logoutSuccessText: "Tizimdan muvaffaqiyatli chiqildi.",

    loginErrorTitle: "Login xatoligi",
    loginErrorText: "Kirishda xatolik yuz berdi.",
    logoutErrorTitle: "Chiqish xatoligi",
    logoutErrorText: "Tizimdan chiqishda xatolik yuz berdi.",

    unauthorizedDomainTitle: "Firebase domen xatoligi",
    unauthorizedDomainText: "Firebase Console → Authentication → Settings → Authorized domains bo'limiga localhost va 127.0.0.1 ni qo'shing.",

    telegramSendingTitle: "Telegramga yuborilmoqda",
    telegramLoginSendingText: "User kirish ma'lumotlari Telegram botga yuborilmoqda...",
    telegramLogoutSendingText: "User chiqish ma'lumotlari Telegram botga yuborilmoqda...",

    telegramSuccessTitle: "Telegramga yuborildi",
    telegramLoginText: "User kirish ma'lumotlari Telegram botga muvaffaqiyatli yuborildi.",
    telegramLogoutText: "User chiqish ma'lumotlari Telegram botga muvaffaqiyatli yuborildi.",

    telegramErrorTitle: "Telegram xatoligi",
    telegramErrorText: "Telegram botga ma'lumot yuborib bo'lmadi.",
    telegramLoginFailedText: "Tizimga kirildi, lekin user ma'lumotlari Telegram botga yuborilmadi.",
    telegramLogoutFailedText: "Tizimdan chiqildi, lekin chiqish ma'lumotlari Telegram botga yuborilmadi.",

    serverErrorTitle: "Server xatoligi",
    serverErrorText: "Telegram API bilan ulanishda xatolik yuz berdi.",

    noEmail: "Email ko'rsatilmagan",
    user: "User"
  },

  en: {
    loginSuccessTitle: "Login confirmed",
    loginSuccessText: "You have successfully signed in.",
    logoutSuccessTitle: "Logout confirmed",
    logoutSuccessText: "You have successfully logged out.",

    loginErrorTitle: "Login error",
    loginErrorText: "An error occurred during sign-in.",
    logoutErrorTitle: "Logout error",
    logoutErrorText: "An error occurred during logout.",

    unauthorizedDomainTitle: "Firebase domain error",
    unauthorizedDomainText: "Add localhost and 127.0.0.1 in Firebase Console → Authentication → Settings → Authorized domains.",

    telegramSendingTitle: "Sending to Telegram",
    telegramLoginSendingText: "User login information is being sent to Telegram bot...",
    telegramLogoutSendingText: "User logout information is being sent to Telegram bot...",

    telegramSuccessTitle: "Sent to Telegram",
    telegramLoginText: "User login information was successfully sent to Telegram bot.",
    telegramLogoutText: "User logout information was successfully sent to Telegram bot.",

    telegramErrorTitle: "Telegram error",
    telegramErrorText: "Could not send information to Telegram bot.",
    telegramLoginFailedText: "Login completed, but user information was not sent to Telegram.",
    telegramLogoutFailedText: "Logout completed, but logout information was not sent to Telegram.",

    serverErrorTitle: "Server error",
    serverErrorText: "An error occurred connecting to Telegram API.",

    noEmail: "Email not provided",
    user: "User"
  },

  ru: {
    loginSuccessTitle: "Вход подтверждён",
    loginSuccessText: "Вы успешно вошли в систему.",
    logoutSuccessTitle: "Выход подтверждён",
    logoutSuccessText: "Вы успешно вышли из системы.",

    loginErrorTitle: "Ошибка входа",
    loginErrorText: "Во время входа произошла ошибка.",
    logoutErrorTitle: "Ошибка выхода",
    logoutErrorText: "Во время выхода произошла ошибка.",

    unauthorizedDomainTitle: "Ошибка домена Firebase",
    unauthorizedDomainText: "Добавьте localhost и 127.0.0.1 в Firebase Console → Authentication → Settings → Authorized domains.",

    telegramSendingTitle: "Отправка в Telegram",
    telegramLoginSendingText: "Информация о входе пользователя отправляется в Telegram бот...",
    telegramLogoutSendingText: "Информация о выходе пользователя отправляется в Telegram бот...",

    telegramSuccessTitle: "Отправлено в Telegram",
    telegramLoginText: "Информация о входе пользователя успешно отправлена в Telegram бот.",
    telegramLogoutText: "Информация о выходе пользователя успешно отправлена в Telegram бот.",

    telegramErrorTitle: "Ошибка Telegram",
    telegramErrorText: "Не удалось отправить информацию в Telegram бот.",
    telegramLoginFailedText: "Вход выполнен, но информация пользователя не отправлена в Telegram.",
    telegramLogoutFailedText: "Выход выполнен, но информация о выходе не отправлена в Telegram.",

    serverErrorTitle: "Ошибка сервера",
    serverErrorText: "Произошла ошибка подключения к Telegram API.",

    noEmail: "Email не указан",
    user: "Пользователь"
  }
};

function t() {
  return authTexts[getLang()] || authTexts.uz;
}

/* ─── TOAST ───────────────────────────────────────────────────────────────── */

function setToastIcon(iconClass) {
  const toastIcon = document.getElementById("toastIcon");
  if (toastIcon) {
    toastIcon.innerHTML = `<i class="bi ${iconClass}"></i>`;
  }
}

function showToast(title, message, type = "info", iconClass = "bi-info-circle-fill") {
  setToastIcon(iconClass);
  if (window.showModernToast) {
    window.showModernToast({ title, message, type });
  } else {
    console.log(`[${type}] ${title}: ${message}`);
  }
}

/* ─── UNIVERSAL REDIRECT ──────────────────────────────────────────────────── */

function redirectToPage(pageName) {
  const currentPath = window.location.pathname;
  const folderPath = currentPath.substring(0, currentPath.lastIndexOf("/") + 1);
  window.location.href = `${window.location.origin}${folderPath}${pageName}`;
}

/* ─── TELEGRAM LOG — to'g'ridan-to'g'ri Telegram API ga ──────────────────── */

async function sendTelegramLog(action, userData) {
  try {
    showToast(
      t().telegramSendingTitle,
      action === "LOGIN" ? t().telegramLoginSendingText : t().telegramLogoutSendingText,
      "info",
      "bi-send-fill"
    );

    const message =
`${action === "LOGIN" ? "✅ TIZIMGA KIRDI" : "🚪 TIZIMDAN CHIQDI"}

👤 Ism: ${userData.name}
📧 Email: ${userData.email}
🔐 Provider: ${userData.provider}
🆔 UID: ${userData.uid}
🌐 Sahifa: ${window.location.href}
📱 Qurilma: ${navigator.platform}
🌍 Til: ${navigator.language}
⏰ Vaqt: ${new Date().toLocaleString("uz-UZ")}`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      }
    );

    const result = await response.json();
    console.log("Telegram result:", result);

    if (result.ok) {
      showToast(
        t().telegramSuccessTitle,
        action === "LOGIN" ? t().telegramLoginText : t().telegramLogoutText,
        "success",
        "bi-send-check-fill"
      );
      return true;
    }

    showToast(
      t().telegramErrorTitle,
      result.description || t().telegramErrorText,
      "error",
      "bi-send-x-fill"
    );
    return false;

  } catch (error) {
    console.error("Telegram log error:", error);
    showToast(t().serverErrorTitle, t().serverErrorText, "error", "bi-wifi-off");
    return false;
  }
}

/* ─── LOGIN ───────────────────────────────────────────────────────────────── */

async function loginWithProvider() {
  try {
    const providerName = window.kpkSelectedProvider || "google";
    const selectedProvider = providerName === "github" ? githubProvider : googleProvider;

    const result = await signInWithPopup(auth, selectedProvider);
    const user = result.user;

    // Email: Firebase dan olish, bo'lmasa providerData dan qidirish
    const email =
      user.email ||
      user.providerData?.find(p => p.email)?.email ||
      t().noEmail;

    const userData = {
      uid: user.uid,
      name: user.displayName || t().user,
      email: email,
      image: user.photoURL || "./images/user.png",
      provider: providerName,
      createdAt: user.metadata?.creationTime || "Noma'lum",
      lastLoginAt: user.metadata?.lastSignInTime || "Noma'lum"
    };

    localStorage.setItem("kpk-user", JSON.stringify(userData));

    showToast(
      t().loginSuccessTitle,
      `${userData.name} — ${t().loginSuccessText}`,
      "success",
      "bi-check-circle-fill"
    );

    const telegramSent = await sendTelegramLog("LOGIN", userData);

    if (!telegramSent) {
      showToast(
        t().telegramErrorTitle,
        t().telegramLoginFailedText,
        "error",
        "bi-send-x-fill"
      );
    }

    if (window.closeAuthModalWindow) {
      window.closeAuthModalWindow();
    }

    setTimeout(() => {
      redirectToPage("dashboard.html");
    }, 1300);

  } catch (error) {
    console.error("Login Error Code:", error.code);
    console.error("Login Error Message:", error.message);

    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return;
    }

    if (error.code === "auth/unauthorized-domain") {
      showToast(
        t().unauthorizedDomainTitle,
        t().unauthorizedDomainText,
        "error",
        "bi-shield-exclamation"
      );
      return;
    }

    const toast = window.getAuthToastText
      ? window.getAuthToastText(error.code)
      : { title: t().loginErrorTitle, message: t().loginErrorText };

    showToast(toast.title, toast.message, "error", "bi-exclamation-triangle-fill");
  }
}

if (continueAuthBtn) {
  continueAuthBtn.addEventListener("click", loginWithProvider);
}

/* ─── LOGOUT ──────────────────────────────────────────────────────────────── */

window.kpkLogout = async function () {
  try {
    const userData = JSON.parse(localStorage.getItem("kpk-user") || "null");

    let telegramSent = true;

    if (userData) {
      telegramSent = await sendTelegramLog("LOGOUT", userData);
    }

    await signOut(auth);

    localStorage.removeItem("kpk-user");

    showToast(
      t().logoutSuccessTitle,
      t().logoutSuccessText,
      "success",
      "bi-box-arrow-right"
    );

    if (!telegramSent) {
      showToast(
        t().telegramErrorTitle,
        t().telegramLogoutFailedText,
        "error",
        "bi-send-x-fill"
      );
    }

    setTimeout(() => {
      redirectToPage("index.html");
    }, 1200);

  } catch (error) {
    console.error("Logout Error:", error);
    showToast(t().logoutErrorTitle, t().logoutErrorText, "error", "bi-x-circle-fill");
  }
};