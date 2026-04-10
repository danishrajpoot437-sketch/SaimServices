import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Search, X, Mail, ArrowRight, Bookmark, Rss } from "lucide-react";
import { newsData } from "@/data/newsData";
import NewsCard from "./NewsCard";
import ArticleModal from "./ArticleModal";
import type { NewsItem, NewsCategory } from "@/data/newsData";

type FilterCategory = "All" | NewsCategory;
const categories: FilterCategory[] = ["All", "AI", "Tech", "Engineering", "Scholarships", "Education"];

const BOOKMARK_KEY = "saimservices_bookmarks";

function loadBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? new Set<number>(JSON.parse(raw)) : new Set<number>();
  } catch {
    return new Set<number>();
  }
}

function saveBookmarks(set: Set<number>) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...set]));
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function NewsFeed() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState<NewsItem | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => loadBookmarks());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => {
    let result = activeCategory === "All" ? newsData : newsData.filter((n) => n.category === activeCategory);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.subheading.toLowerCase().includes(q));
    return result;
  }, [activeCategory, search]);

  const handleToggleBookmark = useCallback((id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <section id="news-feed" className="py-28 px-4 sm:px-6 lg:px-8 section-bg relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[700px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 100% 0%, rgba(139,92,246,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 0% 100%, rgba(67,97,238,0.06) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.15em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.25em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4 block"
          >
            Expert Curation
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-display">
            Stay Ahead with{" "}
            <span className="gradient-text-blue">Expert Curation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            AI, Technology, Engineering, and Scholarship news — handpicked for engineers, students, and researchers.
          </p>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="section-divider w-64 mx-auto mt-6"
          />
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="max-w-lg mx-auto mb-8"
        >
          <motion.div
            animate={{
              boxShadow: searchFocused
                ? "0 0 0 2px rgba(67,97,238,0.5), 0 4px 24px rgba(67,97,238,0.12)"
                : "0 0 0 1px rgba(255,255,255,0.08)",
            }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search articles, topics…"
              className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-foreground placeholder-muted-foreground outline-none"
              data-testid="input-news-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="btn-search-clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Category Chips */}
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
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-5 py-2 rounded-full text-sm font-medium"
              data-testid={`tab-news-${cat.toLowerCase()}`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="active-news-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 16px rgba(67,97,238,0.4)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {activeCategory !== cat && (
                <span className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
              )}
              <span className={`relative z-10 transition-colors ${activeCategory === cat ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted-foreground">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
          {bookmarks.size > 0 && (
            <button
              onClick={() => { setActiveCategory("All"); setSearch(""); }}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {bookmarks.size} saved
            </button>
          )}
        </div>

        {/* News Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-muted-foreground"
              data-testid="news-empty"
            >
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base">No articles found for <strong className="text-foreground">"{search}"</strong></p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${search}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((item) => (
                <NewsCard
                  key={item.id}
                  {...item}
                  bookmarked={bookmarks.has(item.id)}
                  onOpenArticle={setOpenArticle}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter Opt-in */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(67,97,238,0.1) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(67,97,238,0.2)",
          }}
          data-testid="newsletter-section"
        >
          {/* Glow orb */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(67,97,238,0.12) 0%, transparent 70%)" }} />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 mb-5">
              <Rss className="w-5 h-5 text-primary" />
            </div>

            <h3 className="text-2xl font-bold text-foreground font-display mb-2">
              Stay Updated
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Get the week's best AI, engineering, and scholarship stories delivered to your inbox every Friday.
            </p>

            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold"
                  data-testid="newsletter-success"
                >
                  <Mail className="w-4 h-4" />
                  You're subscribed! Watch for the Friday digest.
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  data-testid="newsletter-form"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(67,97,238,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(67,97,238,0.15)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                    data-testid="input-newsletter-email"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold whitespace-nowrap transition-all hover:bg-primary/90"
                    style={{ boxShadow: "0 0 20px rgba(67,97,238,0.35)" }}
                    data-testid="btn-newsletter-subscribe"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime. Powered by SaimServices.</p>
          </div>
        </motion.div>
      </div>

      {/* Article Modal */}
      <ArticleModal
        article={openArticle}
        onClose={() => setOpenArticle(null)}
        bookmarked={openArticle ? bookmarks.has(openArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </section>
  );
}
