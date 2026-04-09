import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Type, Hash } from "lucide-react";
import WordToPDF from "./WordToPDF";
import CaseConverter from "./CaseConverter";
import CharacterCounter from "./CharacterCounter";

type Tool = "pdf" | "case" | "counter";

const tools: { id: Tool; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "pdf", label: "Word to PDF", icon: FileText, description: "Drag-and-drop conversion" },
  { id: "case", label: "Case Converter", icon: Type, description: "Text transformation" },
  { id: "counter", label: "Character Counter", icon: Hash, description: "Stats & keyword density" },
];

export default function ContentPowerhouse() {
  const [activeTool, setActiveTool] = useState<Tool>("pdf");

  return (
    <section id="content-powerhouse" className="py-24 px-4 sm:px-6 lg:px-8">
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Content Tools</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Content{" "}
                <span style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Powerhouse
                </span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Professional text tools for writers, developers, and content creators. Fast, accurate, and always at hand.
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
                  ? "bg-amber-500/10 border-amber-500/40 shadow-lg"
                  : "glass-card hover:border-amber-500/20"
              }`}
              data-testid={`btn-content-tool-${tool.id}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTool === tool.id ? "bg-amber-500/20" : "bg-white/5"
              }`}>
                <tool.icon className={`w-4 h-4 ${activeTool === tool.id ? "text-amber-400" : "text-muted-foreground"}`} />
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
          {activeTool === "pdf" && <WordToPDF />}
          {activeTool === "case" && <CaseConverter />}
          {activeTool === "counter" && <CharacterCounter />}
        </motion.div>
      </div>
    </section>
  );
}
