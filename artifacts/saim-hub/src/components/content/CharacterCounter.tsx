import { useState, useMemo } from "react";
import { motion } from "framer-motion";

function getStats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]*[.!?]+/g) || []).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(Boolean).length;
  const readingTime = Math.ceil(words / 200);
  const speakingTime = Math.ceil(words / 130);
  return { chars, charsNoSpaces, words, lines, sentences, paragraphs, readingTime, speakingTime };
}

function getKeywordDensity(text: string): { word: string; count: number; pct: string }[] {
  if (!text.trim()) return [];
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "was", "are", "were", "be", "this", "that", "it", "by"]);
  const matches: string[] = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  const freq: Record<string, number> = {};
  matches.forEach((w: string) => { if (!stopWords.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1; });
  const total = Object.values(freq).reduce((a, b) => a + b, 0);
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, pct: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0" }));
}

export default function CharacterCounter() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const stats = useMemo(() => getStats(text), [text]);
  const keywords = useMemo(() => getKeywordDensity(text), [text]);

  const statCards = [
    { label: "Characters", value: stats.chars, sub: `${stats.charsNoSpaces} no spaces`, testId: "characters" },
    { label: "Words", value: stats.words, sub: undefined, testId: "words" },
    { label: "Lines", value: stats.lines, sub: undefined, testId: "lines" },
    { label: "Sentences", value: stats.sentences, sub: undefined, testId: "sentences" },
    { label: "Read Time", value: `${stats.readingTime}m`, sub: "at 200 wpm", testId: "reading-time" },
    { label: "Speak Time", value: `${stats.speakingTime}m`, sub: "at 130 wpm", testId: "speaking-time" },
  ];

  return (
    <div className="space-y-5">
      {/* Textarea with focus glow */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 3px rgba(67,97,238,0.18), 0 0 32px rgba(67,97,238,0.10)"
            : "0 0 0 0px rgba(67,97,238,0)",
        }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type or paste your text here to analyze it in real time..."
          rows={8}
          className="w-full bg-muted/30 text-foreground text-sm rounded-2xl px-4 py-3.5 border border-white/10 outline-none resize-none placeholder:text-muted-foreground/40 transition-colors duration-200 leading-relaxed"
          style={{
            borderColor: focused ? "rgba(67,97,238,0.5)" : undefined,
          }}
          data-testid="textarea-char-input"
        />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <motion.div
              key={String(s.value)}
              initial={{ scale: 0.88, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-primary mb-1 font-mono"
              data-testid={`stat-${s.testId}`}
            >
              {s.value}
            </motion.div>
            <div className="text-xs font-medium text-foreground leading-tight">{s.label}</div>
            {s.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Keyword Density */}
      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <h4 className="text-sm font-semibold text-foreground mb-4">Top Keywords</h4>
          <div className="space-y-3">
            {keywords.map((kw, i) => (
              <div key={kw.word} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 font-mono">{i + 1}.</span>
                <span className="text-sm font-medium text-foreground w-24 font-mono truncate">{kw.word}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right font-mono">{kw.count}×</span>
                <span className="text-xs text-primary w-12 text-right font-mono">{kw.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
