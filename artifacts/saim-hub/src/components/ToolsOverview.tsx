import { useState } from "react";
import { motion } from "framer-motion";
import { toolsData } from "@/data/toolsData";
import ToolCard from "./ToolCard";

type Category = "All" | "Engineering" | "Academic" | "Content" | "News";
const categories: Category[] = ["All", "Engineering", "Academic", "Content", "News"];

export default function ToolsOverview() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = activeCategory === "All"
    ? toolsData
    : toolsData.filter((t) => t.category === activeCategory);

  return (
    <section id="tools-overview" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-primary tracking-widest uppercase mb-3 block">Platform Tools</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need,{" "}
            <span className="gradient-text-blue">In One Place</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A comprehensive suite of precision tools built for professionals. No bloat, no fluff — just results.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
              }`}
              data-testid={`tab-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} {...tool} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
