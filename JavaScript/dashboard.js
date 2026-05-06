const user = JSON.parse(localStorage.getItem("kpk-user"));

if (!user) {
  window.location.href = "./index.html";
}

const profileWrapper = document.getElementById("profileWrapper");
const profileBtn = document.getElementById("profileBtn");

const profileImage = document.getElementById("profileImage");
const menuProfileImage = document.getElementById("menuProfileImage");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileProvider = document.getElementById("profileProvider");

const logoutBtn = document.getElementById("logoutBtn");

const currentLang = localStorage.getItem("kpk-lang") || "uz";

const translations = {
  uz: {
    dashboardTitle: "Dashboard",
    dashboardDesc: "KPK platformasiga xush kelibsiz",
    settings: "Sozlamalar",
    logout: "Chiqish",
    welcomeDashboard: "KPK platformasiga xush kelibsiz",
    welcomeDashboardText: "Bu yerda talabalar salohiyati, ijodkorlik va kasbiy o‘sish jarayonlari boshqariladi.",
    google: "Google orqali kirilgan",
    github: "Github orqali kirilgan"
  },

  en: {
    dashboardTitle: "Dashboard",
    dashboardDesc: "Welcome to KPK platform",
    settings: "Settings",
    logout: "Logout",
    welcomeDashboard: "Welcome to KPK platform",
    welcomeDashboardText: "Here, students’ potential, creativity and professional growth processes are managed.",
    google: "Signed in with Google",
    github: "Signed in with Github"
  },

  ru: {
    dashboardTitle: "Панель управления",
    dashboardDesc: "Добро пожаловать на платформу KPK",
    settings: "Настройки",
    logout: "Выйти",
    welcomeDashboard: "Добро пожаловать на платформу KPK",
    welcomeDashboardText: "Здесь управляются потенциал студентов, креативность и профессиональный рост.",
    google: "Вход через Google",
    github: "Вход через Github"
  }
};

function applyLanguage(lang) {
  const data = translations[lang] || translations.uz;

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-lang]").forEach((element) => {
    const key = element.getAttribute("data-lang");

    if (data[key]) {
      element.textContent = data[key];
    }
  });

  if (profileProvider) {
    profileProvider.textContent =
      user.provider === "github" ? data.github : data.google;
  }
}

function setUserData() {
  const fallbackImage = "./images/user.png";

  if (profileImage) {
    profileImage.src = user.image || fallbackImage;
  }

  if (menuProfileImage) {
    menuProfileImage.src = user.image || fallbackImage;
  }

  if (profileName) {
    profileName.textContent = user.name || "User";
  }

  if (profileEmail) {
    profileEmail.textContent = user.email || "No email";
  }
}

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    profileWrapper.classList.toggle("active");
  });
}

document.addEventListener("click", (event) => {
  if (profileWrapper && !profileWrapper.contains(event.target)) {
    profileWrapper.classList.remove("active");
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (window.kpkLogout) {
      await window.kpkLogout();
    }

    localStorage.removeItem("kpk-user");
    window.location.href = "./index.html";
  });
}

setUserData();
applyLanguage(currentLang);
