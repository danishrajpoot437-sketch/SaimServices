import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Mail, Lock, User, Eye, EyeOff, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-[10px] font-medium" style={{ color: colors[score - 1] }}>
          {labels[score - 1]} password
        </p>
      )}
    </div>
  );
}

interface FieldInputProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  suffix?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

function FieldInput({ icon, type, placeholder, value, onChange, autoComplete, suffix, inputRef }: FieldInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{
        borderColor: focused ? "rgba(67,97,238,0.6)" : "rgba(255,255,255,0.09)",
        boxShadow: focused ? "0 0 0 3px rgba(67,97,238,0.12)" : "none",
      }}
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <span className={`transition-colors flex-shrink-0 ${focused ? "text-primary" : "text-muted-foreground/60"}`}>
        {icon}
      </span>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        style={{ minWidth: 0 }}
      />
      {suffix}
    </motion.div>
  );
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(""); setEmail(""); setPassword("");
      setError(""); setSuccess(false); setSuccessMsg(""); setShowPw(false); setLoading(false);
      setTimeout(() => firstRef.current?.focus(), 180);
    }
  }, [open]);

  useEffect(() => { setError(""); }, [tab, email, password, name]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (tab === "signup" && name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)."); return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long."); return;
    }
    setLoading(true);
    try {
      if (tab === "signup") {
        const { email: confirmedEmail } = await signUp(name, email, password);
        setSuccess(true);
        setSuccessMsg("Check your inbox for the verification code!");
        setTimeout(() => {
          onClose();
          navigate(`/verify-otp?email=${encodeURIComponent(confirmedEmail)}`);
        }, 1400);
      } else {
        await signIn(email, password);
        setSuccess(true);
        setSuccessMsg("Signed in successfully!");
        setTimeout(onClose, 1400);
      }
    } catch (ex: unknown) {
      if (
        ex instanceof Error &&
        (ex as Error & { requiresVerification?: boolean; email?: string }).requiresVerification
      ) {
        const unverifiedEmail = (ex as Error & { email?: string }).email ?? email;
        onClose();
        navigate(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
        return;
      }
      setError(ex instanceof Error ? ex.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          data-testid="auth-modal-backdrop"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(10, 16, 46, 0.98)",
              border: "1px solid rgba(67,97,238,0.28)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 80px rgba(67,97,238,0.07)",
            }}
            data-testid="auth-modal"
          >
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.8), rgba(14,165,233,0.8), rgba(67,97,238,0.8), transparent)" }} />

            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 55% 55% at 100% 0%, rgba(67,97,238,0.12) 0%, transparent 70%)" }} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
              data-testid="auth-modal-close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-8 pt-8 pb-9">
              <div className="text-center mb-7">
                <motion.div
                  className="w-13 h-13 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    width: 52, height: 52,
                    background: "linear-gradient(135deg, rgba(67,97,238,0.25) 0%, rgba(14,165,233,0.15) 100%)",
                    border: "1px solid rgba(67,97,238,0.35)",
                    boxShadow: "0 0 28px rgba(67,97,238,0.3)",
                  }}
                  animate={{ boxShadow: ["0 0 20px rgba(67,97,238,0.2)", "0 0 36px rgba(67,97,238,0.4)", "0 0 20px rgba(67,97,238,0.2)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-6 h-6 text-primary" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-1.5">
                  {success ? (tab === "signup" ? "Almost there!" : "You're all set!") : tab === "signin" ? "Welcome back" : "Join SaimServices"}
                </h2>
                <p className="text-sm text-muted-foreground leading-snug">
                  {success
                    ? successMsg
                    : tab === "signin"
                    ? "Sign in to access all your tools"
                    : "Join 50K+ engineers, students & researchers"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <p className="text-emerald-400 font-semibold">
                      {tab === "signup" ? "Redirecting to verification…" : "Successfully signed in!"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div
                      className="flex p-1 rounded-2xl mb-6"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {(["signin", "signup"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                          style={{
                            color: tab === t ? "#fff" : "rgba(255,255,255,0.38)",
                            background: tab === t ? "rgba(67,97,238,0.9)" : "transparent",
                            boxShadow: tab === t ? "0 4px 14px rgba(67,97,238,0.4)" : "none",
                          }}
                          data-testid={`auth-tab-${t}`}
                        >
                          {t === "signin" ? "Sign In" : "Sign Up"}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <AnimatePresence initial={false}>
                        {tab === "signup" && (
                          <motion.div
                            key="name"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <FieldInput
                              inputRef={tab === "signup" ? firstRef : undefined}
                              icon={<User className="w-4 h-4" />}
                              type="text"
                              placeholder="Full name"
                              value={name}
                              onChange={setName}
                              autoComplete="name"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <FieldInput
                        inputRef={tab === "signin" ? firstRef : undefined}
                        icon={<Mail className="w-4 h-4" />}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={setEmail}
                        autoComplete="email"
                      />

                      <div>
                        <FieldInput
                          icon={<Lock className="w-4 h-4" />}
                          type={showPw ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={setPassword}
                          autoComplete={tab === "signin" ? "current-password" : "new-password"}
                          suffix={
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPw((p) => !p)}
                              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
                            >
                              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                        {tab === "signup" && <PasswordStrength password={password} />}
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm overflow-hidden"
                            style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }}
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-1"
                        style={{
                          background: "linear-gradient(135deg, #4361ee 0%, #3a86ff 60%, #0ea5e9 100%)",
                          boxShadow: "0 8px 28px rgba(67,97,238,0.45), 0 1px 0 rgba(255,255,255,0.12) inset",
                          opacity: loading ? 0.72 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        data-testid={`auth-submit-${tab}`}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : tab === "signin" ? "Sign In to SaimServices" : "Create Free Account"}
                      </motion.button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                      {tab === "signin" ? "New here?" : "Already have an account?"}{" "}
                      <button
                        onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                      >
                        {tab === "signin" ? "Create a free account" : "Sign in instead"}
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
