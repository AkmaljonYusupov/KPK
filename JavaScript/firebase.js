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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// COOP xatosini kamaytirish uchun
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
    serverErrorText: "Telegram API bilan ulanishda xatolik. Live Server ishlatayotgan bo'lsangiz, yonida vercel dev ham ishga tushgan bo'lishi kerak.",

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
    serverErrorText: "Telegram API connection error. If you use Live Server, vercel dev must also be running.",

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
    serverErrorText: "Ошибка соединения с Telegram API. Если используете Live Server, vercel dev тоже должен быть запущен.",

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

/* ─── TELEGRAM API URL ────────────────────────────────────────────────────── */
function getTelegramApiUrl() {
  const host = window.location.hostname;
  const port = window.location.port;

  const isLiveServer =
    (host === "127.0.0.1" || host === "localhost") && port === "5500";

  if (isLiveServer) {
    // vercel dev o'rniga to'g'ridan deploy qilingan URL ga yubor
    return "https://kpk-platform.vercel.app/api/telegram";
  }

  return `${window.location.origin}/api/telegram`;
}

/* ─── TELEGRAM LOG ────────────────────────────────────────────────────────── */

async function sendTelegramLog(action, userData) {
  try {
    showToast(
      t().telegramSendingTitle,
      action === "LOGIN"
        ? t().telegramLoginSendingText
        : t().telegramLogoutSendingText,
      "info",
      "bi-send-fill"
    );

    const payload = {
      action,
      user: userData,
      page: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      time: new Date().toLocaleString("uz-UZ")
    };

    const response = await fetch(getTelegramApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = { ok: false, message: "Invalid JSON response" };
    }

    console.log("Telegram API URL:", getTelegramApiUrl());
    console.log("Telegram result:", result);

    if (response.ok && result.ok) {
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
      result.message || t().telegramErrorText,
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

    const userData = {
      uid: user.uid,
      name: user.displayName || t().user,
      email: user.email || t().noEmail,
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

    // Foydalanuvchi popupni o'zi yopsa — xato emas, jimgina chiqamiz
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