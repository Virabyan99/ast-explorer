export async function saveToIndexedDB(key: string, value: any) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ASTStorage", 1);
  
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("history")) {
          db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
        }
      };
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("history", "readwrite");
        const store = transaction.objectStore("history");
        store.add({ key, value, timestamp: Date.now() });
  
        transaction.oncomplete = () => resolve("Saved!");
        transaction.onerror = () => reject("Error saving data.");
      };
  
      request.onerror = () => reject("Database error.");
    });
  }
  
  export async function loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ASTStorage", 1);
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("history", "readonly");
        const store = transaction.objectStore("history");
        const allRecords = store.getAll();
  
        allRecords.onsuccess = () => resolve(allRecords.result);
        allRecords.onerror = () => reject("Error loading data.");
      };
  
      request.onerror = () => reject("Database error.");
    });
  }
  
  export async function deleteFromIndexedDB(id: number) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ASTStorage", 1);
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("history", "readwrite");
        const store = transaction.objectStore("history");
        store.delete(id);
  
        transaction.oncomplete = () => resolve("Deleted!");
        transaction.onerror = () => reject("Error deleting data.");
      };
  
      request.onerror = () => reject("Database error.");
    });
  }
  