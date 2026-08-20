import type { HistoryEntry } from "../types";

const HISTORY_KEY = "scanHistory";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushHistory(entry: Omit<HistoryEntry, "id" | "date">) {
  try {
    const hist = loadHistory();
    const full: HistoryEntry = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      ...entry,
    };
    hist.unshift(full);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 50)));
  } catch (e) {
    console.error("Could not save history", e);
  }
}

export function deleteHistoryEntry(id: string) {
  const hist = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
