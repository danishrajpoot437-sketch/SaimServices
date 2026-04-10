import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Hash, Building2 } from "lucide-react";
import StudyGuides from "./StudyGuides";
import CGPAConverter from "./CGPAConverter";
import UniversityTracker from "./UniversityTracker";

type Tool = "study" | "cgpa" | "tracker";

const tools: { id: Tool; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "study", label: "Study Guides", icon: BookOpen, description: "USA, Europe, Scholarships, Visa" },
  { id: "cgpa", label: "CGPA Converter", icon: Hash, description: "Multi-system grade conversion" },
  { id: "tracker", label: "University Tracker", icon: Building2, description: "Application management" },
];

export default function AcademicHub() {
  const [activeTool, setActiveTool] = useState<Tool>("study");

  return (
    <section id="academic-hub" className="py-28 px-4 sm:px-6 lg:px-8 section-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -right-64 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center glow-emerald"
            >
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase block mb-0.5"
              >
                Academic Hub
              </motion.span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
                Your Academic{" "}
                <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Command Center
                </span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl ml-[60px] leading-relaxed">
            Everything you need for international academic success — from study guides to application tracking.
          </p>
          <div className="w-48 h-px mt-6 ml-[60px] rounded-full"
            style={{ background: "linear-gradient(90deg, rgba(52,211,153,0.5), rgba(16,185,129,0.2), transparent)" }}
          />
        </motion.div>

        {/* Tool Selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          {tools.map((tool, i) => (
            <motion.button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-colors duration-200 text-left overflow-hidden ${
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
                    background: "linear-gradient(135deg, rgba(52,211,153,0.14) 0%, rgba(16,185,129,0.06) 100%)",
                    boxShadow: "0 0 20px rgba(52,211,153,0.12) inset",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                activeTool === tool.id ? "bg-emerald-500/25" : "bg-white/5"
              }`}>
                <tool.icon className={`w-4 h-4 transition-colors duration-200 ${activeTool === tool.id ? "text-emerald-400" : "text-muted-foreground"}`} />
              </div>
              <div className="relative">
                <div className={`text-sm font-semibold transition-colors duration-200 ${activeTool === tool.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {tool.label}
                </div>
                <div className="text-xs text-muted-foreground">{tool.description}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Tool Content */}
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
            {activeTool === "study" && <StudyGuides />}
            {activeTool === "cgpa" && <CGPAConverter />}
            {activeTool === "tracker" && <UniversityTracker />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
