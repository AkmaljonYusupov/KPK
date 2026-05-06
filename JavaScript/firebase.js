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

async function loginWithProvider(){
  try{
    const providerName = window.kpkSelectedProvider || "google";

    const selectedProvider =
      providerName === "github" ? githubProvider : googleProvider;

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

    if(window.closeAuthModalWindow){
      window.closeAuthModalWindow();
    }

    window.location.assign("/dashboard.html");
  }

  catch(error){
    console.error("Login Error Code:", error.code);
    console.error("Login Error Message:", error.message);

    if(error.code === "auth/account-exists-with-different-credential"){
      alert("Bu email boshqa login usuli bilan ulangan. Avval Google bilan kirgan bo‘lsangiz, Google orqali kiring.");
      return;
    }

    if(error.code === "auth/popup-closed-by-user"){
      console.log("Foydalanuvchi login oynasini yopdi.");
      return;
    }

    if(error.code === "auth/unauthorized-domain"){
      alert("Firebase Authorized domains ichiga kpk-uz.vercel.app qo‘shilmagan.");
      return;
    }

    alert("GitHub orqali kirishda xatolik bor. Console’da error code ni tekshiring.");
  }
}

if(continueAuthBtn){
  continueAuthBtn.addEventListener("click", loginWithProvider);
}

window.kpkLogout = async function(){
  try{
    await signOut(auth);
    localStorage.removeItem("kpk-user");
    window.location.assign("/index.html");
  }
  catch(error){
    console.error("Logout Error:", error);
  }
};
