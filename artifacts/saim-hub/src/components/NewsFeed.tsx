import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { newsData } from "@/data/newsData";
import NewsCard from "./NewsCard";
import type { NewsItem } from "@/data/newsData";

type Category = "All" | "AI" | "Tech" | "Education";
const categories: Category[] = ["All", "AI", "Tech", "Education"];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function NewsFeed() {
  const [active, setActive] = useState<Category>("All");

  const filtered: NewsItem[] = active === "All" ? newsData : newsData.filter((n) => n.category === active);

  return (
    <section id="news-feed" className="py-28 px-4 sm:px-6 lg:px-8 section-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 100% 0%, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.15em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.25em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4 block"
          >
            Curated News
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-display">
            Stay Ahead with{" "}
            <span className="gradient-text-blue">Expert Curation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            AI, Technology, and Education news handpicked for engineers, students, and researchers.
          </p>
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
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActive(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-5 py-2 rounded-full text-sm font-medium"
              data-testid={`tab-news-${cat.toLowerCase()}`}
            >
              {active === cat && (
                <motion.div
                  layoutId="active-news-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 16px rgba(67,97,238,0.4)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {active !== cat && (
                <span className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
              )}
              <span className={`relative z-10 transition-colors ${active === cat ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* News Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((item, i) => (
              <NewsCard key={item.id} {...item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
