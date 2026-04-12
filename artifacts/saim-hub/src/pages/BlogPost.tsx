import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Calendar, Clock, Tag, ArrowLeft, Share2, BookOpen, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  coverImage: string | null;
  author: string;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchBlog(slug: string): Promise<Blog> {
  const res = await fetch(`${BASE}/api/blogs/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json() as Promise<Blog>;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const CATEGORY_COLORS: Record<string, string> = {
  engineering: "bg-primary/15 text-primary border-primary/25",
  academic:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  tech:        "bg-sky-500/15 text-sky-400 border-sky-500/25",
  tools:       "bg-amber-500/15 text-amber-400 border-amber-500/25",
  career:      "bg-violet-500/15 text-violet-400 border-violet-500/25",
  research:    "bg-rose-500/15 text-rose-400 border-rose-500/25",
  general:     "bg-white/8 text-muted-foreground border-white/15",
};

/** Handles both comma-separated "a,b,c" and PostgreSQL array "{\"a\",\"b\",\"c\"}" formats */
function parseTags(raw: string): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1).split(",").map(t => t.replace(/^"|"$/g, "").trim()).filter(Boolean);
  }
  return trimmed.split(",").map(t => t.trim()).filter(Boolean);
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ["blog", slug],
    queryFn:  () => fetchBlog(slug ?? ""),
    enabled:  !!slug,
  });

  const catColor = blog ? (CATEGORY_COLORS[blog.category.toLowerCase()] ?? CATEGORY_COLORS.general) : "";

  const handleShare = () => {
    if (navigator.share && blog) {
      void navigator.share({ title: blog.title, text: blog.excerpt, url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto mb-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            {blog && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/60 truncate max-w-[200px]">{blog.title}</span>
              </>
            )}
          </nav>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground/20" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Article not found</h1>
            <p className="text-muted-foreground mb-6">This article may have been removed or the link is incorrect.</p>
            <Link href="/blog">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold mx-auto hover:bg-primary/90 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>
            </Link>
          </div>
        )}

        {blog && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${catColor}`}>
                  {blog.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{blog.readTime} min read
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display leading-tight mb-4">
                {blog.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{blog.excerpt}</p>

              {/* Author + Date + Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-6"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{blog.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{blog.author}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/blog">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass-card text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> All Articles
                    </button>
                  </Link>
                  <button onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            </header>

            {/* Cover image */}
            {blog.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-8" style={{ maxHeight: 420 }}>
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-invert prose-sm sm:prose-base max-w-none mb-10 leading-relaxed"
              style={{
                color: "rgba(203,213,225,0.9)",
                lineHeight: "1.85",
              }}
              dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }}
            />

            {/* Tags */}
            {blog.tags && (
              <div className="flex flex-wrap gap-2 pt-8 mb-8" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mr-1">
                  <Tag className="w-3.5 h-3.5" /> Tags:
                </span>
                {parseTags(blog.tags).map(t => (
                  <span key={t}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)", color: "#93c5fd" }}
                  >{t}</span>
                ))}
              </div>
            )}

            {/* Back link */}
            <div className="flex justify-center pt-4">
              <Link href="/blog">
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/15 text-primary border border-primary/25 text-sm font-semibold hover:bg-primary/25 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Browse All Articles
                </button>
              </Link>
            </div>
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* Convert plain text/simple markdown to safe HTML */
function renderContent(content: string): string {
  if (content.trim().startsWith("<")) return content;

  return content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3 style='color:#e2e8f0;font-size:1.1rem;font-weight:700;margin:1.5rem 0 0.5rem'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 style='color:#e2e8f0;font-size:1.3rem;font-weight:700;margin:2rem 0 0.75rem'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 style='color:#e2e8f0;font-size:1.6rem;font-weight:800;margin:2rem 0 1rem'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:#e2e8f0;font-weight:700'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:rgba(67,97,238,0.12);color:#93c5fd;padding:1px 6px;border-radius:4px;font-size:0.85em;font-family:monospace'>$1</code>")
    .replace(/^- (.+)$/gm, "<li style='margin:0.25rem 0;padding-left:0.5rem'>$1</li>")
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style='margin:0.75rem 0 0.75rem 1.5rem;list-style:disc'>${m}</ul>`)
    .replace(/\n\n+/g, "</p><p style='margin:0.75rem 0'>")
    .replace(/^(?!<[h|u|l])/, "<p style='margin:0.75rem 0'>")
    .replace(/$(?![>])/, "</p>");
}
