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

/* FIREBASE CONFIG */

const firebaseConfig = {
  apiKey: "AIzaSyBfmybIJBQjvVPMXBJqnST2kLH7LDKc_Gs",
  authDomain: "kpk-platform.firebaseapp.com",
  projectId: "kpk-platform",
  storageBucket: "kpk-platform.firebasestorage.app",
  messagingSenderId: "825526667791",
  appId: "1:825526667791:web:82933a1cfb1a9d9161f17a",
  measurementId: "G-W02BY5MCFB"
};

/* INIT */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* PROVIDERS */

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/* ELEMENT */

const continueAuthBtn = document.getElementById("continueAuthBtn");

/* LOGIN */

async function loginWithProvider(){
  try{
    const providerName = window.kpkSelectedProvider || "google";

    const selectedProvider =
      providerName === "github"
        ? githubProvider
        : googleProvider;

    const result = await signInWithPopup(auth, selectedProvider);

    const user = result.user;

    localStorage.setItem(
      "kpk-user",
      JSON.stringify({
        uid:user.uid,
        name:user.displayName,
        email:user.email,
        image:user.photoURL,
        provider:providerName
      })
    );

    if(window.closeAuthModalWindow){
      window.closeAuthModalWindow();
    }

    window.location.href = "./dashboard.html";
  }

  catch(error){
    console.error("Login Error:", error);
  }
}

/* BUTTON */

if(continueAuthBtn){
  continueAuthBtn.addEventListener("click", loginWithProvider);
}

/* LOGOUT */

window.kpkLogout = async function(){
  try{
    await signOut(auth);

    localStorage.removeItem("kpk-user");

    window.location.href = "./index.html";
  }

  catch(error){
    console.error("Logout Error:", error);
  }
};
