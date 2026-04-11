import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote, Copy, Check, Download, Plus, Trash2,
  Globe, BookOpen, FileText, Youtube, Clock, X, Loader2, Wand2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CitationStyle = "apa7" | "mla9" | "harvard" | "chicago17" | "vancouver";
type SourceType = "website" | "book" | "journal" | "youtube";

interface Author { first: string; last: string }

interface CitationSource {
  type: SourceType;
  authors: Author[];
  title: string;
  year: string;
  // Website
  siteName: string;
  url: string;
  accessDay: string;
  accessMonth: string;
  accessYear: string;
  publishDay: string;
  publishMonth: string;
  // Book
  publisher: string;
  place: string;
  edition: string;
  // Journal
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  // YouTube
  channelName: string;
  videoDay: string;
  videoMonth: string;
}

interface CitationSegment { text: string; italic?: boolean }
interface CitationResult { plain: string; segments: CitationSegment[] }
interface HistoryItem { id: string; style: string; sourceType: string; result: string; segments: CitationSegment[]; ts: number }

const HISTORY_KEY = "saimservices_citation_history";
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Formatting Helpers ───────────────────────────────────────────────────────

/** Drop blank author rows so formatters never produce awkward empty-name output */
function cleanAuthors(authors: Author[]): Author[] {
  return authors.filter(a => a.last.trim() || a.first.trim());
}

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).map(n => n[0].toUpperCase() + ".").join(" ");
}

function formatAuthorsAPA(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => `${a.last.trim()}, ${initials(a.first)}`;
  if (authors.length === 1) return fmt(authors[0]);
  if (authors.length === 2) return `${fmt(authors[0])}, & ${fmt(authors[1])}`;
  if (authors.length <= 20) return authors.slice(0, -1).map(fmt).join(", ") + ", & " + fmt(authors[authors.length - 1]);
  return authors.slice(0, 19).map(fmt).join(", ") + " . . . " + fmt(authors[authors.length - 1]);
}

function formatAuthorsMLA(authors: Author[]): string {
  if (!authors.length) return "";
  const first = authors[0];
  const firstFmt = `${first.last.trim()}, ${first.first.trim()}`;
  if (authors.length === 1) return firstFmt;
  if (authors.length === 2) return `${firstFmt}, and ${authors[1].first.trim()} ${authors[1].last.trim()}`;
  return `${firstFmt}, et al`;
}

function formatAuthorsHarvard(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => `${a.last.trim()}, ${initials(a.first)}`;
  if (authors.length === 1) return fmt(authors[0]);
  if (authors.length === 2) return `${fmt(authors[0])} and ${fmt(authors[1])}`;
  if (authors.length === 3) return `${fmt(authors[0])}, ${fmt(authors[1])} and ${fmt(authors[2])}`;
  return fmt(authors[0]) + " et al.";
}

function formatAuthorsChicago(authors: Author[]): string {
  if (!authors.length) return "";
  const first = authors[0];
  const firstFmt = `${first.last.trim()}, ${first.first.trim()}`;
  if (authors.length === 1) return firstFmt;
  if (authors.length > 3) return firstFmt + ", et al.";
  const rest = authors.slice(1).map(a => `${a.first.trim()} ${a.last.trim()}`);
  if (authors.length === 2) return `${firstFmt}, and ${rest[0]}`;
  // exactly 3 authors
  return `${firstFmt}, ${rest[0]}, and ${rest[1]}`;
}

function formatAuthorsVancouver(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => `${a.last.trim()} ${initials(a.first).replace(/\. /g, "").replace(/\.$/, "")}`;
  if (authors.length <= 6) return authors.map(fmt).join(", ");
  return authors.slice(0, 6).map(fmt).join(", ") + ", et al.";
}

// Segment helpers
function seg(text: string, italic = false): CitationSegment { return { text, italic }; }

/** Plain text: italic segments wrapped in *asterisks* per style guide requirement */
function toPlain(segs: CitationSegment[]): string {
  return segs.map(s => s.italic ? `*${s.text}*` : s.text).join("");
}

function buildResult(segs: CitationSegment[]): CitationResult {
  return { segments: segs, plain: toPlain(segs) };
}

// Month helpers
function fullMonth(m: string): string { const i = parseInt(m); return (!isNaN(i) && i >= 1 && i <= 12) ? MONTHS_FULL[i-1] : m; }
function shortMonth(m: string): string { const i = parseInt(m); return (!isNaN(i) && i >= 1 && i <= 12) ? MONTHS_SHORT[i-1] : m; }

// ─── Citation Formatters ──────────────────────────────────────────────────────

function formatAPA7(src: CitationSource): CitationResult {
  const authors = cleanAuthors(src.authors);
  const authStr = formatAuthorsAPA(authors);
  const year = src.year || "n.d.";
  switch (src.type) {
    case "book": {
      const ed = src.edition ? ` (${src.edition} ed.)` : "";
      return buildResult([
        seg(authStr ? authStr + " " : ""),
        seg(`(${year}). `),
        seg(src.title || "Title", true),
        seg(ed + ". "),
        seg(src.publisher || "Publisher"),
        seg("."),
      ]);
    }
    case "journal": {
      const vol = src.volume ? `, ${src.volume}` : "";
      const iss = src.issue ? `(${src.issue})` : "";
      const pp = src.pages ? `, ${src.pages}` : "";
      const doiStr = src.doi ? ` https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//,"")}` : "";
      return buildResult([
        seg(authStr ? authStr + " " : ""),
        seg(`(${year}). `),
        seg(src.title || "Article title"),
        seg(". "),
        seg(src.journal || "Journal Name", true),
        seg(`${vol}${iss}${pp}.${doiStr}`),
      ]);
    }
    case "website": {
      const dateStr = (src.publishDay || src.publishMonth)
        ? `, ${src.publishMonth ? fullMonth(src.publishMonth) : ""} ${src.publishDay || ""}`.trim()
        : "";
      const authorPart = authStr ? authStr + " " : (src.siteName ? src.siteName + ". " : "");
      return buildResult([
        seg(authorPart),
        seg(`(${year}${dateStr}). `),
        seg(src.title || "Page title", true),
        seg(". "),
        seg(authStr && src.siteName ? src.siteName + ". " : ""),
        seg(src.url || "URL"),
      ]);
    }
    case "youtube": {
      const creator = authors.length
        ? formatAuthorsAPA(authors)
        : (src.channelName || "Creator");
      const dateStr = (src.videoDay || src.videoMonth)
        ? `, ${src.videoMonth ? fullMonth(src.videoMonth) : ""} ${src.videoDay || ""}`.trim()
        : "";
      return buildResult([
        seg(creator + " "),
        seg(`(${year}${dateStr}). `),
        seg(src.title || "Video title", true),
        seg(" [Video]. YouTube. "),
        seg(src.url || "URL"),
      ]);
    }
  }
}

function formatMLA9(src: CitationSource): CitationResult {
  const authors = cleanAuthors(src.authors);
  const authStr = formatAuthorsMLA(authors);
  switch (src.type) {
    case "book": {
      const ed = src.edition ? `, ${src.edition} ed.,` : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(src.title || "Title of Book", true),
        seg(`${ed} ${src.publisher || "Publisher"}, ${src.year || "Year"}.`),
      ]);
    }
    case "journal": {
      const vol = src.volume ? `, vol. ${src.volume}` : "";
      const iss = src.issue ? `, no. ${src.issue}` : "";
      const pp = src.pages ? `, pp. ${src.pages}` : "";
      const doiStr = src.doi ? `. https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//,"")}` : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(`"${src.title || "Article title"}." `),
        seg(src.journal || "Journal Name", true),
        seg(`${vol}${iss}, ${src.year || "Year"}${pp}${doiStr}.`),
      ]);
    }
    case "website": {
      const dateStr = [src.publishDay, src.publishMonth ? fullMonth(src.publishMonth) : "", src.year]
        .filter(Boolean).join(" ").trim() || src.year || "n.d.";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(`"${src.title || "Page Title"}." `),
        seg(src.siteName || "Site Name", true),
        seg(`, ${dateStr}, `),
        seg(src.url || "URL"),
        seg("."),
      ]);
    }
    case "youtube": {
      const creator = authors.length
        ? formatAuthorsMLA(authors)
        : (src.channelName || "Creator");
      const dateStr = [src.videoDay, src.videoMonth ? fullMonth(src.videoMonth) : "", src.year]
        .filter(Boolean).join(" ").trim() || src.year || "n.d.";
      return buildResult([
        seg(creator ? creator + ". " : ""),
        seg(`"${src.title || "Video Title"}." `),
        seg("YouTube", true),
        seg(`, ${dateStr}, `),
        seg(src.url || "URL"),
        seg("."),
      ]);
    }
  }
}

function formatHarvard(src: CitationSource): CitationResult {
  const authors = cleanAuthors(src.authors);
  const authStr = formatAuthorsHarvard(authors);
  const year = src.year || "n.d.";
  switch (src.type) {
    case "book": {
      const ed = src.edition ? ` (${src.edition} edn.)` : "";
      const place = src.place ? src.place + ": " : "";
      return buildResult([
        seg(authStr ? authStr + " " : ""),
        seg(`(${year}) `),
        seg(src.title || "Title of book", true),
        seg(`${ed}. ${place}`),
        seg(src.publisher || "Publisher"),
        seg("."),
      ]);
    }
    case "journal": {
      const vol = src.volume ? `, vol. ${src.volume}` : "";
      const iss = src.issue ? `, no. ${src.issue}` : "";
      const pp = src.pages ? `, pp. ${src.pages}` : "";
      const doiStr = src.doi ? `. https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//,"")}` : "";
      return buildResult([
        seg(authStr ? authStr + " " : ""),
        seg(`(${year}) '${src.title || "Article title"}', `),
        seg(src.journal || "Journal Name", true),
        seg(`${vol}${iss}${pp}${doiStr}.`),
      ]);
    }
    case "website": {
      const accDate = src.accessDay && src.accessMonth && src.accessYear
        ? `(Accessed: ${src.accessDay} ${fullMonth(src.accessMonth)} ${src.accessYear})`
        : "(Accessed: Date)";
      return buildResult([
        seg(authStr ? authStr + " " : (src.siteName ? src.siteName + " " : "")),
        seg(`(${year}) `),
        seg(src.title || "Title of page", true),
        seg(`. ${authStr && src.siteName ? src.siteName + ". " : ""}Available at: `),
        seg(src.url || "URL"),
        seg(` ${accDate}.`),
      ]);
    }
    case "youtube": {
      const creator = authors.length
        ? formatAuthorsHarvard(authors)
        : (src.channelName || "Creator");
      const accDate = src.accessDay && src.accessMonth && src.accessYear
        ? ` (Accessed: ${src.accessDay} ${fullMonth(src.accessMonth)} ${src.accessYear})`
        : "";
      return buildResult([
        seg(creator + " "),
        seg(`(${year}) `),
        seg(src.title || "Video title", true),
        seg(" [Video]. YouTube. Available at: "),
        seg(src.url || "URL"),
        seg(accDate + "."),
      ]);
    }
  }
}

function formatChicago17(src: CitationSource): CitationResult {
  const authors = cleanAuthors(src.authors);
  const authStr = formatAuthorsChicago(authors);
  switch (src.type) {
    case "book": {
      const place = src.place || "Place";
      const ed = src.edition ? ` ${src.edition} ed.` : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(src.title || "Title of Book", true),
        seg(`${ed}. ${place}: ${src.publisher || "Publisher"}, ${src.year || "Year"}.`),
      ]);
    }
    case "journal": {
      const vol = src.volume ? ` ${src.volume}` : "";
      const iss = src.issue ? `, no. ${src.issue}` : "";
      const pp = src.pages ? `: ${src.pages}` : "";
      const doiStr = src.doi ? `. https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//,"")}` : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(`"${src.title || "Article Title"}." `),
        seg(src.journal || "Journal Name", true),
        seg(`${vol}${iss} (${src.year || "Year"})${pp}${doiStr}.`),
      ]);
    }
    case "website": {
      const dateStr = [fullMonth(src.publishMonth || ""), src.publishDay, src.year]
        .filter(Boolean).join(" ").trim() || src.year || "n.d.";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(`"${src.title || "Page Title"}." `),
        seg(src.siteName || "Site Name", true),
        seg(`. ${dateStr}. `),
        seg(src.url || "URL"),
        seg("."),
      ]);
    }
    case "youtube": {
      const creator = authors.length
        ? formatAuthorsChicago(authors)
        : (src.channelName || "Creator");
      const dateStr = [fullMonth(src.videoMonth || ""), src.videoDay, src.year]
        .filter(Boolean).join(" ").trim() || src.year || "n.d.";
      return buildResult([
        seg(creator ? creator + ". " : ""),
        seg(`"${src.title || "Video Title"}." YouTube video. `),
        seg(`${dateStr}. `),
        seg(src.url || "URL"),
        seg("."),
      ]);
    }
  }
}

function formatVancouver(src: CitationSource): CitationResult {
  const authors = cleanAuthors(src.authors);
  const authStr = formatAuthorsVancouver(authors);
  switch (src.type) {
    case "book": {
      const ed = src.edition ? ` ${src.edition} ed.` : "";
      const place = src.place ? src.place + ": " : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(src.title || "Title of book"),
        seg(`${ed}. ${place}${src.publisher || "Publisher"}; ${src.year || "Year"}.`),
      ]);
    }
    case "journal": {
      const vol = src.volume || "";
      const iss = src.issue ? `(${src.issue})` : "";
      const pp = src.pages ? `:${src.pages}` : "";
      const doiStr = src.doi ? ` https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//,"")}` : "";
      return buildResult([
        seg(authStr ? authStr + ". " : ""),
        seg(src.title || "Article title"),
        seg(". "),
        seg(src.journal || "J Abbrev", true),
        seg(`. ${src.year || "Year"};${vol}${iss}${pp}.${doiStr}`),
      ]);
    }
    case "website": {
      const accDate = src.accessYear
        ? `[cited ${src.accessYear} ${shortMonth(src.accessMonth || "")} ${src.accessDay || ""}]`.trim()
        : "[cited Date]";
      const sitePartial = authStr && src.siteName ? src.siteName + "; " : "";
      return buildResult([
        seg(authStr ? authStr + ". " : (src.siteName ? src.siteName + ". " : "")),
        seg(src.title || "Title of page"),
        seg(` [Internet]. ${sitePartial}${src.year || "Year"} ${accDate}. Available from: `),
        seg(src.url || "URL"),
      ]);
    }
    case "youtube": {
      const creator = authors.length
        ? formatAuthorsVancouver(authors)
        : (src.channelName || "Creator");
      const accDate = src.accessYear
        ? `[cited ${src.accessYear} ${shortMonth(src.accessMonth || "")} ${src.accessDay || ""}]`.trim()
        : "";
      return buildResult([
        seg(creator + ". "),
        seg(src.title || "Video title"),
        seg(` [Internet]. YouTube; ${src.year || "Year"} ${accDate}. Available from: `),
        seg(src.url || "URL"),
      ]);
    }
  }
}

function generateCitation(style: CitationStyle, src: CitationSource): CitationResult {
  switch (style) {
    case "apa7":      return formatAPA7(src);
    case "mla9":      return formatMLA9(src);
    case "harvard":   return formatHarvard(src);
    case "chicago17": return formatChicago17(src);
    case "vancouver": return formatVancouver(src);
  }
}

// ─── URL Metadata Extraction ──────────────────────────────────────────────────

interface OGMeta { title?: string; siteName?: string; author?: string; year?: string; month?: string; day?: string }

async function fetchOGMeta(url: string): Promise<OGMeta> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error("Proxy request failed");
  const data: { contents?: string } = await res.json();
  const html = data.contents || "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const getMeta = (name: string) =>
    doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content") ||
    doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
    "";

  const title =
    getMeta("og:title") ||
    getMeta("twitter:title") ||
    doc.querySelector("title")?.textContent?.trim() ||
    "";

  const siteName =
    getMeta("og:site_name") ||
    getMeta("application-name") ||
    new URL(url).hostname.replace(/^www\./, "") ||
    "";

  const author =
    getMeta("author") ||
    getMeta("article:author") ||
    "";

  // Try to parse publish date
  const rawDate =
    getMeta("article:published_time") ||
    getMeta("og:article:published_time") ||
    getMeta("date") ||
    getMeta("DC.date") ||
    "";

  let year = "", month = "", day = "";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      year = String(d.getFullYear());
      month = String(d.getMonth() + 1);
      day = String(d.getDate());
    } else {
      const m = rawDate.match(/(\d{4})/);
      if (m) year = m[1];
    }
  }

  return { title: title.trim(), siteName: siteName.trim(), author: author.trim(), year, month, day };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES: { id: CitationStyle; label: string; color: string }[] = [
  { id: "apa7",      label: "APA 7th",      color: "rgba(67,97,238,1)" },
  { id: "mla9",      label: "MLA 9th",      color: "rgba(16,185,129,1)" },
  { id: "harvard",   label: "Harvard",      color: "rgba(245,158,11,1)" },
  { id: "chicago17", label: "Chicago 17th", color: "rgba(168,85,247,1)" },
  { id: "vancouver", label: "Vancouver",    color: "rgba(236,72,153,1)" },
];

const SOURCE_TYPES: { id: SourceType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "website", label: "Website",         icon: Globe,     color: "text-sky-400" },
  { id: "book",    label: "Book",            icon: BookOpen,  color: "text-emerald-400" },
  { id: "journal", label: "Journal Article", icon: FileText,  color: "text-purple-400" },
  { id: "youtube", label: "YouTube",         icon: Youtube,   color: "text-red-400" },
];

const BLANK_SOURCE: CitationSource = {
  type: "website",
  authors: [{ first: "", last: "" }],
  title: "", year: "", siteName: "", url: "",
  accessDay: "", accessMonth: "", accessYear: new Date().getFullYear().toString(),
  publishDay: "", publishMonth: "",
  publisher: "", place: "", edition: "",
  journal: "", volume: "", issue: "", pages: "", doi: "",
  channelName: "", videoDay: "", videoMonth: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AuthorFields({ authors, onChange }: { authors: Author[]; onChange: (a: Author[]) => void }) {
  const update = (i: number, field: keyof Author, val: string) => {
    const next = [...authors];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...authors, { first: "", last: "" }]);
  const remove = (i: number) => onChange(authors.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Authors</label>
      {authors.map((a, i) => (
        <div key={i} className="flex gap-2">
          <input value={a.last} onChange={e => update(i, "last", e.target.value)}
            placeholder="Last name"
            className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500/40 transition-colors"
          />
          <input value={a.first} onChange={e => update(i, "first", e.target.value)}
            placeholder="First / initials"
            className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500/40 transition-colors"
          />
          {authors.length > 1 && (
            <button onClick={() => remove(i)} className="p-2 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors px-1 py-0.5">
        <Plus className="w-3.5 h-3.5" /> Add author
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, half }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; half?: boolean;
}) {
  return (
    <div className={half ? "flex-1 min-w-[110px]" : "w-full"}>
      {label && <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-emerald-500/40 transition-colors"
      />
    </div>
  );
}

function MonthSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex-1 min-w-[110px]">
      {label && <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-emerald-500/40 transition-colors"
      >
        <option value="">Month (optional)</option>
        {MONTHS_FULL.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
      </select>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CitationGenerator() {
  const [style, setStyle] = useState<CitationStyle>("apa7");
  const [src, setSrc] = useState<CitationSource>(BLANK_SOURCE);
  const [result, setResult] = useState<CitationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  const update = useCallback((patch: Partial<CitationSource>) => {
    setSrc(prev => ({ ...prev, ...patch }));
    setResult(null);
  }, []);

  const changeType = (t: SourceType) => {
    setSrc({ ...BLANK_SOURCE, type: t });
    setResult(null);
    setFetchError("");
  };

  const generate = () => {
    const r = generateCitation(style, src);
    setResult(r);
    const entry: HistoryItem = {
      id: Date.now().toString(),
      style: STYLES.find(s => s.id === style)!.label,
      sourceType: SOURCE_TYPES.find(s => s.id === src.type)!.label,
      result: r.plain,
      segments: r.segments,
      ts: Date.now(),
    };
    const next = [entry, ...history].slice(0, 5);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const handleFetchMeta = async () => {
    if (!src.url) return;
    setFetching(true);
    setFetchError("");
    try {
      const meta = await fetchOGMeta(src.url);
      setSrc(prev => ({
        ...prev,
        title: meta.title || prev.title,
        siteName: meta.siteName || prev.siteName,
        year: meta.year || prev.year,
        publishMonth: meta.month || prev.publishMonth,
        publishDay: meta.day || prev.publishDay,
        authors: meta.author
          ? [{ last: meta.author.split(/\s+/).pop() || meta.author, first: meta.author.split(/\s+/).slice(0,-1).join(" ") }]
          : prev.authors,
      }));
      setResult(null);
    } catch {
      setFetchError("Couldn't auto-fetch metadata — please fill in fields manually.");
    } finally {
      setFetching(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.plain).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result.plain], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `citation-${style}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const activeStyle = STYLES.find(s => s.id === style)!;
  const activeType = SOURCE_TYPES.find(s => s.id === src.type)!;

  return (
    <div className="space-y-5">
      {/* Citation Style Selector */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Citation Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => { setStyle(s.id); setResult(null); }}
              className="relative px-4 py-2 rounded-xl border text-sm font-bold transition-all"
              style={style === s.id ? {
                background: `${s.color}1a`,
                borderColor: `${s.color}55`,
                color: s.color,
                boxShadow: `0 0 14px ${s.color}22`,
              } : {
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#64748b",
              }}
              data-testid={`btn-citation-style-${s.id}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Type Selector */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Source Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCE_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => changeType(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  src.type === t.id
                    ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                    : "border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/4"
                }`}
                data-testid={`btn-citation-type-${t.id}`}
              >
                <Icon className={`w-3.5 h-3.5 ${src.type === t.id ? t.color : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* URL input + auto-fetch for Website */}
        {src.type === "website" && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">URL</label>
            <div className="flex gap-2">
              <input value={src.url} onChange={e => update({ url: e.target.value })}
                placeholder="https://..."
                className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-sky-400/50 transition-colors"
              />
              <button
                onClick={handleFetchMeta}
                disabled={!src.url || fetching}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-500/30 text-sky-300 text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                title="Auto-fill title, site name, and date from URL"
              >
                {fetching
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Wand2 className="w-3.5 h-3.5" />}
                Auto-fill
              </button>
            </div>
            {fetchError && (
              <p className="text-[11px] text-amber-400/70 flex items-center gap-1">
                <span>⚠</span> {fetchError}
              </p>
            )}
            {!fetchError && src.url && (
              <p className="text-[10px] text-muted-foreground/50">
                Click Auto-fill to extract title, site name, and date from the URL (falls back to manual if unavailable)
              </p>
            )}
          </div>
        )}

        <AuthorFields
          authors={src.authors}
          onChange={a => update({ authors: a })}
        />

        {/* Channel name for YouTube */}
        {src.type === "youtube" && (
          <Field label="Channel / Creator name" value={src.channelName} onChange={v => update({ channelName: v })} placeholder="e.g. 3Blue1Brown" />
        )}

        <Field label="Title" value={src.title} onChange={v => update({ title: v })}
          placeholder={
            src.type === "book" ? "Full book title" :
            src.type === "journal" ? "Article title" :
            src.type === "youtube" ? "Video title" :
            "Page or article title"
          }
        />

        {/* Year */}
        <div className="flex gap-3 flex-wrap">
          <Field label="Year" value={src.year} onChange={v => update({ year: v })} placeholder="e.g. 2024" half />

          {src.type === "website" && (
            <>
              <MonthSelect value={src.publishMonth} onChange={v => update({ publishMonth: v })} label="Month published" />
              <Field label="Day published" value={src.publishDay} onChange={v => update({ publishDay: v })} placeholder="e.g. 15" half />
            </>
          )}
          {src.type === "youtube" && (
            <>
              <MonthSelect value={src.videoMonth} onChange={v => update({ videoMonth: v })} label="Month uploaded" />
              <Field label="Day uploaded" value={src.videoDay} onChange={v => update({ videoDay: v })} placeholder="e.g. 8" half />
            </>
          )}
        </div>

        {/* Book specific */}
        {src.type === "book" && (
          <>
            <div className="flex gap-3 flex-wrap">
              <Field label="Publisher" value={src.publisher} onChange={v => update({ publisher: v })} placeholder="e.g. Oxford University Press" half />
              <Field label="Place of publication" value={src.place} onChange={v => update({ place: v })} placeholder="e.g. London" half />
            </div>
            <Field label="Edition (optional)" value={src.edition} onChange={v => update({ edition: v })} placeholder="e.g. 3rd" />
          </>
        )}

        {/* Journal specific */}
        {src.type === "journal" && (
          <>
            <Field label="Journal Name" value={src.journal} onChange={v => update({ journal: v })} placeholder="e.g. Nature" />
            <div className="flex gap-3 flex-wrap">
              <Field label="Volume" value={src.volume} onChange={v => update({ volume: v })} placeholder="e.g. 42" half />
              <Field label="Issue" value={src.issue} onChange={v => update({ issue: v })} placeholder="e.g. 3" half />
              <Field label="Pages" value={src.pages} onChange={v => update({ pages: v })} placeholder="e.g. 112–130" half />
            </div>
            <Field label="DOI (optional)" value={src.doi} onChange={v => update({ doi: v })} placeholder="e.g. 10.1038/..." />
          </>
        )}

        {/* Website site name (below URL) */}
        {src.type === "website" && (
          <Field label="Website / Organisation name" value={src.siteName} onChange={v => update({ siteName: v })} placeholder="e.g. BBC News" />
        )}

        {/* YouTube URL */}
        {src.type === "youtube" && (
          <Field label="URL" value={src.url} onChange={v => update({ url: v })} placeholder="https://youtube.com/watch?v=..." />
        )}

        {/* Access date for Harvard / Vancouver — shown for website & youtube */}
        {(src.type === "website" || src.type === "youtube") && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Access Date <span className="normal-case font-normal">(required for Harvard &amp; Vancouver)</span>
            </p>
            <div className="flex gap-3 flex-wrap">
              <Field label="" value={src.accessDay} onChange={v => update({ accessDay: v })} placeholder="Day" half />
              <MonthSelect value={src.accessMonth} onChange={v => update({ accessMonth: v })} />
              <Field label="" value={src.accessYear} onChange={v => update({ accessYear: v })} placeholder="Year" half />
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button onClick={generate}
        className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${activeStyle.color}cc, ${activeStyle.color}88)`,
          boxShadow: `0 0 24px ${activeStyle.color}33`,
          color: "#fff",
        }}
        data-testid="btn-generate-citation"
      >
        <Quote className="w-4 h-4" />
        Generate {activeStyle.label} Citation
        <span className="text-xs opacity-70">· {activeType.label}</span>
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: `${activeStyle.color}0d`,
              border: `1px solid ${activeStyle.color}30`,
              boxShadow: `0 0 30px ${activeStyle.color}12`,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${activeStyle.color}22`, color: activeStyle.color, border: `1px solid ${activeStyle.color}33` }}
                >{activeStyle.label}</span>
                <span className="text-xs text-muted-foreground">· {activeType.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={copyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={downloadResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> .txt
                </button>
              </div>
            </div>

            {/* Rendered citation with italic support */}
            <p className="text-sm text-foreground leading-relaxed font-serif select-all p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              {result.segments.map((s, i) =>
                s.italic
                  ? <em key={i}>{s.text}</em>
                  : <span key={i}>{s.text}</span>
              )}
            </p>

            <p className="text-[10px] text-muted-foreground/50 flex items-start gap-1">
              <span className="flex-shrink-0">ℹ</span>
              <span>Italics shown above. In the copied text, italicised portions are wrapped with *asterisks* — apply italic formatting in your word processor.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Recent citations</span>
            </div>
            <button onClick={() => {
              setHistory([]);
              try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
            }} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
          {history.map(h => (
            <motion.div key={h.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl p-3 cursor-pointer transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              whileHover={{ borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.04)" }}
              onClick={() => setResult({ plain: h.result, segments: h.segments || [{ text: h.result }] })}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/6 border border-white/10 text-muted-foreground">{h.style}</span>
                <span className="text-[9px] text-muted-foreground/50">{h.sourceType}</span>
                <span className="text-[9px] text-muted-foreground/40 ml-auto">{new Date(h.ts).toLocaleDateString()}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{h.result}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
