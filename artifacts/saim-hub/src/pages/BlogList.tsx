import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Tag, ArrowRight, Search, BookOpen, Rss, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  coverImage: string | null;
  author: string;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchBlogs(): Promise<Blog[]> {
  const res = await fetch(`${BASE}/api/blogs`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json() as Promise<Blog[]>;
}

const CATEGORIES = ["All", "Engineering", "Academic", "Tech", "Tools", "Career", "Research", "General"];

const CATEGORY_COLORS: Record<string, string> = {
  engineering: "bg-primary/15 text-primary border-primary/25",
  academic:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  tech:        "bg-sky-500/15 text-sky-400 border-sky-500/25",
  tools:       "bg-amber-500/15 text-amber-400 border-amber-500/25",
  career:      "bg-violet-500/15 text-violet-400 border-violet-500/25",
  research:    "bg-rose-500/15 text-rose-400 border-rose-500/25",
  general:     "bg-white/8 text-muted-foreground border-white/15",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? CATEGORY_COLORS.general;
}

/** Handles both comma-separated "a,b,c" and PostgreSQL array "{\"a\",\"b\",\"c\"}" formats */
function parseTags(raw: string): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map(t => t.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return trimmed.split(",").map(t => t.trim()).filter(Boolean);
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogList() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  const { data: blogs = [], isLoading, error } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn:  fetchBlogs,
  });

  const filtered = blogs.filter(b => {
    const matchCat = category === "All" || b.category.toLowerCase() === category.toLowerCase();
    const matchQ   = !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
                     b.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(67,97,238,0.08) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
                <Rss className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">SaimServices Blog</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-display mb-4">
              Insights for{" "}
              <span className="gradient-text-blue">Engineers & Researchers</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Guides, tutorials, and deep-dives on engineering tools, academic strategies, and tech.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full bg-muted/40 text-foreground text-sm rounded-2xl pl-11 pr-4 py-3.5 border border-white/10 outline-none focus:border-primary/40 transition-colors"
              style={{ background: "rgba(10,16,40,0.6)", backdropFilter: "blur(12px)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Category filter ───────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
                  category === cat
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "glass-card text-muted-foreground hover:text-foreground hover:border-white/20"
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Blog grid ────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-24 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Failed to load articles. Try refreshing.</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold text-foreground/60 mb-2">No articles yet</p>
              <p className="text-sm">Check back soon — new posts are coming!</p>
            </div>
          )}

          {/* ── Featured post (first article, only when not filtered / searching) ── */}
          {!isLoading && !error && !search && category === "All" && filtered.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">Featured Article</span>
              </div>
              <Link href={`/blog/${filtered[0].slug}`}>
                <div className="group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
                  style={{
                    background: "rgba(10,16,40,0.7)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Cover image */}
                    <div className="relative overflow-hidden lg:w-[45%] xl:w-[40%] flex-shrink-0 h-56 sm:h-72 lg:h-auto min-h-[240px]">
                      {filtered[0].coverImage ? (
                        <img src={filtered[0].coverImage} alt={filtered[0].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy" decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.2) 0%, rgba(14,165,233,0.1) 100%)" }}
                        >
                          <BookOpen className="w-16 h-16 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-transparent lg:to-[rgba(10,16,40,0.4)]" />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${categoryColor(filtered[0].category)}`}>
                          {filtered[0].category}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                        {filtered[0].title}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                        {filtered[0].excerpt}
                      </p>
                      {filtered[0].tags && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {parseTags(filtered[0].tags).slice(0, 4).map(t => (
                            <span key={t} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                              <Tag className="w-2.5 h-2.5" />{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(filtered[0].publishedAt || filtered[0].createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />{filtered[0].readTime} min read
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-primary font-semibold group-hover:gap-3 transition-all">
                          Read article <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Grid — skip first post when it's shown as featured (no-search, All category) */}
          {(!search && category === "All" && filtered.length <= 1) ? null : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {((!search && category === "All") ? filtered.slice(1) : filtered).map((blog, i) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col"
                      style={{
                        background: "rgba(10,16,40,0.6)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                      }}
                    >
                      {/* Cover Image */}
                      <div className="relative overflow-hidden h-48 flex-shrink-0">
                        {blog.coverImage ? (
                          <img src={blog.coverImage} alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy" decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, rgba(67,97,238,0.15) 0%, rgba(14,165,233,0.08) 100%)` }}
                          >
                            <BookOpen className="w-12 h-12 text-primary/20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${categoryColor(blog.category)}`}>
                            {blog.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        {blog.tags && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {parseTags(blog.tags).slice(0, 3).map(t => (
                              <span key={t} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                              >
                                <Tag className="w-2.5 h-2.5" />{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{blog.readTime} min
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
