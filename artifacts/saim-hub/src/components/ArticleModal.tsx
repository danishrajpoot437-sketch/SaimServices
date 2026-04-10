import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { X, Bookmark, BookmarkCheck, Share2, Twitter, Linkedin, Clock, CalendarDays, User, ExternalLink, Sparkles } from "lucide-react";
import type { NewsItem, BodyBlock } from "@/data/newsData";

const categoryColors: Record<string, string> = {
  AI: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  Tech: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Engineering: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  Scholarships: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Education: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const panelVariants: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 280, damping: 32, mass: 0.9 } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function renderBody(block: BodyBlock, i: number) {
  if (block.type === "heading") {
    return (
      <h3 key={i} className="text-lg font-bold text-foreground mt-8 mb-3 font-display">
        {block.text}
      </h3>
    );
  }
  if (block.type === "bullets" && block.items) {
    return (
      <ul key={i} className="space-y-2.5 my-4">
        {block.items.map((item, j) => {
          const parts = item.split(/\*\*(.*?)\*\*/g);
          return (
            <li key={j} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>
                {parts.map((part, k) =>
                  k % 2 === 1 ? <strong key={k} className="text-foreground font-semibold">{part}</strong> : part
                )}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <p key={i} className="text-sm text-muted-foreground leading-7 my-4">
      {block.text}
    </p>
  );
}

interface ArticleModalProps {
  article: NewsItem | null;
  onClose: () => void;
  bookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

export default function ArticleModal({ article, onClose, bookmarked, onToggleBookmark }: ArticleModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (article) {
      document.body.style.overflow = "hidden";
      scrollRef.current?.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [article]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shareTwitter = (title: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&via=SaimServices&url=${encodeURIComponent("https://saimservices.com")}`, "_blank");
  };
  const shareLinkedIn = (title: string) => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://saimservices.com")}&title=${encodeURIComponent(title)}`, "_blank");
  };

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            data-testid="article-modal-backdrop"
          />

          {/* Slide-over Panel */}
          <motion.aside
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl flex flex-col shadow-2xl"
            style={{
              background: "hsl(231 44% 10%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
            data-testid="article-modal"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryColors[article.category] || categoryColors.Tech}`}>
                {article.category}
              </span>
              <div className="flex items-center gap-2">
                {/* Bookmark */}
                <motion.button
                  onClick={() => onToggleBookmark(article.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-lg hover:bg-white/8 transition-colors"
                  title={bookmarked ? "Remove bookmark" : "Save for later"}
                  data-testid="btn-bookmark"
                >
                  {bookmarked
                    ? <BookmarkCheck className="w-5 h-5 text-amber-400" />
                    : <Bookmark className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  }
                </motion.button>

                {/* Share dropdown */}
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="p-2 rounded-lg hover:bg-white/8 transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                    title="Share article"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                  <div className="absolute right-0 top-full mt-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-10">
                    <div className="glass-card rounded-xl p-1.5 flex flex-col gap-1 min-w-[140px] shadow-xl">
                      <button
                        onClick={() => shareTwitter(article.title)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        data-testid="btn-share-twitter"
                      >
                        <Twitter className="w-3.5 h-3.5 text-sky-400" /> Share on X
                      </button>
                      <button
                        onClick={() => shareLinkedIn(article.title)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        data-testid="btn-share-linkedin"
                      >
                        <Linkedin className="w-3.5 h-3.5 text-blue-500" /> Share on LinkedIn
                      </button>
                      <button
                        onClick={() => window.open(article.url, "_blank")}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Source
                      </button>
                    </div>
                  </div>
                </div>

                {/* Close */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-lg hover:bg-white/8 transition-colors text-muted-foreground hover:text-foreground"
                  data-testid="btn-close-modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {/* Hero image */}
              <div className="relative h-56 overflow-hidden flex-shrink-0">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              <div className="px-6 py-8 space-y-6">
                {/* Title & meta */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-display leading-tight mb-2">
                    {article.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed mb-5">
                    {article.subheading}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      {formatDate(article.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {article.readTime} min read
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      via <strong className="text-foreground">{article.source}</strong>
                    </span>
                  </div>
                </div>

                {/* AI Summary Box */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="rounded-xl p-5"
                  style={{
                    background: "linear-gradient(135deg, rgba(67,97,238,0.08) 0%, rgba(139,92,246,0.06) 100%)",
                    border: "1px solid rgba(67,97,238,0.2)",
                  }}
                  data-testid="ai-summary-box"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-primary/15">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span className="text-xs font-semibold text-primary tracking-wide uppercase">AI-Generated Summary</span>
                    <span className="text-xs text-muted-foreground ml-auto">For busy professionals</span>
                  </div>
                  <ul className="space-y-2">
                    {article.aiSummary.map((point, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Article body */}
                <div className="border-t border-white/8 pt-6">
                  {article.body.map((block, i) => renderBody(block, i))}
                </div>

                {/* Footer CTA */}
                <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    data-testid="link-source"
                  >
                    Read full article at {article.source}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => shareTwitter(article.title)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold hover:bg-sky-500/20 transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" /> Share
                    </motion.button>
                    <motion.button
                      onClick={() => shareLinkedIn(article.title)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" /> Share
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
