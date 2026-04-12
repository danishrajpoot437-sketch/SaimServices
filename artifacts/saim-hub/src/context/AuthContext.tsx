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
  signUp: (name: string, email: string, password: string) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "saim_session_v1";

async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error ?? "Something went wrong. Please try again.");
    (err as Error & { requiresVerification?: boolean; email?: string }).requiresVerification =
      data.requiresVerification ?? false;
    (err as Error & { email?: string }).email = data.email;
    throw err;
  }
  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });

  const signUp = async (name: string, email: string, password: string): Promise<{ email: string }> => {
    const data = await apiPost<{ email: string }>("/api/auth/signup", { name, email, password });
    return { email: data.email };
  };

  const verifyOtp = async (email: string, otp: string): Promise<void> => {
    const data = await apiPost<{ user: AuthUser }>("/api/auth/verify-otp", { email, otp });
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const resendOtp = async (email: string): Promise<void> => {
    await apiPost("/api/auth/resend-otp", { email });
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    const data = await apiPost<{ user: AuthUser }>("/api/auth/signin", { email, password });
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, verifyOtp, resendOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
