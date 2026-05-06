import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "BU_YERGA_API_KEY",
  authDomain: "kpk-platform.firebaseapp.com",
  projectId: "kpk-platform",
  storageBucket: "kpk-platform.appspot.com",
  messagingSenderId: "BU_YERGA_SENDER_ID",
  appId: "BU_YERGA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const continueAuthBtn = document.getElementById("continueAuthBtn");

async function loginWithProvider() {
  try {
    const providerName = window.kpkSelectedProvider || "google";

    const selectedProvider =
      providerName === "github" ? githubProvider : googleProvider;

    const result = await signInWithPopup(auth, selectedProvider);
    const user = result.user;

    localStorage.setItem("kpk-user", JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
      provider: providerName
    }));

    if (window.closeAuthModalWindow) {
      window.closeAuthModalWindow();
    }

    window.location.href = "./dashboard.html";

  } catch (error) {
    console.error("Login xatoligi:", error);
  }
}

if (continueAuthBtn) {
  continueAuthBtn.addEventListener("click", loginWithProvider);
}
