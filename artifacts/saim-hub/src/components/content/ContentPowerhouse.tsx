import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Layers, Zap } from "lucide-react";

const FileConversionEngine = lazy(() => import("./FileConversionEngine"));
const ContentAnalyzer      = lazy(() => import("./ContentAnalyzer"));

type Tool = "converter" | "analyzer";

const tools: { id: Tool; label: string; icon: React.ComponentType<{ className?: string }>; description: string; badge: string }[] = [
  { id: "converter", label: "File Converter",    icon: FileText, description: "Word, PDF, Image, Text — universal conversion", badge: "4 formats" },
  { id: "analyzer",  label: "Content Analyzer",  icon: Layers,   description: "Case transform · Stats · Keyword density",     badge: "Pro Suite" },
];

export default function ContentPowerhouse() {
  const [activeTool, setActiveTool] = useState<Tool>("converter");

  return (
    <section id="content-powerhouse" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -left-48 bottom-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)" }}
      />
      <div className="absolute right-0 top-1/4 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)" }}
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
              className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 20px rgba(245,158,11,0.25)" }}
            >
              <Zap className="w-5 h-5 text-amber-400" />
            </motion.div>
            <div className="text-left">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs font-semibold text-amber-400 tracking-[0.2em] uppercase block mb-0.5"
              >
                Content Powerhouse · Writers & SEO Professionals
              </motion.span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-display">
                Content{" "}
                <span style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Powerhouse
                </span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Professional-grade tools for writers, SEO experts, and students. Convert files, analyze content,
            and optimize text — all in a distraction-free environment.
          </p>
          <div className="w-48 h-px mt-6 mx-auto rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), rgba(251,191,36,0.2), transparent)" }}
          />
        </motion.div>

        {/* ── Tool Selector ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5"
        >
          {tools.map((tool, i) => (
            <motion.button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-colors duration-200 text-left overflow-hidden ${
                activeTool === tool.id
                  ? "border-amber-500/45"
                  : "glass-card hover:border-amber-500/22"
              }`}
              style={activeTool === tool.id ? {
                background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.05) 100%)",
                boxShadow: "0 0 24px rgba(245,158,11,0.12)",
              } : {}}
              data-testid={`btn-content-tool-${tool.id}`}
            >
              {activeTool === tool.id && (
                <motion.div
                  layoutId="content-active-bg"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "rgba(245,158,11,0.06)" }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                />
              )}
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                activeTool === tool.id ? "bg-amber-500/25" : "bg-white/5"
              }`}>
                <tool.icon className={`w-5 h-5 transition-colors duration-200 ${
                  activeTool === tool.id ? "text-amber-400" : "text-muted-foreground"
                }`} />
              </div>
              <div className="relative flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-bold transition-colors duration-200 ${
                    activeTool === tool.id ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {tool.label}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                    activeTool === tool.id
                      ? "text-amber-300 bg-amber-500/15 border-amber-500/25"
                      : "text-muted-foreground/50 bg-white/5 border-white/8"
                  }`}>
                    {tool.badge}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/70">{tool.description}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Tool Content Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: "rgba(10,16,40,0.55)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 2px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6 pb-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                {activeTool === "converter"
                  ? <FileText className="w-4 h-4 text-amber-400" />
                  : <Layers className="w-4 h-4 text-amber-400" />
                }
                <span className="text-sm font-bold text-foreground">
                  {activeTool === "converter" ? "File Conversion Engine" : "Advanced Content Analyzer"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground/40 font-mono hidden sm:block">
                Content Powerhouse · {activeTool === "converter" ? "Universal Converter" : "Pro Text Suite"}
              </span>
            </div>

            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-7 h-7 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              </div>
            }>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool}
                  initial={{ opacity: 0, y: 14, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeTool === "converter" && <FileConversionEngine />}
                  {activeTool === "analyzer"  && <ContentAnalyzer />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
