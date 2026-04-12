import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { Search, ArrowRight, Calculator, BookOpen, FileText, ChevronDown, Sparkles, CheckCircle2, X as XClose } from "lucide-react";
import { toolsData } from "@/data/toolsData";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const DISCOVERY_ITEMS = [
  { icon: "✅", label: "Solve Quadratic & Linear Equations" },
  { icon: "✅", label: "Calculate Beam Deflection & SFD" },
  { icon: "✅", label: "Balance Chemical Reactions" },
  { icon: "✅", label: "Plot 2D/3D Function Graphs" },
  { icon: "✅", label: "Convert Units Across 9 Categories" },
  { icon: "✅", label: "Generate Citations (APA/MLA/Harvard)" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof toolsData>([]);
  const [focused, setFocused] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const discoveryRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], isMobile ? [0, 0] : [0, -80]);

  useEffect(() => {
    if (!discoveryOpen) return;
    const handler = (e: MouseEvent) => {
      if (discoveryRef.current && !discoveryRef.current.contains(e.target as Node)) {
        setDiscoveryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [discoveryOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      setResults(
        toolsData.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        )
      );
    } else {
      setResults([]);
    }
  }, [query]);

  const handleToolClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setQuery("");
    setFocused(false);
  };

  const stats = [
    { label: "Tools Available", value: "20+", color: "#4361ee" },
    { label: "Engineering Tools", value: "10", color: "#0ea5e9" },
    { label: "Academic Tools", value: "5", color: "#8b5cf6" },
    { label: "Users Worldwide", value: "50K+", color: "#f59e0b" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* ── Animated Background ── */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: parallaxY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

        {/* Orb 1 — primary blue */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(67,97,238,0.22) 0%, transparent 70%)" }}
          animate={{ x: [0, 35, -25, 0], y: [0, -25, 35, 0], scale: [1, 1.12, 0.93, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orb 2 — sky blue */}
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)" }}
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -30, 0], scale: [1, 0.88, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Orb 3 — gold */}
        <motion.div
          className="absolute top-1/2 right-1/3 w-[280px] h-[280px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)" }}
          animate={{ x: [0, 22, -12, 0], y: [0, -35, 12, 0], scale: [1, 1.18, 0.88, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        {/* Orb 4 — purple accent */}
        <motion.div
          className="absolute top-3/4 left-1/6 w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
          animate={{ x: [0, 18, -8, 0], y: [0, -20, 18, 0], scale: [1, 1.1, 0.92, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />

        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(67,97,238,0.8) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />

        {/* Top glow ring */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.5), rgba(14,165,233,0.6), rgba(67,97,238,0.5), transparent)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(67,97,238,0.08) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* ── Desktop Side Decorations (xl+) ── */}
      <div className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col gap-4 pl-8 pointer-events-none z-10">
        {[
          { label: "Unit Conversions", value: "9 categories", color: "rgba(67,97,238,0.6)" },
          { label: "Elements", value: "118 in table", color: "rgba(16,185,129,0.6)" },
          { label: "Math Solver", value: "Symbolic AI", color: "rgba(139,92,246,0.6)" },
        ].map(({ label, value, color }) => (
          <motion.div key={label}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(10,16,40,0.55)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <div>
              <div className="text-[10px] text-muted-foreground leading-none mb-0.5">{label}</div>
              <div className="text-xs font-bold text-foreground">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 pr-8 pointer-events-none z-10">
        {[
          { label: "Stat Suite", value: "Descriptive + Regression", color: "rgba(251,191,36,0.6)" },
          { label: "Beam Analyst", value: "SFD · BMD · Deflection", color: "rgba(14,165,233,0.6)" },
          { label: "Dev Kit", value: "JSON · Hash · Regex", color: "rgba(251,146,60,0.6)" },
        ].map(({ label, value, color }) => (
          <motion.div key={label}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(10,16,40,0.55)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            <div>
              <div className="text-[10px] text-muted-foreground leading-none mb-0.5 text-right">{label}</div>
              <div className="text-xs font-bold text-foreground text-right">{value}</div>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          </motion.div>
        ))}
      </div>

      {/* ── Hero Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-sm font-medium"
              style={{ boxShadow: "0 0 20px rgba(67,97,238,0.15), 0 1px 0 rgba(255,255,255,0.06) inset" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Professional Utility Platform
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 font-display leading-[1.08]"
          >
            <span className="text-foreground">Empowering Global</span>
            <br />
            <span className="shimmer-text">Minds with</span>
            <br />
            <span className="text-foreground">Precision Tools</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The professional ecosystem for engineers, students, and researchers.{" "}
            <br className="hidden sm:block" />
            Built for those who demand precision, speed, and elegance.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <motion.div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-colors duration-300"
              animate={{
                borderColor: focused ? "rgba(67,97,238,0.65)" : "rgba(255,255,255,0.09)",
                boxShadow: focused
                  ? "0 0 0 4px rgba(67,97,238,0.12), 0 12px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset"
                  : "0 4px 24px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.04) inset",
              }}
              style={{
                background: "rgba(12, 40, 78, 0.55)",
                backdropFilter: "blur(20px)",
              }}
            >
              <motion.div animate={{ rotate: focused ? 0 : 0 }}>
                <Search className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${focused ? "text-primary" : "text-muted-foreground"}`} />
              </motion.div>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                placeholder="Search tools — calculator, converter, tracker..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-base outline-none"
                data-testid="input-hero-search"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setQuery("")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-clear-search"
                  >
                    <XIcon className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {results.length > 0 && focused && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full mt-2 left-0 right-0 rounded-2xl border overflow-hidden z-50"
                  style={{
                    background: "rgba(18, 28, 58, 0.98)",
                    backdropFilter: "blur(24px)",
                    borderColor: "rgba(67, 97, 238, 0.3)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
                  }}
                >
                  {results.map((tool, i) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      onClick={() => handleToolClick(tool.sectionId)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left border-b border-white/4 last:border-0 group"
                      data-testid={`search-result-${tool.id}`}
                    >
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/15 text-primary border border-primary/20">
                        {tool.category}
                      </span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform duration-150" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Discovery Badge ── */}
          <motion.div variants={itemVariants} className="flex justify-center mb-7">
            <div className="relative" ref={discoveryRef}>
              <motion.button
                onClick={() => setDiscoveryOpen((o) => !o)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(67,97,238,0.18) 0%, rgba(14,165,233,0.12) 100%)",
                  border: "1px solid rgba(67,97,238,0.35)",
                  color: "#7ba3ff",
                  boxShadow: discoveryOpen
                    ? "0 0 28px rgba(67,97,238,0.3), 0 4px 16px rgba(0,0,0,0.2)"
                    : "0 0 16px rgba(67,97,238,0.15)",
                }}
                data-testid="btn-discovery"
              >
                <motion.span
                  animate={{ rotate: discoveryOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.span>
                What can I solve today?
                <motion.span
                  animate={{ rotate: discoveryOpen ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>

              {/* Discovery dropdown */}
              <AnimatePresence>
                {discoveryOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                    style={{
                      background: "rgba(10, 16, 46, 0.98)",
                      border: "1px solid rgba(67,97,238,0.3)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
                    }}
                  >
                    {/* Top glow */}
                    <div className="h-px w-full"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.6), rgba(14,165,233,0.5), transparent)" }} />

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">
                          Today you can…
                        </p>
                        <button
                          onClick={() => setDiscoveryOpen(false)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                        >
                          <XClose className="w-3 h-3" />
                        </button>
                      </div>

                      <ul className="space-y-1">
                        {DISCOVERY_ITEMS.map((item, i) => (
                          <motion.li
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
                          >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {item.label}
                            </span>
                          </motion.li>
                        ))}
                      </ul>

                      <div className="mt-3 pt-3 border-t border-white/6">
                        <p className="text-[10px] text-muted-foreground/50 text-center">
                          All tools are free · No account required
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Access Chips */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-2.5 mb-20"
          >
            {[
              { label: "Scientific Calculator", icon: Calculator, section: "engineering-suite" },
              { label: "Study Guides", icon: BookOpen, section: "academic-hub" },
              { label: "Case Converter", icon: FileText, section: "content-powerhouse" },
            ].map((chip) => (
              <motion.button
                key={chip.label}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const el = document.getElementById(chip.section);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/4 hover:bg-primary/10 hover:border-primary/35 text-sm text-muted-foreground hover:text-primary transition-all duration-200"
                style={{ backdropFilter: "blur(8px)" }}
                data-testid={`chip-${chip.section}`}
              >
                <chip.icon className="w-3.5 h-3.5" />
                {chip.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.06, y: -2 }}
                className="relative text-center group cursor-default px-3 py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${stat.color}28`,
                  boxShadow: `0 0 24px ${stat.color}0a`,
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
                <div
                  className="text-3xl font-bold mb-1 transition-transform duration-200"
                  style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium tracking-wide leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-16 flex flex-col items-center gap-1.5 text-muted-foreground/40"
        >
          <span className="text-xs tracking-widest uppercase font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(231,44%,8%))" }}
      />
    </section>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
