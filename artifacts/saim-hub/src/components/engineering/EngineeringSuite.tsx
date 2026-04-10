import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Layers, TrendingUp, Atom } from "lucide-react";
import UnitPro from "./UnitPro";
import MaterialFinder from "./MaterialFinder";
import FunctionPlotter from "./FunctionPlotter";
import EngineeringConstants from "./EngineeringConstants";

type Tab = "unitpro" | "materials" | "plotter" | "constants";

const tabs: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}[] = [
  {
    id: "unitpro",
    label: "Unit Pro",
    icon: ArrowLeftRight,
    description: "9 categories · Force, Torque, Energy",
    badge: "9 cats",
  },
  {
    id: "materials",
    label: "Materials",
    icon: Layers,
    description: "Properties database",
    badge: "8 materials",
  },
  {
    id: "plotter",
    label: "Graph Plotter",
    icon: TrendingUp,
    description: "2D function visualiser",
    badge: "Interactive",
  },
  {
    id: "constants",
    label: "Constants",
    icon: Atom,
    description: "Physics & engineering",
    badge: "12 constants",
  },
];

const contentVariants = {
  initial: { opacity: 0, y: 14, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.99 },
};

export default function EngineeringSuite() {
  const [activeTab, setActiveTab] = useState<Tab>("unitpro");

  const activeTabData = tabs.find(t => t.id === activeTab)!;
  const ActiveIcon = activeTabData.icon;

  return (
    <section
      id="engineering-suite"
      className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute -left-64 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(67,97,238,0.05) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-48 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center glow-blue"
            >
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-0.5"
              >
                Engineering Suite
              </motion.span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
                Professional{" "}
                <span className="gradient-text-blue">Engineering Tools</span>
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl ml-[60px] leading-relaxed">
            Precision tools for engineers and students — unit conversion, material science,
            function plotting, and fundamental constants.
          </p>
          <div className="section-divider w-48 mt-5 ml-[60px]" />
        </motion.div>

        {/* ── Tab Navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-5"
        >
          {/* Scrollable tab row on mobile */}
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.18 + i * 0.07 }}
                    whileHover={{
                      y: -2,
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left overflow-hidden transition-colors duration-200 ${
                      isActive
                        ? "border-primary/40"
                        : "glass-card hover:border-primary/20"
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(67,97,238,0.18) 0%, rgba(14,165,233,0.08) 100%)",
                            boxShadow:
                              "0 0 24px rgba(67,97,238,0.18), 0 4px 16px rgba(0,0,0,0.2)",
                          }
                        : {}
                    }
                    data-testid={`tab-eng-${tab.id}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="eng-tab-active"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(67,97,238,0.10) 0%, rgba(14,165,233,0.04) 100%)",
                        }}
                        transition={{ type: "spring", stiffness: 280, damping: 28 }}
                      />
                    )}
                    <div
                      className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isActive ? "bg-primary/30" : "bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors duration-200 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="relative min-w-0">
                      <div
                        className={`text-sm font-semibold transition-colors duration-200 ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div className="text-xs text-muted-foreground/60 leading-tight hidden sm:block">
                        {tab.description}
                      </div>
                    </div>
                    {tab.badge && (
                      <div
                        className="relative ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 leading-none hidden lg:block"
                        style={{
                          background: isActive ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.05)",
                          borderColor: isActive ? "rgba(67,97,238,0.3)" : "rgba(255,255,255,0.08)",
                          color: isActive ? "rgba(147,197,253,1)" : "rgba(148,163,184,0.6)",
                        }}
                      >
                        {tab.badge}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Tool Content Panel ── */}
        <div
          className="rounded-3xl p-5 sm:p-7"
          style={{
            background: "rgba(10,16,40,0.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 2px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <ActiveIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{activeTabData.label}</h3>
              <p className="text-xs text-muted-foreground">{activeTabData.description}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground/40 font-mono hidden sm:block">
              Engineering Suite · {activeTabData.label}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === "unitpro"   && <UnitPro />}
              {activeTab === "materials" && <MaterialFinder />}
              {activeTab === "plotter"   && <FunctionPlotter />}
              {activeTab === "constants" && <EngineeringConstants />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
