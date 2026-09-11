import type { Language } from "@/i18n/dictionaries";

/* ══════════════════════════════════════════════════════════════
   KIRISH TESTI SAVOLLARI

   Original json/questions.json dagi 5 ta savol va ularning
   to'g'ri javob indekslari o'zgarmagan. Farqi: savollar endi
   uch tilda — foydalanuvchi tanlagan tilga qarab ko'rsatiladi.
══════════════════════════════════════════════════════════════ */

export interface Question {
  id: number;
  /** To'g'ri javobning options massividagi indeksi. */
  correct: number;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
}

export const questions: Question[] = [
  {
    id: 1,
    correct: 1,
    question: {
      uz: "HTML nima?",
      en: "What is HTML?",
      ru: "Что такое HTML?",
    },
    options: {
      uz: ["Dasturlash tili", "Belgilash tili", "Ma'lumotlar bazasi", "Framework"],
      en: ["Programming language", "Markup language", "Database", "Framework"],
      ru: ["Язык программирования", "Язык разметки", "База данных", "Фреймворк"],
    },
  },
  {
    id: 2,
    correct: 0,
    question: {
      uz: "CSS nima uchun ishlatiladi?",
      en: "What is CSS used for?",
      ru: "Для чего используется CSS?",
    },
    options: {
      uz: ["Dizayn uchun", "Ma'lumotlar bazasi uchun", "Server uchun", "AI uchun"],
      en: ["For design", "For databases", "For servers", "For AI"],
      ru: ["Для дизайна", "Для базы данных", "Для сервера", "Для ИИ"],
    },
  },
  {
    id: 3,
    correct: 2,
    question: {
      uz: "JavaScript nima?",
      en: "What is JavaScript?",
      ru: "Что такое JavaScript?",
    },
    options: {
      uz: ["Backend", "Ma'lumotlar bazasi", "Dasturlash tili", "Dizayn vositasi"],
      en: ["Backend", "Database", "Programming language", "Design tool"],
      ru: ["Backend", "База данных", "Язык программирования", "Инструмент дизайна"],
    },
  },
  {
    id: 4,
    correct: 1,
    question: {
      uz: "React nima?",
      en: "What is React?",
      ru: "Что такое React?",
    },
    options: {
      uz: ["Backend framework", "Frontend kutubxona", "Ma'lumotlar bazasi", "Operatsion tizim"],
      en: ["Backend framework", "Frontend library", "Database", "Operating system"],
      ru: ["Backend фреймворк", "Frontend библиотека", "База данных", "Операционная система"],
    },
  },
  {
    id: 5,
    correct: 0,
    question: {
      uz: "HTTP nima?",
      en: "What is HTTP?",
      ru: "Что такое HTTP?",
    },
    options: {
      uz: [
        "HyperText Transfer Protocol",
        "High Transfer Protocol",
        "Hyper Transfer Text",
        "Hech biri",
      ],
      en: ["HyperText Transfer Protocol", "High Transfer Protocol", "Hyper Transfer Text", "None"],
      ru: [
        "HyperText Transfer Protocol",
        "High Transfer Protocol",
        "Hyper Transfer Text",
        "Ни один из них",
      ],
    },
  },
];
