import { useState } from "react";
import { motion } from "framer-motion";
import { newsData } from "@/data/newsData";
import NewsCard from "./NewsCard";
import type { NewsItem } from "@/data/newsData";

type Category = "All" | "AI" | "Tech" | "Education";
const categories: Category[] = ["All", "AI", "Tech", "Education"];

export default function NewsFeed() {
  const [active, setActive] = useState<Category>("All");

  const filtered: NewsItem[] = active === "All" ? newsData : newsData.filter((n) => n.category === active);

  return (
    <section id="news-feed" className="py-24 px-4 sm:px-6 lg:px-8 section-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-primary tracking-widest uppercase mb-3 block">Curated News</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Stay Ahead with{" "}
            <span className="gradient-text-blue">Expert Curation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI, Technology, and Education news handpicked for engineers, students, and researchers.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === cat
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
              }`}
              data-testid={`tab-news-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* News Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((item, i) => (
            <NewsCard key={item.id} {...item} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
