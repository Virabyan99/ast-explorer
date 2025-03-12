// Variable to hold the database promise
let dbPromise;

// Centralized function to open the database
function getDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("ASTStorage", 3); // Increment to version 3 to add 'currentCode'

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("history")) {
          db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
          console.log("Object store 'history' created.");
        }
        if (!db.objectStoreNames.contains("currentCode")) {
          db.createObjectStore("currentCode");
          console.log("Object store 'currentCode' created.");
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject("Database error: " + event.target.error);
      };
    });
  }
  return dbPromise;
}

// Save function for history snapshots
export async function saveToIndexedDB(key: string, value: any) {
  try {
    const db = await getDatabase();
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");
    const addRequest = store.add({ key, value, timestamp: Date.now() });

    return new Promise((resolve, reject) => {
      addRequest.onsuccess = () => {
        resolve("Saved!");
      };
      addRequest.onerror = () => {
        reject("Error saving data: " + addRequest.error);
      };
    });
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
    throw error;
  }
}

// Load function for history snapshots
export async function loadFromIndexedDB() {
  try {
    const db = await getDatabase();
    const transaction = db.transaction("history", "readonly");
    const store = transaction.objectStore("history");
    const allRecords = store.getAll();

    return new Promise((resolve, reject) => {
      allRecords.onsuccess = () => {
        resolve(allRecords.result);
      };
      allRecords.onerror = () => {
        reject("Error loading data: " + allRecords.error);
      };
    });
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    throw error;
  }
}

// Delete function for history snapshots
export async function deleteFromIndexedDB(id: number) {
  try {
    const db = await getDatabase();
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");
    const deleteRequest = store.delete(id);

    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        resolve("Deleted!");
      };
      deleteRequest.onerror = () => {
        reject("Error deleting data: " + deleteRequest.error);
      };
    });
  } catch (error) {
    console.error("Failed to delete from IndexedDB:", error);
    throw error;
  }
}

// Save the current code
export async function saveCurrentCode(code: string) {
  try {
    const db = await getDatabase();
    const transaction = db.transaction("currentCode", "readwrite");
    const store = transaction.objectStore("currentCode");
    const request = store.put(code, "current");
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve("Current code saved!");
      };
      request.onerror = () => {
        reject("Error saving current code: " + request.error);
      };
    });
  } catch (error) {
    console.error("Failed to save current code:", error);
    throw error;
  }
}

// Load the current code
export async function loadCurrentCode() {
  try {
    const db = await getDatabase();
    const transaction = db.transaction("currentCode", "readonly");
    const store = transaction.objectStore("currentCode");
    const request = store.get("current");
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || '// Write JavaScript here...');
      };
      request.onerror = () => {
        reject("Error loading current code: " + request.error);
      };
    });
  } catch (error) {
    console.error("Failed to load current code:", error);
    throw error;
  }
}