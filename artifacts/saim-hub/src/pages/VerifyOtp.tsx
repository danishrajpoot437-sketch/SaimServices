import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { CheckCircle2, AlertCircle, Mail, Zap, RotateCcw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtp() {
  const [, navigate] = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (canResend) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [canResend]);

  if (!emailParam) {
    navigate("/");
    return null;
  }

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(Boolean)) {
      handleSubmit(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) handleSubmit(text);
  };

  const handleSubmit = async (code?: string) => {
    const finalOtp = (code ?? otp.join("")).trim();
    if (finalOtp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOtp(emailParam, finalOtp);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : "Verification failed. Please try again.");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setResendMsg("");
    setError("");
    try {
      await resendOtp(emailParam);
      setResendMsg("A new code has been sent to your email.");
      setCanResend(false);
      setCountdown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = emailParam.replace(/(.{2})[^@]+(@.+)/, "$1****$2");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(67,97,238,0.14) 0%, transparent 70%), #060b1f" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px]"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10, 16, 46, 0.98)",
            border: "1px solid rgba(67,97,238,0.28)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 80px rgba(67,97,238,0.07)",
          }}
        >
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.8), rgba(14,165,233,0.8), rgba(67,97,238,0.8), transparent)" }} />

          <div className="px-8 pt-8 pb-9">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-5 py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
                    <p className="text-sm text-muted-foreground">Your account is now active. Redirecting you home…</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Back link */}
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </button>

                  {/* Logo + heading */}
                  <div className="text-center mb-7">
                    <motion.div
                      className="w-13 h-13 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{
                        width: 52, height: 52,
                        background: "linear-gradient(135deg, rgba(67,97,238,0.25) 0%, rgba(14,165,233,0.15) 100%)",
                        border: "1px solid rgba(67,97,238,0.35)",
                      }}
                      animate={{ boxShadow: ["0 0 20px rgba(67,97,238,0.2)", "0 0 36px rgba(67,97,238,0.4)", "0 0 20px rgba(67,97,238,0.2)"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Zap className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white mb-1.5">Verify Your Email</h2>
                    <p className="text-sm text-muted-foreground leading-snug">
                      We sent a 6-digit code to
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary/90">{maskedEmail}</span>
                    </div>
                  </div>

                  {/* OTP inputs */}
                  <div className="flex gap-2.5 justify-center mb-5" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigit(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        disabled={loading}
                        className="w-11 h-13 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200 disabled:opacity-50"
                        style={{
                          width: 44, height: 52,
                          background: digit ? "rgba(67,97,238,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1.5px solid ${digit ? "rgba(67,97,238,0.55)" : "rgba(255,255,255,0.1)"}`,
                          color: "#fff",
                          boxShadow: digit ? "0 0 0 3px rgba(67,97,238,0.1)" : "none",
                          caretColor: "transparent",
                        }}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm overflow-hidden mb-3"
                        style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }}
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Resend success */}
                  <AnimatePresence>
                    {resendMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm overflow-hidden mb-3"
                        style={{ background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.22)", color: "#4ade80" }}
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-px" />
                        <span>{resendMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading || otp.some((d) => !d)}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #4361ee 0%, #3a86ff 60%, #0ea5e9 100%)",
                      boxShadow: "0 8px 28px rgba(67,97,238,0.45)",
                      opacity: loading || otp.some((d) => !d) ? 0.6 : 1,
                      cursor: loading || otp.some((d) => !d) ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Verify & Activate Account"}
                  </motion.button>

                  {/* Resend */}
                  <div className="text-center mt-5">
                    <p className="text-xs text-muted-foreground/50 mb-1.5">Didn't receive the code?</p>
                    {canResend ? (
                      <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="flex items-center gap-1.5 mx-auto text-sm font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                        {resendLoading ? "Sending…" : "Resend Code"}
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground/40">
                        Resend available in <span className="text-primary/60 font-semibold">{countdown}s</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
