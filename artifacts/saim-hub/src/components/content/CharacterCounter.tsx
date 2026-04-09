import { useState, useMemo } from "react";
import { motion } from "framer-motion";

function getStats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) || []).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(Boolean).length;
  const readingTime = Math.ceil(words / 200);
  const speakingTime = Math.ceil(words / 130);
  return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime };
}

function getKeywordDensity(text: string): { word: string; count: number; pct: string }[] {
  if (!text.trim()) return [];
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "was", "are", "were", "be", "this", "that", "it", "by"]);
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const freq: Record<string, number> = {};
  words.forEach((w) => { if (!stopWords.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1; });
  const total = Object.values(freq).reduce((a, b) => a + b, 0);
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, pct: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0" }));
}

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => getStats(text), [text]);
  const keywords = useMemo(() => getKeywordDensity(text), [text]);

  const statCards = [
    { label: "Characters", value: stats.chars, sub: `${stats.charsNoSpaces} without spaces` },
    { label: "Words", value: stats.words },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading Time", value: `${stats.readingTime} min`, sub: "at 200 wpm" },
    { label: "Speaking Time", value: `${stats.speakingTime} min`, sub: "at 130 wpm" },
  ];

  return (
    <div className="space-y-5">
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here to analyze it..."
        rows={8}
        className="w-full bg-muted/30 text-foreground text-sm rounded-2xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50 transition-colors leading-relaxed"
        data-testid="textarea-char-input"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            initial={{ scale: 0.97 }}
            animate={{ scale: 1 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-primary mb-1" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              {s.value}
            </div>
            <div className="text-xs font-medium text-foreground">{s.label}</div>
            {s.sub && <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Keyword Density */}
      {keywords.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-foreground mb-4">Top Keywords (SEO)</h4>
          <div className="space-y-3">
            {keywords.map((kw, i) => (
              <div key={kw.word} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <span className="text-sm font-medium text-foreground w-24 font-mono">{kw.word}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{kw.count}x</span>
                <span className="text-xs text-primary w-12 text-right">{kw.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
