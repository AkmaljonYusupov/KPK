const user =
JSON.parse(
  localStorage.getItem("kpk-user")
);

if (!user) {

  window.location.href =
  "./index.html";

}

/* ═══════════════════════════════
   ELEMENTS
═══════════════════════════════ */

const profileWrapper =
document.getElementById(
  "profileWrapper"
);

const profileBtn =
document.getElementById(
  "profileBtn"
);

const profileImage =
document.getElementById(
  "profileImage"
);

const menuProfileImage =
document.getElementById(
  "menuProfileImage"
);

const profileName =
document.getElementById(
  "profileName"
);

const profileEmail =
document.getElementById(
  "profileEmail"
);

const profileProvider =
document.getElementById(
  "profileProvider"
);

const logoutBtn =
document.getElementById(
  "logoutBtn"
);

const langDropdown =
document.getElementById(
  "langDropdown"
);

const langCurrent =
document.getElementById(
  "langCurrent"
);

const currentFlag =
document.getElementById(
  "currentFlag"
);

const currentLangText =
document.getElementById(
  "currentLangText"
);

const langOptions =
document.querySelectorAll(
  ".lang-option"
);

/* ═══════════════════════════════
   MODULES
═══════════════════════════════ */

const module1 =
document.getElementById(
  "module1"
);

const module2 =
document.getElementById(
  "module2"
);

const module3 =
document.getElementById(
  "module3"
);

const module4 =
document.getElementById(
  "module4"
);

/* ═══════════════════════════════
   LANGUAGE
═══════════════════════════════ */

let translations = {};

const currentLang =
localStorage.getItem("kpk-lang")
|| "uz";

const languageData = {

  uz: {

    text: "UZ",

    flag:
    "./images/uz.png"

  },

  en: {

    text: "EN",

    flag:
    "./images/en.png"

  },

  ru: {

    text: "RU",

    flag:
    "./images/ru.png"

  }

};

async function loadLanguage(lang) {

  try {

    const response =
    await fetch(
      `./json/${lang}.json`
    );

    translations =
    await response.json();

    document.documentElement.lang =
    lang;

    document
    .querySelectorAll("[data-lang]")
    .forEach((element) => {

      const key =
      element.getAttribute(
        "data-lang"
      );

      if (translations[key]) {

        element.textContent =
        translations[key];

      }

    });

    if (profileProvider) {

      profileProvider.textContent =

      user.provider === "github"

      ? translations.github

      : translations.google;

    }

    localStorage.setItem(
      "kpk-lang",
      lang
    );

  }

  catch (error) {

    console.error(
      "Language loading error:",
      error
    );

  }

}

function updateLanguageUI(lang) {

  const current =
  languageData[lang];

  if (!current) return;

  currentFlag.src =
  current.flag;

  currentLangText.textContent =
  current.text;

  langOptions.forEach(option => {

    option.classList.remove(
      "active"
    );

    if (
      option.dataset.langCode
      === lang
    ) {

      option.classList.add(
        "active"
      );

    }

  });

}

/* ═══════════════════════════════
   USER
═══════════════════════════════ */

function setUserData() {

  const fallbackImage =
  "./images/user.png";

  profileImage.src =
  user.image || fallbackImage;

  menuProfileImage.src =
  user.image || fallbackImage;

  profileName.textContent =
  user.name || "User";

  profileEmail.textContent =
  user.email || "No Email";

}

/* ═══════════════════════════════
   LANGUAGE DROPDOWN
═══════════════════════════════ */

if (langCurrent) {

  langCurrent.addEventListener(
    "click",
    () => {

      langDropdown.classList.toggle(
        "active"
      );

    }
  );

}

document.addEventListener(
  "click",
  (e) => {

    if (

      langDropdown &&

      !langDropdown.contains(e.target)

    ) {

      langDropdown.classList.remove(
        "active"
      );

    }

  }
);

langOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const lang =
      option.dataset.langCode;

      loadLanguage(lang);

      updateLanguageUI(lang);

      langDropdown.classList.remove(
        "active"
      );

    }
  );

});

/* ═══════════════════════════════
   PROFILE
═══════════════════════════════ */

if (profileBtn) {

  profileBtn.addEventListener(
    "click",
    () => {

      profileWrapper.classList.toggle(
        "active"
      );

    }
  );

}

document.addEventListener(
  "click",
  (event) => {

    if (

      profileWrapper &&

      !profileWrapper.contains(
        event.target
      )

    ) {

      profileWrapper.classList.remove(
        "active"
      );

    }

  }
);

/* ═══════════════════════════════
   LOGOUT
═══════════════════════════════ */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      if (window.kpkLogout) {

        await window.kpkLogout();

      }

      localStorage.removeItem(
        "kpk-user"
      );

      window.location.href =
      "./index.html";

    }
  );

}

/* ═══════════════════════════════
   MODULE LOCK SYSTEM
═══════════════════════════════ */

const progress =
JSON.parse(
  localStorage.getItem(
    "kpk-progress"
  )
);

if (progress) {

  if (
    !progress.modules[1].unlocked
  ) {

    module1.classList.add(
      "locked"
    );

  }

  if (
    !progress.modules[2].unlocked
  ) {

    module2.classList.add(
      "locked"
    );

  }

  if (
    !progress.modules[3].unlocked
  ) {

    module3.classList.add(
      "locked"
    );

  }

  if (
    !progress.modules[4].unlocked
  ) {

    module4.classList.add(
      "locked"
    );

  }

}

/* ═══════════════════════════════
   OPEN MODULE
═══════════════════════════════ */

window.openModule =
function(moduleNumber){

  localStorage.setItem(
    "current-module",
    moduleNumber
  );

  window.location.href =

  `module${moduleNumber}.html`;

};

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */

setUserData();

loadLanguage(currentLang);

updateLanguageUI(currentLang);