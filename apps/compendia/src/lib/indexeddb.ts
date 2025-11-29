import { CompendiaPost } from '@/types';

const DB_NAME = 'CompendiaDB';
const DB_VERSION = 2; // Incremented for read_history
const STORE_NAME = 'posts';
const READ_HISTORY_STORE_NAME = 'read_history';

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        if (typeof window === 'undefined') {
            return reject(new Error("IndexedDB is not available on server side"));
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('date', 'date', { unique: false });
            }

            if (!db.objectStoreNames.contains(READ_HISTORY_STORE_NAME)) {
                const historyStore = db.createObjectStore(READ_HISTORY_STORE_NAME, { keyPath: 'id' });
                historyStore.createIndex('readAt', 'readAt', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            db.onversionchange = () => {
                db?.close();
                db = null;
            };
            db.onclose = () => {
                db = null;
            };
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const addPosts = async (posts: CompendiaPost[]): Promise<void> => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    posts.forEach((post) => {
        store.put(post);
    });

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    });
};

export const getAllPostsFromIndexedDB = async (): Promise<CompendiaPost[]> => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as CompendiaPost[]);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};

export const getPostsByDate = async (date: string): Promise<CompendiaPost[]> => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('date');

    return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(date));
        request.onsuccess = () => resolve(request.result as CompendiaPost[]);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};

export const getPostsDateRange = async (startDate: string, endDate: string): Promise<CompendiaPost[]> => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('date');

    return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.bound(startDate, endDate));
        request.onsuccess = () => resolve(request.result as CompendiaPost[]);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};

export const addToReadHistory = async (post: CompendiaPost): Promise<void> => {
    const database = await openDatabase();
    const transaction = database.transaction(READ_HISTORY_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(READ_HISTORY_STORE_NAME);

    const historyItem = {
        ...post,
        readAt: new Date().toISOString(),
    };

    store.put(historyItem);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            window.dispatchEvent(new Event('read-history-updated'));
            resolve();
        };
        transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    });
};

export const getReadHistory = async (): Promise<(CompendiaPost & { readAt: string })[]> => {
    const database = await openDatabase();
    const transaction = database.transaction(READ_HISTORY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(READ_HISTORY_STORE_NAME);
    const index = store.index('readAt');

    return new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => {
            const results = request.result as (CompendiaPost & { readAt: string })[];
            resolve(results.reverse());
        };
        request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};
