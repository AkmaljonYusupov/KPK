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

    if (!result.ok) {
      console.error("Telegram API Error:", result);
    }

  } catch (error) {
    console.error("Telegram log error:", error);
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
      name: user.displayName || "User",
      email: user.email || "Email ko‘rsatilmagan",
      image: user.photoURL || "./images/user.png",
      provider: providerName
    };

    localStorage.setItem("kpk-user", JSON.stringify(userData));

    await sendTelegramLog("LOGIN", userData);

    if (window.closeAuthModalWindow) {
      window.closeAuthModalWindow();
    }

    if (window.showModernToast) {
      window.showModernToast({
        title: "Kirish tasdiqlandi",
        message: `${userData.name} tizimga muvaffaqiyatli kirdi.`,
        type: "success"
      });
    }

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 900);

  } catch (error) {
    console.error("Login Error Code:", error.code);
    console.error("Login Error Message:", error.message);

    const toast = window.getAuthToastText
      ? window.getAuthToastText(error.code)
      : {
          title: "Login xatoligi",
          message: "Kirishda xatolik yuz berdi."
        };

    if (window.showModernToast) {
      window.showModernToast({
        title: toast.title,
        message: toast.message,
        type: "error"
      });
    }
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

    if (window.showModernToast) {
      window.showModernToast({
        title: "Chiqish tasdiqlandi",
        message: "Tizimdan muvaffaqiyatli chiqildi.",
        type: "success"
      });
    }

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 800);

  } catch (error) {
    console.error("Logout Error:", error);

    if (window.showModernToast) {
      window.showModernToast({
        title: "Chiqish xatoligi",
        message: "Tizimdan chiqishda xatolik yuz berdi.",
        type: "error"
      });
    }
  }
};
