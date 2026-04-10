import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Trash2, BookOpen, Mic, Hash, ChevronDown, ChevronUp } from "lucide-react";

// ── Text transformations ────────────────────────────────────────────────────

function toTitleCase(str: string) {
  const smalls = new Set(["a","an","the","and","but","or","nor","for","yet","so","at","by","in","of","on","to","up","as","is","it","be"]);
  return str.replace(/\w\S*/g, (txt, offset) => {
    const lower = txt.toLowerCase();
    if (offset === 0 || !smalls.has(lower)) return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    return lower;
  });
}

function toSentenceCase(str: string) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function toCapitalizedCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function toAlternatingCase(str: string) {
  let toggle = false;
  return str.split("").map(c => {
    if (!/[a-zA-Z]/.test(c)) return c;
    const result = toggle ? c.toUpperCase() : c.toLowerCase();
    toggle = !toggle;
    return result;
  }).join("");
}

interface Transform {
  label: string;
  shortLabel: string;
  fn: (s: string) => string;
  testId: string;
  color: string;
  activeRing: string;
}

const transformations: Transform[] = [
  { label: "UPPERCASE",       shortLabel: "UPPER",   fn: s => s.toUpperCase(), testId: "btn-uppercase",       color: "text-blue-300 border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/18",     activeRing: "ring-blue-400/40" },
  { label: "lowercase",       shortLabel: "lower",   fn: s => s.toLowerCase(), testId: "btn-lowercase",       color: "text-purple-300 border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/18", activeRing: "ring-purple-400/40" },
  { label: "Title Case",      shortLabel: "Title",   fn: toTitleCase,           testId: "btn-titlecase",       color: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/18", activeRing: "ring-emerald-400/40" },
  { label: "Sentence case",   shortLabel: "Sentence",fn: toSentenceCase,        testId: "btn-sentencecase",    color: "text-amber-300 border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/18",   activeRing: "ring-amber-400/40" },
  { label: "Capitalized Case",shortLabel: "Capitalize",fn: toCapitalizedCase,   testId: "btn-capitalizedcase", color: "text-sky-300 border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/18",         activeRing: "ring-sky-400/40" },
  { label: "aLtErNaTiNg",    shortLabel: "aLtErN",  fn: toAlternatingCase,     testId: "btn-alternatingcase", color: "text-rose-300 border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/18",     activeRing: "ring-rose-400/40" },
];

// ── Stats computation ────────────────────────────────────────────────────────

function getStats(text: string) {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    words,
    sentences: text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) || []).length,
    paragraphs: text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(Boolean).length,
    lines: text === "" ? 0 : text.split("\n").length,
    readingTime: words === 0 ? 0 : Math.max(1, Math.ceil(words / 200)),
    speakingTime: words === 0 ? 0 : Math.max(1, Math.ceil(words / 130)),
  };
}

interface Keyword { word: string; count: number; pct: string }

function getKeywords(text: string): Keyword[] {
  if (!text.trim()) return [];
  const stop = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","is","was","are","were","be","this","that","it","by","he","she","they","we","i","you","from","have","has","had","will","can","do","not","no"]);
  const matches = (text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? []);
  const freq: Record<string, number> = {};
  matches.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const total = Object.values(freq).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([word, count]) => ({ word, count, pct: ((count / total) * 100).toFixed(1) }));
}

// ── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; color: string }

let toastId = 0;

// ── Main Component ────────────────────────────────────────────────────────────

export default function ContentAnalyzer() {
  const [text, setText] = useState("");
  const [activeTransform, setActiveTransform] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => getStats(text), [text]);
  const keywords = useMemo(() => getKeywords(text), [text]);
  const top3 = keywords.slice(0, 3);

  const pushToast = useCallback((message: string, color: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  const applyTransform = (t: Transform) => {
    if (!text) return;
    setText(t.fn(text));
    setActiveTransform(t.label);
    pushToast(`Applied: ${t.label}`, "amber");
  };

  const copyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    pushToast("Copied to clipboard!", "emerald");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearText = () => {
    setText("");
    setActiveTransform(null);
    pushToast("Text cleared", "red");
  };

  // Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newText = text.substring(0, start) + "  " + text.substring(end);
      setText(newText);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="space-y-4 relative">

      {/* ── Floating Toasts ── */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 48, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-md ${
                t.color === "emerald" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300" :
                t.color === "red"     ? "bg-red-500/15 border border-red-500/30 text-red-300" :
                                        "bg-amber-500/15 border border-amber-500/30 text-amber-300"
              }`}
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Transformation Buttons ── */}
      <div className="flex flex-wrap gap-2">
        {transformations.map(t => (
          <motion.button key={t.label} onClick={() => applyTransform(t)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${t.color} ${
              activeTransform === t.label ? `ring-1 ${t.activeRing}` : ""
            }`}
            title={t.label}
            data-testid={t.testId}>
            {activeTransform === t.label && (
              <motion.div layoutId="active-case-ring"
                className="absolute inset-0 rounded-xl ring-1 ring-current opacity-40"
                transition={{ type: "spring", stiffness: 400, damping: 28 }} />
            )}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </motion.button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <motion.button onClick={copyText} whileTap={{ scale: 0.92 }}
            disabled={!text}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
              text ? "text-amber-300 border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/18" : "text-muted-foreground/40 border-white/8 bg-white/3 cursor-not-allowed"
            }`}
            data-testid="button-copy-text">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
          <motion.button onClick={clearText} whileTap={{ scale: 0.92 }}
            disabled={!text}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
              text ? "text-red-400 border-red-500/25 bg-red-500/8 hover:bg-red-500/15" : "text-muted-foreground/40 border-white/8 bg-white/3 cursor-not-allowed"
            }`}
            data-testid="button-clear-text">
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        </div>
      </div>

      {/* ── Textarea ── */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(245,158,11,0.3), 0 0 32px rgba(245,158,11,0.08)"
            : "0 0 0 0px rgba(245,158,11,0)",
        }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl"
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your content here... Stats update instantly as you write."
          rows={10}
          className="w-full text-foreground text-sm rounded-2xl px-5 py-4 outline-none resize-none placeholder:text-muted-foreground/35 leading-relaxed transition-colors duration-200"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${focused ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
          }}
          data-testid="textarea-char-input"
        />
      </motion.div>

      {/* ── Live Metadata Bar ── */}
      <motion.div
        animate={{ opacity: text ? 1 : 0.5 }}
        className="flex flex-wrap items-center gap-3 px-5 py-3.5 rounded-2xl"
        style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
      >
        {/* Reading time */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-muted-foreground">Read:</span>
          <motion.span key={stats.readingTime} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            className="font-bold text-foreground font-mono">
            {stats.words === 0 ? "—" : `${stats.readingTime} min`}
          </motion.span>
          <span className="text-muted-foreground/50 text-[10px]">@200wpm</span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Speaking time */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-muted-foreground">Speak:</span>
          <motion.span key={stats.speakingTime} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            className="font-bold text-foreground font-mono">
            {stats.words === 0 ? "—" : `${stats.speakingTime} min`}
          </motion.span>
          <span className="text-muted-foreground/50 text-[10px]">@130wpm</span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Top 3 Keywords */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-muted-foreground">Top keywords:</span>
          {top3.length === 0
            ? <span className="text-muted-foreground/50 italic">none yet</span>
            : top3.map((kw, i) => (
                <motion.span key={kw.word} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{ background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.25)", color: "#fbbf24" }}>
                  {kw.word} <span className="opacity-70">{kw.pct}%</span>
                </motion.span>
              ))
          }
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {[
          { label: "Characters",     value: stats.chars,          sub: `${stats.charsNoSpaces} no spaces`, testId: "stat-characters", color: "text-amber-300" },
          { label: "Words",          value: stats.words,          sub: undefined,                           testId: "stat-words",      color: "text-amber-300" },
          { label: "Sentences",      value: stats.sentences,      sub: undefined,                           testId: "stat-sentences",  color: "text-sky-300" },
          { label: "Paragraphs",     value: stats.paragraphs,     sub: undefined,                           testId: "stat-paragraphs", color: "text-purple-300" },
          { label: "Lines",          value: stats.lines,          sub: undefined,                           testId: "stat-lines",      color: "text-emerald-300" },
          { label: "Read Time",      value: stats.words === 0 ? "—" : `${stats.readingTime}m`, sub: "reading", testId: "stat-readtime", color: "text-rose-300" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-3.5 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <motion.div key={String(s.value)}
              initial={{ scale: 0.82, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className={`text-xl font-bold font-mono mb-0.5 ${s.color}`}
              data-testid={s.testId}>
              {s.value}
            </motion.div>
            <div className="text-[10px] font-semibold text-muted-foreground leading-tight">{s.label}</div>
            {s.sub && <div className="text-[9px] text-muted-foreground/50 mt-0.5">{s.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* ── Keyword Density Panel ── */}
      <AnimatePresence>
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button onClick={() => setKeywordsExpanded(!keywordsExpanded)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-foreground hover:text-amber-300 transition-colors"
              data-testid="btn-toggle-keywords">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-400" />
                Keyword Density Analysis
                <span className="text-[10px] font-normal text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Top {Math.min(keywords.length, 5)}
                </span>
              </div>
              {keywordsExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {keywordsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  className="px-5 pb-5 space-y-3 overflow-hidden"
                >
                  {keywords.map((kw, i) => (
                    <div key={kw.word} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/60 font-mono w-4 flex-shrink-0">{i + 1}.</span>
                      <span className="text-sm font-bold text-foreground font-mono w-28 truncate">{kw.word}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${kw.pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.07 }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)", boxShadow: "0 0 8px rgba(245,158,11,0.4)" }} />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-mono">{kw.count}×</span>
                        <span className="text-xs font-bold text-amber-400 font-mono w-10 text-right">{kw.pct}%</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
