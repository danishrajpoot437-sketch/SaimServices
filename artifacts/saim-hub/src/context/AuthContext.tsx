import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "saim_users_v1";
const SESSION_KEY = "saim_session_v1";

function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function getUsers(): Array<AuthUser & { passwordHash: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]"); }
  catch { return []; }
}

function saveUsers(users: Array<AuthUser & { passwordHash: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });

  const signUp = async (name: string, email: string, password: string) => {
    const normalEmail = email.toLowerCase().trim();
    const users = getUsers();
    if (users.some(u => u.email === normalEmail)) {
      throw new Error("An account with this email already exists.");
    }
    const newUser: AuthUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: normalEmail,
      createdAt: Date.now(),
    };
    users.push({ ...newUser, passwordHash: simpleHash(normalEmail + password) });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const normalEmail = email.toLowerCase().trim();
    const users = getUsers();
    const record = users.find(u => u.email === normalEmail);
    if (!record) throw new Error("No account found with this email address.");
    if (record.passwordHash !== simpleHash(normalEmail + password)) {
      throw new Error("Incorrect password. Please try again.");
    }
    const { passwordHash: _, ...session } = record;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
