"use client";

/* ══════════════════════════════════════════════════════════════
   AI suhbatidagi rasmlarni IndexedDB'da saqlash.

   localStorage kvotasi (~5MB) rasmlar (base64 data-URL) uchun
   yetarli emas, shuning uchun rasmlar alohida — IndexedDB'da,
   xabar id'siga bog'lab saqlanadi.
══════════════════════════════════════════════════════════════ */

const DB_NAME = "kpk-ai-images";
const DB_VERSION = 1;
const STORE_NAME = "images";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Bitta xabarga tegishli rasmlarni saqlaydi (data-URL massivi). */
export async function saveImages(messageId: string, images: string[]): Promise<void> {
  if (typeof window === "undefined") return;

  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(images, messageId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

/** Barcha saqlangan rasmlarni { xabarId: rasmlar[] } shaklida qaytaradi. */
export async function loadAllImages(): Promise<Record<string, string[]>> {
  if (typeof window === "undefined") return {};

  const db = await openDb();
  const result: Record<string, string[]> = {};

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }

      result[String(cursor.key)] = cursor.value as string[];
      cursor.continue();
    };

    cursorRequest.onerror = () => reject(cursorRequest.error);
  });

  db.close();
  return result;
}

/** Barcha saqlangan rasmlarni tozalaydi (suhbat tozalanganda). */
export async function clearImages(): Promise<void> {
  if (typeof window === "undefined") return;

  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}