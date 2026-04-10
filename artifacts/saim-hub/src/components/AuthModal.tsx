import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight } from "lucide-react";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.18, ease: "easeIn" } },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.532 24.552c0-1.636-.145-3.2-.418-4.698H24.48v8.883h12.98c-.56 2.98-2.256 5.51-4.808 7.208v5.994h7.782c4.553-4.194 7.098-10.373 7.098-17.387z" fill="#4285F4"/>
      <path d="M24.48 48c6.507 0 11.965-2.152 15.95-5.84l-7.782-5.994c-2.155 1.44-4.91 2.292-8.168 2.292-6.278 0-11.594-4.236-13.495-9.926H2.932v6.19C6.9 42.666 15.074 48 24.48 48z" fill="#34A853"/>
      <path d="M10.985 28.532A14.455 14.455 0 0 1 10.24 24c0-1.576.272-3.106.745-4.532v-6.19H2.932A23.956 23.956 0 0 0 .48 24c0 3.868.928 7.527 2.452 10.722l8.053-6.19z" fill="#FBBC05"/>
      <path d="M24.48 9.542c3.538 0 6.711 1.214 9.208 3.6l6.9-6.9C36.436 2.386 30.987 0 24.48 0 15.074 0 6.9 5.334 2.932 13.278l8.053 6.19c1.9-5.69 7.217-9.926 13.495-9.926z" fill="#EA4335"/>
    </svg>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  showToggle?: boolean;
}

function Field({ label, type = "text", placeholder, icon: Icon, showToggle }: FieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground tracking-wide">{label}</label>
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(67,97,238,0.5)"
            : "0 0 0 1px rgba(255,255,255,0.09)",
        }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/60 outline-none"
        />
        {showToggle && (
          <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </motion.div>
    </div>
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="auth-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            data-testid="auth-modal-backdrop"
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <motion.div
              key="auth-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "hsl(231 44% 10%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 0 0 1px rgba(67,97,238,0.15), 0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(67,97,238,0.08)",
              }}
              data-testid="auth-modal"
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.6), rgba(14,165,233,0.5), rgba(67,97,238,0.6), transparent)" }} />

              {/* Ambient orb */}
              <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 60% at 100% 0%, rgba(67,97,238,0.1) 0%, transparent 70%)" }} />

              <div className="relative p-8">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-2 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="auth-modal-close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
                    style={{ boxShadow: "0 0 16px rgba(67,97,238,0.5)" }}>
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-base">
                    <span className="gradient-text-blue">Saim</span>
                    <span className="text-foreground">Services</span>
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-xl p-1 mb-7" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {(["signin", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className="relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors"
                      data-testid={`auth-tab-${t}`}
                    >
                      {tab === t && (
                        <motion.div
                          layoutId="auth-active-tab"
                          className="absolute inset-0 rounded-lg bg-primary"
                          style={{ boxShadow: "0 0 14px rgba(67,97,238,0.4)" }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors ${tab === t ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {t === "signin" ? "Sign In" : "Sign Up"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  <motion.form
                    key={tab}
                    initial={{ opacity: 0, x: tab === "signin" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: tab === "signin" ? 10 : -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-4"
                    onSubmit={(e) => e.preventDefault()}
                    data-testid={`auth-form-${tab}`}
                  >
                    {tab === "signup" && (
                      <Field label="Full Name" placeholder="John Smith" icon={User} />
                    )}
                    <Field label="Email Address" type="email" placeholder="you@example.com" icon={Mail} />
                    <Field label="Password" placeholder="••••••••" icon={Lock} showToggle />
                    {tab === "signup" && (
                      <Field label="Confirm Password" placeholder="••••••••" icon={Lock} showToggle />
                    )}

                    {tab === "signin" && (
                      <div className="flex justify-end">
                        <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 mt-2"
                      style={{ boxShadow: "0 0 24px rgba(67,97,238,0.35), 0 4px 12px rgba(0,0,0,0.3)" }}
                      data-testid={`auth-submit-${tab}`}
                    >
                      {tab === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-xs text-muted-foreground">or continue with</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {/* Google */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-white/8 transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      data-testid="auth-google-btn"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </motion.button>
                  </motion.form>
                </AnimatePresence>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  {tab === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
                    className="text-primary hover:underline font-medium"
                  >
                    {tab === "signin" ? "Sign up free" : "Sign in"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
