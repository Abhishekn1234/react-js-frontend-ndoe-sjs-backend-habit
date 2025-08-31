const DB_NAME = 'habit-db';
const STORE_NAME = 'habit-store';
const KEY = 'records';

export async function saveRecordsToIndexedDB(records) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('habitDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('records');
    };
    request.onsuccess = () => {
      const tx = request.result.transaction('records', 'readwrite');
      tx.objectStore('records').put(records, 'habitRecords');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadRecordsFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('habitDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('records');
    };
    request.onsuccess = () => {
      const tx = request.result.transaction('records', 'readonly');
      const getReq = tx.objectStore('records').get('habitRecords');
      getReq.onsuccess = () => resolve(getReq.result || {});
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function saveRecordsToLocalStorage(records) {
  localStorage.setItem('habitRecords', JSON.stringify(records));
}
export function loadRecordsFromLocalStorage() {
  const raw = localStorage.getItem('habitRecords');
  return raw ? JSON.parse(raw) : {};
}
