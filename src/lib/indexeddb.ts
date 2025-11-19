import { Post } from '@/types';

const DB_NAME = 'ReadMoreDB';
const DB_VERSION = 3;
const STORE_NAME = 'posts';
const READ_HISTORY_STORE_NAME = 'read_history';

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'slug' });
      } else {
        store = (event.target as IDBOpenDBRequest).transaction?.objectStore(STORE_NAME);
      }
      if (store && !store.indexNames.contains('topic')) {
        store.createIndex('topic', 'topic', { unique: false });
      }

      if (!db.objectStoreNames.contains(READ_HISTORY_STORE_NAME)) {
        const historyStore = db.createObjectStore(READ_HISTORY_STORE_NAME, { keyPath: 'slug' });
        historyStore.createIndex('readAt', 'readAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const addPosts = async (posts: Post[]): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  posts.forEach((post) => {
    store.put(post); // Use put to add or update
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      console.error('Add posts transaction error:', (event.target as IDBTransaction).error);
      reject((event.target as IDBTransaction).error);
    };
  });
};

export const getAllPostsFromIndexedDB = async (): Promise<Post[]> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Post[]);
    request.onerror = (event) => {
      console.error('Get all posts transaction error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const clearAllPosts = async (): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Clear all posts transaction error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const addToReadHistory = async (post: Post): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(READ_HISTORY_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(READ_HISTORY_STORE_NAME);

  const historyItem = {
    ...post,
    readAt: new Date().toISOString(),
  };

  store.put(historyItem);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      console.error('Add to read history transaction error:', (event.target as IDBTransaction).error);
      reject((event.target as IDBTransaction).error);
    };
  });
};

export const getReadHistory = async (): Promise<(Post & { readAt: string })[]> => {
  const database = await openDatabase();
  const transaction = database.transaction(READ_HISTORY_STORE_NAME, 'readonly');
  const store = transaction.objectStore(READ_HISTORY_STORE_NAME);
  const index = store.index('readAt');

  return new Promise((resolve, reject) => {
    const request = index.getAll();
    request.onsuccess = () => {
      // Sort by readAt descending (newest first)
      const results = request.result as (Post & { readAt: string })[];
      resolve(results.reverse());
    };
    request.onerror = (event) => {
      console.error('Get read history transaction error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const removeFromReadHistory = async (slug: string): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(READ_HISTORY_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(READ_HISTORY_STORE_NAME);

  store.delete(slug);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      console.error('Remove from read history transaction error:', (event.target as IDBTransaction).error);
      reject((event.target as IDBTransaction).error);
    };
  });
};