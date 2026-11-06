import { atom } from 'nanostores';

// Recent searches, stored in IndexedDB (results can weigh several MB, too much for localStorage).
// Each entry: { id, city, postalCode, savedAt, data } where `data` holds the result atoms' values.
const DB_NAME = 'acheter-en-france';
const STORE = 'searches';
const MAX_ENTRIES = 8;

// Summaries of saved searches, newest first: [{ id, city, postalCode, savedAt }]
export const searchHistory = atom([]);

let dbPromise;
const openDb = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

// Runs one operation on the store and resolves with its result.
const withStore = async (mode, operation) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
  });
};

const summary = ({ id, city, postalCode, savedAt }) => ({ id, city, postalCode, savedAt });

export const searchId = (postalCode, city) => `${postalCode}-${city}`;

// Reloads the summaries into `searchHistory`. Storage errors (private mode, quota) are non-fatal.
export const loadHistory = async () => {
  try {
    const entries = await withStore('readonly', (store) => store.getAll());
    searchHistory.set(entries.sort((a, b) => b.savedAt - a.savedAt).map(summary));
  } catch (error) {
    console.warn('Search history unavailable:', error);
  }
};

// Saves a search (replacing an older one for the same commune) and keeps the newest MAX_ENTRIES.
export const saveSearch = async ({ postalCode, city, data }) => {
  try {
    const entry = { id: searchId(postalCode, city), postalCode, city, savedAt: Date.now(), data };
    await withStore('readwrite', (store) => store.put(entry));

    const stale = [entry, ...searchHistory.get().filter((item) => item.id !== entry.id)].slice(MAX_ENTRIES);
    if (stale.length) {
      await withStore('readwrite', (store) => stale.forEach((item) => store.delete(item.id)));
    }
    await loadHistory();
  } catch (error) {
    console.warn('Could not save search:', error);
  }
};

export const getSavedSearch = (id) => withStore('readonly', (store) => store.get(id));

export const deleteSavedSearch = async (id) => {
  try {
    await withStore('readwrite', (store) => store.delete(id));
    await loadHistory();
  } catch (error) {
    console.warn('Could not delete search:', error);
  }
};
