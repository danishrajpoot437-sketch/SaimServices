import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

export default function NotFound() {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || "/";

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(67,97,238,0.18) 0%, transparent 70%)" }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-md w-full text-center"
      >
        <div className="rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(10, 16, 40, 0.7)",
            border: "1px solid rgba(67,97,238,0.25)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(67,97,238,0.25) 0%, rgba(14,165,233,0.15) 100%)",
              border: "1px solid rgba(67,97,238,0.4)",
              boxShadow: "0 0 32px rgba(67,97,238,0.3)",
            }}
          >
            <Compass className="w-9 h-9 text-primary" />
          </motion.div>

          <h1 className="text-7xl font-bold font-display mb-2 shimmer-text">404</h1>
          <h2 className="text-xl font-bold text-foreground mb-3">Page Not Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            The page you're looking for doesn't exist or may have moved.
            Let's get you back to the tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link href="/"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ boxShadow: "0 0 20px rgba(67,97,238,0.4)" }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/8">
            <p className="text-xs text-muted-foreground mb-3">Or jump straight to:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Engineering Suite", href: `${base}/#engineering-suite` },
                { label: "Academic Hub", href: `${base}/#academic-hub` },
                { label: "Blog", href: `${base}/blog` },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/40 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
