import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Palette, Triangle, Percent, CalendarDays, Copy, Check, RotateCcw } from "lucide-react";

type SubTool = "ohms" | "resistor" | "triangle" | "percent" | "color" | "date";

const subTools: { id: SubTool; label: string; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
  { id: "ohms",     label: "Ohm's Law",     icon: Zap,          accent: "#4361ee" },
  { id: "resistor", label: "Resistor Code", icon: Palette,      accent: "#f59e0b" },
  { id: "triangle", label: "Triangle",      icon: Triangle,     accent: "#0ea5e9" },
  { id: "percent",  label: "Percentage",    icon: Percent,      accent: "#8b5cf6" },
  { id: "color",    label: "Color Convert", icon: Palette,      accent: "#10b981" },
  { id: "date",     label: "Date Diff",     icon: CalendarDays, accent: "#ec4899" },
];

export default function QuickTools() {
  const [active, setActive] = useState<SubTool>("ohms");

  return (
    <div>
      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {subTools.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isActive ? "text-white" : "text-muted-foreground hover:text-foreground border-white/8 bg-white/4 hover:bg-white/8"
              }`}
              style={isActive ? {
                background: `linear-gradient(135deg, ${t.accent}33 0%, ${t.accent}18 100%)`,
                borderColor: `${t.accent}66`,
                boxShadow: `0 0 16px ${t.accent}33`,
              } : {}}
              data-testid={`subtool-${t.id}`}
            >
              <span style={isActive ? { color: t.accent } : undefined} className="inline-flex">
                <Icon className="w-3.5 h-3.5" />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {active === "ohms"     && <OhmsLaw />}
          {active === "resistor" && <ResistorDecoder />}
          {active === "triangle" && <TriangleSolver />}
          {active === "percent"  && <PercentageCalc />}
          {active === "color"    && <ColorConverter />}
          {active === "date"     && <DateDiff />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Shared UI primitives ─────────── */

function NumberField({ label, value, onChange, unit, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-primary/50 transition-colors">
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-foreground outline-none text-sm min-w-0"
        />
        {unit && <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit, accent = "#4361ee" }: { label: string; value: string; unit?: string; accent?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ }
  };
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}
    >
      <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold" style={{ color: accent }}>
          {value}{unit && <span className="text-muted-foreground font-normal text-xs ml-1">{unit}</span>}
        </span>
        <button onClick={handleCopy} className="p-1 rounded-md hover:bg-white/8 text-muted-foreground transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) > 1e6 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(3);
  return Number(n.toFixed(digits)).toString();
}

/* ─────────── 1. Ohm's Law ─────────── */

function OhmsLaw() {
  const [v, setV] = useState(""); const [i, setI] = useState(""); const [r, setR] = useState(""); const [p, setP] = useState("");

  const result = useMemo(() => {
    const V = parseFloat(v), I = parseFloat(i), R = parseFloat(r), P = parseFloat(p);
    const known = [!isNaN(V), !isNaN(I), !isNaN(R), !isNaN(P)].filter(Boolean).length;
    if (known < 2) return null;
    let V2 = V, I2 = I, R2 = R, P2 = P;
    if (!isNaN(V) && !isNaN(I))      { R2 = V / I;        P2 = V * I; }
    else if (!isNaN(V) && !isNaN(R)) { I2 = V / R;        P2 = (V*V) / R; }
    else if (!isNaN(I) && !isNaN(R)) { V2 = I * R;        P2 = I * I * R; }
    else if (!isNaN(V) && !isNaN(P)) { I2 = P / V;        R2 = (V*V) / P; }
    else if (!isNaN(I) && !isNaN(P)) { V2 = P / I;        R2 = P / (I*I); }
    else if (!isNaN(R) && !isNaN(P)) { I2 = Math.sqrt(P/R); V2 = I2 * R; }
    return { V: V2, I: I2, R: R2, P: P2 };
  }, [v, i, r, p]);

  const reset = () => { setV(""); setI(""); setR(""); setP(""); };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <NumberField label="Voltage"    value={v} onChange={setV} unit="V"  placeholder="e.g. 12" />
        <NumberField label="Current"    value={i} onChange={setI} unit="A"  placeholder="e.g. 0.5" />
        <NumberField label="Resistance" value={r} onChange={setR} unit="Ω"  placeholder="e.g. 100" />
        <NumberField label="Power"      value={p} onChange={setP} unit="W"  placeholder="e.g. 60" />
      </div>
      <p className="text-xs text-muted-foreground mb-4">Enter any two values — the rest are calculated automatically.</p>

      {result ? (
        <div className="space-y-2">
          <ResultRow label="Voltage (V)"    value={fmt(result.V)} unit="V" accent="#4361ee" />
          <ResultRow label="Current (I)"    value={fmt(result.I)} unit="A" accent="#0ea5e9" />
          <ResultRow label="Resistance (R)" value={fmt(result.R)} unit="Ω" accent="#f59e0b" />
          <ResultRow label="Power (P)"      value={fmt(result.P)} unit="W" accent="#10b981" />
          <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Enter at least two values to compute.
        </div>
      )}
    </div>
  );
}

/* ─────────── 2. Resistor Color Code ─────────── */

const COLOR_BANDS = [
  { name: "Black",  hex: "#000000", digit: 0,  mult: 1,        tol: null },
  { name: "Brown",  hex: "#8B4513", digit: 1,  mult: 10,       tol: 1 },
  { name: "Red",    hex: "#dc2626", digit: 2,  mult: 100,      tol: 2 },
  { name: "Orange", hex: "#f97316", digit: 3,  mult: 1_000,    tol: null },
  { name: "Yellow", hex: "#eab308", digit: 4,  mult: 10_000,   tol: null },
  { name: "Green",  hex: "#22c55e", digit: 5,  mult: 100_000,  tol: 0.5 },
  { name: "Blue",   hex: "#3b82f6", digit: 6,  mult: 1_000_000,tol: 0.25 },
  { name: "Violet", hex: "#8b5cf6", digit: 7,  mult: 10_000_000, tol: 0.1 },
  { name: "Grey",   hex: "#6b7280", digit: 8,  mult: 100_000_000, tol: null },
  { name: "White",  hex: "#f5f5f5", digit: 9,  mult: 1_000_000_000, tol: null },
  { name: "Gold",   hex: "#d4af37", digit: null, mult: 0.1,   tol: 5 },
  { name: "Silver", hex: "#c0c0c0", digit: null, mult: 0.01,  tol: 10 },
];

function ResistorDecoder() {
  const [b1, setB1] = useState(1); // brown
  const [b2, setB2] = useState(0); // black
  const [mult, setMult] = useState(2); // red ×100
  const [tol, setTol] = useState(10); // gold ±5%

  const digit1 = COLOR_BANDS[b1].digit;
  const digit2 = COLOR_BANDS[b2].digit;
  const value  = digit1 != null && digit2 != null ? (digit1 * 10 + digit2) * COLOR_BANDS[mult].mult : NaN;
  const tolerance = COLOR_BANDS[tol].tol;

  const formatOhms = (v: number) => {
    if (!Number.isFinite(v)) return "—";
    if (v >= 1e9) return `${(v/1e9).toFixed(2)} GΩ`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)} MΩ`;
    if (v >= 1e3) return `${(v/1e3).toFixed(2)} kΩ`;
    return `${v} Ω`;
  };

  const Band = ({ idx, set, kind }: { idx: number; set: (i: number) => void; kind: "digit" | "mult" | "tol" }) => {
    const valid = COLOR_BANDS.map((b, i) => ({ b, i })).filter(({ b }) => {
      if (kind === "digit") return b.digit != null;
      if (kind === "tol")   return b.tol != null;
      return true;
    });
    return (
      <select
        value={idx}
        onChange={(e) => set(parseInt(e.target.value))}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-primary/50"
        style={{ borderLeft: `4px solid ${COLOR_BANDS[idx].hex}` }}
      >
        {valid.map(({ b, i }) => <option key={i} value={i} className="bg-slate-900">{b.name}</option>)}
      </select>
    );
  };

  return (
    <div>
      {/* Visual resistor */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-64 h-14 rounded-full" style={{ background: "linear-gradient(180deg, #d4a373 0%, #a8693a 50%, #d4a373 100%)" }}>
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-1 bg-gray-400" />
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-1 bg-gray-400" />
          {[b1, b2, mult, tol].map((bandIdx, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-3" style={{
              background: COLOR_BANDS[bandIdx].hex,
              left: `${20 + i * 18}%`,
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
            }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <div><label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Band 1</label><Band idx={b1} set={setB1} kind="digit" /></div>
        <div><label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Band 2</label><Band idx={b2} set={setB2} kind="digit" /></div>
        <div><label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Multiplier</label><Band idx={mult} set={setMult} kind="mult" /></div>
        <div><label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Tolerance</label><Band idx={tol} set={setTol} kind="tol" /></div>
      </div>

      <div className="space-y-2">
        <ResultRow label="Resistance" value={formatOhms(value)} accent="#f59e0b" />
        <ResultRow label="Tolerance"  value={tolerance != null ? `±${tolerance}%` : "—"} accent="#10b981" />
      </div>
    </div>
  );
}

/* ─────────── 3. Triangle Solver ─────────── */

function TriangleSolver() {
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState("");

  const result = useMemo(() => {
    const A = parseFloat(a), B = parseFloat(b), C = parseFloat(c);
    if (isNaN(A) || isNaN(B) || isNaN(C)) return null;
    if (A + B <= C || A + C <= B || B + C <= A) return { error: "Invalid: sides do not form a triangle." };
    // Law of cosines
    const angA = Math.acos((B*B + C*C - A*A) / (2*B*C)) * 180 / Math.PI;
    const angB = Math.acos((A*A + C*C - B*B) / (2*A*C)) * 180 / Math.PI;
    const angC = 180 - angA - angB;
    const s = (A + B + C) / 2;
    const area = Math.sqrt(s * (s-A) * (s-B) * (s-C));
    return { angA, angB, angC, area, perimeter: A+B+C };
  }, [a, b, c]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <NumberField label="Side a" value={a} onChange={setA} placeholder="3" />
        <NumberField label="Side b" value={b} onChange={setB} placeholder="4" />
        <NumberField label="Side c" value={c} onChange={setC} placeholder="5" />
      </div>
      <p className="text-xs text-muted-foreground mb-4">Enter all three side lengths — angles, area and perimeter are computed via law of cosines.</p>

      {!result ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Enter all three sides to solve.
        </div>
      ) : "error" in result ? (
        <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">
          {result.error}
        </div>
      ) : (
        <div className="space-y-2">
          <ResultRow label="Angle A" value={fmt(result.angA, 2)} unit="°" accent="#0ea5e9" />
          <ResultRow label="Angle B" value={fmt(result.angB, 2)} unit="°" accent="#0ea5e9" />
          <ResultRow label="Angle C" value={fmt(result.angC, 2)} unit="°" accent="#0ea5e9" />
          <ResultRow label="Area"       value={fmt(result.area)}      accent="#10b981" />
          <ResultRow label="Perimeter"  value={fmt(result.perimeter)} accent="#f59e0b" />
        </div>
      )}
    </div>
  );
}

/* ─────────── 4. Percentage Calculator ─────────── */

function PercentageCalc() {
  const [mode, setMode] = useState<"of" | "is" | "change">("of");
  const [x, setX] = useState(""); const [y, setY] = useState("");

  const result = useMemo(() => {
    const X = parseFloat(x), Y = parseFloat(y);
    if (isNaN(X) || isNaN(Y)) return null;
    if (mode === "of")     return { value: (X/100) * Y,             label: `${X}% of ${Y}` };
    if (mode === "is")     return { value: (X/Y) * 100,             label: `${X} is what % of ${Y}`, unit: "%" };
    if (mode === "change") return { value: ((Y-X)/X) * 100,         label: `% change from ${X} to ${Y}`, unit: "%" };
    return null;
  }, [x, y, mode]);

  const modes = [
    { id: "of"     as const, label: "X% of Y",        a: "X (%)", b: "Y" },
    { id: "is"     as const, label: "X is what % of Y", a: "X",    b: "Y" },
    { id: "change" as const, label: "% change",       a: "From", b: "To" },
  ];
  const cur = modes.find(m => m.id === mode)!;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              mode === m.id ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/4 border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <NumberField label={cur.a} value={x} onChange={setX} />
        <NumberField label={cur.b} value={y} onChange={setY} />
      </div>

      {result ? (
        <ResultRow label={result.label} value={fmt(result.value, 4)} unit={"unit" in result ? result.unit : ""} accent="#8b5cf6" />
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Enter both values to calculate.
        </div>
      )}
    </div>
  );
}

/* ─────────── 5. Color Converter ─────────── */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const R=r/255, G=g/255, B=b/255;
  const max=Math.max(R,G,B), min=Math.min(R,G,B);
  const l=(max+min)/2; let h=0, s=0;
  if (max !== min) {
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    if (max===R) h=((G-B)/d + (G<B?6:0));
    else if (max===G) h=((B-R)/d + 2);
    else h=((R-G)/d + 4);
    h*=60;
  }
  return [Math.round(h), Math.round(s*100), Math.round(l*100)];
}

function ColorConverter() {
  const [hex, setHex] = useState("#4361ee");
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-2xl flex-shrink-0 border-2 border-white/10"
          style={{ background: rgb ? hex : "transparent", boxShadow: rgb ? `0 0 32px ${hex}66` : "none" }}
        />
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">HEX Input</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={rgb ? hex : "#4361ee"}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="w-12 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-primary/50 font-mono"
              placeholder="#4361EE"
            />
          </div>
        </div>
      </div>

      {rgb && hsl ? (
        <div className="space-y-2">
          <ResultRow label="HEX" value={hex.toUpperCase()}                                          accent="#4361ee" />
          <ResultRow label="RGB" value={`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}                     accent="#10b981" />
          <ResultRow label="HSL" value={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}                   accent="#f59e0b" />
          <ResultRow label="CSS Var" value={`--brand: ${hex.toUpperCase()};`}                       accent="#8b5cf6" />
        </div>
      ) : (
        <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">
          Invalid HEX color. Use format #RRGGBB.
        </div>
      )}
    </div>
  );
}

/* ─────────── 6. Date Difference ─────────── */

function DateDiff() {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  useEffect(() => {
    if (!start) setStart(today);
  }, [start, today]);

  const result = useMemo(() => {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const ms = e.getTime() - s.getTime();
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    const weeks = days / 7;
    // Calendar months/years
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) months -= 1;
    const years = months / 12;
    return { days, weeks, months, years };
  }, [start, end]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Start Date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-primary/50 [color-scheme:dark]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">End Date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-primary/50 [color-scheme:dark]" />
        </div>
      </div>

      {result ? (
        <div className="space-y-2">
          <ResultRow label="Days"   value={result.days.toLocaleString()}     accent="#ec4899" />
          <ResultRow label="Weeks"  value={fmt(result.weeks, 2)}             accent="#0ea5e9" />
          <ResultRow label="Months" value={result.months.toString()}         accent="#f59e0b" />
          <ResultRow label="Years"  value={fmt(result.years, 3)}             accent="#10b981" />
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Pick two dates to compare.
        </div>
      )}
    </div>
  );
}
