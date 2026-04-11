import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Plus, Trash2, AlertCircle, CheckCircle2, Info, ChevronDown } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type BeamType   = "Simply Supported" | "Cantilever";
type LoadKind   = "point" | "udl";

interface LoadEntry {
  id: string;
  kind: LoadKind;
  mag: string;      // kN  or  kN/m
  pos: string;      // m  (point load position OR udl start)
  end: string;      // m  (udl end, unused for point)
}

/* ─── Presets ────────────────────────────────────────────────────────────── */
const MATERIAL_PRESETS: Record<string, { E: number; label: string }> = {
  "Structural Steel":    { E: 200,  label: "E = 200 GPa" },
  "Reinforced Concrete": { E: 30,   label: "E = 30 GPa"  },
  "Structural Timber":   { E: 11,   label: "E = 11 GPa"  },
  "Aluminium 6061":      { E: 70,   label: "E = 70 GPa"  },
  "Custom":              { E: 200,  label: "Enter below"  },
};

const SECTION_PRESETS: Record<string, Record<string, number | null>> = {
  "Structural Steel": {
    "IPE 200  (I = 19.4 × 10⁶ mm⁴)":  19.4e6,
    "IPE 300  (I = 83.6 × 10⁶ mm⁴)":  83.6e6,
    "UB 305×165 (I = 85.0 × 10⁶ mm⁴)": 85.0e6,
    "UB 406×178 (I = 274 × 10⁶ mm⁴)":  274e6,
    "Custom (enter I below)":            null,
  },
  "Reinforced Concrete": {
    "200×400 mm (I = 1.07 × 10⁹ mm⁴)": (200 * 400 ** 3) / 12,
    "300×600 mm (I = 5.40 × 10⁹ mm⁴)": (300 * 600 ** 3) / 12,
    "400×800 mm (I = 17.1 × 10⁹ mm⁴)": (400 * 800 ** 3) / 12,
    "Custom (enter I below)":            null,
  },
  "Structural Timber": {
    "47×145 mm C24 (I = 11.9 × 10⁶ mm⁴)": (47 * 145 ** 3) / 12,
    "47×195 mm C24 (I = 29.2 × 10⁶ mm⁴)": (47 * 195 ** 3) / 12,
    "Custom (enter I below)":               null,
  },
  "Aluminium 6061": {
    "Custom (enter I below)": null,
  },
  "Custom": {
    "Custom (enter I below)": null,
  },
};

/* ─── Maths ──────────────────────────────────────────────────────────────── */
interface Load { kind: LoadKind; mag: number; pos: number; end: number }

function computeBeam(beamType: BeamType, L: number, loads: Load[], E_GPa: number, I_mm4: number) {
  const N = 200;
  const dx_m = L / N;
  const L_mm = L * 1000;
  const E_Nmm2 = E_GPa * 1000;        // GPa → N/mm² = MPa
  const EI = E_Nmm2 * I_mm4;          // N·mm²

  /* ── Reactions ─────────────────────────────────────────────────────────── */
  let Ra = 0, Rb = 0, Ma = 0;

  if (beamType === "Simply Supported") {
    let momentAboutA = 0;
    let totalLoad = 0;
    for (const l of loads) {
      if (l.kind === "point") {
        momentAboutA += l.mag * l.pos;
        totalLoad    += l.mag;
      } else {
        const span = Math.min(l.end, L) - Math.max(l.pos, 0);
        if (span <= 0) continue;
        const centroid = Math.max(l.pos, 0) + span / 2;
        momentAboutA += l.mag * span * centroid;
        totalLoad    += l.mag * span;
      }
    }
    Rb = momentAboutA / L;
    Ra = totalLoad - Rb;
  } else {
    // Cantilever — fixed at x=0
    for (const l of loads) {
      if (l.kind === "point") {
        Ra += l.mag;
        Ma += l.mag * l.pos;
      } else {
        const span = Math.min(l.end, L) - Math.max(l.pos, 0);
        if (span <= 0) continue;
        const centroid = Math.max(l.pos, 0) + span / 2;
        Ra += l.mag * span;
        Ma += l.mag * span * centroid;
      }
    }
  }

  /* ── SFD / BMD ──────────────────────────────────────────────────────────── */
  const xs: number[] = Array.from({ length: N + 1 }, (_, i) => i * dx_m);
  const V: number[] = new Array(N + 1).fill(0);
  const M_kNm: number[] = new Array(N + 1).fill(0);

  for (let i = 0; i <= N; i++) {
    const x = xs[i];
    let v = 0, m = 0;

    if (beamType === "Simply Supported") {
      v = Ra;
      m = Ra * x;
      for (const l of loads) {
        if (l.kind === "point") {
          if (x > l.pos) { v -= l.mag; m -= l.mag * (x - l.pos); }
        } else {
          const s0 = Math.max(l.pos, 0), s1 = Math.min(l.end, L);
          if (s0 >= s1) continue;
          const applied = Math.max(0, Math.min(x, s1) - s0);
          v -= l.mag * applied;
          const centroid = s0 + applied / 2;
          m -= l.mag * applied * (x - centroid);
        }
      }
    } else {
      // Cantilever: compute from free end (right)
      v = 0; m = 0;
      for (const l of loads) {
        if (l.kind === "point") {
          if (l.pos > x) { v -= l.mag; m -= l.mag * (l.pos - x); }
        } else {
          const s0 = Math.max(l.pos, x), s1 = Math.min(l.end, L);
          if (s0 >= s1) continue;
          const span = s1 - s0;
          const centroid = s0 + span / 2;
          v -= l.mag * span;
          m -= l.mag * span * (centroid - x);
        }
      }
    }

    V[i]     = v;          // kN
    M_kNm[i] = m;          // kN·m
  }

  /* ── Deflection (numerical double integration) ──────────────────────────── */
  // M in kN·m → N·mm = kN·m × 10⁶
  const dx_mm = L_mm / N;
  const kappa  = M_kNm.map(m_km => (m_km * 1e6) / EI); // 1/mm (curvature)

  // Integrate once → slope (theta), no constant yet
  const theta_raw: number[] = [0];
  for (let i = 1; i <= N; i++) {
    theta_raw.push(theta_raw[i - 1] + kappa[i] * dx_mm);
  }

  // Integrate again → deflection_raw
  const delta_raw: number[] = [0];
  for (let i = 1; i <= N; i++) {
    delta_raw.push(delta_raw[i - 1] + theta_raw[i] * dx_mm);
  }

  // Apply boundary conditions
  let delta: number[];
  if (beamType === "Simply Supported") {
    // δ(0) = 0, δ(L) = 0  →  C1 = -delta_raw[L] / L
    const C1 = -delta_raw[N] / L_mm;
    delta = delta_raw.map((d, i) => d + C1 * i * dx_mm);
  } else {
    // θ(0) = 0, δ(0) = 0  →  C1 = -theta_raw[0] = 0 (already 0), C2 = 0
    delta = delta_raw;
  }

  /* ── Build chart data ────────────────────────────────────────────────────── */
  const chartData = xs.map((x, i) => ({
    x: parseFloat(x.toFixed(3)),
    V: parseFloat(V[i].toFixed(4)),
    M: parseFloat(M_kNm[i].toFixed(4)),
    D: parseFloat(delta[i].toFixed(4)),
  }));

  const maxV    = Math.max(...V.map(Math.abs));
  const maxM    = Math.max(...M_kNm.map(Math.abs));
  const maxDmm  = Math.max(...delta.map(Math.abs));

  const posMaxM = xs[M_kNm.map(Math.abs).indexOf(Math.max(...M_kNm.map(Math.abs)))];
  const ratio   = maxDmm > 0 ? Math.round((L_mm) / maxDmm) : Infinity;

  return { Ra, Rb, Ma, chartData, maxV, maxM, maxDmm, posMaxM, ratio };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8);

function fmt(n: number, dp = 3) {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(dp);
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function BeamCalculator() {
  const [beamType,  setBeamType]  = useState<BeamType>("Simply Supported");
  const [spanStr,   setSpanStr]   = useState("6");
  const [material,  setMaterial]  = useState("Structural Steel");
  const [section,   setSection]   = useState("IPE 300  (I = 83.6 × 10⁶ mm⁴)");
  const [customE,   setCustomE]   = useState("200");
  const [customI,   setCustomI]   = useState("83600000");
  const [loads, setLoads]         = useState<LoadEntry[]>([
    { id: uid(), kind: "point", mag: "25", pos: "3",   end: "6" },
    { id: uid(), kind: "udl",   mag: "5",  pos: "0",   end: "6" },
  ]);
  const [addKind,   setAddKind]   = useState<LoadKind>("point");
  const [showTips,  setShowTips]  = useState(false);

  const E_val = material === "Custom" ? parseFloat(customE) || 0 : MATERIAL_PRESETS[material]?.E ?? 200;
  const sectionOptions = SECTION_PRESETS[material] ?? {};
  const sectionI_raw = sectionOptions[section];
  const I_val = (sectionI_raw !== undefined && sectionI_raw !== null)
    ? sectionI_raw
    : parseFloat(customI) || 0;

  /* ─── Material change ────────────────────────────────────────────────────── */
  const handleMaterialChange = useCallback((mat: string) => {
    setMaterial(mat);
    const opts = SECTION_PRESETS[mat] ?? {};
    const firstKey = Object.keys(opts)[0] ?? "";
    setSection(firstKey);
  }, []);

  /* ─── Load CRUD ──────────────────────────────────────────────────────────── */
  const addLoad = useCallback(() => {
    setLoads(prev => [...prev, { id: uid(), kind: addKind, mag: addKind === "point" ? "10" : "5", pos: "0", end: "3" }]);
  }, [addKind]);

  const removeLoad = useCallback((id: string) => {
    setLoads(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLoad = useCallback((id: string, key: keyof LoadEntry, val: string) => {
    setLoads(prev => prev.map(l => l.id === id ? { ...l, [key]: val } : l));
  }, []);

  /* ─── Compute ────────────────────────────────────────────────────────────── */
  const result = useMemo(() => {
    const L = parseFloat(spanStr) || 0;
    if (L <= 0 || E_val <= 0 || I_val <= 0) return null;

    const parsedLoads: Load[] = loads
      .map(l => ({
        kind: l.kind,
        mag:  parseFloat(l.mag) || 0,
        pos:  parseFloat(l.pos) || 0,
        end:  parseFloat(l.end) || 0,
      }))
      .filter(l => l.mag > 0 && (l.kind === "point" ? (l.pos >= 0 && l.pos <= L) : (l.end > l.pos)));

    if (parsedLoads.length === 0) return null;
    return computeBeam(beamType, L, parsedLoads, E_val, I_val);
  }, [beamType, spanStr, loads, E_val, I_val]);

  const L = parseFloat(spanStr) || 0;
  const SPAN_LIMIT  = beamType === "Simply Supported" ? 250 : 300;  // L/δ ≥ 250–300 is typical code check

  /* ─── Custom tooltip ─────────────────────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SFDTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2 text-xs font-mono" style={{ background: "rgba(8,12,28,0.95)", border: "1px solid rgba(16,185,129,0.25)" }}>
        <p className="text-muted-foreground mb-0.5">x = {Number(label).toFixed(2)} m</p>
        <p className="text-emerald-400 font-semibold">V = {Number(payload[0]?.value).toFixed(3)} kN</p>
      </div>
    );
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BMDTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2 text-xs font-mono" style={{ background: "rgba(8,12,28,0.95)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <p className="text-muted-foreground mb-0.5">x = {Number(label).toFixed(2)} m</p>
        <p className="text-violet-400 font-semibold">M = {Number(payload[0]?.value).toFixed(3)} kN·m</p>
      </div>
    );
  };

  const passCheck = result ? result.ratio >= SPAN_LIMIT : false;

  return (
    <div className="space-y-6">
      {/* ── Top row: Beam + Material config ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Beam Setup */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Beam Configuration</p>

          {/* Beam type */}
          <div className="flex gap-2">
            {(["Simply Supported", "Cantilever"] as BeamType[]).map(t => (
              <button key={t} onClick={() => setBeamType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  beamType === t ? "bg-primary text-primary-foreground shadow shadow-primary/25" : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >{t}</button>
            ))}
          </div>

          {/* Span */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Span L (m)</label>
            <input type="number" value={spanStr} onChange={e => setSpanStr(e.target.value)} min="0.1" step="0.5"
              className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none font-mono focus:border-primary/50 transition-colors"
            />
          </div>

          {/* SVG beam diagram */}
          <BeamDiagram beamType={beamType} loads={loads} span={L || 6} />
        </div>

        {/* Material & Section */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material & Section</p>

          {/* Material */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Material</label>
            <select value={material} onChange={e => handleMaterialChange(e.target.value)}
              className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 transition-colors"
            >
              {Object.keys(MATERIAL_PRESETS).map(k => <option key={k} value={k}>{k} — {MATERIAL_PRESETS[k].label}</option>)}
            </select>
          </div>

          {material === "Custom" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Young's Modulus E (GPa)</label>
              <input type="number" value={customE} onChange={e => setCustomE(e.target.value)} min="1"
                className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none font-mono focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Section */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)}
              className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 transition-colors"
            >
              {Object.keys(sectionOptions).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Custom I */}
          {sectionI_raw === null && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Second Moment of Area I (mm⁴)</label>
              <input type="number" value={customI} onChange={e => setCustomI(e.target.value)} min="1"
                className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none font-mono focus:border-primary/50 transition-colors"
              />
              <p className="text-[10px] text-muted-foreground/50 mt-1">Rectangle: I = bh³/12 · Circle: I = πd⁴/64</p>
            </div>
          )}

          {/* Active values */}
          <div className="flex gap-3 pt-1">
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.18)" }}>
              <p className="text-[10px] text-muted-foreground mb-0.5">E</p>
              <p className="text-sm font-bold font-mono text-primary">{E_val} GPa</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.18)" }}>
              <p className="text-[10px] text-muted-foreground mb-0.5">I</p>
              <p className="text-sm font-bold font-mono text-sky-400">{I_val > 0 ? (I_val / 1e6).toFixed(1) + " ×10⁶" : "—"} mm⁴</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
              <p className="text-[10px] text-muted-foreground mb-0.5">EI</p>
              <p className="text-sm font-bold font-mono text-amber-400">
                {E_val > 0 && I_val > 0 ? ((E_val * 1000 * I_val) / 1e12).toFixed(1) + " MN·m²" : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loads ────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied Loads</p>
          <div className="flex items-center gap-2">
            <select value={addKind} onChange={e => setAddKind(e.target.value as LoadKind)}
              className="text-xs bg-muted/50 text-muted-foreground rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-primary/40 transition-colors"
            >
              <option value="point">Point Load (kN)</option>
              <option value="udl">UDL (kN/m)</option>
            </select>
            <button onClick={addLoad} disabled={loads.length >= 6}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> Add Load
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {loads.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No loads added. Click "Add Load" to start.</p>
          )}
          {loads.map((l) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                l.kind === "point" ? "bg-amber-400/15 text-amber-400 border border-amber-400/25" : "bg-sky-400/15 text-sky-400 border border-sky-400/25"
              }`}>
                {l.kind === "point" ? "POINT" : "UDL"}
              </span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <label className="text-[10px] text-muted-foreground">
                  {l.kind === "point" ? "P (kN)" : "w (kN/m)"}
                </label>
                <input type="number" value={l.mag} onChange={e => updateLoad(l.id, "mag", e.target.value)} min="0"
                  className="w-20 bg-muted/60 text-foreground text-xs rounded-lg px-2.5 py-1.5 border border-white/10 outline-none font-mono focus:border-amber-400/40 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <label className="text-[10px] text-muted-foreground">
                  {l.kind === "point" ? "at x (m)" : "from (m)"}
                </label>
                <input type="number" value={l.pos} onChange={e => updateLoad(l.id, "pos", e.target.value)} min="0" max={spanStr}
                  className="w-20 bg-muted/60 text-foreground text-xs rounded-lg px-2.5 py-1.5 border border-white/10 outline-none font-mono focus:border-sky-400/40 transition-colors"
                />
              </div>

              {l.kind === "udl" && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label className="text-[10px] text-muted-foreground">to (m)</label>
                  <input type="number" value={l.end} onChange={e => updateLoad(l.id, "end", e.target.value)} min="0" max={spanStr}
                    className="w-20 bg-muted/60 text-foreground text-xs rounded-lg px-2.5 py-1.5 border border-white/10 outline-none font-mono focus:border-sky-400/40 transition-colors"
                  />
                </div>
              )}

              <button onClick={() => removeLoad(l.id)}
                className="ml-auto p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/8 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <ResultCard label="Ra" value={fmt(result.Ra, 2)} unit="kN" color="primary" />
              {beamType === "Simply Supported"
                ? <ResultCard label="Rb"      value={fmt(result.Rb, 2)}         unit="kN"   color="sky" />
                : <ResultCard label="MA"      value={fmt(result.Ma, 2)}         unit="kN·m" color="sky" />
              }
              <ResultCard label="Max |V|" value={fmt(result.maxV, 2)}           unit="kN"   color="emerald" />
              <ResultCard label="Max |M|" value={fmt(result.maxM, 2)}           unit="kN·m" color="violet" />
              <ResultCard label="Max δ"   value={fmt(result.maxDmm, 3)}         unit="mm"   color="amber" />
              <ResultCard label="L/δ"
                value={result.ratio >= 1e6 ? "∞" : result.ratio.toLocaleString()}
                unit=""
                color={passCheck ? "emerald" : "red"}
                badge={passCheck ? "OK" : "CHECK"}
              />
            </div>

            {/* Code check */}
            <motion.div
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
              style={{
                background: passCheck ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                border: `1px solid ${passCheck ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {passCheck
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <AlertCircle  className="w-4 h-4 text-red-400 flex-shrink-0" />
              }
              <p className="text-xs text-foreground/80">
                <span className={`font-semibold ${passCheck ? "text-emerald-400" : "text-red-400"}`}>
                  Serviceability {passCheck ? "PASS" : "FAIL"} —{" "}
                </span>
                L/δ = <span className="font-mono font-semibold">{result.ratio >= 1e6 ? "∞" : result.ratio}</span>{" "}
                {passCheck
                  ? `≥ ${SPAN_LIMIT} (${beamType === "Simply Supported" ? "BS 8110 / Eurocode limit L/250" : "typical code check"})`
                  : `< ${SPAN_LIMIT} — consider increasing section depth or reducing span`
                }
              </p>
            </motion.div>

            {/* SFD chart */}
            <ChartPanel
              title="Shear Force Diagram"
              subtitle="V(x)  (kN)"
              color1="#10b981"  color2="rgba(16,185,129,0.08)"
              dataKey="V"
              data={result.chartData}
              Tooltip={SFDTip}
              borderColor="rgba(16,185,129,0.2)"
            />

            {/* BMD chart */}
            <ChartPanel
              title="Bending Moment Diagram"
              subtitle="M(x)  (kN·m)"
              color1="#8b5cf6"  color2="rgba(139,92,246,0.08)"
              dataKey="M"
              data={result.chartData}
              Tooltip={BMDTip}
              borderColor="rgba(139,92,246,0.2)"
            />

            {/* Tips accordion */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setShowTips(t => !t)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Engineering Notes & Conventions</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showTips ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {showTips && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-4 space-y-3 text-xs text-muted-foreground"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p><span className="text-emerald-400 font-semibold">SFD convention:</span> Positive shear = left face of section acts upward. Sign reversal marks the point of maximum moment.</p>
                      <p><span className="text-violet-400 font-semibold">BMD convention:</span> Sagging (tension on bottom) shown as positive for simply supported; hogging shown as negative for cantilever.</p>
                      <p><span className="text-amber-400 font-semibold">Deflection:</span> Computed by double numerical integration of M/EI with boundary conditions applied. Positive δ = downward.</p>
                      <p><span className="text-primary font-semibold">Serviceability check:</span> BS EN 1993-1-1 / BS 8110 recommend L/δ ≥ 250–360 for floors (live load only). This check uses L/{SPAN_LIMIT}.</p>
                      <p><span className="text-sky-400 font-semibold">IPE sections:</span> Standard European I-beams per EN 10034. UB = Universal Beam (BS 4-1). Both are grade S275 steel by default.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl flex flex-col items-center justify-center py-14 text-center"
            style={{ background: "rgba(6,14,36,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-primary/60" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Enter span, material, and at least one load</p>
            <p className="text-xs text-muted-foreground">SFD, BMD, reactions and deflection will appear here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function ResultCard({ label, value, unit, color, badge }: {
  label: string; value: string; unit: string; color: string; badge?: string;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    primary: { bg: "rgba(67,97,238,0.1)",  border: "rgba(67,97,238,0.25)",  text: "#93c5fd" },
    sky:     { bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.25)", text: "#7dd3fc" },
    emerald: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#6ee7b7" },
    violet:  { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", text: "#c4b5fd" },
    amber:   { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#fcd34d" },
    red:     { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  text: "#fca5a5" },
  };
  const c = colorMap[color] ?? colorMap.primary;
  return (
    <div className="rounded-2xl px-3 py-3 text-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono" style={{ color: c.text }}>{value}</p>
      {unit && <p className="text-[10px] text-muted-foreground mt-0.5">{unit}</p>}
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >{badge}</span>
      )}
    </div>
  );
}

function ChartPanel({ title, subtitle, color1, color2, dataKey, data, Tooltip: TipComp, borderColor }: {
  title: string; subtitle: string; color1: string; color2: string;
  dataKey: string; data: Record<string, number>[]; Tooltip: React.ComponentType<unknown>; borderColor: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(6,14,36,0.7)", border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>
        </div>
        <div className="w-3 h-3 rounded-full" style={{ background: color1, boxShadow: `0 0 8px ${color1}` }} />
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color1} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color1} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "x (m)", position: "insideBottomRight", offset: -4, style: { fontSize: 10, fill: "#64748b" } }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={50} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 2" />
            <Tooltip content={<TipComp />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color1}
              strokeWidth={2}
              fill={`url(#grad-${dataKey})`}
              dot={false}
              activeDot={{ r: 4, fill: color1, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Beam Diagram SVG ───────────────────────────────────────────────────── */
function BeamDiagram({ beamType, loads, span }: { beamType: BeamType; loads: LoadEntry[]; span: number }) {
  const W = 320, H = 100;
  const bx0 = 40, bx1 = 280, by = 55, bh = 9;
  const scale = (x: number) => bx0 + (x / span) * (bx1 - bx0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ filter: "drop-shadow(0 0 6px rgba(67,97,238,0.1))" }}>
      <defs>
        <marker id="arr-dn" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
          <polygon points="0 0, 6 0, 3 5" fill="#fbbf24" />
        </marker>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(67,97,238,0.35)" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Beam */}
      <rect x={bx0} y={by - bh / 2} width={bx1 - bx0} height={bh} fill="rgba(67,97,238,0.7)" rx="2" />

      {/* Supports */}
      {beamType === "Cantilever" ? (
        <rect x={bx0 - 14} y={by - 14} width={14} height={28} fill="url(#hatch)" stroke="rgba(67,97,238,0.4)" strokeWidth="1" rx="1" />
      ) : (
        <>
          <polygon points={`${bx0},${by + 5} ${bx0 + 12},${by + 20} ${bx0 - 12},${by + 20}`} fill="rgba(67,97,238,0.55)" />
          <polygon points={`${bx1},${by + 5} ${bx1 + 12},${by + 20} ${bx1 - 12},${by + 20}`} fill="rgba(67,97,238,0.55)" />
          <line x1={bx0 - 14} y1={by + 22} x2={bx0 + 14} y2={by + 22} stroke="rgba(67,97,238,0.35)" strokeWidth="2" />
          <line x1={bx1 - 14} y1={by + 22} x2={bx1 + 14} y2={by + 22} stroke="rgba(67,97,238,0.35)" strokeWidth="2" />
        </>
      )}

      {/* Loads */}
      {loads.map((l) => {
        const mag = parseFloat(l.mag);
        if (!mag || mag <= 0) return null;
        if (l.kind === "point") {
          const px = scale(parseFloat(l.pos) || 0);
          if (px < bx0 || px > bx1) return null;
          return (
            <g key={l.id}>
              <line x1={px} y1={by - bh / 2 - 22} x2={px} y2={by - bh / 2 - 2} stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arr-dn)" />
              <text x={px + 3} y={by - bh / 2 - 12} fontSize="8" fill="#fbbf24" fontFamily="monospace">{mag}kN</text>
            </g>
          );
        } else {
          const px0 = Math.max(scale(parseFloat(l.pos) || 0), bx0);
          const px1 = Math.min(scale(parseFloat(l.end) || span), bx1);
          if (px1 <= px0) return null;
          const arrowCount = Math.min(7, Math.max(2, Math.round((px1 - px0) / 28)));
          return (
            <g key={l.id}>
              <line x1={px0} y1={by - bh / 2 - 22} x2={px1} y2={by - bh / 2 - 22} stroke="#fbbf24" strokeWidth="1.2" />
              {Array.from({ length: arrowCount }).map((_, i) => {
                const ax = px0 + (i / (arrowCount - 1)) * (px1 - px0);
                return <line key={i} x1={ax} y1={by - bh / 2 - 22} x2={ax} y2={by - bh / 2 - 2} stroke="#fbbf24" strokeWidth="1.2" markerEnd="url(#arr-dn)" />;
              })}
              <text x={(px0 + px1) / 2} y={by - bh / 2 - 26} fontSize="8" fill="#fbbf24" fontFamily="monospace" textAnchor="middle">{mag}kN/m</text>
            </g>
          );
        }
      })}

      {/* Dimension */}
      <line x1={bx0} y1={H - 8} x2={bx1} y2={H - 8} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
      <line x1={bx0} y1={H - 12} x2={bx0} y2={H - 4} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
      <line x1={bx1} y1={H - 12} x2={bx1} y2={H - 4} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
      <text x={(bx0 + bx1) / 2} y={H - 1} fontSize="9" fill="rgba(148,163,184,0.55)" fontFamily="monospace" textAnchor="middle">L = {span} m</text>
    </svg>
  );
}
