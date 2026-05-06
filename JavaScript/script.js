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

let currentLang = localStorage.getItem("kpk-lang") || "uz";
let currentTranslations = {};

if (langCurrent && langDropdown) {
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

    currentLang = lang;
    currentTranslations = data;

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");

      if (data[key]) {
        element.textContent = data[key];
      }
    });

    if (currentFlag) {
      currentFlag.src = langMeta[lang].flag;
    }

    if (currentLangText) {
      currentLangText.textContent = langMeta[lang].label;
    }

    langOptions.forEach((option) => {
      option.classList.toggle("active", option.dataset.langCode === lang);
    });

    localStorage.setItem("kpk-lang", lang);

    if (window.kpkSelectedProvider) {
      updateAuthModal(window.kpkSelectedProvider);
    }

  } catch (error) {
    console.error("Til faylini yuklashda xatolik:", error);
  }
}

langOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const lang = option.dataset.langCode;

    changeLanguage(lang);

    if (langDropdown) {
      langDropdown.classList.remove("active");
    }
  });
});

changeLanguage(currentLang);

/* AUTH MODAL */

const googleLoginBtn = document.getElementById("googleLoginBtn");
const githubLoginBtn = document.getElementById("githubLoginBtn");

const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const cancelAuthBtn = document.getElementById("cancelAuthBtn");

const authModalIcon = document.getElementById("authModalIcon");
const authModalTitle = document.getElementById("authModalTitle");
const authModalText = document.getElementById("authModalText");

window.kpkSelectedProvider = "google";

function updateAuthModal(provider) {
  if (!currentTranslations) return;

  const isGoogle = provider === "google";

  if (authModalIcon) {
    authModalIcon.innerHTML = isGoogle
      ? `<i class="bi bi-google"></i>`
      : `<i class="bi bi-github"></i>`;

    authModalIcon.classList.toggle("github-modal-icon", !isGoogle);
  }

  if (authModalTitle) {
    authModalTitle.textContent = isGoogle
      ? currentTranslations.modalGoogleTitle
      : currentTranslations.modalGithubTitle;
  }

  if (authModalText) {
    authModalText.textContent = isGoogle
      ? currentTranslations.modalGoogleText
      : currentTranslations.modalGithubText;
  }
}

function openAuthModal(provider) {
  window.kpkSelectedProvider = provider;

  updateAuthModal(provider);

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
  googleLoginBtn.addEventListener("click", () => {
    openAuthModal("google");
  });
}

if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", () => {
    openAuthModal("github");
  });
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

window.closeAuthModalWindow = closeModal;
