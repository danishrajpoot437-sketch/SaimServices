import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ExternalLink, FileText, Users, Calendar,
  BookOpen, ChevronDown, ChevronUp, Copy, Check,
  Loader2, AlertCircle, Download, BookMarked, Bookmark,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Author { name: string }

interface Paper {
  paperId: string;
  title: string;
  abstract: string;
  year: number | null;
  authors: Author[];
  venue: string;
  externalIds: Record<string, string>;
  openAccessPdf: { url: string; status: string } | null;
  fieldsOfStudy: string[] | null;
}

interface SearchResponse { total: number; data: Paper[] }

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "/api/papers/search";

const SUBJECT_FILTERS = [
  { id: "all",        label: "All Fields",      color: "rgba(99,102,241,1)" },
  { id: "cs",         label: "Computer Sci.",   color: "rgba(67,97,238,1)" },
  { id: "physics",    label: "Physics",         color: "rgba(14,165,233,1)" },
  { id: "math",       label: "Mathematics",     color: "rgba(16,185,129,1)" },
  { id: "biology",    label: "Biology",         color: "rgba(34,197,94,1)" },
  { id: "medicine",   label: "Medicine",        color: "rgba(239,68,68,1)" },
  { id: "chemistry",  label: "Chemistry",       color: "rgba(245,158,11,1)" },
  { id: "engineering",label: "Engineering",     color: "rgba(168,85,247,1)" },
];

const SORT_OPTIONS = [
  { id: "relevance",    label: "Most Relevant" },
  { id: "citationCount",label: "Most Cited" },
  { id: "year",         label: "Newest First" },
];

const SAMPLE_QUERIES = [
  "transformer neural networks", "CRISPR gene editing",
  "quantum computing algorithms", "climate change machine learning",
  "cancer immunotherapy", "large language models",
];

const SAVE_KEY = "saimservices_saved_papers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getArXivId(paper: Paper): string | null {
  return paper.externalIds?.ArXiv || null;
}

function getPubMedId(paper: Paper): string | null {
  return paper.externalIds?.PubMed || null;
}

function getDOI(paper: Paper): string | null {
  return paper.externalIds?.DOI || null;
}

function getSourceBadges(paper: Paper): { label: string; color: string; bg: string }[] {
  const badges = [];
  if (getArXivId(paper)) badges.push({ label: "arXiv", color: "text-sky-300", bg: "bg-sky-500/12 border-sky-500/25" });
  if (getPubMedId(paper)) badges.push({ label: "PubMed", color: "text-emerald-300", bg: "bg-emerald-500/12 border-emerald-500/25" });
  if (paper.openAccessPdf) badges.push({ label: "Open Access", color: "text-amber-300", bg: "bg-amber-500/12 border-amber-500/25" });
  return badges;
}

function formatAuthors(authors: Author[]): string {
  if (!authors.length) return "Unknown authors";
  if (authors.length <= 3) return authors.map(a => a.name).join(", ");
  return authors.slice(0, 3).map(a => a.name).join(", ") + ` +${authors.length - 3} more`;
}

async function fetchPapers(query: string, subject: string, sort: string, offset = 0): Promise<SearchResponse> {
  const params = new URLSearchParams({ query, subject, sort, offset: String(offset), limit: "10" });
  const res = await fetch(`${API_BASE}?${params.toString()}`, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(errData.error || `Search failed (${res.status})`);
  }
  return await res.json() as SearchResponse;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${bg} ${color}`}>
      {label}
    </span>
  );
}

function PaperCard({ paper, savedIds, onToggleSave }: {
  paper: Paper;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const badges = getSourceBadges(paper);
  const arxivId = getArXivId(paper);
  const pubmedId = getPubMedId(paper);
  const doi = getDOI(paper);
  const isSaved = savedIds.has(paper.paperId);

  const paperUrl = arxivId
    ? `https://arxiv.org/abs/${arxivId}`
    : doi
    ? `https://doi.org/${doi}`
    : pubmedId
    ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`
    : `https://openalex.org/${paper.paperId.replace("https://openalex.org/", "")}`;

  const copyRef = () => {
    const ref = `${formatAuthors(paper.authors)} (${paper.year || "n.d."}). ${paper.title}${paper.venue ? ". " + paper.venue : ""}${doi ? ". https://doi.org/" + doi : ""}`;
    navigator.clipboard.writeText(ref).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 space-y-3 group transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      whileHover={{ borderColor: "rgba(67,97,238,0.25)", background: "rgba(67,97,238,0.035)" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <a href={paperUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-bold text-foreground hover:text-primary transition-colors leading-snug block mb-1.5 line-clamp-2"
          >
            {paper.title}
          </a>
          <div className="flex flex-wrap gap-1 items-center">
            {badges.map(b => <SourceBadge key={b.label} {...b} />)}
            {paper.year && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />{paper.year}
              </span>
            )}
            {paper.venue && (
              <span className="text-[9px] text-muted-foreground/70 italic truncate max-w-[140px]">
                {paper.venue}
              </span>
            )}
          </div>
        </div>
        {/* Save button */}
        <button
          onClick={() => onToggleSave(paper.paperId)}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isSaved ? "text-amber-400 bg-amber-500/10" : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/8"}`}
          title={isSaved ? "Remove bookmark" : "Save paper"}
        >
          {isSaved ? <BookMarked className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Authors */}
      {paper.authors.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-snug">{formatAuthors(paper.authors)}</p>
        </div>
      )}

      {/* Abstract */}
      {paper.abstract && (
        <div>
          <p className={`text-xs text-muted-foreground/80 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {paper.abstract}
          </p>
          {paper.abstract.length > 220 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-1"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Read abstract</>}
            </button>
          )}
        </div>
      )}

      {/* Field tags */}
      {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {paper.fieldsOfStudy.slice(0, 4).map(f => (
            <span key={f} className="text-[9px] px-2 py-0.5 rounded-full border border-white/8 text-muted-foreground/60 bg-white/3">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5 flex-wrap">
        <a href={paperUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/12 border border-primary/25 text-primary font-semibold hover:bg-primary/20 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View Paper
        </a>
        {paper.openAccessPdf?.url && (
          <a href={paper.openAccessPdf.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold hover:bg-emerald-500/18 transition-colors"
          >
            <Download className="w-3 h-3" /> Free PDF
          </a>
        )}
        {arxivId && (
          <a href={`https://arxiv.org/abs/${arxivId}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-300 font-semibold hover:bg-sky-500/18 transition-colors"
          >
            <BookOpen className="w-3 h-3" /> arXiv
          </a>
        )}
        {pubmedId && (
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-300 font-semibold hover:bg-green-500/18 transition-colors"
          >
            <FileText className="w-3 h-3" /> PubMed
          </a>
        )}
        <button onClick={copyRef}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all ml-auto"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Cite"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResearchFinder() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [results, setResults] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]")); } catch { return new Set(); }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = async (q: string, sub: string, srt: string, off = 0, append = false) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    if (!append) {
      setHasSearched(true);
      setResults([]);
      setOffset(0);
    }
    try {
      const data = await fetchPapers(q, sub, srt, off);
      setTotal(data.total);
      setResults(prev => append ? [...prev, ...(data.data || [])] : (data.data || []));
      setOffset(off + (data.data?.length || 0));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed";
      if (msg.includes("429") || msg.includes("rate limit") || msg.includes("Too many")) {
        setError("Rate limit reached — please wait a moment and try again.");
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("network")) {
        setError("Network error — check your connection and try again.");
      } else if (msg.includes("JSON") || msg.includes("Unexpected token")) {
        setError("Server returned unexpected data. Please try again.");
      } else if (msg.includes("timeout") || msg.includes("AbortError")) {
        setError("Search timed out — please try again.");
      } else {
        setError(`Search error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => doSearch(query, subject, sort);

  const handleLoadMore = () => doSearch(query, subject, sort, offset, true);

  const handleSampleQuery = (q: string) => {
    setQuery(q);
    doSearch(q, subject, sort);
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  const activeSubject = SUBJECT_FILTERS.find(s => s.id === subject)!;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "0 0 16px rgba(67,97,238,0.2)" }}
        >
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Research Paper Finder</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search 200M+ papers from arXiv, PubMed, Nature, IEEE, ACM and more — powered by OpenAlex
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search by title, topic, author or keyword..."
            className="w-full bg-white/4 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
            data-testid="input-research-query"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
          style={{ boxShadow: "0 0 20px rgba(67,97,238,0.3)" }}
          data-testid="btn-research-search"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Filters row */}
      <div className="space-y-2.5">
        {/* Subject filter */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max">
            {SUBJECT_FILTERS.map(s => (
              <button key={s.id}
                onClick={() => { setSubject(s.id); if (query.trim()) doSearch(query, s.id, sort); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={subject === s.id ? {
                  background: `${s.color}1a`,
                  borderColor: `${s.color}44`,
                  color: s.color,
                } : {
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#64748b",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Sort by:</span>
          {SORT_OPTIONS.map(s => (
            <button key={s.id}
              onClick={() => { setSort(s.id); if (query.trim()) doSearch(query, subject, s.id); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                sort === s.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/8 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sample queries — shown before first search */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground">Try a sample search:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map(q => (
              <button key={q} onClick={() => handleSampleQuery(q)}
                className="px-3 py-1.5 text-xs rounded-xl border border-primary/20 bg-primary/8 text-primary/80 hover:text-primary hover:border-primary/40 hover:bg-primary/14 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            Data from OpenAlex · Covers arXiv, PubMed, Nature, IEEE, ACM and 200M+ papers · No rate limits
          </p>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-xs">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl p-5 space-y-3 animate-pulse"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/6 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/6 rounded-lg w-5/6" />
                  <div className="h-3 bg-white/4 rounded-lg w-2/3" />
                </div>
              </div>
              <div className="h-3 bg-white/4 rounded-lg w-full" />
              <div className="h-3 bg-white/4 rounded-lg w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {/* Results header */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-semibold">{results.length}</span> of{" "}
              <span className="text-foreground font-semibold">{total.toLocaleString()}</span> results
              {subject !== "all" && (
                <span className="ml-1" style={{ color: activeSubject.color }}>· {activeSubject.label}</span>
              )}
            </p>
            <span className="text-[10px] text-muted-foreground/50">via OpenAlex</span>
          </div>

          {results.map((paper, i) => (
            <motion.div key={paper.paperId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <PaperCard paper={paper} savedIds={savedIds} onToggleSave={toggleSave} />
            </motion.div>
          ))}

          {/* Load more */}
          {results.length < total && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-3 rounded-2xl border border-white/10 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Loading..." : `Load more · ${(total - results.length).toLocaleString()} remaining`}
            </button>
          )}
        </div>
      )}

      {/* No results */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-10 space-y-2"
        >
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">No papers found</p>
          <p className="text-xs text-muted-foreground/60">Try different keywords or remove subject filters</p>
        </motion.div>
      )}
    </div>
  );
}
