import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown, AlertCircle } from "lucide-react";

type BeamType = "Cantilever" | "Simply Supported";
type LoadType = "Point Load" | "UDL";

interface FormulaInfo {
  formula: string;
  latex: string;
  description: string;
  coefficient: string;
}

const FORMULAS: Record<BeamType, Record<LoadType, FormulaInfo>> = {
  Cantilever: {
    "Point Load": {
      formula: "δ = PL³ / (3EI)",
      latex: "δ_max = PL³ ÷ 3EI",
      description: "Point load P applied at the free end of a cantilever beam",
      coefficient: "3",
    },
    UDL: {
      formula: "δ = wL⁴ / (8EI)",
      latex: "δ_max = wL⁴ ÷ 8EI",
      description: "Uniformly distributed load w over entire cantilever span",
      coefficient: "8",
    },
  },
  "Simply Supported": {
    "Point Load": {
      formula: "δ = PL³ / (48EI)",
      latex: "δ_max = PL³ ÷ 48EI",
      description: "Central point load P on a simply supported beam",
      coefficient: "48",
    },
    UDL: {
      formula: "δ = 5wL⁴ / (384EI)",
      latex: "δ_max = 5wL⁴ ÷ 384EI",
      description: "Uniformly distributed load w over the full simply supported span",
      coefficient: "384",
    },
  },
};

function computeDeflection(
  beamType: BeamType,
  loadType: LoadType,
  P: number,
  L: number,
  E: number,
  I: number
): number {
  const P_N = P * 1000;        // kN → N
  const L_mm = L * 1000;       // m → mm
  const E_Nmm2 = E * 1000;     // GPa → N/mm²  (1 GPa = 1000 N/mm²)
  const w_Nmm = P * 1000 / 1000; // kN/m → N/mm  (1 kN/m = 1 N/mm)

  if (beamType === "Cantilever") {
    if (loadType === "Point Load") {
      return (P_N * Math.pow(L_mm, 3)) / (3 * E_Nmm2 * I);
    } else {
      return (w_Nmm * Math.pow(L_mm, 4)) / (8 * E_Nmm2 * I);
    }
  } else {
    if (loadType === "Point Load") {
      return (P_N * Math.pow(L_mm, 3)) / (48 * E_Nmm2 * I);
    } else {
      return (5 * w_Nmm * Math.pow(L_mm, 4)) / (384 * E_Nmm2 * I);
    }
  }
}

function formatDeflection(mm: number): { value: string; unit: string } {
  if (!isFinite(mm) || isNaN(mm)) return { value: "—", unit: "mm" };
  const abs = Math.abs(mm);
  if (abs < 0.001) return { value: (mm * 1000).toFixed(4), unit: "μm" };
  if (abs >= 1000) return { value: (mm / 1000).toFixed(4), unit: "m" };
  return { value: mm.toFixed(4), unit: "mm" };
}

export default function BeamCalculator() {
  const [beamType, setBeamType] = useState<BeamType>("Cantilever");
  const [loadType, setLoadType] = useState<LoadType>("Point Load");
  const [load, setLoad] = useState("10");
  const [length, setLength] = useState("3");
  const [youngs, setYoungs] = useState("200");
  const [inertia, setInertia] = useState("66700000");
  const [showFormula, setShowFormula] = useState(true);

  const P = parseFloat(load) || 0;
  const L = parseFloat(length) || 0;
  const E = parseFloat(youngs) || 0;
  const I = parseFloat(inertia) || 0;

  const hasValidInputs = P > 0 && L > 0 && E > 0 && I > 0;

  const deflectionMm = useMemo(() => {
    if (!hasValidInputs) return null;
    return computeDeflection(beamType, loadType, P, L, E, I);
  }, [beamType, loadType, P, L, E, I, hasValidInputs]);

  const formatted = deflectionMm !== null ? formatDeflection(deflectionMm) : null;
  const formulaInfo = FORMULAS[beamType][loadType];

  const slope = useMemo(() => {
    if (!hasValidInputs || deflectionMm === null) return null;
    const L_mm = L * 1000;
    return (deflectionMm / L_mm) * 1000;
  }, [deflectionMm, L, hasValidInputs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Inputs ── */}
        <div className="space-y-5">
          {/* Beam Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Beam Configuration
            </label>
            <div className="flex gap-2">
              {(["Cantilever", "Simply Supported"] as BeamType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBeamType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    beamType === t
                      ? "bg-primary text-primary-foreground shadow shadow-primary/25"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`btn-beam-type-${t.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Load Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Load Type
            </label>
            <div className="flex gap-2">
              {(["Point Load", "UDL"] as LoadType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setLoadType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    loadType === t
                      ? "bg-purple-500/25 text-purple-300 border border-purple-500/30"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`btn-load-type-${t.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {t === "UDL" ? "Uniform (UDL)" : "Point Load"}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={loadType === "Point Load" ? "Load P (kN)" : "Load w (kN/m)"}
              value={load}
              onChange={setLoad}
              id="load"
              hint={loadType === "Point Load" ? "Applied force" : "Load per metre"}
            />
            <InputField
              label="Length L (m)"
              value={length}
              onChange={setLength}
              id="length"
              hint="Beam span"
            />
            <InputField
              label="Modulus E (GPa)"
              value={youngs}
              onChange={setYoungs}
              id="youngs"
              hint="Steel ≈ 200 GPa"
            />
            <InputField
              label="Inertia I (mm⁴)"
              value={inertia}
              onChange={setInertia}
              id="inertia"
              hint="2nd moment of area"
            />
          </div>

          {/* Validation warning */}
          <AnimatePresence>
            {!hasValidInputs && (load || length || youngs || inertia) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/8 border border-amber-400/20 rounded-xl px-3 py-2.5"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                All values must be greater than zero to compute deflection.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Results + Formula ── */}
        <div className="space-y-4">
          {/* Beam Diagram */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(6,14,36,0.7)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-xs font-medium text-muted-foreground mb-3">Beam Diagram</p>
            <BeamDiagram beamType={beamType} loadType={loadType} />
          </div>

          {/* Result */}
          <motion.div
            key={`${beamType}-${loadType}-${deflectionMm}`}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-5"
            style={{
              background: hasValidInputs && deflectionMm !== null
                ? "linear-gradient(135deg, rgba(67,97,238,0.14) 0%, rgba(14,165,233,0.06) 100%)"
                : "rgba(255,255,255,0.03)",
              border: hasValidInputs
                ? "1px solid rgba(67,97,238,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: hasValidInputs ? "0 0 24px rgba(67,97,238,0.12)" : "none",
            }}
          >
            <p className="text-xs font-medium text-muted-foreground mb-3">Maximum Deflection</p>
            {formatted ? (
              <>
                <div className="flex items-end gap-2 mb-1">
                  <motion.span
                    key={formatted.value}
                    initial={{ opacity: 0.5, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-primary font-mono"
                    data-testid="text-beam-deflection"
                  >
                    {formatted.value}
                  </motion.span>
                  <span className="text-lg font-semibold text-primary/70 mb-1">{formatted.unit}</span>
                </div>
                {slope !== null && (
                  <p className="text-xs text-muted-foreground">
                    Slope ≈ {slope.toFixed(3)} mm/m · L/δ ratio ≈ {(L * 1000 / (deflectionMm ?? 1)).toFixed(0)}
                  </p>
                )}
              </>
            ) : (
              <div className="text-3xl font-bold text-muted-foreground/30 font-mono" data-testid="text-beam-deflection">
                —
              </div>
            )}
          </motion.div>

          {/* Formula accordion */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <button
              onClick={() => setShowFormula((f) => !f)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Formula Reference</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showFormula ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {showFormula && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="pt-4">
                      <div className="font-mono text-xl font-bold text-primary mb-1">
                        {formulaInfo.formula}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{formulaInfo.description}</p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          <p><span className="text-foreground font-mono font-semibold">P</span> = Applied load (kN)</p>
                          <p><span className="text-foreground font-mono font-semibold">L</span> = Beam length (m)</p>
                          <p><span className="text-foreground font-mono font-semibold">E</span> = Young's Modulus (GPa)</p>
                          <p><span className="text-foreground font-mono font-semibold">I</span> = 2nd Moment of Area (mm⁴)</p>
                          <p><span className="text-foreground font-mono font-semibold">w</span> = UDL intensity (kN/m)</p>
                          <p><span className="text-foreground font-mono font-semibold">δ</span> = Max deflection (mm)</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="rounded-xl px-4 py-3 text-xs text-muted-foreground"
                      style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.15)" }}
                    >
                      <span className="text-primary font-semibold">Tip: </span>
                      For a 100×200mm rectangular section: I = bh³/12 = 100×200³/12 ≈ 66.7×10⁶ mm⁴.
                      Structural steel: E = 200 GPa. Aluminium: E ≈ 70 GPa.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  id,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(67,97,238,0.22)"
            : "0 0 0 0px rgba(67,97,238,0)",
        }}
        transition={{ duration: 0.15 }}
        className="rounded-xl"
      >
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none transition-colors font-mono"
          style={{ borderColor: focused ? "rgba(67,97,238,0.45)" : undefined }}
          data-testid={`input-beam-${id}`}
        />
      </motion.div>
      {hint && <p className="text-[10px] text-muted-foreground/50 mt-1">{hint}</p>}
    </div>
  );
}

function BeamDiagram({ beamType, loadType }: { beamType: BeamType; loadType: LoadType }) {
  return (
    <svg
      viewBox="0 0 320 110"
      className="w-full"
      style={{ filter: "drop-shadow(0 0 8px rgba(67,97,238,0.12))" }}
    >
      <defs>
        <pattern id="beamgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(67,97,238,0.07)" strokeWidth="0.5" />
        </pattern>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#fbbf24" />
        </marker>
      </defs>
      <rect width="320" height="110" fill="url(#beamgrid)" rx="8" />

      {/* Beam */}
      <rect x="40" y="52" width="240" height="10" fill="rgba(67,97,238,0.65)" rx="2" />

      {/* Left Support */}
      {beamType === "Cantilever" ? (
        <>
          <rect x="20" y="42" width="20" height="30" fill="rgba(67,97,238,0.55)" rx="2" />
          <line x1="10" y1="40" x2="10" y2="74" stroke="rgba(67,97,238,0.4)" strokeWidth="1.5" />
          <line x1="10" y1="40" x2="20" y2="40" stroke="rgba(67,97,238,0.4)" strokeWidth="1.5" />
          <line x1="10" y1="74" x2="20" y2="74" stroke="rgba(67,97,238,0.4)" strokeWidth="1.5" />
        </>
      ) : (
        <polygon points="40,62 52,80 28,80" fill="rgba(67,97,238,0.55)" />
      )}

      {/* Right Support (Simply Supported only) */}
      {beamType === "Simply Supported" && (
        <polygon points="280,62 292,80 268,80" fill="rgba(67,97,238,0.55)" />
      )}

      {/* Load arrows */}
      {loadType === "Point Load" ? (
        <g>
          <line x1="160" y1="12" x2="160" y2="50" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="168" y="30" fontSize="10" fill="#fbbf24" fontFamily="monospace" fontWeight="bold">P</text>
        </g>
      ) : (
        <>
          <line x1="55" y1="12" x2="275" y2="12" stroke="#fbbf24" strokeWidth="1.5" />
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 60 + i * 30;
            return (
              <g key={i}>
                <line x1={x} y1="14" x2={x} y2="50" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
              </g>
            );
          })}
          <text x="155" y="10" fontSize="9" fill="#fbbf24" fontFamily="monospace" fontWeight="bold" textAnchor="middle">w</text>
        </>
      )}

      {/* Deflected shape (dashed curve) */}
      {beamType === "Cantilever" ? (
        <path
          d="M 40 57 Q 160 57 280 90"
          fill="none"
          stroke="rgba(14,165,233,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      ) : (
        <path
          d="M 40 57 Q 160 80 280 57"
          fill="none"
          stroke="rgba(14,165,233,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* δ annotation */}
      {beamType === "Cantilever" && (
        <>
          <line x1="285" y1="57" x2="285" y2="90" stroke="rgba(14,165,233,0.5)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="291" y="76" fontSize="9" fill="rgba(14,165,233,0.8)" fontFamily="monospace">δ</text>
        </>
      )}
      {beamType === "Simply Supported" && (
        <>
          <line x1="160" y1="62" x2="160" y2="80" stroke="rgba(14,165,233,0.5)" strokeWidth="1" strokeDasharray="2 2" />
          <text x="164" y="76" fontSize="9" fill="rgba(14,165,233,0.8)" fontFamily="monospace">δ</text>
        </>
      )}

      {/* Dimension line */}
      <line x1="40" y1="98" x2="280" y2="98" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      <line x1="40" y1="94" x2="40" y2="102" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      <line x1="280" y1="94" x2="280" y2="102" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      <text x="160" y="108" fontSize="9" fill="rgba(148,163,184,0.6)" fontFamily="monospace" textAnchor="middle">L</text>
    </svg>
  );
}
