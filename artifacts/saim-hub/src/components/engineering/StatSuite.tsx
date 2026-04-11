import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, TrendingUp, ChevronDown, ChevronUp, Copy, Check,
  AlertCircle, Info, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ─── Maths helpers ────────────────────────────────────────────────────────────

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,;|\n]+/)
    .map(s => s.trim())
    .filter(s => s !== "")
    .map(Number)
    .filter(n => !isNaN(n) && isFinite(n));
}

function mean(a: number[])   { return a.reduce((s, x) => s + x, 0) / a.length; }
function variance(a: number[], mu: number) { return mean(a.map(x => (x - mu) ** 2)); }

function median(sorted: number[]) {
  const n = sorted.length;
  return n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
}

function mode(a: number[]) {
  const freq: Record<number, number> = {};
  for (const x of a) freq[x] = (freq[x] || 0) + 1;
  const max = Math.max(...Object.values(freq));
  const modes = Object.entries(freq).filter(([, f]) => f === max).map(([v]) => Number(v));
  if (modes.length === a.length) return { modes: [], label: "No mode" };
  return { modes, label: modes.slice(0, 5).map(m => fmtN(m)).join(", ") + (modes.length > 5 ? "…" : "") };
}

function percentile(sorted: number[], p: number) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function skewness(a: number[], mu: number, sd: number) {
  if (sd === 0) return 0;
  return mean(a.map(x => ((x - mu) / sd) ** 3));
}

function kurtosis(a: number[], mu: number, sd: number) {
  if (sd === 0) return 0;
  return mean(a.map(x => ((x - mu) / sd) ** 4)) - 3;
}

function linearRegression(x: number[], y: number[]) {
  const n  = x.length;
  const mx = mean(x), my = mean(y);
  const ss = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const sx = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  const m  = ss / sx;
  const b  = my - m * mx;
  const yHat = x.map(xi => m * xi + b);
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0);
  const ssRes = y.reduce((s, yi, i) => s + (yi - yHat[i]) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { m, b, r2 };
}

function buildHistogramBins(data: number[], bins = 10) {
  const lo  = Math.min(...data);
  const hi  = Math.max(...data);
  const w   = (hi - lo) / bins || 1;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    x:     lo + i * w,
    label: `${fmtN(lo + i * w)}`,
    count: 0,
  }));
  for (const v of data) {
    const idx = Math.min(Math.floor((v - lo) / w), bins - 1);
    buckets[idx].count++;
  }
  return buckets;
}

function fmtN(n: number, dec = 4) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1e6 || (abs < 1e-3 && abs > 0)) return n.toExponential(2);
  return parseFloat(n.toFixed(dec)).toString();
}

// ─── Stat row component ───────────────────────────────────────────────────────

function StatRow({ label, value, color = "text-foreground", hint }: {
  label: string; value: string; color?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {hint && (
          <button onClick={() => setShow(s => !s)} className="text-muted-foreground/40 hover:text-muted-foreground">
            <Info className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      <div className="text-right">
        <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
        <AnimatePresence>
          {show && hint && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-[10px] text-muted-foreground/60 mt-0.5 max-w-[180px] text-left"
            >{hint}</motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sample datasets ──────────────────────────────────────────────────────────

const SAMPLES = [
  { label: "Normal sample",  data: "23,25,22,28,24,26,23,27,25,24,22,29,24,26,25,23,28,27,24,26" },
  { label: "Skewed dataset", data: "1,1,1,2,2,3,4,5,7,10,15,22,35,52,80" },
  { label: "Bimodal data",   data: "10,11,10,12,11,10,50,51,50,52,51,50,11,52,10" },
  { label: "Exam scores",    data: "72,85,91,68,77,83,95,62,74,88,79,65,90,71,82" },
];

type ViewMode = "descriptive" | "regression";

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StatSuite() {
  const [viewMode, setViewMode] = useState<ViewMode>("descriptive");
  const [input, setInput]   = useState("");
  const [input2, setInput2] = useState("");
  const [bins, setBins]     = useState(8);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied]   = useState(false);

  // Descriptive stats
  const nums = useMemo(() => parseNumbers(input), [input]);
  const sorted = useMemo(() => [...nums].sort((a, b) => a - b), [nums]);
  const stats = useMemo(() => {
    if (nums.length < 2) return null;
    const mu  = mean(nums);
    const v   = variance(nums, mu);
    const sd  = Math.sqrt(v);
    const q1  = percentile(sorted, 25);
    const q3  = percentile(sorted, 75);
    return {
      n: nums.length, mu, v, sd,
      min: sorted[0], max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      med: median(sorted), mode: calcMode(nums),
      q1, q3, iqr: q3 - q1,
      skew: skewness(nums, mu, sd),
      kurt: kurtosis(nums, mu, sd),
      sem: sd / Math.sqrt(nums.length),
      cv: Math.abs(mu) < 1e-10 ? Infinity : (sd / mu) * 100,
    };
  }, [nums, sorted]);

  function calcMode(a: number[]) { return mode(a); }

  const histBins = useMemo(() =>
    nums.length >= 2 ? buildHistogramBins(nums, bins) : [],
  [nums, bins]);

  // Regression stats
  const nums2 = useMemo(() => parseNumbers(input2), [input2]);
  const reg = useMemo(() => {
    if (nums.length < 2 || nums2.length < 2) return null;
    const n = Math.min(nums.length, nums2.length);
    return linearRegression(nums.slice(0, n), nums2.slice(0, n));
  }, [nums, nums2]);

  const scatterData = useMemo(() => {
    if (!reg) return [];
    const n = Math.min(nums.length, nums2.length);
    return nums.slice(0, n).map((x, i) => ({ x, y: nums2[i] }));
  }, [nums, nums2, reg]);

  const regLinePoints = useMemo(() => {
    if (!reg || scatterData.length === 0) return [];
    const xs = scatterData.map(d => d.x);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    return [{ x: xMin, y: reg.m * xMin + reg.b }, { x: xMax, y: reg.m * xMax + reg.b }];
  }, [reg, scatterData]);

  const copyStats = () => {
    if (!stats) return;
    const lines = [
      `Count: ${stats.n}`, `Mean: ${fmtN(stats.mu)}`, `Median: ${fmtN(stats.med)}`,
      `Std Dev: ${fmtN(stats.sd)}`, `Variance: ${fmtN(stats.v)}`,
      `Min: ${fmtN(stats.min)}`, `Max: ${fmtN(stats.max)}`,
      `Q1: ${fmtN(stats.q1)}`, `Q3: ${fmtN(stats.q3)}`, `IQR: ${fmtN(stats.iqr)}`,
      `Skewness: ${fmtN(stats.skew)}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const hasData = nums.length >= 2;
  const error = input.trim() && !hasData
    ? "Need at least 2 valid numbers separated by commas, spaces or newlines."
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "0 0 16px rgba(139,92,246,0.2)" }}
        >
          <BarChart2 className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Statistical Suite</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Descriptive statistics, histogram analysis, and linear regression
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(["descriptive", "regression"] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              viewMode === m
                ? "border-violet-500/40 bg-violet-500/12 text-violet-300"
                : "border-white/8 text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "descriptive" ? <BarChart2 className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {m === "descriptive" ? "Descriptive" : "Regression"}
          </button>
        ))}
      </div>

      {/* ── Descriptive Mode ── */}
      {viewMode === "descriptive" && (
        <div className="space-y-4">
          {/* Sample buttons */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-muted-foreground self-center">Try sample:</span>
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => setInput(s.data)}
                className="px-2.5 py-1 text-[10px] rounded-lg border border-violet-500/20 bg-violet-500/8 text-violet-400/80 hover:text-violet-300 hover:border-violet-500/40 transition-all"
              >
                {s.label}
              </button>
            ))}
            {input && (
              <button onClick={() => setInput("")}
                className="px-2.5 py-1 text-[10px] rounded-lg border border-white/8 text-muted-foreground hover:text-foreground transition-all ml-auto"
              >
                <RefreshCw className="w-2.5 h-2.5 inline mr-1" />Clear
              </button>
            )}
          </div>

          {/* Input */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-semibold">
              Dataset — paste numbers separated by commas, spaces or new lines
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g.  12, 15, 11, 18, 14, 20, 13, 16, 19, 12"
              rows={4}
              className="w-full bg-white/4 border border-white/10 rounded-xl p-3.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-violet-500/50 transition-colors resize-none"
              data-testid="input-stat-data"
            />
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle className="w-3 h-3" />{error}
              </p>
            )}
            {hasData && <p className="text-[10px] text-muted-foreground/50 mt-1">{nums.length} values parsed</p>}
          </div>

          {/* Results */}
          <AnimatePresence>
            {stats && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Central tendency */}
                  <div className="rounded-2xl p-4 space-y-0.5"
                    style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}
                  >
                    <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-widest mb-2">Central Tendency</p>
                    <StatRow label="Count (n)"   value={String(stats.n)} />
                    <StatRow label="Mean (μ)"    value={fmtN(stats.mu)}  color="text-violet-300"
                      hint="Sum of all values divided by n" />
                    <StatRow label="Median"      value={fmtN(stats.med)}
                      hint="Middle value of the sorted dataset" />
                    <StatRow label="Mode"        value={stats.mode.label}
                      hint="Most frequently occurring value(s)" />
                  </div>

                  {/* Spread */}
                  <div className="rounded-2xl p-4 space-y-0.5"
                    style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.15)" }}
                  >
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-2">Spread</p>
                    <StatRow label="Std Dev (σ)"  value={fmtN(stats.sd)} color="text-primary"
                      hint="Average distance from the mean" />
                    <StatRow label="Variance (σ²)" value={fmtN(stats.v)}
                      hint="Squared average distance from mean" />
                    <StatRow label="Range"         value={fmtN(stats.range)} />
                    <StatRow label="Min / Max"      value={`${fmtN(stats.min)} / ${fmtN(stats.max)}`} />
                  </div>
                </div>

                {/* Extended stats (toggle) */}
                <button onClick={() => setShowAll(s => !s)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAll ? "Hide" : "Show"} advanced statistics
                </button>
                <AnimatePresence>
                  {showAll && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl p-4 space-y-0.5"
                          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                        >
                          <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-2">Quartiles</p>
                          <StatRow label="Q1 (25th pct)"  value={fmtN(stats.q1)}  color="text-emerald-400" />
                          <StatRow label="Q2 / Median"    value={fmtN(stats.med)} />
                          <StatRow label="Q3 (75th pct)"  value={fmtN(stats.q3)}  color="text-emerald-400" />
                          <StatRow label="IQR (Q3 − Q1)"  value={fmtN(stats.iqr)}
                            hint="Interquartile range — measures middle 50% spread" />
                        </div>
                        <div className="rounded-2xl p-4 space-y-0.5"
                          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
                        >
                          <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest mb-2">Distribution Shape</p>
                          <StatRow label="Skewness"    value={fmtN(stats.skew, 3)}
                            hint="0 = symmetric; positive = right tail; negative = left tail" />
                          <StatRow label="Kurtosis"    value={fmtN(stats.kurt, 3)}
                            hint="Excess kurtosis; 0 = normal; >0 = heavy tails" />
                          <StatRow label="Std Error"   value={fmtN(stats.sem)}
                            hint="σ / √n — uncertainty of the sample mean" />
                          <StatRow label="CV (%)"      value={isFinite(stats.cv) ? `${fmtN(stats.cv)}%` : "—"}
                            hint="Coefficient of variation — relative variability" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Histogram */}
                {histBins.length > 0 && (
                  <div className="rounded-2xl p-4 space-y-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground">Histogram</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Bins:</span>
                        {[5, 8, 10, 15, 20].map(b => (
                          <button key={b} onClick={() => setBins(b)}
                            className={`w-6 h-5 rounded text-[10px] font-semibold border transition-all ${
                              bins === b
                                ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                                : "border-white/8 text-muted-foreground hover:text-foreground"
                            }`}
                          >{b}</button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={histBins} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#64748b" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, fontSize: 11 }}
                          cursor={{ fill: "rgba(139,92,246,0.08)" }}
                          formatter={(v: number) => [v, "Count"]}
                        />
                        <Bar dataKey="count" fill="rgba(139,92,246,0.7)" radius={[4, 4, 0, 0]} />
                        <ReferenceLine x={fmtN(stats.mu)} stroke="rgba(67,97,238,0.8)" strokeDasharray="4 2" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground/50">Blue dashed line = mean ({fmtN(stats.mu)})</p>
                  </div>
                )}

                {/* Copy button */}
                <button onClick={copyStats}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy all statistics"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Regression Mode ── */}
      {viewMode === "regression" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter paired X and Y datasets. Both must have the same number of values.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-semibold">X values (independent)</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="1, 2, 3, 4, 5"
                rows={5}
                className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors resize-none"
                data-testid="input-reg-x"
              />
              {nums.length > 0 && <p className="text-[10px] text-muted-foreground/50 mt-1">{nums.length} values</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-semibold">Y values (dependent)</label>
              <textarea
                value={input2}
                onChange={e => setInput2(e.target.value)}
                placeholder="2.1, 4.0, 5.8, 8.2, 9.9"
                rows={5}
                className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-emerald-500/50 transition-colors resize-none"
                data-testid="input-reg-y"
              />
              {nums2.length > 0 && <p className="text-[10px] text-muted-foreground/50 mt-1">{nums2.length} values</p>}
            </div>
          </div>

          {/* Quick demo */}
          <button
            onClick={() => {
              setInput("1,2,3,4,5,6,7,8,9,10");
              setInput2("2.1,3.9,6.2,7.8,10.1,12.0,14.2,16.1,18.3,19.8");
            }}
            className="px-3 py-1.5 text-[10px] rounded-lg border border-primary/20 bg-primary/8 text-primary/70 hover:text-primary transition-all"
          >
            Load demo dataset
          </button>

          <AnimatePresence>
            {reg && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Equation card */}
                <div className="rounded-2xl p-5 space-y-3"
                  style={{ background: "rgba(67,97,238,0.07)", border: "1px solid rgba(67,97,238,0.2)" }}
                >
                  <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Regression Equation</p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    y = {reg.m >= 0 || fmtN(reg.m).startsWith("-") ? "" : "+"}{fmtN(reg.m, 4)}x
                    {reg.b >= 0 ? " + " : " − "}{fmtN(Math.abs(reg.b), 4)}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl" style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.15)" }}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Slope (m)</p>
                      <p className="text-sm font-mono font-bold text-primary">{fmtN(reg.m, 4)}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.15)" }}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Intercept (b)</p>
                      <p className="text-sm font-mono font-bold text-primary">{fmtN(reg.b, 4)}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{
                      background: reg.r2 > 0.9 ? "rgba(16,185,129,0.12)" : reg.r2 > 0.7 ? "rgba(245,158,11,0.10)" : "rgba(239,68,68,0.10)",
                      border: `1px solid ${reg.r2 > 0.9 ? "rgba(16,185,129,0.25)" : reg.r2 > 0.7 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">R² score</p>
                      <p className={`text-sm font-mono font-bold ${reg.r2 > 0.9 ? "text-emerald-400" : reg.r2 > 0.7 ? "text-amber-400" : "text-red-400"}`}>
                        {fmtN(reg.r2, 4)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    R² = {(reg.r2 * 100).toFixed(1)}% of the variance in Y is explained by X.
                    {reg.r2 > 0.9 ? " Excellent fit." : reg.r2 > 0.7 ? " Good fit." : reg.r2 > 0.5 ? " Moderate fit." : " Weak fit."}
                  </p>
                </div>

                {/* Scatter plot */}
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-xs font-bold text-muted-foreground">Scatter Plot + Regression Line</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 9, fill: "#64748b" }} domain={["auto", "auto"]} />
                      <YAxis type="number" dataKey="y" name="Y" tick={{ fontSize: 9, fill: "#64748b" }} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 10, fontSize: 11 }}
                        cursor={{ strokeDasharray: "3 3" }}
                      />
                      <Scatter name="Data" data={scatterData} fill="rgba(67,97,238,0.8)" />
                      <Scatter name="Fit" data={regLinePoints} line={{ stroke: "rgba(16,185,129,0.9)", strokeWidth: 2, strokeDasharray: "6 2" }} fill="none" shape={() => null as unknown as React.ReactElement} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-muted-foreground/50">Blue dots = data points · Green dashed = regression line</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
