import { useState } from "react";
import { motion } from "framer-motion";
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
    <section id="academic-hub" className="py-24 px-4 sm:px-6 lg:px-8 section-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Academic Hub</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Your Academic{" "}
                <span style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Command Center
                </span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Everything you need for international academic success — from study guides to application tracking.
          </p>
        </motion.div>

        {/* Tool Selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left ${
                activeTool === tool.id
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg"
                  : "glass-card hover:border-emerald-500/20"
              }`}
              data-testid={`btn-academic-tool-${tool.id}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTool === tool.id ? "bg-emerald-500/20" : "bg-white/5"
              }`}>
                <tool.icon className={`w-4 h-4 ${activeTool === tool.id ? "text-emerald-400" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className={`text-sm font-semibold ${activeTool === tool.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {tool.label}
                </div>
                <div className="text-xs text-muted-foreground">{tool.description}</div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Tool Content */}
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          {activeTool === "study" && <StudyGuides />}
          {activeTool === "cgpa" && <CGPAConverter />}
          {activeTool === "tracker" && <UniversityTracker />}
        </motion.div>
      </div>
    </section>
  );
}
