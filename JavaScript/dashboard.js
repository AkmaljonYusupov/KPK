const user = JSON.parse(localStorage.getItem("kpk-user"));
if (!user) window.location.href = "./index.html";

let progress = JSON.parse(localStorage.getItem("kpk-progress") || "{}");

/* ==================== ELEMENTLAR ==================== */
const profileWrapper = document.getElementById("profileWrapper");
const profileBtn = document.getElementById("profileBtn");
const profileImage = document.getElementById("profileImage");
const menuProfileImage = document.getElementById("menuProfileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileProvider = document.getElementById("profileProvider");
const logoutBtn = document.getElementById("logoutBtn");

const langDropdown = document.getElementById("langDropdown");
const langCurrent = document.getElementById("langCurrent");
const currentFlag = document.getElementById("currentFlag");
const currentLangText = document.getElementById("currentLangText");
const langOptions = document.querySelectorAll(".lang-option");

/* ==================== MODULLARNI YANGILASH ==================== */
function updateModuleLocks() {
    const initialPercent = progress.initialTest?.percent || 0;

    for (let i = 1; i <= 4; i++) {
        const moduleEl = document.getElementById(`module${i}`);
        if (!moduleEl) continue;

        let unlocked = i === 1; // 1-bo'lim har doim ochiq

        if (i === 2 && initialPercent >= 56) unlocked = true;
        if (i === 3 && initialPercent >= 71) unlocked = true;
        if (i === 4 && initialPercent >= 90) unlocked = true;

        if (unlocked) {
            moduleEl.classList.remove("locked");
        } else {
            moduleEl.classList.add("locked");
        }
    }
}

/* ==================== FOYDALANUVCHI MA'LUMOTLARI ==================== */
function setUserData() {
    const defaultImg = "./images/user.png";
    profileImage.src = user.image || defaultImg;
    menuProfileImage.src = user.image || defaultImg;
    profileName.textContent = user.name || "Foydalanuvchi";
    profileEmail.textContent = user.email || "email@example.com";
    profileProvider.textContent = user.provider === "github" ? "GitHub" : "Google";
}

/* ==================== TIL ==================== */
function updateLanguageUI(lang) {
    const flags = { uz: "./images/uz.png", en: "./images/en.png", ru: "./images/ru.png" };
    currentFlag.src = flags[lang] || flags.uz;
    currentLangText.textContent = lang.toUpperCase();

    langOptions.forEach(opt => {
        opt.classList.toggle("active", opt.dataset.langCode === lang);
    });
}

async function loadLanguage(lang) {
    try {
        const res = await fetch(`./json/${lang}.json`);
        if (res.ok) {
            localStorage.setItem("kpk-lang", lang);
            // Qo'shimcha tarjimalarni yangilash mumkin
        }
    } catch (e) {
        console.error("Til yuklash xatosi");
    }
}

/* ==================== MODUL OCHISH ==================== */
window.openModule = function(num) {
    localStorage.setItem("current-module", num);
    window.location.href = `module${num}.html`;
};

/* ==================== EVENT LISTENERS ==================== */
profileBtn.addEventListener("click", () => profileWrapper.classList.toggle("active"));

document.addEventListener("click", e => {
    if (!profileWrapper.contains(e.target)) profileWrapper.classList.remove("active");
});

langCurrent.addEventListener("click", () => langDropdown.classList.toggle("active"));

langOptions.forEach(opt => {
    opt.addEventListener("click", () => {
        const lang = opt.dataset.langCode;
        updateLanguageUI(lang);
        loadLanguage(lang);
        langDropdown.classList.remove("active");
    });
});

logoutBtn.addEventListener("click", async () => {
    if (window.kpkLogout) await window.kpkLogout();
    localStorage.clear();
    window.location.href = "./index.html";
});

/* ==================== INIT ==================== */
setUserData();
updateLanguageUI(localStorage.getItem("kpk-lang") || "uz");
updateModuleLocks();