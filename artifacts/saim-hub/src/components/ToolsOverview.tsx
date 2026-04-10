import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { toolsData } from "@/data/toolsData";
import ToolCard from "./ToolCard";

type Category = "All" | "Engineering" | "Academic" | "Content" | "News";
const categories: Category[] = ["All", "Engineering", "Academic", "Content", "News"];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function ToolsOverview() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = activeCategory === "All"
    ? toolsData
    : toolsData.filter((t) => t.category === activeCategory);

  return (
    <section id="tools-overview" className="py-28 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle radial glow behind section */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,97,238,0.04) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.25em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4 block"
          >
            Platform Tools
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-display">
            Everything You Need,{" "}
            <span className="gradient-text-blue">In One Place</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            A comprehensive suite of precision tools built for professionals. No bloat, no fluff — just results.
          </p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="section-divider w-64 mx-auto mt-6"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                color: activeCategory === cat ? "hsl(var(--primary-foreground))" : undefined,
              }}
              data-testid={`tab-category-${cat.toLowerCase()}`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="active-category-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 16px rgba(67,97,238,0.4), 0 4px 12px rgba(67,97,238,0.25)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {activeCategory !== cat && (
                <span className="absolute inset-0 rounded-full bg-white/5 border border-white/10 hover:bg-white/10" />
              )}
              <span className={`relative z-10 ${activeCategory !== cat ? "text-muted-foreground hover:text-foreground" : ""} transition-colors`}>
                {cat}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tools Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((tool, i) => (
              <ToolCard key={tool.id} {...tool} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
