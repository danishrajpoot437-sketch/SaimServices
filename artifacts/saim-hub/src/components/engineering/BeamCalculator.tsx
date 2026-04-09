import { useState } from "react";
import { motion } from "framer-motion";
import { Construction, Info } from "lucide-react";

type BeamType = "Simply Supported" | "Cantilever";
type LoadType = "Point Load" | "Uniform Distributed Load (UDL)";

export default function BeamCalculator() {
  const [beamType, setBeamType] = useState<BeamType>("Simply Supported");
  const [loadType, setLoadType] = useState<LoadType>("Point Load");
  const [load, setLoad] = useState("10");
  const [length, setLength] = useState("5");
  const [youngs, setYoungs] = useState("200");
  const [inertia, setInertia] = useState("8333");

  const formula = beamType === "Simply Supported" && loadType === "Point Load"
    ? "δ_max = PL³ / (48EI)"
    : beamType === "Simply Supported" && loadType === "Uniform Distributed Load (UDL)"
    ? "δ_max = 5wL⁴ / (384EI)"
    : beamType === "Cantilever" && loadType === "Point Load"
    ? "δ_max = PL³ / (3EI)"
    : "δ_max = wL⁴ / (8EI)";

  return (
    <div>
      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 mb-6"
      >
        <Construction className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-400">Engineering Preview</p>
          <p className="text-xs text-muted-foreground">Full calculation engine coming soon. Input fields are active — results will populate in the next update.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Beam Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Beam Type</label>
            <div className="flex gap-2">
              {(["Simply Supported", "Cantilever"] as BeamType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBeamType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    beamType === t ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
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
            <label className="text-xs font-medium text-muted-foreground block mb-2">Load Type</label>
            <select
              value={loadType}
              onChange={(e) => setLoadType(e.target.value as LoadType)}
              className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50"
              data-testid="select-load-type"
            >
              <option value="Point Load">Point Load</option>
              <option value="Uniform Distributed Load (UDL)">Uniform Distributed Load (UDL)</option>
            </select>
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label={loadType === "Point Load" ? "Load P (kN)" : "Load w (kN/m)"} value={load} onChange={setLoad} id="load" />
            <InputField label="Length L (m)" value={length} onChange={setLength} id="length" />
            <InputField label="Young's Modulus E (GPa)" value={youngs} onChange={setYoungs} id="youngs" />
            <InputField label="Moment of Inertia I (mm⁴)" value={inertia} onChange={setInertia} id="inertia" />
          </div>
        </div>

        {/* Visualization & Formula */}
        <div className="space-y-5">
          {/* Beam Diagram SVG */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-medium text-muted-foreground mb-4">Beam Diagram</p>
            <BeamDiagram beamType={beamType} loadType={loadType} />
          </div>

          {/* Formula */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Deflection Formula</span>
            </div>
            <div className="font-mono text-lg font-bold text-primary">{formula}</div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>P = Applied load | w = UDL intensity</p>
              <p>L = Beam length | E = Young's Modulus</p>
              <p>I = Second moment of area</p>
            </div>
          </div>

          {/* Result placeholder */}
          <div className="glass-card rounded-2xl p-5 border border-primary/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Maximum Deflection</p>
            <div className="text-3xl font-bold text-muted-foreground/40">— mm</div>
            <p className="text-xs text-muted-foreground mt-2">Calculation engine coming in next release</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 transition-colors font-mono"
        data-testid={`input-beam-${id}`}
      />
    </div>
  );
}

function BeamDiagram({ beamType, loadType }: { beamType: BeamType; loadType: LoadType }) {
  return (
    <svg viewBox="0 0 320 120" className="w-full" style={{ filter: "drop-shadow(0 0 8px rgba(67,97,238,0.15))" }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(67,97,238,0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="320" height="120" fill="url(#grid)" rx="8" />

      {/* Beam */}
      <rect x="40" y="55" width="240" height="10" fill="rgba(67,97,238,0.6)" rx="2" />

      {/* Left Support */}
      {beamType === "Simply Supported" ? (
        <polygon points="40,65 52,85 28,85" fill="rgba(67,97,238,0.5)" />
      ) : (
        <rect x="20" y="45" width="20" height="30" fill="rgba(67,97,238,0.5)" rx="2" />
      )}

      {/* Right Support (Simply Supported only) */}
      {beamType === "Simply Supported" && (
        <polygon points="280,65 292,85 268,85" fill="rgba(67,97,238,0.5)" />
      )}

      {/* Load arrows */}
      {loadType === "Point Load" ? (
        <g>
          <line x1="160" y1="10" x2="160" y2="52" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="165" y="28" fontSize="9" fill="#fbbf24" fontFamily="monospace">P</text>
        </g>
      ) : (
        Array.from({ length: 7 }).map((_, i) => (
          <g key={i}>
            <line x1={60 + i * 30} y1="15" x2={60 + i * 30} y2="52" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points={`${60 + i * 30},52 ${57 + i * 30},44 ${63 + i * 30},44`} fill="#fbbf24" />
          </g>
        ))
      )}
      {loadType === "Uniform Distributed Load (UDL)" && (
        <line x1="60" y1="15" x2="240" y2="15" stroke="#fbbf24" strokeWidth="1.5" />
      )}

      {/* Dimension line */}
      <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <text x="155" y="112" fontSize="9" fill="rgba(148,163,184,0.7)" fontFamily="monospace" textAnchor="middle">L</text>
    </svg>
  );
}
