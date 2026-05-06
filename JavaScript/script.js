const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* LOADING */

window.addEventListener("load", () => {
  const loaderScreen = document.getElementById("loaderScreen");

  setTimeout(() => {
    if (loaderScreen) {
      loaderScreen.classList.add("hide");
    }
  }, 900);
});

/* LANGUAGE */

const langDropdown = document.getElementById("langDropdown");
const langCurrent = document.getElementById("langCurrent");
const currentFlag = document.getElementById("currentFlag");
const currentLangText = document.getElementById("currentLangText");
const langOptions = document.querySelectorAll(".lang-option");

const langMeta = {
  uz: {
    label: "UZ",
    flag: "./images/uz.png"
  },
  en: {
    label: "EN",
    flag: "./images/en.png"
  },
  ru: {
    label: "RU",
    flag: "./images/ru.png"
  }
};

if (langCurrent) {
  langCurrent.addEventListener("click", () => {
    langDropdown.classList.toggle("active");
  });
}

document.addEventListener("click", (event) => {
  if (langDropdown && !langDropdown.contains(event.target)) {
    langDropdown.classList.remove("active");
  }
});

async function changeLanguage(lang) {
  try {
    const response = await fetch(`./json/${lang}.json`);

    if (!response.ok) {
      throw new Error("JSON fayl topilmadi");
    }

    const data = await response.json();

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");

      if (data[key]) {
        element.textContent = data[key];
      }
    });

    currentFlag.src = langMeta[lang].flag;
    currentLangText.textContent = langMeta[lang].label;

    langOptions.forEach((option) => {
      option.classList.toggle("active", option.dataset.langCode === lang);
    });

    localStorage.setItem("kpk-lang", lang);
  } catch (error) {
    console.error("Til faylini yuklashda xatolik:", error);
  }
}

langOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const lang = option.dataset.langCode;
    changeLanguage(lang);
    langDropdown.classList.remove("active");
  });
});

const savedLang = localStorage.getItem("kpk-lang") || "uz";
changeLanguage(savedLang);

/* MODAL */

const googleLoginBtn = document.getElementById("googleLoginBtn");
const githubLoginBtn = document.getElementById("githubLoginBtn");

const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const cancelAuthBtn = document.getElementById("cancelAuthBtn");
const continueAuthBtn = document.getElementById("continueAuthBtn");

function openAuthModal() {
  if (authModal) {
    authModal.classList.add("show");
  }
}

function closeModal() {
  if (authModal) {
    authModal.classList.remove("show");
  }
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", openAuthModal);
}

if (closeAuthModal) {
  closeAuthModal.addEventListener("click", closeModal);
}

if (cancelAuthBtn) {
  cancelAuthBtn.addEventListener("click", closeModal);
}

if (authModal) {
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeModal();
    }
  });
}

if (continueAuthBtn) {
  continueAuthBtn.addEventListener("click", () => {
    closeModal();

    console.log("Google login boshlanmoqda...");

    /*
      Bu yerga Firebase Google Auth kodi ulanadi.
      Masalan: signInWithPopup(auth, provider)
    */
  });
}

if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", () => {
    console.log("Github login boshlanmoqda...");
  });
}
