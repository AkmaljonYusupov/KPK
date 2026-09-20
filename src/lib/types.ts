import type { AuthProviderName } from "@/lib/constants";

/** localStorage("kpk-user") ichida saqlanadigan foydalanuvchi. */
export interface KpkUser {
  uid: string;
  name: string;
  email: string;
  image: string | null;
  provider: AuthProviderName;
  createdAt: string;
  lastLoginAt: string;
}

export interface ModuleState {
  unlocked: boolean;
  completed: boolean;
}

export interface InitialTestResult {
  score: number;
  percent: number;
  total: number;
  completed: boolean;
  /** Qaysi savolga qaysi variant tanlangani (indeks). */
  answers?: (number | null)[];
  /** Shu urinishda tushgan savollarning bazadagi id'lari —
      natijani qayta ko'rsatishda aynan o'sha savollar kerak. */
  questionIds?: number[];
  finishedAt?: string;
  /** Nechanchi urinish ekani. */
  attempt?: number;
  /** Test davomida qayd etilgan qoida buzilishlari soni. */
  violations?: number;
  /** Chegaradan oshgani uchun avtomatik yakunlanganmi. */
  autoSubmitted?: boolean;
}

/** localStorage("kpk-progress") ichida saqlanadigan progress. */
export interface KpkProgress {
  initialTest?: InitialTestResult;
  maxLevel?: number;
  modules?: Record<string, ModuleState>;
}