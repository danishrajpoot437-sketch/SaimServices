import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Calculator, BookOpen, FileText } from "lucide-react";
import { toolsData } from "@/data/toolsData";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof toolsData>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    { label: "Tools Available", value: "10+" },
    { label: "Engineering Tools", value: "3" },
    { label: "Academic Tools", value: "3" },
    { label: "Users Worldwide", value: "10K+" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4361ee 0%, transparent 70%)" }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
          animate={{ x: [0, -25, 15, 0], y: [0, 20, -25, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-60 h-60 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
          animate={{ x: [0, 20, -10, 0], y: [0, -30, 10, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(67,97,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(67,97,238,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Professional Utility Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Empowering Global</span>
          <br />
          <span className="gradient-text">Minds with</span>
          <br />
          <span className="text-foreground">Precision Tools</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The professional ecosystem for engineers, students, and researchers.
          Built for those who demand precision, speed, and elegance.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="relative max-w-2xl mx-auto mb-16"
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300"
            style={{
              background: "rgba(15, 52, 96, 0.4)",
              backdropFilter: "blur(16px)",
              borderColor: focused ? "rgba(67, 97, 238, 0.6)" : "rgba(255, 255, 255, 0.08)",
              boxShadow: focused ? "0 0 0 3px rgba(67, 97, 238, 0.15), 0 8px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search tools — calculator, converter, tracker..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
              data-testid="input-hero-search"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {results.length > 0 && focused && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-2xl border overflow-hidden z-50"
                style={{
                  background: "rgba(22, 33, 62, 0.97)",
                  backdropFilter: "blur(20px)",
                  borderColor: "rgba(67, 97, 238, 0.3)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                }}
              >
                {results.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleToolClick(tool.sectionId)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                    data-testid={`search-result-${tool.id}`}
                  >
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                      {tool.category}
                    </span>
                    <span className="text-sm font-medium text-foreground">{tool.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Access Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-wrap justify-center gap-3 mb-20"
        >
          {[
            { label: "Scientific Calculator", icon: Calculator, section: "engineering-suite" },
            { label: "Study Guides", icon: BookOpen, section: "academic-hub" },
            { label: "Case Converter", icon: FileText, section: "content-powerhouse" },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                const el = document.getElementById(chip.section);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
              data-testid={`chip-${chip.section}`}
            >
              <chip.icon className="w-3.5 h-3.5" />
              {chip.label}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text-blue mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
