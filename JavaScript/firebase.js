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
const githubLoginBtn = document.getElementById("githubLoginBtn");

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    localStorage.setItem("kpk-user", JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
      provider: "google"
    }));

    if (window.closeAuthModalWindow) {
      window.closeAuthModalWindow();
    }

    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Google login xatoligi:", error);
  }
}

async function loginWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    localStorage.setItem("kpk-user", JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
      provider: "github"
    }));

    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Github login xatoligi:", error);
  }
}

if (continueAuthBtn) {
  continueAuthBtn.addEventListener("click", loginWithGoogle);
}

if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", loginWithGithub);
}
