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

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

const continueAuthBtn = document.getElementById("continueAuthBtn");

/* TRANSLATION */

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
    telegramSuccessTitle: "Telegramga yuborildi",
    telegramLoginText: "User kirish maʼlumotlari Telegram botga muvaffaqiyatli yuborildi.",
    telegramLogoutText: "User chiqish maʼlumotlari Telegram botga muvaffaqiyatli yuborildi.",
    telegramErrorTitle: "Telegram xatoligi",
    telegramErrorText: "Telegram botga maʼlumot yuborib bo‘lmadi.",
    serverErrorTitle: "Server xatoligi",
    serverErrorText: "Telegram server bilan ulanishda xatolik.",
    noEmail: "Email ko‘rsatilmagan",
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
    telegramSuccessTitle: "Sent to Telegram",
    telegramLoginText: "User login information was successfully sent to the Telegram bot.",
    telegramLogoutText: "User logout information was successfully sent to the Telegram bot.",
    telegramErrorTitle: "Telegram error",
    telegramErrorText: "Could not send information to the Telegram bot.",
    serverErrorTitle: "Server error",
    serverErrorText: "Error connecting to the Telegram server.",
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
    telegramSuccessTitle: "Отправлено в Telegram",
    telegramLoginText: "Информация о входе пользователя успешно отправлена в Telegram бот.",
    telegramLogoutText: "Информация о выходе пользователя успешно отправлена в Telegram бот.",
    telegramErrorTitle: "Ошибка Telegram",
    telegramErrorText: "Не удалось отправить информацию в Telegram бот.",
    serverErrorTitle: "Ошибка сервера",
    serverErrorText: "Ошибка соединения с сервером Telegram.",
    noEmail: "Email не указан",
    user: "Пользователь"
  }
};

function t() {
  return authTexts[getLang()] || authTexts.uz;
}

function setToastIcon(iconClass) {
  const toastIcon = document.getElementById("toastIcon");

  if (toastIcon) {
    toastIcon.innerHTML = `<i class="bi ${iconClass}"></i>`;
  }
}

function showToast(title, message, type = "info", iconClass = "bi-info-circle-fill") {
  setToastIcon(iconClass);

  if (window.showModernToast) {
    window.showModernToast({
      title,
      message,
      type
    });
  }
}

/* TELEGRAM LOG */

async function sendTelegramLog(action, userData) {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        user: userData,
        time: new Date().toLocaleString("uz-UZ")
      })
    });

    const result = await response.json();

    console.log("Telegram result:", result);

    if (result.ok) {
      showToast(
        t().telegramSuccessTitle,
        action === "LOGIN"
          ? t().telegramLoginText
          : t().telegramLogoutText,
        "success",
        "bi-send-check-fill"
      );

      return true;
    }

    showToast(
      t().telegramErrorTitle,
      t().telegramErrorText,
      "error",
      "bi-send-x-fill"
    );

    console.error("Telegram API Error:", result);

    return false;

  } catch (error) {
    console.error("Telegram log error:", error);

    showToast(
      t().serverErrorTitle,
      t().serverErrorText,
      "error",
      "bi-wifi-off"
    );

    return false;
  }
}

/* LOGIN */

async function loginWithProvider() {
  try {
    const providerName = window.kpkSelectedProvider || "google";

    const selectedProvider =
      providerName === "github"
        ? githubProvider
        : googleProvider;

    const result = await signInWithPopup(auth, selectedProvider);
    const user = result.user;

    const userData = {
      uid: user.uid,
      name: user.displayName || t().user,
      email: user.email || t().noEmail,
      image: user.photoURL || "./images/user.png",
      provider: providerName
    };

    localStorage.setItem("kpk-user", JSON.stringify(userData));

    await sendTelegramLog("LOGIN", userData);

    if (window.closeAuthModalWindow) {
      window.closeAuthModalWindow();
    }

    showToast(
      t().loginSuccessTitle,
      `${userData.name} — ${t().loginSuccessText}`,
      "success",
      "bi-check-circle-fill"
    );

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1100);

  } catch (error) {
    console.error("Login Error Code:", error.code);
    console.error("Login Error Message:", error.message);

    const toast = window.getAuthToastText
      ? window.getAuthToastText(error.code)
      : {
          title: t().loginErrorTitle,
          message: t().loginErrorText
        };

    showToast(
      toast.title,
      toast.message,
      "error",
      "bi-exclamation-triangle-fill"
    );
  }
}

if (continueAuthBtn) {
  continueAuthBtn.addEventListener("click", loginWithProvider);
}

/* LOGOUT */

window.kpkLogout = async function() {
  try {
    const userData = JSON.parse(localStorage.getItem("kpk-user"));

    if (userData) {
      await sendTelegramLog("LOGOUT", userData);
    }

    await signOut(auth);

    localStorage.removeItem("kpk-user");

    showToast(
      t().logoutSuccessTitle,
      t().logoutSuccessText,
      "success",
      "bi-box-arrow-right"
    );

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1000);

  } catch (error) {
    console.error("Logout Error:", error);

    showToast(
      t().logoutErrorTitle,
      t().logoutErrorText,
      "error",
      "bi-x-circle-fill"
    );
  }
};
