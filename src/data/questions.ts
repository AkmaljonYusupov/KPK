/* ══════════════════════════════════════════════════════════════
   BILIMNI BAHOLASH TESTI — SAVOLLAR BAZASI

   Manba: "Platforma uchun test.docx" — yengil sanoatda axborot
   texnologiyalari bo'yicha 150 ta savol. Savollar faqat o'zbek
   tilida, chunki manba shu tilda tayyorlangan.

   MUHIM: asl hujjatda to'g'ri javob HAR DOIM "A" variant edi.
   Shunday qoldirilsa, talaba mazmunni o'qimay ham to'g'ri
   javob berardi. Shuning uchun variantlar bir marta (barqaror
   urug' bilan) aralashtirilgan va `correct` maydoni to'g'ri
   javobning yangi indeksini ko'rsatadi.
══════════════════════════════════════════════════════════════ */

export interface Question {
  id: number;
  /** To'g'ri javobning options massividagi indeksi. */
  correct: number;
  question: string;
  options: string[];
}

export const questions: Question[] = [
  {
    id: 1,
    correct: 3,
    question: "Yengil sanoatda axborot texnologiyalaridan foydalanishning asosiy maqsadi nima?",
    options: [
      "Barcha hisob-kitoblarni faqat qo‘lda bajarish",
      "Ishlab chiqarish jarayonlarini murakkablashtirish",
      "Ishlab chiqarishda axborot almashinuvini cheklash",
      "Ishlab chiqarish va boshqaruv jarayonlarining samaradorligini oshirish",
    ],
  },
  {
    id: 2,
    correct: 0,
    question: "Axborot texnologiyasi tushunchasi nimani anglatadi?",
    options: [
      "Axborotni yig‘ish, saqlash, qayta ishlash va uzatish usul hamda vositalari majmuini",
      "Faqat qog‘oz hujjatlar bilan ishlashni",
      "Faqat kompyuter qurilmalarini",
      "Faqat internet tarmog‘idan foydalanishni",
    ],
  },
  {
    id: 3,
    correct: 3,
    question: "Yengil sanoat korxonalarida kompyuterlardan foydalanishning muhim yo‘nalishi qaysi?",
    options: [
      "Faqat matn yozish",
      "Xodimlar o‘rtasidagi axborot almashinuvini to‘xtatish",
      "Faqat kompyuter o‘yinlarini ishga tushirish",
      "Ishlab chiqarish, hisob-kitob va boshqaruv jarayonlarini avtomatlashtirish",
    ],
  },
  {
    id: 4,
    correct: 3,
    question: "Kompyuterning asosiy vazifasi nimadan iborat?",
    options: [
      "Faqat axborotni chop etish",
      "Faqat tasvirlarni namoyish qilish",
      "Faqat elektr energiyasini saqlash",
      "Axborotni qayta ishlash",
    ],
  },
  {
    id: 5,
    correct: 1,
    question: "Yengil sanoatda axborot tizimi nima uchun xizmat qiladi?",
    options: [
      "Faqat mahsulotlarni omborda saqlash uchun",
      "Korxona faoliyatiga oid axborotni yig‘ish, qayta ishlash va foydalanuvchiga yetkazish uchun",
      "Faqat reklama materiallarini chop etish uchun",
      "Faqat tikuv mashinalarini mexanik boshqarish uchun",
    ],
  },
  {
    id: 6,
    correct: 2,
    question: "Shaxsiy kompyuterning asosiy tarkibiy qurilmalaridan biri qaysi?",
    options: [
      "Tikuv mashinasi",
      "Skanerlangan mato",
      "Markaziy protsessor",
      "Elektr dvigatel",
    ],
  },
  {
    id: 7,
    correct: 1,
    question: "Protsessorning asosiy vazifasi nima?",
    options: [
      "Faqat hujjatlarni qog‘ozga chiqarish",
      "Buyruqlarni bajarish va ma’lumotlarni qayta ishlash",
      "Faqat tovush yozish",
      "Faqat internet kabelini ulash",
    ],
  },
  {
    id: 8,
    correct: 3,
    question: "Operativ xotira qanday vazifani bajaradi?",
    options: [
      "Kompyuterni internet bilan ta’minlaydi",
      "Faqat tasvirlarni chop etadi",
      "Ma’lumotlarni faqat qog‘ozga chiqaradi",
      "Dasturlar va ma’lumotlarni vaqtincha saqlaydi",
    ],
  },
  {
    id: 9,
    correct: 0,
    question: "Qattiq disk yoki SSD qurilmasining vazifasi nima?",
    options: [
      "Ma’lumotlarni uzoq muddat saqlash",
      "Faqat tasvirni ekranga chiqarish",
      "Faqat klaviaturani boshqarish",
      "Faqat ovoz chiqarish",
    ],
  },
  {
    id: 10,
    correct: 3,
    question: "Klaviatura kompyuterning qaysi turdagi qurilmasi hisoblanadi?",
    options: [
      "Chiqarish qurilmasi",
      "Saqlash qurilmasi",
      "Tarmoq qurilmasi",
      "Kiritish qurilmasi",
    ],
  },
  {
    id: 11,
    correct: 3,
    question: "Monitorning asosiy vazifasi nima?",
    options: [
      "Ma’lumotlarni doimiy saqlash",
      "Matnlarni klaviaturadan kiritish",
      "Internet signalini kuchaytirish",
      "Axborotni foydalanuvchiga ekranda ko‘rsatish",
    ],
  },
  {
    id: 12,
    correct: 2,
    question: "Printer qanday qurilma hisoblanadi?",
    options: [
      "Axborotni faqat vaqtincha saqlovchi qurilma",
      "Internetga ulovchi qurilma",
      "Axborotni qog‘ozga chiqaruvchi qurilma",
      "Ma’lumotlarni hisoblovchi qurilma",
    ],
  },
  {
    id: 13,
    correct: 0,
    question: "Skanerning asosiy vazifasi nima?",
    options: [
      "Qog‘ozdagi ma’lumotlarni raqamli ko‘rinishga o‘tkazish",
      "Internet tezligini oshirish",
      "Raqamli ma’lumotlarni qog‘ozga chiqarish",
      "Fayllarni avtomatik o‘chirish",
    ],
  },
  {
    id: 14,
    correct: 3,
    question: "Dasturiy ta’minot nima?",
    options: [
      "Faqat printer va skanerlar",
      "Faqat kompyuterning tashqi korpusi",
      "Faqat elektr kabellari",
      "Kompyuterda ishlashni ta’minlovchi dasturlar majmui",
    ],
  },
  {
    id: 15,
    correct: 1,
    question: "Operatsion tizimning asosiy vazifasi nima?",
    options: [
      "Faqat rasmlarni tahrirlash",
      "Kompyuter qurilmalari va dasturlarining ishlashini boshqarish",
      "Faqat elektron jadvallar yaratish",
      "Faqat internet saytlarini loyihalash",
    ],
  },
  {
    id: 16,
    correct: 3,
    question: "Microsoft Windows qanday dasturiy ta’minot turiga kiradi?",
    options: [
      "Grafik fayl",
      "Elektron jadval",
      "Ma’lumotlar bazasi",
      "Operatsion tizim",
    ],
  },
  {
    id: 17,
    correct: 2,
    question: "Microsoft Word dasturi yengil sanoat korxonalarida qanday vazifada ishlatilishi mumkin?",
    options: [
      "Faqat videolarni namoyish qilishda",
      "Elektr energiyasini ishlab chiqarishda",
      "Hujjatlar, hisobotlar va texnik matnlarni tayyorlashda",
      "Tikuv mashinasini mexanik ta’mirlashda",
    ],
  },
  {
    id: 18,
    correct: 1,
    question: "Microsoft Excel dasturining asosiy imkoniyati qaysi?",
    options: [
      "Faqat rasmlarni chizish",
      "Jadval ma’lumotlarini hisoblash, qayta ishlash va tahlil qilish",
      "Faqat videolarni montaj qilish",
      "Faqat internet sahifalarini ko‘rish",
    ],
  },
  {
    id: 19,
    correct: 0,
    question: "Excel dasturidagi katak nima?",
    options: [
      "Satr va ustun kesishmasida joylashgan ma’lumot kiritish sohasi",
      "Fayllarni saqlovchi alohida qurilma",
      "Internet tarmog‘ining bir qismi",
      "Kompyuterning tashqi qurilmasi",
    ],
  },
  {
    id: 20,
    correct: 2,
    question: "Excel dasturida formula qaysi belgi bilan boshlanadi?",
    options: [
      "#",
      "@",
      "=",
      "&",
    ],
  },
  {
    id: 21,
    correct: 2,
    question: "Yengil sanoatda Excel dasturidan foydalanib nimani hisoblash mumkin?",
    options: [
      "Faqat kompyuter ekranining o‘lchamini",
      "Faqat printer ranglarini",
      "Material sarfi, mahsulot miqdori va ishlab chiqarish xarajatlarini",
      "Faqat internet tezligini",
    ],
  },
  {
    id: 22,
    correct: 2,
    question: "Excel dasturida diagramma nima uchun ishlatiladi?",
    options: [
      "Kompyuterni o‘chirish uchun",
      "Fayllarni viruslardan tozalash uchun",
      "Ma’lumotlarni grafik ko‘rinishda ifodalash uchun",
      "Matnlarni avtomatik tarjima qilish uchun",
    ],
  },
  {
    id: 23,
    correct: 3,
    question: "Microsoft PowerPoint dasturi qanday maqsadda ishlatiladi?",
    options: [
      "Faqat ma’lumotlar bazasini boshqarish uchun",
      "Faqat hisob-kitoblarni bajarish uchun",
      "Faqat dastur kodini kompilyatsiya qilish uchun",
      "Taqdimotlar yaratish va namoyish etish uchun",
    ],
  },
  {
    id: 24,
    correct: 3,
    question: "Yengil sanoatda PowerPoint dasturidan qanday foydalanish mumkin?",
    options: [
      "Mato tarkibini laboratoriyada aniqlashda",
      "Elektr tarmog‘ini ta’mirlashda",
      "Tikuv mashinasini mexanik sozlashda",
      "Mahsulot, texnologik jarayon yoki loyiha haqidagi taqdimotni tayyorlashda",
    ],
  },
  {
    id: 25,
    correct: 1,
    question: "Fayl nima?",
    options: [
      "Internet kabelining turi",
      "Kompyuterda nom bilan saqlanadigan axborot birligi",
      "Printerdagi siyoh turi",
      "Faqat kompyuterning protsessori",
    ],
  },
  {
    id: 26,
    correct: 0,
    question: "Papkaning asosiy vazifasi nima?",
    options: [
      "Fayllarni tartibli saqlash va guruhlash",
      "Kompyuterni elektr bilan ta’minlash",
      "Monitor tasvirini kattalashtirish",
      "Internet tezligini oshirish",
    ],
  },
  {
    id: 27,
    correct: 2,
    question: "PDF formatining asosiy afzalliklaridan biri nima?",
    options: [
      "Faqat audio ma’lumotlarni saqlash",
      "Faqat dastur kodlarini ishga tushirish",
      "Hujjat ko‘rinishini turli qurilmalarda nisbatan bir xil saqlash",
      "Faqat elektron jadvallar yaratish",
    ],
  },
  {
    id: 28,
    correct: 3,
    question: "Internet nima?",
    options: [
      "Faqat mobil telefon dasturi",
      "Faqat bitta kompyuterning xotirasi",
      "Faqat printerlar tizimi",
      "Dunyo bo‘ylab o‘zaro bog‘langan kompyuter tarmoqlari majmui",
    ],
  },
  {
    id: 29,
    correct: 3,
    question: "Veb-brauzer nima uchun ishlatiladi?",
    options: [
      "Faqat hujjatlarni qog‘ozga chiqarish uchun",
      "Faqat elektr kuchlanishini o‘lchash uchun",
      "Faqat kompyuter xotirasini almashtirish uchun",
      "Internetdagi veb-sahifalarni ko‘rish va ulardan foydalanish uchun",
    ],
  },
  {
    id: 30,
    correct: 0,
    question: "Google Drive qanday xizmat hisoblanadi?",
    options: [
      "Bulutli fayl saqlash va almashish xizmati",
      "Grafik karta turi",
      "Printer drayveri",
      "Operatsion tizim turi",
    ],
  },
  {
    id: 31,
    correct: 1,
    question: "Bulutli texnologiyalarning yengil sanoatdagi afzalligi nimada?",
    options: [
      "Barcha fayllarni avtomatik o‘chirib yuborishida",
      "Ma’lumotlarga internet orqali turli qurilmalardan foydalanish imkonini berishida",
      "Kompyuterni internetsiz ishlatishida",
      "Faqat ma’lumotlarni qog‘ozda saqlashida",
    ],
  },
  {
    id: 32,
    correct: 0,
    question: "Elektron pochta qanday maqsadda ishlatiladi?",
    options: [
      "Elektron xabar va fayllarni yuborish hamda qabul qilish uchun",
      "Faqat grafik tasvirlarni chop etish uchun",
      "Faqat kompyuter xotirasini kengaytirish uchun",
      "Faqat dasturlarni o‘chirish uchun",
    ],
  },
  {
    id: 33,
    correct: 0,
    question: "Axborot xavfsizligi nima?",
    options: [
      "Axborotni ruxsatsiz foydalanish, o‘zgartirish yoki yo‘qotishdan himoya qilish",
      "Faqat fayllarni nusxalash",
      "Faqat kompyuterlarni tezlashtirish",
      "Faqat internetdan foydalanishni cheklash",
    ],
  },
  {
    id: 34,
    correct: 3,
    question: "Kuchli parol qanday bo‘lishi kerak?",
    options: [
      "Faqat foydalanuvchining ismidan iborat",
      "Faqat tug‘ilgan yildan iborat",
      "Faqat 123456 raqamlaridan iborat",
      "Harf, raqam va maxsus belgilar kombinatsiyasidan tashkil topgan murakkab parol",
    ],
  },
  {
    id: 35,
    correct: 2,
    question: "Kompyuter virusi nima?",
    options: [
      "Kompyuterning fizik qurilmasi",
      "Internet kabelining turi",
      "Kompyuter tizimiga zarar yetkazishi yoki uning ishlashiga salbiy ta’sir ko‘rsatishi mumkin bo‘lgan zararli dastur",
      "Operatsion tizimning standart funksiyasi",
    ],
  },
  {
    id: 36,
    correct: 0,
    question: "Antivirus dasturining vazifasi nima?",
    options: [
      "Zararli dasturlarni aniqlash, oldini olish va bartaraf etishga yordam berish",
      "Faqat taqdimot yaratish",
      "Faqat matn yozish",
      "Faqat internet tezligini o‘lchash",
    ],
  },
  {
    id: 37,
    correct: 3,
    question: "Ma’lumotlarni zaxiralash nima?",
    options: [
      "Barcha fayllarni o‘chirib tashlash",
      "Internetni o‘chirish",
      "Kompyuterni qayta ishga tushirish",
      "Muhim ma’lumotlarning qo‘shimcha nusxasini yaratish",
    ],
  },
  {
    id: 38,
    correct: 1,
    question: "Algoritm nima?",
    options: [
      "Internet tarmog‘i",
      "Muayyan masalani yechishga olib keluvchi tartibli amallar ketma-ketligi",
      "Faqat grafik tasvir",
      "Kompyuter qurilmasi",
    ],
  },
  {
    id: 39,
    correct: 2,
    question: "Algoritmlash yengil sanoatda nima uchun muhim?",
    options: [
      "Faqat rasmlarni chop etish uchun",
      "Faqat kompyuterlarni o‘chirish uchun",
      "Ishlab chiqarish va hisoblash jarayonlarini tartibga solish va avtomatlashtirish uchun",
      "Faqat matnlarni bezash uchun",
    ],
  },
  {
    id: 40,
    correct: 1,
    question: "Dasturlash nima?",
    options: [
      "Faqat internet saytlarini ko‘rish",
      "Kompyuter bajarishi uchun algoritmlarni dasturlash tilida ifodalash jarayoni",
      "Faqat kompyuterni ta’mirlash",
      "Faqat ma’lumotlarni qog‘ozga yozish",
    ],
  },
  {
    id: 41,
    correct: 0,
    question: "Python qanday dasturlash tili?",
    options: [
      "Yuqori darajadagi, ko‘p maqsadli dasturlash tili",
      "Kompyuter qurilmasi",
      "Operatsion tizim turi",
      "Faqat grafik fayl formati",
    ],
  },
  {
    id: 42,
    correct: 3,
    question: "Python dasturidan yengil sanoatda qanday foydalanish mumkin?",
    options: [
      "Faqat klaviaturani tozalashda",
      "Faqat printer siyohini almashtirishda",
      "Faqat monitorni boshqarishda",
      "Hisob-kitoblarni avtomatlashtirish va ma’lumotlarni qayta ishlashda",
    ],
  },
  {
    id: 43,
    correct: 3,
    question: "Ma’lumotlar bazasi nima?",
    options: [
      "Faqat grafik rasm",
      "Faqat kompyuterning elektr manbai",
      "Faqat internet brauzeri",
      "Tartiblangan va boshqariladigan ma’lumotlar majmui",
    ],
  },
  {
    id: 44,
    correct: 1,
    question: "Microsoft Access qanday dastur?",
    options: [
      "Grafik muharrir",
      "Ma’lumotlar bazasini yaratish va boshqarish tizimi",
      "Operatsion tizim",
      "Video montaj dasturi",
    ],
  },
  {
    id: 45,
    correct: 2,
    question: "Yengil sanoatda ma’lumotlar bazasidan qanday foydalanish mumkin?",
    options: [
      "Faqat kompyuter o‘yinlarini saqlashda",
      "Faqat ekran yorqinligini boshqarishda",
      "Mahsulotlar, materiallar, buyurtmalar va mijozlar haqidagi ma’lumotlarni saqlashda",
      "Faqat musiqa tinglashda",
    ],
  },
  {
    id: 46,
    correct: 2,
    question: "CAD texnologiyasi nimani anglatadi?",
    options: [
      "Faqat elektron pochta xizmatini",
      "Faqat ma’lumotlarni siqish texnologiyasini",
      "Kompyuter yordamida loyihalash texnologiyasini",
      "Faqat antivirus tizimini",
    ],
  },
  {
    id: 47,
    correct: 3,
    question: "CAD tizimlarining yengil sanoatdagi ahamiyati nimada?",
    options: [
      "Faqat ma’lumotlarni o‘chiradi",
      "Faqat hujjatlarni chop etadi",
      "Faqat elektron pochta yuboradi",
      "Mahsulot va texnologik obyektlarni raqamli loyihalash imkonini beradi",
    ],
  },
  {
    id: 48,
    correct: 2,
    question: "CAM texnologiyasi qanday vazifaga yo‘naltirilgan?",
    options: [
      "Faqat elektron pochta yuborishga",
      "Faqat taqdimot tayyorlashga",
      "Kompyuter yordamida ishlab chiqarish jarayonlarini boshqarish va avtomatlashtirishga",
      "Faqat matnlarni tahrirlashga",
    ],
  },
  {
    id: 49,
    correct: 2,
    question: "Yengil sanoatda raqamlashtirish nima beradi?",
    options: [
      "Barcha texnologik jarayonlarni qo‘lda bajarishga majbur qiladi",
      "Kompyuter texnologiyalaridan voz kechishga olib keladi",
      "Ishlab chiqarish, boshqaruv va axborot almashinuvi jarayonlarini tezkor va samarali tashkil etish imkonini beradi",
      "Axborotdan foydalanishni kamaytiradi",
    ],
  },
  {
    id: 50,
    correct: 2,
    question: "Sun’iy intellekt texnologiyalarining yengil sanoatdagi istiqbolli qo‘llanilish sohasi qaysi?",
    options: [
      "Faqat klaviaturada matn terish",
      "Faqat kompyuterlarni o‘chirish",
      "Mahsulot sifatini nazorat qilish, talabni prognozlash va ishlab chiqarish jarayonlarini optimallashtirish",
      "Faqat qog‘oz hujjatlarni saqlash",
    ],
  },
  {
    id: 51,
    correct: 2,
    question: "Yengil sanoat korxonalarida elektron hujjat aylanishining asosiy afzalligi nima?",
    options: [
      "Ma’lumotlarni qayta ishlashni murakkablashtiradi",
      "Hujjat almashinuvini butunlay to‘xtatadi",
      "Hujjatlarni tezkor yaratish, yuborish, saqlash va boshqarish imkonini beradi",
      "Hujjatlarni faqat qog‘oz shaklida saqlaydi",
    ],
  },
  {
    id: 52,
    correct: 3,
    question: "Raqamli ma’lumot nima?",
    options: [
      "Faqat qog‘ozga yozilgan ma’lumot",
      "Faqat mexanik qurilma",
      "Faqat og‘zaki ma’lumot",
      "Kompyuter yordamida qayta ishlanishi mumkin bo‘lgan raqamli ko‘rinishdagi axborot",
    ],
  },
  {
    id: 53,
    correct: 3,
    question: "Yengil sanoatda ERP tizimlaridan foydalanishdan asosiy maqsad nima?",
    options: [
      "Faqat videolarni saqlash",
      "Faqat elektron pochta yuborish",
      "Faqat rasmlarni tahrirlash",
      "Korxonaning turli biznes va ishlab chiqarish jarayonlarini yagona tizimda boshqarish",
    ],
  },
  {
    id: 54,
    correct: 2,
    question: "CRM tizimi qanday vazifani bajaradi?",
    options: [
      "Faqat ishlab chiqarish uskunalarini ta’mirlash",
      "Faqat grafik tasvirlar yaratish",
      "Mijozlar bilan munosabatlarni boshqarish va ular haqidagi ma’lumotlarni tizimlashtirish",
      "Faqat kompyuter xotirasini boshqarish",
    ],
  },
  {
    id: 55,
    correct: 1,
    question: "Yengil sanoatda avtomatlashtirilgan boshqaruv tizimi nima uchun kerak?",
    options: [
      "Kompyuterlarni o‘chirib qo‘yish uchun",
      "Ishlab chiqarish jarayonlarini nazorat qilish va boshqarishni avtomatlashtirish uchun",
      "Barcha jarayonlarni faqat qo‘lda bajarish uchun",
      "Axborot almashinuvini cheklash uchun",
    ],
  },
  {
    id: 56,
    correct: 0,
    question: "IoT tushunchasi nimani anglatadi?",
    options: [
      "Qurilmalar va obyektlarning internet orqali o‘zaro bog‘lanishini",
      "Faqat grafik dasturlarni",
      "Faqat matn muharrirlarini",
      "Faqat kompyuter xotirasini",
    ],
  },
  {
    id: 57,
    correct: 0,
    question: "Yengil sanoatda IoT texnologiyasidan qanday foydalanish mumkin?",
    options: [
      "Ishlab chiqarish uskunalarining holatini masofadan kuzatish va ma’lumot yig‘ishda",
      "Faqat elektron pochta yuborishda",
      "Faqat rasmlarni tahrirlashda",
      "Faqat hujjatlarni chop etishda",
    ],
  },
  {
    id: 58,
    correct: 3,
    question: "Sensorlarning ishlab chiqarishdagi vazifasi nima?",
    options: [
      "Faqat fayllarni o‘chirish",
      "Faqat matnlarni tahrirlash",
      "Faqat internet saytlarini yaratish",
      "Turli fizik ko‘rsatkichlarni o‘lchash va ma’lumotlarni tizimga uzatish",
    ],
  },
  {
    id: 59,
    correct: 3,
    question: "Big Data atamasi nimani bildiradi?",
    options: [
      "Faqat qog‘oz hujjatlarni",
      "Faqat kichik hajmdagi matnlarni",
      "Faqat bitta kompyuterdagi faylni",
      "Katta hajmdagi, turli xil va tez sur’atda hosil bo‘ladigan ma’lumotlar majmuini",
    ],
  },
  {
    id: 60,
    correct: 3,
    question: "Big Data texnologiyalaridan yengil sanoatda foydalanishning foydasi nimada?",
    options: [
      "Internetdan foydalanishni cheklashda",
      "Hisobotlarni qo‘lda tayyorlashda",
      "Ma’lumotlarni butunlay o‘chirishda",
      "Ishlab chiqarish va bozor ma’lumotlarini tahlil qilish asosida samarali qarorlar qabul qilishda",
    ],
  },
  {
    id: 61,
    correct: 1,
    question: "Ma’lumotlarni tahlil qilish nima?",
    options: [
      "Barcha ma’lumotlarni o‘chirish jarayoni",
      "Ma’lumotlardan foydali axborot va xulosalarni olish jarayoni",
      "Kompyuterni qayta ishga tushirish",
      "Faqat ma’lumotlarni qog‘ozga chiqarish",
    ],
  },
  {
    id: 62,
    correct: 3,
    question: "Yengil sanoatda talabni prognozlash nima uchun amalga oshiriladi?",
    options: [
      "Faqat internet tezligini aniqlash uchun",
      "Faqat hujjatlarni arxivlash uchun",
      "Faqat kompyuter xotirasini tekshirish uchun",
      "Kelajakdagi mahsulotga bo‘lgan ehtiyojni oldindan aniqlash uchun",
    ],
  },
  {
    id: 63,
    correct: 2,
    question: "Elektron jadvalda saralash funksiyasi nima uchun ishlatiladi?",
    options: [
      "Printer qurilmasini sozlash uchun",
      "Kompyuterni o‘chirish uchun",
      "Ma’lumotlarni belgilangan mezon asosida tartiblash uchun",
      "Fayllarni viruslardan tozalash uchun",
    ],
  },
  {
    id: 64,
    correct: 2,
    question: "Excel dasturidagi SUM funksiyasi qanday vazifani bajaradi?",
    options: [
      "Sonlarni tasodifiy tanlaydi",
      "Matnlarni tarjima qiladi",
      "Sonlarning yig‘indisini hisoblaydi",
      "Grafik tasvir yaratadi",
    ],
  },
  {
    id: 65,
    correct: 1,
    question: "Excel dasturidagi AVERAGE funksiyasi nima uchun ishlatiladi?",
    options: [
      "Fayllarni o‘chirish uchun",
      "Sonlarning o‘rtacha qiymatini hisoblash uchun",
      "Kompyuter xotirasini tozalash uchun",
      "Hujjatlarni chop etish uchun",
    ],
  },
  {
    id: 66,
    correct: 0,
    question: "Yengil sanoatda elektron jadvallardan foydalanish qanday imkoniyat beradi?",
    options: [
      "Ishlab chiqarish ko‘rsatkichlarini hisoblash va tahlil qilish imkonini beradi",
      "Faqat internet saytlarini ochish imkonini beradi",
      "Faqat musiqa tinglash imkonini beradi",
      "Faqat rasm chizish imkonini beradi",
    ],
  },
  {
    id: 67,
    correct: 2,
    question: "Diagrammaning ustunli turi qaysi holatda qulay?",
    options: [
      "Faqat elektron pochta yuborishda",
      "Faqat fayllarni saqlashda",
      "Bir nechta ko‘rsatkichlarni o‘zaro taqqoslashda",
      "Faqat matn yozishda",
    ],
  },
  {
    id: 68,
    correct: 0,
    question: "Ma’lumotlarni vizuallashtirish nima?",
    options: [
      "Ma’lumotlarni grafik, diagramma yoki boshqa ko‘rgazmali shaklda ifodalash",
      "Ma’lumotlarni faqat qog‘ozda saqlash",
      "Ma’lumotlarni o‘chirib tashlash",
      "Ma’lumotlarni yashirish",
    ],
  },
  {
    id: 69,
    correct: 1,
    question: "Grafik muharrirning asosiy vazifasi nima?",
    options: [
      "Faqat matnlarni avtomatik tarjima qilish",
      "Raqamli tasvirlarni yaratish va tahrirlash",
      "Faqat ma’lumotlar bazasini boshqarish",
      "Faqat elektron jadvallar yaratish",
    ],
  },
  {
    id: 70,
    correct: 2,
    question: "CorelDRAW dasturi qanday turdagi dastur hisoblanadi?",
    options: [
      "Operatsion tizim",
      "Ma’lumotlar bazasi tizimi",
      "Vektorli grafik muharrir",
      "Elektron pochta dasturi",
    ],
  },
  {
    id: 71,
    correct: 3,
    question: "Adobe Photoshop dasturining asosiy vazifasi nima?",
    options: [
      "Faqat ma’lumotlar bazasini boshqarish",
      "Faqat elektron jadvallar yaratish",
      "Faqat dastur kodlarini kompilyatsiya qilish",
      "Rastrli tasvirlarni yaratish va tahrirlash",
    ],
  },
  {
    id: 72,
    correct: 0,
    question: "Vektorli grafikaning asosiy xususiyati nimada?",
    options: [
      "Tasvir geometrik obyektlar asosida shakllantiriladi va masshtablanganda sifatini yaxshi saqlaydi",
      "Tasvir faqat matn ko‘rinishida bo‘ladi",
      "Tasvir faqat nuqtalardan iborat bo‘ladi",
      "Tasvir faqat audio ma’lumotdan tashkil topadi",
    ],
  },
  {
    id: 73,
    correct: 0,
    question: "Rastrli tasvir nimaga asoslanadi?",
    options: [
      "Piksel deb ataluvchi nuqtalar majmuiga",
      "Faqat geometrik formulalarga",
      "Faqat matnli belgilar ketma-ketligiga",
      "Faqat audio signallarga",
    ],
  },
  {
    id: 74,
    correct: 3,
    question: "Grafik fayllarning PNG formatining muhim xususiyati qaysi?",
    options: [
      "Faqat elektron jadval saqlashi",
      "Faqat video saqlashi",
      "Faqat audio saqlashi",
      "Shaffof fonni qo‘llab-quvvatlashi mumkin",
    ],
  },
  {
    id: 75,
    correct: 2,
    question: "JPEG formatining asosiy qo‘llanilish sohasi qaysi?",
    options: [
      "Dastur kodlarini bajarish",
      "Ma’lumotlar bazasini boshqarish",
      "Raqamli fotosurat va tasvirlarni saqlash",
      "Elektron jadvallarni hisoblash",
    ],
  },
  {
    id: 76,
    correct: 1,
    question: "Grafik dizayn jarayonida rang modeli nima uchun kerak?",
    options: [
      "Fayllarni o‘chirish uchun",
      "Ranglarni raqamli muhitda ifodalash va boshqarish uchun",
      "Internetni ulash uchun",
      "Kompyuterni tezlashtirish uchun",
    ],
  },
  {
    id: 77,
    correct: 1,
    question: "RGB rang modeli qayerda keng qo‘llaniladi?",
    options: [
      "Faqat mexanik qurilmalarda",
      "Monitor va boshqa raqamli ekranlarda ranglarni ifodalashda",
      "Faqat metallni qayta ishlashda",
      "Faqat qog‘ozni kesishda",
    ],
  },
  {
    id: 78,
    correct: 3,
    question: "CMYK rang modeli qaysi jarayonda muhim?",
    options: [
      "Faqat kompyuter dasturlarini o‘rnatishda",
      "Faqat audio yozishda",
      "Faqat internet tezligini o‘lchashda",
      "Poligrafik va bosma mahsulotlarni tayyorlashda",
    ],
  },
  {
    id: 79,
    correct: 2,
    question: "Yengil sanoatda raqamli tasvirlardan foydalanishning muhim yo‘nalishi qaysi?",
    options: [
      "Faqat elektr tarmoqlarini boshqarish",
      "Faqat ma’lumotlarni o‘chirish",
      "Mahsulot namunalari, kataloglar va reklama materiallarini tayyorlash",
      "Faqat kompyuterlarni ta’mirlash",
    ],
  },
  {
    id: 80,
    correct: 3,
    question: "Multimedia texnologiyasi nimani birlashtiradi?",
    options: [
      "Faqat raqamlarni",
      "Faqat matnni",
      "Faqat elektron jadvallarni",
      "Matn, grafik, audio, video va animatsiya kabi axborot turlarini",
    ],
  },
  {
    id: 81,
    correct: 2,
    question: "Yengil sanoat korxonalarida multimedia taqdimotlari nima uchun kerak?",
    options: [
      "Faqat kompyuterni sozlash uchun",
      "Faqat fayllarni o‘chirish uchun",
      "Mahsulot va ishlab chiqarish jarayonlarini ko‘rgazmali namoyish etish uchun",
      "Faqat parol yaratish uchun",
    ],
  },
  {
    id: 82,
    correct: 2,
    question: "QR-kod texnologiyasidan qanday foydalanish mumkin?",
    options: [
      "Printer tezligini oshirish uchun",
      "Fayllarni avtomatik o‘chirish uchun",
      "Mahsulot yoki uning haqidagi raqamli ma’lumotlarga tezkor kirish uchun",
      "Kompyuter protsessorini almashtirish uchun",
    ],
  },
  {
    id: 83,
    correct: 2,
    question: "Elektron katalog nima?",
    options: [
      "Faqat kompyuter qurilmasi",
      "Faqat qog‘oz hujjatlar to‘plami",
      "Mahsulotlar haqidagi ma’lumotlarni raqamli shaklda taqdim etuvchi katalog",
      "Faqat internet kabeli",
    ],
  },
  {
    id: 84,
    correct: 2,
    question: "Elektron tijorat yengil sanoatga qanday imkoniyat yaratadi?",
    options: [
      "Mahsulotlarni faqat qog‘oz katalog orqali sotadi",
      "Axborot almashinuvini to‘xtatadi",
      "Mahsulotlarni internet orqali namoyish qilish va sotish imkonini beradi",
      "Mahsulot savdosini faqat an’anaviy do‘kon bilan cheklaydi",
    ],
  },
  {
    id: 85,
    correct: 2,
    question: "Onlayn do‘konning asosiy vazifasi nima?",
    options: [
      "Faqat grafik fayllarni yaratish",
      "Faqat ma’lumotlar bazasini o‘chirish",
      "Mahsulotlarni internet orqali tanlash, buyurtma qilish va sotib olish imkonini berish",
      "Faqat kompyuterlarni ta’mirlash",
    ],
  },
  {
    id: 86,
    correct: 1,
    question: "Raqamli marketing nima?",
    options: [
      "Faqat telefon qurilmalarini ta’mirlash",
      "Internet va raqamli texnologiyalar orqali mahsulot yoki xizmatlarni targ‘ib qilish",
      "Faqat ishlab chiqarish uskunalarini sozlash",
      "Faqat qog‘oz reklama tarqatish",
    ],
  },
  {
    id: 87,
    correct: 0,
    question: "Ijtimoiy tarmoqlardan yengil sanoat korxonalari qanday foydalanishi mumkin?",
    options: [
      "Mahsulotlarni targ‘ib qilish, mijozlar bilan muloqot qilish va brendni rivojlantirish uchun",
      "Faqat kompyuterlarni boshqarish uchun",
      "Faqat ishlab chiqarish uskunalarini ta’mirlash uchun",
      "Faqat ma’lumotlar bazasini o‘chirish uchun",
    ],
  },
  {
    id: 88,
    correct: 2,
    question: "Raqamli marketingda analitik vositalarning vazifasi nima?",
    options: [
      "Faqat fayllarni arxivlash",
      "Faqat kompyuterlarni o‘chirish",
      "Foydalanuvchilar faoliyati va reklama samaradorligini tahlil qilish",
      "Faqat rasmlarni chop etish",
    ],
  },
  {
    id: 89,
    correct: 3,
    question: "QR-kodning asosiy afzalligi nimada?",
    options: [
      "Internetni avtomatik o‘rnatishida",
      "Kompyuter protsessorini tezlashtirishida",
      "Faqat katta hajmdagi videoni saqlashida",
      "Axborotga smartfon yordamida tezkor kirish imkonini berishida",
    ],
  },
  {
    id: 90,
    correct: 1,
    question: "Bulutli hisoblash texnologiyasi nima?",
    options: [
      "Faqat mahalliy kompyuter xotirasi",
      "Hisoblash resurslari va xizmatlaridan internet orqali foydalanish texnologiyasi",
      "Faqat grafik muharrir",
      "Faqat printer qurilmasi",
    ],
  },
  {
    id: 91,
    correct: 0,
    question: "Google Docs qanday imkoniyat beradi?",
    options: [
      "Hujjatlarni onlayn yaratish, tahrirlash va hamkorlikda ishlash imkonini beradi",
      "Faqat kompyuter xotirasini kengaytiradi",
      "Faqat viruslarni aniqlaydi",
      "Faqat rasmlarni chop etadi",
    ],
  },
  {
    id: 92,
    correct: 0,
    question: "Onlayn hamkorlik texnologiyalarining asosiy afzalligi nima?",
    options: [
      "Bir nechta foydalanuvchining axborot ustida masofadan hamkorlik qilish imkoniyati",
      "Internetdan foydalanishni taqiqlash",
      "Barcha fayllarni avtomatik o‘chirish",
      "Faqat bitta foydalanuvchini ishlatish",
    ],
  },
  {
    id: 93,
    correct: 0,
    question: "Videokonferensiya texnologiyasi yengil sanoatda qanday qo‘llanilishi mumkin?",
    options: [
      "Masofaviy yig‘ilish, maslahat va o‘quv mashg‘ulotlarini tashkil etishda",
      "Faqat qog‘oz hujjatlarni skanerlashda",
      "Faqat ma’lumotlar bazasini o‘chirishda",
      "Faqat printerlarni boshqarishda",
    ],
  },
  {
    id: 94,
    correct: 0,
    question: "Fayllarni arxivlashdan maqsad nima?",
    options: [
      "Fayllar hajmini kamaytirish va ularni tartibli saqlash",
      "Fayllarni virusga aylantirish",
      "Kompyuterni internetdan uzish",
      "Barcha fayllarni o‘chirish",
    ],
  },
  {
    id: 95,
    correct: 3,
    question: "ZIP qanday fayl formatiga misol bo‘la oladi?",
    options: [
      "Video formatiga",
      "Audio formatiga",
      "Operatsion tizim formatiga",
      "Arxiv formatiga",
    ],
  },
  {
    id: 96,
    correct: 1,
    question: "Kompyuter tarmog‘i nima?",
    options: [
      "Faqat printer dasturi",
      "Ma’lumot almashish uchun o‘zaro bog‘langan qurilmalar majmui",
      "Faqat grafik muharrir",
      "Faqat bitta kompyuterning xotirasi",
    ],
  },
  {
    id: 97,
    correct: 1,
    question: "Lokal tarmoq qanday ataladi?",
    options: [
      "HTML",
      "LAN",
      "CPU",
      "PDF",
    ],
  },
  {
    id: 98,
    correct: 0,
    question: "Wi-Fi texnologiyasining asosiy vazifasi nima?",
    options: [
      "Qurilmalarni simsiz tarmoq orqali ulash",
      "Faqat fayllarni arxivlash",
      "Faqat rasmlarni tahrirlash",
      "Faqat hujjatlarni chop etish",
    ],
  },
  {
    id: 99,
    correct: 0,
    question: "IP-manzil nima uchun kerak?",
    options: [
      "Tarmoqdagi qurilmani aniqlash va unga murojaat qilish uchun",
      "Faqat printer siyohini boshqarish uchun",
      "Faqat rasmlarni saqlash uchun",
      "Faqat matnlarni formatlash uchun",
    ],
  },
  {
    id: 100,
    correct: 0,
    question: "Yengil sanoatda kompyuter tarmoqlaridan foydalanishning muhim afzalligi nima?",
    options: [
      "Korxona bo‘limlari o‘rtasida tezkor axborot almashinuvini ta’minlash",
      "Barcha ma’lumotlarni faqat qog‘ozda saqlash",
      "Ma’lumot almashinuvini butunlay to‘xtatish",
      "Kompyuterlarni bir-biridan ajratish",
    ],
  },
  {
    id: 101,
    correct: 1,
    question: "HTML texnologiyasi nima uchun ishlatiladi?",
    options: [
      "Elektron jadvallarni hisoblash uchun",
      "Veb-sahifalarning tuzilmasini yaratish uchun",
      "Antivirus dasturlarini yaratish uchun",
      "Rastrli tasvirlarni tahrirlash uchun",
    ],
  },
  {
    id: 102,
    correct: 2,
    question: "Yengil sanoat korxonasi uchun veb-sayt yaratishning asosiy maqsadi nima?",
    options: [
      "Faqat kompyuter xotirasini boshqarish",
      "Faqat dasturlarni o‘chirish",
      "Korxona va uning mahsulotlari haqida internet orqali axborot taqdim etish",
      "Faqat ichki hujjatlarni chop etish",
    ],
  },
  {
    id: 103,
    correct: 3,
    question: "Veb-saytning bosh sahifasi qanday vazifani bajaradi?",
    options: [
      "Faqat fayllarni o‘chiradi",
      "Operativ xotirani boshqaradi",
      "Kompyuter viruslarini aniqlaydi",
      "Sayt haqida umumiy ma’lumot berib, asosiy bo‘limlarga yo‘naltiradi",
    ],
  },
  {
    id: 104,
    correct: 0,
    question: "Domen nomi nima?",
    options: [
      "Internetdagi veb-resursni aniqlash uchun ishlatiladigan nom",
      "Printer qurilmasining modeli",
      "Kompyuterning operativ xotirasi",
      "Grafik faylning turi",
    ],
  },
  {
    id: 105,
    correct: 0,
    question: "Qidiruv tizimining asosiy vazifasi nima?",
    options: [
      "Internetdagi kerakli axborotlarni izlash va topishga yordam berish",
      "Faqat kompyuterlarni o‘chirish",
      "Faqat grafik tasvirlarni tahrirlash",
      "Faqat hujjatlarni chop etish",
    ],
  },
  {
    id: 106,
    correct: 3,
    question: "Google qaysi xizmat turiga misol bo‘ladi?",
    options: [
      "Antivirus qurilmasiga",
      "Operatsion tizimga",
      "Grafik karta turiga",
      "Qidiruv tizimiga",
    ],
  },
  {
    id: 107,
    correct: 3,
    question: "Elektron hujjat nima?",
    options: [
      "Faqat audio yozuv",
      "Faqat videotasvir",
      "Faqat qog‘oz shaklidagi hujjat",
      "Raqamli shaklda yaratiladigan, saqlanadigan va uzatiladigan hujjat",
    ],
  },
  {
    id: 108,
    correct: 3,
    question: "Elektron raqamli imzo nima uchun ishlatiladi?",
    options: [
      "Faqat internet tezligini oshirish uchun",
      "Faqat printerlarni boshqarish uchun",
      "Faqat grafik tasvirlarni kattalashtirish uchun",
      "Elektron hujjat muallifini tasdiqlash va uning yaxlitligini nazorat qilish uchun",
    ],
  },
  {
    id: 109,
    correct: 2,
    question: "Axborotning maxfiyligi nimani anglatadi?",
    options: [
      "Axborotni faqat qog‘ozda saqlash",
      "Barcha ma’lumotlarni o‘chirish",
      "Axborotdan faqat ruxsat berilgan shaxslar foydalanishini ta’minlash",
      "Axborotni barcha foydalanuvchilarga cheklovsiz berish",
    ],
  },
  {
    id: 110,
    correct: 2,
    question: "Axborotning yaxlitligi nimani bildiradi?",
    options: [
      "Ma’lumotlarni faqat internetga joylashtirish",
      "Barcha ma’lumotlarni o‘chirish",
      "Ma’lumotlarning ruxsatsiz o‘zgartirilmasligi va buzilmasligini ta’minlash",
      "Faqat ma’lumotlarni nusxalash",
    ],
  },
  {
    id: 111,
    correct: 3,
    question: "Fishing (phishing) nima?",
    options: [
      "Grafik tasvir yaratish texnologiyasi",
      "Ma’lumotlarni zaxiralash usuli",
      "Elektron jadval funksiyasi",
      "Foydalanuvchining maxfiy ma’lumotlarini aldov yo‘li bilan qo‘lga kiritishga qaratilgan usul",
    ],
  },
  {
    id: 112,
    correct: 3,
    question: "Spam nima?",
    options: [
      "Grafik fayl turi",
      "Kompyuter protsessori",
      "Ma’lumotlar bazasi jadvali",
      "Keraksiz yoki ommaviy tarzda yuboriladigan elektron xabarlar",
    ],
  },
  {
    id: 113,
    correct: 0,
    question: "Ikki bosqichli autentifikatsiyaning afzalligi nimada?",
    options: [
      "Hisob qaydnomasini qo‘shimcha tasdiqlash orqali xavfsizlikni oshiradi",
      "Kompyuter xotirasini kengaytiradi",
      "Parolni butunlay bekor qiladi",
      "Internetni tezlashtiradi",
    ],
  },
  {
    id: 114,
    correct: 0,
    question: "Autentifikatsiya nima?",
    options: [
      "Foydalanuvchining shaxsini tekshirish jarayoni",
      "Elektron jadval yaratish jarayoni",
      "Tasvirlarni tahrirlash jarayoni",
      "Fayllarni arxivlash jarayoni",
    ],
  },
  {
    id: 115,
    correct: 2,
    question: "Avtomatlashtirish tushunchasi nimani anglatadi?",
    options: [
      "Axborotni faqat qog‘ozda saqlash",
      "Barcha ishlarni qo‘lda bajarish",
      "Jarayonlarni inson aralashuvini kamaytirgan holda texnik va dasturiy vositalar yordamida bajarish",
      "Kompyuterlarni ishlatmaslik",
    ],
  },
  {
    id: 116,
    correct: 0,
    question: "Ishlab chiqarish jarayonlarini avtomatlashtirish qanday natija beradi?",
    options: [
      "Mehnat unumdorligini oshirish va jarayonlarni aniqroq boshqarish imkonini beradi",
      "Axborot almashinuvini to‘xtatadi",
      "Xatolar sonini ataylab oshiradi",
      "Ishlab chiqarish tezligini kamaytiradi",
    ],
  },
  {
    id: 117,
    correct: 2,
    question: "Avtomatlashtirilgan loyihalash tizimlarining afzalligi nima?",
    options: [
      "Faqat internetga ulanishni ta’minlaydi",
      "Faqat qog‘ozda chizma yaratadi",
      "Loyihalarni tez, aniq va raqamli shaklda ishlab chiqish imkonini beradi",
      "Faqat matnlarni tarjima qiladi",
    ],
  },
  {
    id: 118,
    correct: 0,
    question: "3D modellashtirish nima?",
    options: [
      "Obyektlarning uch o‘lchamli raqamli modelini yaratish jarayoni",
      "Faqat ma’lumotlarni o‘chirish",
      "Faqat matn terish jarayoni",
      "Faqat elektron pochta yuborish",
    ],
  },
  {
    id: 119,
    correct: 3,
    question: "Yengil sanoatda 3D modellashtirishdan qanday foydalanish mumkin?",
    options: [
      "Faqat ma’lumotlar bazasini o‘chirish uchun",
      "Faqat kompyuterni qayta ishga tushirish uchun",
      "Faqat elektron pochta yuborish uchun",
      "Mahsulot yoki uning elementlarining raqamli modelini yaratish va ko‘rish uchun",
    ],
  },
  {
    id: 120,
    correct: 3,
    question: "3D vizualizatsiyaning asosiy vazifasi nima?",
    options: [
      "Faqat internet tezligini o‘lchash",
      "Faqat matnlarni formatlash",
      "Faqat fayllarni arxivlash",
      "Raqamli obyektni uch o‘lchamli ko‘rinishda tasvirlash",
    ],
  },
  {
    id: 121,
    correct: 3,
    question: "Raqamli prototiplash nima?",
    options: [
      "Faqat tayyor mahsulotni sotish",
      "Faqat hujjatlarni chop etish",
      "Faqat ma’lumotlarni o‘chirish",
      "Mahsulotning fizik nusxasidan oldin uning raqamli namunasini ishlab chiqish",
    ],
  },
  {
    id: 122,
    correct: 3,
    question: "Kompyuter grafikasi yengil sanoatda nima uchun muhim?",
    options: [
      "Faqat ma’lumotlar bazasini boshqarish uchun",
      "Faqat elektron pochta yuborish uchun",
      "Faqat internet tezligini oshirish uchun",
      "Mahsulotlarning raqamli tasvirlari va vizual materiallarini yaratish uchun",
    ],
  },
  {
    id: 123,
    correct: 0,
    question: "Rastrli grafikaning asosiy elementi nima?",
    options: [
      "Piksel",
      "Formula",
      "Jadval",
      "Algoritm",
    ],
  },
  {
    id: 124,
    correct: 1,
    question: "Vektorli grafikada asosiy obyektlar qanday ifodalanadi?",
    options: [
      "Faqat videokadrlar orqali",
      "Geometrik shakllar va matematik tavsiflar orqali",
      "Faqat audio signallar orqali",
      "Faqat elektron jadvallar orqali",
    ],
  },
  {
    id: 125,
    correct: 0,
    question: "Tasvirning aniqligi qanday tushuncha bilan ifodalanadi?",
    options: [
      "Ruxsat etish qobiliyati, ya’ni tasvirning ma’lum birlikdagi piksel zichligi bilan",
      "Kompyuter protsessori bilan",
      "Fayl nomi bilan",
      "Internet tezligi bilan",
    ],
  },
  {
    id: 126,
    correct: 0,
    question: "Infografika nima?",
    options: [
      "Murakkab ma’lumotlarni grafik va ko‘rgazmali shaklda taqdim etish usuli",
      "Faqat printer qurilmasi",
      "Faqat operatsion tizim",
      "Faqat audio fayl",
    ],
  },
  {
    id: 127,
    correct: 1,
    question: "Yengil sanoatda infografikadan qanday foydalanish mumkin?",
    options: [
      "Faqat internetni o‘chirishda",
      "Ishlab chiqarish ko‘rsatkichlari, texnologik jarayonlar va mahsulot xususiyatlarini ko‘rgazmali ifodalashda",
      "Faqat parol yaratishda",
      "Faqat fayllarni o‘chirishda",
    ],
  },
  {
    id: 128,
    correct: 1,
    question: "QR-kod orqali qanday axborotni taqdim etish mumkin?",
    options: [
      "Faqat elektr energiyasini",
      "Veb-sayt manzili, mahsulot yoki boshqa raqamli ma’lumotga olib boruvchi axborotni",
      "Faqat kompyuter protsessorini",
      "Faqat qog‘oz hajmini",
    ],
  },
  {
    id: 129,
    correct: 1,
    question: "Mahsulot shtrix-kodi nima uchun ishlatiladi?",
    options: [
      "Faqat internet saytini yaratish uchun",
      "Mahsulotni identifikatsiya qilish va hisobga olish uchun",
      "Faqat kompyuterni himoyalash uchun",
      "Faqat mahsulot rangini o‘zgartirish uchun",
    ],
  },
  {
    id: 130,
    correct: 1,
    question: "Omborlarni boshqarish axborot tizimi nima uchun kerak?",
    options: [
      "Faqat grafik tasvirlarni tahrirlash uchun",
      "Tovar va materiallarning kirimi, chiqimi hamda qoldig‘ini nazorat qilish uchun",
      "Faqat elektron pochta yuborish uchun",
      "Faqat videolarni montaj qilish uchun",
    ],
  },
  {
    id: 131,
    correct: 2,
    question: "Yengil sanoat korxonasida inventarizatsiya jarayonini raqamlashtirish qanday foyda beradi?",
    options: [
      "Ma’lumotlarni yashiradi",
      "Ombor ishlarini faqat qo‘lda bajarishga majbur qiladi",
      "Mahsulot va materiallar hisobini tezkor va aniq yuritish imkonini beradi",
      "Hisob-kitoblarni butunlay to‘xtatadi",
    ],
  },
  {
    id: 132,
    correct: 2,
    question: "Shtrix-kod skaneri nima qiladi?",
    options: [
      "Faqat fayllarni o‘chiradi",
      "Faqat tasvirni tahrirlaydi",
      "Shtrix-koddagi ma’lumotni o‘qib, axborot tizimiga uzatadi",
      "Faqat internet tezligini oshiradi",
    ],
  },
  {
    id: 133,
    correct: 0,
    question: "Ishlab chiqarish monitoringi nima?",
    options: [
      "Ishlab chiqarish jarayonlarining holatini muntazam kuzatish va tahlil qilish",
      "Faqat mahsulotlarni qadoqlash",
      "Faqat internet saytlarini yaratish",
      "Faqat hujjatlarni chop etish",
    ],
  },
  {
    id: 134,
    correct: 3,
    question: "Real vaqt rejimida monitoring qilishning afzalligi nima?",
    options: [
      "Faqat qog‘oz hisobot yaratadi",
      "Axborot almashinuvini to‘xtatadi",
      "Ma’lumotlarni bir necha yil kechiktirib beradi",
      "Jarayondagi o‘zgarishlarni tez aniqlash va tegishli choralarni ko‘rish imkonini beradi",
    ],
  },
  {
    id: 135,
    correct: 2,
    question: "Ishlab chiqarishdagi ma’lumotlarni avtomatik yig‘ish qanday foyda beradi?",
    options: [
      "Ishlab chiqarishni to‘xtatadi",
      "Ma’lumotlarni butunlay yo‘q qiladi",
      "Inson tomonidan kiritiladigan xatolarni kamaytiradi va ma’lumotlarni tezkor olish imkonini beradi",
      "Kompyuterlarning ishlashini cheklaydi",
    ],
  },
  {
    id: 136,
    correct: 2,
    question: "Sun’iy intellektning mashinali o‘rganish yo‘nalishi nimaga asoslanadi?",
    options: [
      "Faqat ma’lumotlarni qo‘lda kiritishga",
      "Faqat grafik tasvirlarni chop etishga",
      "Kompyuter tizimining ma’lumotlar asosida qonuniyatlarni o‘rganishi va natija chiqarishiga",
      "Faqat qog‘oz hujjatlar bilan ishlashga",
    ],
  },
  {
    id: 137,
    correct: 1,
    question: "Yengil sanoatda kompyuter ko‘rish texnologiyasi qanday qo‘llanilishi mumkin?",
    options: [
      "Faqat kompyuterlarni o‘chirishda",
      "Mahsulotlardagi nuqsonlarni avtomatik aniqlashda",
      "Faqat elektron pochta yuborishda",
      "Faqat hujjatlarni arxivlashda",
    ],
  },
  {
    id: 138,
    correct: 2,
    question: "Sun’iy intellekt yordamida talabni prognozlash qanday amalga oshiriladi?",
    options: [
      "Faqat tasodifiy sonlar yordamida",
      "Faqat qog‘oz hujjatlar asosida",
      "Tarixiy va joriy ma’lumotlarni tahlil qilish orqali kelajakdagi talabni baholash bilan",
      "Ma’lumotlardan foydalanmasdan",
    ],
  },
  {
    id: 139,
    correct: 3,
    question: "Chatbot nima?",
    options: [
      "Kompyuterning fizik xotirasi",
      "Printer qurilmasi",
      "Grafik fayl formati",
      "Foydalanuvchi bilan avtomatik muloqot qilishga mo‘ljallangan dasturiy tizim",
    ],
  },
  {
    id: 140,
    correct: 1,
    question: "Yengil sanoat korxonasida chatbot qanday vazifani bajarishi mumkin?",
    options: [
      "Faqat ishlab chiqarish uskunalarini mexanik ta’mirlash",
      "Mijozlarning mahsulot va xizmatlar haqidagi savollariga avtomatik javob berish",
      "Faqat kompyuter xotirasini almashtirish",
      "Faqat elektr energiyasini ishlab chiqarish",
    ],
  },
  {
    id: 141,
    correct: 3,
    question: "Raqamli transformatsiya nima?",
    options: [
      "Faqat kompyuter sotib olish",
      "Faqat hujjatlarni skanerlash",
      "Faqat internetga ulanish",
      "Tashkilot faoliyatini raqamli texnologiyalar asosida tubdan takomillashtirish jarayoni",
    ],
  },
  {
    id: 142,
    correct: 1,
    question: "Raqamli transformatsiyaning yengil sanoatdagi asosiy natijalaridan biri qaysi?",
    options: [
      "Axborot almashinuvini kamaytirish",
      "Ishlab chiqarish va boshqaruv jarayonlarining samaradorligini oshirish",
      "Ma’lumotlarni qo‘lda qayta ishlashni ko‘paytirish",
      "Texnologiyalardan foydalanishni to‘xtatish",
    ],
  },
  {
    id: 143,
    correct: 0,
    question: "Raqamli egizak (Digital Twin) tushunchasi nimani anglatadi?",
    options: [
      "Real obyekt yoki jarayonning raqamli modeli bo‘lib, uning holatini tahlil qilish va kuzatishga xizmat qiladi",
      "Faqat zaxira kompyuter",
      "Faqat elektron hujjat",
      "Faqat grafik fayl",
    ],
  },
  {
    id: 144,
    correct: 2,
    question: "Yengil sanoatda raqamli egizak texnologiyasidan foydalanishning afzalligi nima?",
    options: [
      "Faqat ma’lumotlarni o‘chiradi",
      "Faqat hujjatlarni chop etadi",
      "Ishlab chiqarish jarayonlarini modellashtirish, kuzatish va optimallashtirish imkonini beradi",
      "Faqat internet saytlarini yaratadi",
    ],
  },
  {
    id: 145,
    correct: 1,
    question: "Robotlashtirilgan ishlab chiqarish tizimining asosiy afzalligi nima?",
    options: [
      "Barcha jarayonlarni sekinlashtirish",
      "Takrorlanuvchi jarayonlarni yuqori aniqlik va barqarorlik bilan bajarish",
      "Faqat qog‘oz hujjatlarni ko‘paytirish",
      "Axborot tizimlarini bekor qilish",
    ],
  },
  {
    id: 146,
    correct: 3,
    question: "Robotlar bilan axborot tizimlarining integratsiyasi nima beradi?",
    options: [
      "Internetdan foydalanishni to‘xtatadi",
      "Kompyuterlarni ishlab chiqarishdan ajratadi",
      "Ma’lumotlarni yo‘q qiladi",
      "Ishlab chiqarish jarayonlarini avtomatik boshqarish va ma’lumot almashish imkonini beradi",
    ],
  },
  {
    id: 147,
    correct: 2,
    question: "Texnologik jarayonni modellashtirish nima?",
    options: [
      "Faqat hujjatlarni chop etish",
      "Faqat kompyuterlarni ta’mirlash",
      "Jarayonning ishlashini raqamli model yordamida ifodalash va tahlil qilish",
      "Faqat ma’lumotlarni o‘chirish",
    ],
  },
  {
    id: 148,
    correct: 1,
    question: "Axborot texnologiyalaridan samarali foydalanish uchun xodimlarda qanday ko‘nikma muhim?",
    options: [
      "Internetdan foydalanishni butunlay rad etish",
      "Raqamli vositalardan to‘g‘ri va xavfsiz foydalanish ko‘nikmasi",
      "Axborotni faqat qog‘ozda saqlash",
      "Kompyuterdan umuman foydalanmaslik",
    ],
  },
  {
    id: 149,
    correct: 1,
    question: "Yengil sanoatda axborot texnologiyalarining kelajakdagi rivojlanish yo‘nalishlaridan biri qaysi?",
    options: [
      "Kompyuter tarmoqlaridan foydalanishni to‘xtatish",
      "Sun’iy intellekt, IoT, robototexnika va raqamli boshqaruv tizimlarining kengayishi",
      "Barcha ma’lumotlarni qo‘lda qayta ishlash",
      "Raqamli texnologiyalardan voz kechish",
    ],
  },
  {
    id: 150,
    correct: 2,
    question: "Yengil sanoatda axborot texnologiyalaridan kompleks foydalanishning eng muhim natijasi nima?",
    options: [
      "Zamonaviy texnologiyalardan foydalanishni kamaytirish",
      "Ishlab chiqarish jarayonlarini murakkablashtirish",
      "Ishlab chiqarish samaradorligi, mahsulot sifati va boshqaruv jarayonlarini yaxshilash",
      "Axborot almashinuvini cheklash",
    ],
  },
];

/** Bazadan tasodifiy `count` ta savol tanlaydi (takrorlanmaydi). */
export function pickRandomQuestions(count: number): Question[] {
  const pool = [...questions];

  // Fisher-Yates: massivni aralashtirib, boshidan kerakli miqdorni olamiz.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}