import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronDown } from "lucide-react";

type Target = "USA" | "UK";
type SourceSystem = "percentage" | "pak4" | "india10" | "uk100";

interface SourceDef {
  id: SourceSystem;
  label: string;
  max: number;
  toPercent: (v: number) => number;
  placeholder: string;
  step: number;
}

const sources: SourceDef[] = [
  { id: "percentage", label: "Percentage (%)", max: 100, step: 0.1, placeholder: "e.g. 85", toPercent: v => v },
  { id: "pak4",       label: "Pakistan CGPA (/ 4.0)", max: 4.0, step: 0.01, placeholder: "e.g. 3.5", toPercent: v => (v / 4.0) * 100 },
  { id: "india10",    label: "India CGPA (/ 10.0)", max: 10.0, step: 0.01, placeholder: "e.g. 8.5", toPercent: v => (v - 0.75) * 10 },
  { id: "uk100",      label: "UK Marks (/ 100)", max: 100, step: 0.1, placeholder: "e.g. 72", toPercent: v => v },
];

interface USAResult { gpa: number; letter: string; label: string; color: string; pct: number }
interface UKResult  { classification: string; shorthand: string; color: string; bg: string; borderColor: string; description: string }

function toUSAGpa(pct: number): USAResult {
  const clamp = Math.max(0, Math.min(100, pct));
  let gpa: number; let letter: string; let label: string; let color: string;
  if (clamp >= 93)      { gpa = 4.0; letter = "A";  label = "Outstanding";     color = "text-emerald-400"; }
  else if (clamp >= 90) { gpa = 3.7; letter = "A−"; label = "Excellent";       color = "text-emerald-400"; }
  else if (clamp >= 87) { gpa = 3.3; letter = "B+"; label = "Very Good";       color = "text-blue-400"; }
  else if (clamp >= 83) { gpa = 3.0; letter = "B";  label = "Good";            color = "text-blue-400"; }
  else if (clamp >= 80) { gpa = 2.7; letter = "B−"; label = "Above Average";   color = "text-sky-400"; }
  else if (clamp >= 77) { gpa = 2.3; letter = "C+"; label = "Average";         color = "text-amber-400"; }
  else if (clamp >= 73) { gpa = 2.0; letter = "C";  label = "Satisfactory";    color = "text-amber-400"; }
  else if (clamp >= 70) { gpa = 1.7; letter = "C−"; label = "Below Average";   color = "text-orange-400"; }
  else if (clamp >= 67) { gpa = 1.3; letter = "D+"; label = "Poor";            color = "text-red-400"; }
  else if (clamp >= 60) { gpa = 1.0; letter = "D";  label = "Very Poor";       color = "text-red-400"; }
  else                  { gpa = 0.0; letter = "F";  label = "Fail";            color = "text-red-500"; }
  return { gpa, letter, label, color, pct: clamp };
}

function toUKClass(pct: number): UKResult {
  const clamp = Math.max(0, Math.min(100, pct));
  if (clamp >= 70) return {
    classification: "First Class Honours",
    shorthand: "1st",
    color: "text-emerald-300",
    bg: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.35)",
    description: "The highest UK degree classification. Equivalent to summa cum laude.",
  };
  if (clamp >= 60) return {
    classification: "Upper Second Class",
    shorthand: "2:1",
    color: "text-blue-300",
    bg: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.35)",
    description: "Most graduate employers require a minimum 2:1 degree.",
  };
  if (clamp >= 50) return {
    classification: "Lower Second Class",
    shorthand: "2:2",
    color: "text-amber-300",
    bg: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.35)",
    description: "Some employers and postgraduate courses accept 2:2 degrees.",
  };
  if (clamp >= 40) return {
    classification: "Third Class Honours",
    shorthand: "3rd",
    color: "text-orange-300",
    bg: "rgba(249,115,22,0.12)",
    borderColor: "rgba(249,115,22,0.35)",
    description: "A passing degree. Postgraduate entry may be difficult.",
  };
  return {
    classification: "Fail / No Honours",
    shorthand: "Fail",
    color: "text-red-400",
    bg: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.30)",
    description: "Below 40%. The degree is not awarded at honours level.",
  };
}

export default function GPAConverter() {
  const [target, setTarget] = useState<Target>("USA");
  const [sourceId, setSourceId] = useState<SourceSystem>("percentage");
  const [value, setValue] = useState(75);
  const [dropOpen, setDropOpen] = useState(false);

  const src = sources.find(s => s.id === sourceId)!;
  const clamped = Math.max(0, Math.min(src.max, value));
  const pct = Math.max(0, Math.min(100, src.toPercent(clamped)));

  const usaRes = toUSAGpa(pct);
  const ukRes  = toUKClass(pct);
  const pctFill = (clamped / src.max) * 100;

  return (
    <div className="space-y-6">

      {/* Target toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mr-1">Target System:</span>
        {(["USA", "UK"] as Target[]).map(t => (
          <motion.button
            key={t}
            onClick={() => setTarget(t)}
            whileTap={{ scale: 0.95 }}
            className={`relative px-5 py-2 rounded-xl text-sm font-bold border transition-colors duration-200 overflow-hidden ${
              target === t
                ? "border-emerald-500/40 text-emerald-300"
                : "glass-card text-muted-foreground hover:text-foreground border-white/10"
            }`}
            style={target === t ? { background: "rgba(16,185,129,0.14)", boxShadow: "0 0 18px rgba(16,185,129,0.18)" } : {}}
            data-testid={`btn-gpa-target-${t.toLowerCase()}`}
          >
            {target === t && (
              <motion.div layoutId="gpa-target-bg" className="absolute inset-0"
                style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(52,211,153,0.06))" }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }} />
            )}
            <span className="relative">
              {t === "USA" ? "🇺🇸 USA (4.0 GPA)" : "🇬🇧 UK (Honours)"}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Source system dropdown */}
      <div className="relative">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Your Grading System</label>
        <button onClick={() => setDropOpen(!dropOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors text-sm text-foreground"
          style={{ background: "rgba(255,255,255,0.04)" }}
          data-testid="select-gpa-source">
          <span>{src.label}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {dropOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 right-0 rounded-xl border border-white/10 z-40 overflow-hidden"
              style={{ background: "rgba(10,18,44,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
              {sources.map(s => (
                <button key={s.id} onClick={() => { setSourceId(s.id); setValue(Math.min(value, s.max)); setDropOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${s.id === sourceId ? "text-emerald-400 bg-emerald-500/8" : "text-foreground hover:bg-white/5"}`}
                  data-testid={`gpa-source-${s.id}`}>
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slider + Input */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Enter Your Score</label>
          <span className="text-xs text-muted-foreground">Range: 0 – {src.max}</span>
        </div>
        <input type="range" min={0} max={src.max} step={src.step} value={clamped}
          onChange={e => setValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #10b981 ${pctFill}%, rgba(255,255,255,0.1) 0%)` }}
          data-testid="slider-gpa" />
        <div className="flex items-center gap-3">
          <input type="number" value={clamped} onChange={e => setValue(Number(e.target.value))}
            min={0} max={src.max} step={src.step}
            className="w-32 bg-white/5 text-foreground text-2xl font-bold rounded-xl px-3 py-2 border border-white/10 outline-none focus:border-emerald-500/50 font-mono text-center"
            data-testid="input-gpa-value" />
          <span className="text-muted-foreground text-sm">/ {src.max}</span>
          {sourceId !== "percentage" && (
            <span className="ml-auto text-xs text-muted-foreground">≈ <span className="text-foreground font-mono">{pct.toFixed(1)}%</span> equivalent</span>
          )}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {target === "USA" ? (
          <motion.div key="usa-result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.22)", boxShadow: "0 0 30px rgba(16,185,129,0.08)" }}
            data-testid="result-gpa-usa">
            <div className="grid grid-cols-3 gap-6 text-center mb-5">
              <div>
                <div className="text-5xl font-bold text-emerald-400 font-mono mb-1">{usaRes.gpa.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">GPA (4.0 Scale)</div>
              </div>
              <div>
                <div className={`text-5xl font-bold font-mono mb-1 ${usaRes.color}`}>{usaRes.letter}</div>
                <div className="text-xs text-muted-foreground">Letter Grade</div>
              </div>
              <div>
                <div className={`text-xl font-bold mb-1 ${usaRes.color}`}>{usaRes.label}</div>
                <div className="text-xs text-muted-foreground">Classification</div>
              </div>
            </div>
            {/* GPA bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>0.0</span><span>2.0</span><span>3.0</span><span>4.0</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(usaRes.gpa / 4.0) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #10b981, #34d399)", boxShadow: "0 0 10px rgba(16,185,129,0.5)" }} />
              </div>
            </div>
            <TrustBadge />
          </motion.div>
        ) : (
          <motion.div key="uk-result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6 space-y-4"
            style={{ background: ukRes.bg, border: `1px solid ${ukRes.borderColor}`, boxShadow: "0 0 30px rgba(16,185,129,0.06)" }}
            data-testid="result-gpa-uk">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-6xl font-bold font-mono mb-1 ${ukRes.color}`}>{ukRes.shorthand}</div>
                <div className="text-xs text-muted-foreground">UK Classification</div>
              </div>
              <div>
                <div className={`text-lg font-bold mb-1 ${ukRes.color}`}>{ukRes.classification}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{ukRes.description}</p>
              </div>
            </div>
            {/* Classification scale */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "1st", range: "70%+", active: pct >= 70, c: "emerald" },
                { label: "2:1", range: "60–69%", active: pct >= 60 && pct < 70, c: "blue" },
                { label: "2:2", range: "50–59%", active: pct >= 50 && pct < 60, c: "amber" },
                { label: "3rd", range: "40–49%", active: pct >= 40 && pct < 50, c: "orange" },
              ].map(({ label, range, active, c }) => (
                <div key={label} className={`rounded-xl px-2 py-3 text-center border transition-all duration-200 ${
                  active
                    ? `border-${c}-500/40 bg-${c}-500/15`
                    : "border-white/6 bg-white/3 opacity-50"
                }`}>
                  <div className={`text-sm font-bold ${active ? `text-${c}-300` : "text-muted-foreground"}`}>{label}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{range}</div>
                </div>
              ))}
            </div>
            <TrustBadge />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrustBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      <span className="text-xs text-emerald-400/80">Calculated using official US/UK conversion standards</span>
    </div>
  );
}
