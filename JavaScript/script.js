const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

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

const googleLoginBtn = document.getElementById("googleLoginBtn");
const githubLoginBtn = document.getElementById("githubLoginBtn");

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    alert("Google Authentication ulanishi shu yerga yoziladi.");
  });
}

if (githubLoginBtn) {
  githubLoginBtn.addEventListener("click", () => {
    alert("GitHub Authentication ulanishi shu yerga yoziladi.");
  });
}