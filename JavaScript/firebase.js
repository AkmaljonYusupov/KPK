import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* FIREBASE CONFIG */

const firebaseConfig = {

  apiKey: "API_KEY",

  authDomain: "PROJECT_ID.firebaseapp.com",

  projectId: "PROJECT_ID",

  storageBucket: "PROJECT_ID.appspot.com",

  messagingSenderId: "SENDER_ID",

  appId: "APP_ID"

};

/* INIT */

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const provider =
new GoogleAuthProvider();

/* BUTTON */

const googleLoginBtn =
document.getElementById("googleLoginBtn");

/* LOGIN */

googleLoginBtn.addEventListener("click", async () => {

  try{

    const result =
    await signInWithPopup(auth, provider);

    const user =
    result.user;

    console.log(user);

    alert(
      `Xush kelibsiz ${user.displayName}`
    );

    // USER DATA

    localStorage.setItem(
      "kpk-user",
      JSON.stringify({

        name:user.displayName,

        email:user.email,

        image:user.photoURL

      })
    );

    // REDIRECT

    window.location.href =
    "./dashboard.html";

  }

  catch(error){

    console.error(error);

    alert(
      "Google login xatoligi"
    );

  }

});

/* LOGOUT */

window.logout = async function(){

  await signOut(auth);

  localStorage.removeItem("kpk-user");

  window.location.href =
  "./index.html";

}
