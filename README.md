# KPK Platform

**KPK — Kreativlik. Potentsial. Kasbiy o'sish.**

Original statik HTML/CSS/JS loyihaning Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui ga to'liq ko'chirilgan versiyasi. Dizayn, ranglar, animatsiyalar va biznes-mantiq 1:1 saqlangan.

---

## Ishga tushirish

```bash
npm install
cp .env.example .env.local     # qiymatlarni to'ldiring
npm run dev
```

`http://localhost:3000` da ochiladi.

### Boshqa buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production serverni ishga tushirish |
| `npm run typecheck` | TypeScript tekshiruvi |

---

## Muhit o'zgaruvchilari

`.env.local` faylini yarating:

```env
# Firebase — brauzerga uzatiladi, public bo'lishi normal
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Telegram — MAXFIY, faqat serverda ishlatiladi
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

`TELEGRAM_*` o'zgaruvchilariga **hech qachon** `NEXT_PUBLIC_` prefiksini qo'ymang — u qiymatni brauzerga chiqarib yuboradi.

Telegram sozlanmagan bo'lsa, ilova xatosiz ishlayveradi — shunchaki log yuborilmaydi.

### Firebase sozlamalari

Firebase Console → Authentication → Sign-in method:
- **Google** provayderini yoqing
- **GitHub** provayderini yoqing (GitHub OAuth App yaratib, Client ID/Secret kiriting)

Firebase Console → Authentication → Settings → **Authorized domains**:
- `localhost`
- deploy qilingan domeningiz (masalan `kpk.vercel.app`)

---

## Loyiha strukturasi

```
src/
├─ app/
│  ├─ layout.tsx                  Root layout, provayderlar, metadata
│  ├─ globals.css                 Dizayn tokenlari + KPK animatsiyalari
│  ├─ page.tsx                    Kirish sahifasi           (index.html)
│  ├─ assessment/page.tsx         Kirish testi              (assessment.html)
│  ├─ dashboard/page.tsx          Dashboard                 (dashboard.html)
│  ├─ modules/[id]/page.tsx       Bo'lim sahifalari         (yangi)
│  ├─ not-found.tsx               404
│  └─ api/telegram/route.ts       Telegram log — server tomoni
│
├─ components/
│  ├─ ui/                         shadcn/ui: button, card, dialog,
│  │                              dropdown-menu, progress, avatar,
│  │                              badge, skeleton, separator, toast
│  ├─ auth-provider.tsx           Firebase auth + toast + Telegram
│  ├─ login-view.tsx              Kirish sahifasi UI
│  ├─ auth-dialog.tsx             Google/GitHub tasdiqlash oynasi
│  ├─ assessment-view.tsx         Test: taymerlar, navigatsiya
│  ├─ assessment-result.tsx       Natija va javoblar tahlili
│  ├─ dashboard-view.tsx          Dashboard + kirish nazorati
│  ├─ dashboard-header.tsx        Sarlavha, til, profil menyusi
│  ├─ module-card.tsx             Bo'lim kartochkasi + qulf
│  ├─ module-view.tsx             Bo'lim sahifasi
│  ├─ language-switcher.tsx       Til tanlagich
│  ├─ loader-screen.tsx           Yuklanish ekrani
│  ├─ site-background.tsx         Grid + orblar
│  ├─ emblem-logo.tsx             Logotip (zaxira bilan)
│  └─ icons.tsx                   Google SVG
│
├─ i18n/
│  ├─ dictionaries.ts             uz / en / ru — tiplangan
│  └─ language-provider.tsx       Til konteksti
│
├─ lib/
│  ├─ constants.ts                localStorage kalitlari, chegaralar
│  ├─ types.ts                    KpkUser, KpkProgress
│  ├─ firebase.ts                 Firebase init va provayderlar
│  ├─ storage.ts                  localStorage helperlar
│  ├─ progress.ts                 Bo'limlarni ochish mantiqi
│  ├─ telegram.ts                 /api/telegram ga so'rov
│  └─ utils.ts                    cn(), formatTime(), getInitials()
│
└─ data/questions.ts              Test savollari (3 tilda)
```

---

## Original loyihaga moslik

| Original | Yangi |
|---|---|
| `index.html` + `script.js` | `app/page.tsx` → `LoginView` |
| `assessment.html` + `assessment.js` | `app/assessment/page.tsx` |
| `dashboard.html` + `dashboard.js` | `app/dashboard/page.tsx` |
| `firebase.js` | `lib/firebase.ts` + `auth-provider.tsx` |
| `json/uz\|en\|ru.json` | `i18n/dictionaries.ts` |
| `json/questions.json` | `data/questions.ts` |
| `css/*.css` | `app/globals.css` + Tailwind klasslari |
| `.modern-toast` | `components/ui/toast.tsx` (sonner) |
| `.lang-dropdown`, `.profile-menu` | Radix `DropdownMenu` |
| `.auth-modal` | Radix `Dialog` |

### localStorage kalitlari o'zgarmagan

`kpk-user`, `kpk-progress`, `kpk-lang`, `current-module` — eski foydalanuvchilarning ma'lumotlari yo'qolmaydi.

### Ranglar 1:1

```
--kpk-primary  #21466d      --kpk-bg     #f4f7fb
--kpk-blue     #0d6efd      --kpk-text   #1f3552
--kpk-cyan     #00b7ff      --kpk-muted  #71829a
```

### Bo'limlarni ochish chegaralari

| Bo'lim | Kerakli foiz |
|---|---|
| 1-Bo'lim | har doim ochiq |
| 2-Bo'lim | 56% |
| 3-Bo'lim | 71% |
| 4-Bo'lim | 90% |

Kirish testi: 20 daqiqa umumiy vaqt, har bir savolga 30 soniya, faqat bir marta topshiriladi.

---

## Xavfsizlik o'zgarishlari

**1. Telegram bot tokeni serverga ko'chirildi.**
Original `firebase.js` da token brauzer kodida edi — saytga kirgan har kim uni DevTools'dan o'qib, botni to'liq boshqara olardi. Endi token faqat `app/api/telegram/route.ts` ichida, `process.env` orqali.

Agar eski token ochiq holda GitHub'da turgan bo'lsa, uni @BotFather orqali `/revoke` qiling va yangisini oling.

**2. Firebase config `.env.local` ga ko'chirildi.**
`apiKey` public bo'lishi Firebase uchun normal, lekin kalitlarni almashtirish endi kodga tegmasdan bajariladi. Ma'lumotlarni himoya qilish Firebase Security Rules orqali qilinishi kerak.

---

## Qo'shilgan yaxshilanishlar

**Test**
- Savollar xaritasi — qaysi savolga javob berilgani ko'rinadi, istalganiga o'tish mumkin
- `1`–`4` klavishlari bilan variant tanlash, `←` / `→` bilan navigatsiya
- Yakunlashdan oldin tasdiqlash oynasi (nechta savol javobsiz qolgani ko'rsatiladi)
- Sahifani tasodifan yopishdan ogohlantirish
- Savollar uch tilda

**Navigatsiya**
- `module1.html` … `module4.html` fayllari original loyihada yo'q edi va "Boshlash" tugmasi 404 berardi. Endi `/modules/[id]` dinamik sahifasi ishlaydi
- Qulflangan bo'limga URL orqali kirib bo'lmaydi
- 404 sahifasi qo'shildi

**Accessibility**
- Klaviatura fokusi barcha interaktiv elementlarda ko'rinadi
- Taymerlar `aria-live` bilan e'lon qilinadi
- Variantlar `role="radiogroup"` ichida
- `prefers-reduced-motion` hurmat qilinadi
- Dropdown va modal Radix ustida — fokus tuzog'i va Escape tayyor

**Boshqa**
- Auth tekshiruvi paytida skeleton — sahifa sakramaydi
- SEO metadata, Open Graph, favicon
- Logotip yuklanmasa zaxira belgi ko'rsatiladi

---

## Deploy

### Vercel

```bash
npm i -g vercel
vercel
```

Vercel dashboard → Settings → Environment Variables da yuqoridagi barcha o'zgaruvchilarni qo'shing. So'ng Firebase Authorized domains ro'yxatiga Vercel domenini kiriting.

---

## Haqiqiy gerbni qo'yish

Hozir logotip Wikimedia'dan olinadi, yuklanmasa loyiha ichidagi zaxira belgiga o'tadi. Tashqi manbaga bog'liq bo'lmaslik uchun gerb faylini `public/images/emblem.svg` sifatida saqlang va `src/lib/constants.ts` dagi `EMBLEM_URL` ni `/images/emblem.svg` ga o'zgartiring.
