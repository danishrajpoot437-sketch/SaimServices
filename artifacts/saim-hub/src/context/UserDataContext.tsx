import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const FAV_KEY    = "saim_favorites_v1";
const RECENT_KEY = "saim_recent_v1";
const RECENT_MAX = 8;

export interface RecentEntry {
  toolId: string;
  ts: number;
}

interface UserDataContextType {
  favorites: string[];
  recents: RecentEntry[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  trackUse: (toolId: string) => void;
  clearRecents: () => void;
  clearFavorites: () => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => readJSON<string[]>(FAV_KEY, []));
  const [recents,   setRecents]   = useState<RecentEntry[]>(() => readJSON<RecentEntry[]>(RECENT_KEY, []));

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === FAV_KEY)    setFavorites(readJSON<string[]>(FAV_KEY, []));
      if (e.key === RECENT_KEY) setRecents(readJSON<RecentEntry[]>(RECENT_KEY, []));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const next = prev.includes(toolId) ? prev.filter(id => id !== toolId) : [toolId, ...prev];
      writeJSON(FAV_KEY, next);
      return next;
    });
  }, []);

  const trackUse = useCallback((toolId: string) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.toolId !== toolId);
      const next = [{ toolId, ts: Date.now() }, ...filtered].slice(0, RECENT_MAX);
      writeJSON(RECENT_KEY, next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    writeJSON(RECENT_KEY, []);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    writeJSON(FAV_KEY, []);
  }, []);

  return (
    <UserDataContext.Provider value={{ favorites, recents, isFavorite, toggleFavorite, trackUse, clearRecents, clearFavorites }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used inside <UserDataProvider>");
  return ctx;
}
