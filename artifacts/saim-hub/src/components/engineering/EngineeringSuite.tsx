import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowLeftRight, Ruler } from "lucide-react";
import CalcComponent from "./Calculator";
import UnitConverter from "./UnitConverter";
import BeamCalculator from "./BeamCalculator";

type Tool = "calculator" | "converter" | "beam";

const tools: { id: Tool; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "calculator", label: "Scientific Calculator", icon: Calculator, description: "Advanced expression evaluator" },
  { id: "converter", label: "Unit Converter", icon: ArrowLeftRight, description: "6 categories, instant conversion" },
  { id: "beam", label: "Beam Deflection", icon: Ruler, description: "Structural analysis preview" },
];

export default function EngineeringSuite() {
  const [activeTool, setActiveTool] = useState<Tool>("calculator");

  return (
    <section id="engineering-suite" className="py-24 px-4 sm:px-6 lg:px-8">
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
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">Engineering Suite</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Professional{" "}
                <span className="gradient-text-blue">Engineering Tools</span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl ml-13">
            Precision tools built for engineers and technical professionals. From expression evaluation to structural analysis.
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
                  ? "bg-primary/15 border-primary/40 shadow-lg"
                  : "glass-card hover:border-primary/20"
              }`}
              data-testid={`btn-eng-tool-${tool.id}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTool === tool.id ? "bg-primary/30" : "bg-white/5"
              }`}>
                <tool.icon className={`w-4 h-4 ${activeTool === tool.id ? "text-primary" : "text-muted-foreground"}`} />
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
          {activeTool === "calculator" && <CalcComponent />}
          {activeTool === "converter" && <UnitConverter />}
          {activeTool === "beam" && <BeamCalculator />}
        </motion.div>
      </div>
    </section>
  );
}
