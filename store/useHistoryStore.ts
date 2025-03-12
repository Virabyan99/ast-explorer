import { create } from "zustand";
import { saveToIndexedDB, loadFromIndexedDB, deleteFromIndexedDB } from "@/utils/indexedDB";

interface HistoryItem {
  id?: number;
  key: string;
  value: any;
  timestamp: number;
}

interface HistoryState {
  history: HistoryItem[];
  loadHistory: () => void;
  saveHistory: (key: string, value: any) => void;
  deleteHistory: (id: number) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  
  loadHistory: async () => {
    const records = (await loadFromIndexedDB()) as HistoryItem[];
    set({ history: records });
  },

  saveHistory: async (key, value) => {
    await saveToIndexedDB(key, value);
    const records = (await loadFromIndexedDB()) as HistoryItem[];
    set({ history: records });
  },

  deleteHistory: async (id) => {
    await deleteFromIndexedDB(id);
    const records = (await loadFromIndexedDB()) as HistoryItem[];
    set({ history: records });
  },
}));
