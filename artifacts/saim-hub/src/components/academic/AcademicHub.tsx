import { useState, lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Calculator, Building2, Quote, Search } from "lucide-react";

const StudyGuides        = lazy(() => import("./StudyGuides"));
const GPAConverter       = lazy(() => import("./GPAConverter"));
const UniversityTracker  = lazy(() => import("./UniversityTracker"));
const ResourceCenter     = lazy(() => import("./ResourceCenter"));
const CitationGenerator  = lazy(() => import("./CitationGenerator"));
const ResearchFinder     = lazy(() => import("./ResearchFinder"));

type Tool = "study" | "gpa" | "tracker" | "citations" | "research";

const tools: {
  id: Tool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isNew?: boolean;
}[] = [
  { id: "study",     label: "Study Guides",  icon: BookOpen,     description: "USA & UK · Scholarships · Deadlines" },
  { id: "gpa",       label: "GPA Converter", icon: Calculator,   description: "USA 4.0 · UK Honours system" },
  { id: "tracker",   label: "Uni Tracker",   icon: Building2,    description: "Application management" },
  { id: "citations", label: "Citations",     icon: Quote,        description: "APA · MLA · Harvard · Chicago · Vancouver", isNew: true },
  { id: "research",  label: "Research",      icon: Search,       description: "arXiv · PubMed · 200M+ papers", isNew: true },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
    </div>
  );
}

export default function AcademicHub() {
  const [activeTool, setActiveTool] = useState<Tool>("study");

  // Listen for tab-switch events dispatched by the Navbar dropdown
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ section: string; tab: string }>).detail;
      if (detail.section === "academic-hub") {
        setActiveTool(detail.tab as Tool);
      }
    };
    window.addEventListener("saim-section-tab", handler);
    return () => window.removeEventListener("saim-section-tab", handler);
  }, []);

  return (
    <section id="academic-hub" className="py-28 px-4 sm:px-6 lg:px-8 section-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -right-64 top-1/3 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.055) 0%, transparent 70%)" }}
      />
      <div className="absolute -left-48 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.03) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}
            >
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div className="text-left">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase block mb-0.5"
              >
                Academic Hub · USA & UK Focused
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-display">
                Your Academic{" "}
                <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Command Center
                </span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Precision tools for US & UK academic success — GPA conversion, study guides, scholarships,
            free citation generator, and a 200M+ paper research search engine.
          </p>
          <div className="w-48 h-px mt-6 mx-auto rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(52,211,153,0.2), transparent)" }}
          />
        </motion.div>

        {/* ── Tool Selector ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="overflow-x-auto pb-1 -mx-1 px-1 mb-5"
        >
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:grid sm:grid-cols-5">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2.5 p-3.5 rounded-2xl border transition-colors duration-200 text-left overflow-hidden ${
                  activeTool === tool.id
                    ? "border-emerald-500/40"
                    : "glass-card hover:border-emerald-500/20"
                }`}
                data-testid={`btn-academic-tool-${tool.id}`}
              >
                {activeTool === tool.id && (
                  <motion.div
                    layoutId="academic-active-bg"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(52,211,153,0.06) 100%)",
                      boxShadow: "0 0 20px rgba(16,185,129,0.1) inset",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  activeTool === tool.id ? "bg-emerald-500/25" : "bg-white/5"
                }`}>
                  <tool.icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    activeTool === tool.id ? "text-emerald-400" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="relative min-w-0 flex-1">
                  <div className={`text-xs font-semibold transition-colors duration-200 flex items-center gap-1 ${
                    activeTool === tool.id ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {tool.label}
                    {tool.isNew && (
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(16,185,129,0.2)", color: "#4ade80", border: "1px solid rgba(16,185,129,0.3)" }}
                      >NEW</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5 truncate">{tool.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Tool Content Panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl p-6 sm:p-8"
            style={{ boxShadow: "0 2px 0 rgba(255,255,255,0.05) inset, 0 20px 60px rgba(0,0,0,0.25)" }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {activeTool === "study"     && <StudyGuides />}
              {activeTool === "gpa"       && <GPAConverter />}
              {activeTool === "tracker"   && <UniversityTracker />}
              {activeTool === "citations" && <CitationGenerator />}
              {activeTool === "research"  && <ResearchFinder />}
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* ── Official Resource Center (always visible below) ── */}
        <Suspense fallback={null}>
          <ResourceCenter />
        </Suspense>
      </div>
    </section>
  );
}
