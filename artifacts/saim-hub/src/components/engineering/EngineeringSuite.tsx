import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Layers, TrendingUp, Atom,
  Sigma, FlaskConical, Maximize2, Minimize2,
  History, X, Zap, Clock, ChevronRight,
} from "lucide-react";
import UnitPro from "./UnitPro";
import MaterialFinder from "./MaterialFinder";
import FunctionPlotter from "./FunctionPlotter";
import EngineeringConstants from "./EngineeringConstants";
import MathSolver, { type HistoryEntry } from "./MathSolver";
import GraphLab from "./GraphLab";
import PeriodicTable from "./PeriodicTable";

type Tab = "unitpro" | "materials" | "plotter" | "constants" | "mathsolver" | "graphlab" | "periodic";
type EngineStatus = "idle" | "computing" | "done" | "error";

const HISTORY_KEY = "saimservices_eng_history";

const tabs: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  isNew?: boolean;
  color?: string;
}[] = [
  { id: "unitpro",     label: "Unit Pro",      icon: ArrowLeftRight, description: "9 unit categories",    badge: "9 cats" },
  { id: "materials",   label: "Materials",     icon: Layers,         description: "Properties database",  badge: "8 mats" },
  { id: "plotter",     label: "Plotter",       icon: TrendingUp,     description: "2D function graph",    badge: "2D" },
  { id: "constants",   label: "Constants",     icon: Atom,           description: "Physics constants",    badge: "12" },
  { id: "mathsolver",  label: "Math Solver",   icon: Sigma,          description: "Symbolic computation", badge: "NEW", isNew: true, color: "rgba(67,97,238,1)" },
  { id: "graphlab",    label: "Graph Lab",     icon: TrendingUp,     description: "Multi-function plots", badge: "NEW", isNew: true, color: "rgba(16,185,129,1)" },
  { id: "periodic",    label: "Chem Table",    icon: FlaskConical,   description: "118 elements",         badge: "NEW", isNew: true, color: "rgba(245,158,11,1)" },
];

const contentVariants = {
  initial: { opacity: 0, y: 14, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.99 },
};

const STATUS_CONFIG = {
  idle:      { label: "Computational Engine Ready",  color: "rgba(67,97,238,0.8)",   dot: "bg-primary",    pulse: false },
  computing: { label: "Computing…",                  color: "rgba(251,191,36,0.9)",  dot: "bg-amber-400",  pulse: true  },
  done:      { label: "Result Ready",                color: "rgba(16,185,129,0.9)",  dot: "bg-emerald-400",pulse: true  },
  error:     { label: "Syntax Error — Check Input",  color: "rgba(239,68,68,0.9)",   dot: "bg-red-400",    pulse: false },
};

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function EngineeringSuite() {
  const [activeTab, setActiveTab] = useState<Tab>("unitpro");
  const [fullscreen, setFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 10);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleStatusChange = useCallback((s: EngineStatus) => {
    setStatus(s);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    if (s === "done" || s === "error") {
      statusTimer.current = setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  };

  // Close fullscreen on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && fullscreen) setFullscreen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen]);

  const activeTabData = tabs.find(t => t.id === activeTab)!;
  const ActiveIcon = activeTabData.icon;
  const isComputational = ["mathsolver", "graphlab"].includes(activeTab);
  const cfg = STATUS_CONFIG[status];

  const workspace = (
    <div className={`relative ${fullscreen ? "min-h-screen py-4 px-4 sm:px-8" : ""}`}>
      {/* ── Tab Navigation ── */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors duration-200 flex-shrink-0 ${
                  isActive ? "border-primary/40" : "glass-card hover:border-primary/20"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(67,97,238,0.18) 0%, rgba(14,165,233,0.08) 100%)",
                  boxShadow: "0 0 20px rgba(67,97,238,0.18), 0 4px 12px rgba(0,0,0,0.2)",
                } : {}}
                data-testid={`tab-eng-${tab.id}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isActive ? "bg-primary/30" : "bg-white/5"}`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {tab.label}
                  </div>
                </div>
                {tab.isNew && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(67,97,238,0.25)", color: "#93c5fd", border: "1px solid rgba(67,97,238,0.3)" }}
                  >NEW</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tool Content Panel ── */}
      <div
        className="rounded-3xl"
        style={{
          background: "rgba(10,16,40,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Panel header */}
        <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <ActiveIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{activeTabData.label}</h3>
            <p className="text-xs text-muted-foreground">{activeTabData.description}</p>
          </div>

          {/* Status Bar — only for computational tools */}
          <AnimatePresence>
            {isComputational && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${cfg.color.replace("0.8", "0.2").replace("0.9", "0.2")}`,
                }}
              >
                <span className="relative flex h-2 w-2">
                  {cfg.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
                </span>
                <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <Zap className="w-2.5 h-2.5" style={{ color: cfg.color }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fullscreen & History toggles */}
          <div className={`flex items-center gap-1.5 ${isComputational ? "sm:ml-2" : "ml-auto"}`}>
            {isComputational && (
              <button
                onClick={() => setShowHistory(h => !h)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                  showHistory ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                title="Toggle history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center font-bold">{history.length}</span>
                )}
              </button>
            )}
            <button
              onClick={() => setFullscreen(f => !f)}
              className="p-1.5 rounded-xl border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title={fullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
            >
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex">
          <div className="flex-1 p-5 sm:p-7 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "unitpro"    && <UnitPro />}
                {activeTab === "materials"  && <MaterialFinder />}
                {activeTab === "plotter"    && <FunctionPlotter />}
                {activeTab === "constants"  && <EngineeringConstants />}
                {activeTab === "mathsolver" && <MathSolver onHistoryPush={pushHistory} onStatusChange={handleStatusChange} />}
                {activeTab === "graphlab"   && <GraphLab  onHistoryPush={pushHistory} onStatusChange={handleStatusChange} />}
                {activeTab === "periodic"   && <PeriodicTable />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && isComputational && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden flex-shrink-0"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-[280px] p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Calculation History</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {history.length > 0 && (
                        <button onClick={clearHistory} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/5">
                          Clear
                        </button>
                      )}
                      <button onClick={() => setShowHistory(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
                      <Clock className="w-8 h-8 text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground">No calculations yet.</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Run the Math Solver or Graph Lab</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto flex-1">
                      {history.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-xl p-3 group cursor-pointer"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          whileHover={{ borderColor: "rgba(67,97,238,0.3)", background: "rgba(67,97,238,0.05)" }}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(67,97,238,0.2)", color: "#93c5fd", border: "1px solid rgba(67,97,238,0.2)" }}
                            >{entry.mode}</span>
                            <span className="text-[9px] text-muted-foreground/50 ml-auto">{timeAgo(entry.ts)}</span>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground truncate mb-1">{entry.input}</p>
                          <div className="flex items-center gap-1">
                            <ChevronRight className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                            <p className="text-[11px] font-mono text-primary truncate font-semibold">{entry.result}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] overflow-auto"
        style={{ background: "rgba(8,12,28,0.98)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Fullscreen header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs text-primary font-semibold tracking-wider uppercase">Engineering Suite</span>
                <p className="text-sm font-bold text-foreground">Fullscreen Workspace</p>
              </div>
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Exit  <kbd className="text-[9px] ml-1 opacity-50">Esc</kbd>
            </button>
          </div>
          {workspace}
        </div>
      </motion.div>
    );
  }

  return (
    <section id="engineering-suite" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -left-64 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(67,97,238,0.05) 0%, transparent 70%)" }} />
      <div className="absolute -right-48 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center glow-blue flex-shrink-0"
            >
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </motion.div>
            <div className="text-left">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-0.5"
              >
                Engineering Suite
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-display">
                Computational{" "}
                <span className="gradient-text-blue">Engineering Engine</span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            7 professional tools in one workspace — symbolic math, multi-function graphing, the full periodic table,
            unit conversion, materials science, function plotting, and engineering constants.
          </p>
          <div className="section-divider w-48 mt-5 mx-auto" />
        </motion.div>

        {workspace}
      </div>
    </section>
  );
}
