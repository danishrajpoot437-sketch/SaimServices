import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Layers, Zap, Thermometer, Shield, Box } from "lucide-react";

interface Material {
  name: string;
  category: string;
  color: string;
  density: number;
  youngsModulus: number;
  thermalConductivity: number;
  yieldStrength: number;
  poissonRatio: number;
  tensileStrength: number;
  meltingPoint: number;
  description: string;
}

const materials: Material[] = [
  {
    name: "Structural Steel (A36)",
    category: "Steel",
    color: "text-blue-300",
    density: 7850,
    youngsModulus: 200,
    thermalConductivity: 50,
    yieldStrength: 250,
    poissonRatio: 0.30,
    tensileStrength: 400,
    meltingPoint: 1425,
    description: "Most common structural steel. Excellent weldability and machinability.",
  },
  {
    name: "Stainless Steel 316",
    category: "Steel",
    color: "text-blue-300",
    density: 7990,
    youngsModulus: 193,
    thermalConductivity: 16,
    yieldStrength: 205,
    poissonRatio: 0.27,
    tensileStrength: 515,
    meltingPoint: 1375,
    description: "Marine-grade stainless. Superior corrosion resistance.",
  },
  {
    name: "Aluminum 6061-T6",
    category: "Aluminum",
    color: "text-sky-300",
    density: 2700,
    youngsModulus: 69,
    thermalConductivity: 167,
    yieldStrength: 276,
    poissonRatio: 0.33,
    tensileStrength: 310,
    meltingPoint: 652,
    description: "Aerospace-grade aluminum. High strength-to-weight ratio.",
  },
  {
    name: "Aluminum 7075-T6",
    category: "Aluminum",
    color: "text-sky-300",
    density: 2810,
    youngsModulus: 71.7,
    thermalConductivity: 130,
    yieldStrength: 503,
    poissonRatio: 0.33,
    tensileStrength: 572,
    meltingPoint: 635,
    description: "One of the strongest aluminum alloys. Used in aircraft structures.",
  },
  {
    name: "Titanium Ti-6Al-4V",
    category: "Titanium",
    color: "text-purple-300",
    density: 4430,
    youngsModulus: 113.8,
    thermalConductivity: 6.7,
    yieldStrength: 880,
    poissonRatio: 0.34,
    tensileStrength: 950,
    meltingPoint: 1660,
    description: "Grade 5 titanium. Aerospace standard, biomedical implants.",
  },
  {
    name: "Concrete (C25/30)",
    category: "Concrete",
    color: "text-stone-400",
    density: 2400,
    youngsModulus: 30,
    thermalConductivity: 1.0,
    yieldStrength: 25,
    poissonRatio: 0.20,
    tensileStrength: 2.6,
    meltingPoint: 1250,
    description: "Standard structural concrete. Compressive strength class C25/30.",
  },
  {
    name: "Copper (pure)",
    category: "Copper",
    color: "text-amber-400",
    density: 8960,
    youngsModulus: 110,
    thermalConductivity: 401,
    yieldStrength: 70,
    poissonRatio: 0.34,
    tensileStrength: 220,
    meltingPoint: 1085,
    description: "Highest thermal and electrical conductivity of common metals.",
  },
  {
    name: "Carbon Fiber (CFRP)",
    category: "Composites",
    color: "text-emerald-300",
    density: 1600,
    youngsModulus: 181,
    thermalConductivity: 5,
    yieldStrength: 600,
    poissonRatio: 0.28,
    tensileStrength: 3500,
    meltingPoint: 3652,
    description: "Unidirectional CFRP. Exceptional strength-to-weight ratio.",
  },
];

const categoryColors: Record<string, string> = {
  Steel: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Aluminum: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Titanium: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Concrete: "bg-stone-500/10 text-stone-400 border-stone-500/20",
  Copper: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Composites: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

interface PropCardProps { label: string; value: string; unit: string; icon: React.ReactNode; color: string }

function PropCard({ label, value, unit, icon, color }: PropCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-foreground font-mono">{value}</div>
        <div className="text-xs text-primary/70 font-mono">{unit}</div>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

export default function MaterialFinder() {
  const [selected, setSelected] = useState<Material | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (m: Material) => {
    setSelected(m);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Search Dropdown */}
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/10 cursor-pointer hover:border-primary/40 transition-colors duration-200"
          style={{ background: "rgba(255,255,255,0.04)" }}
          data-testid="material-dropdown"
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onClick={e => { e.stopPropagation(); setOpen(true); }}
            placeholder="Search material (e.g. Steel, Aluminum, Titanium...)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            data-testid="input-material-search"
          />
          {selected && !search && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColors[selected.category] || ""}`}>
              {selected.category}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 right-0 rounded-2xl border border-white/10 z-50 overflow-hidden"
              style={{ background: "rgba(12, 20, 48, 0.98)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="max-h-64 overflow-y-auto py-1.5">
                {filtered.length === 0
                  ? <div className="px-4 py-4 text-sm text-muted-foreground text-center">No materials found</div>
                  : filtered.map(m => (
                    <button key={m.name} onClick={() => handleSelect(m)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left group ${selected?.name === m.name ? "bg-primary/8" : ""}`}
                      data-testid={`material-option-${m.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.description.slice(0, 55)}...</div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ml-3 ${categoryColors[m.category] || ""}`}>
                        {m.category}
                      </span>
                    </button>
                  ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Material Card */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.12) 0%, rgba(14,165,233,0.06) 100%)", border: "1px solid rgba(67,97,238,0.25)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryColors[selected.category] || ""}`}>
                      {selected.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>
              </div>
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <PropCard label="Density" value={selected.density.toLocaleString()} unit="kg/m³"
                icon={<Box className="w-4 h-4" />} color="bg-blue-500/15 text-blue-400" />
              <PropCard label="Young's Modulus" value={String(selected.youngsModulus)} unit="GPa"
                icon={<Layers className="w-4 h-4" />} color="bg-purple-500/15 text-purple-400" />
              <PropCard label="Thermal Conductivity" value={String(selected.thermalConductivity)} unit="W/m·K"
                icon={<Thermometer className="w-4 h-4" />} color="bg-amber-500/15 text-amber-400" />
              <PropCard label="Yield Strength" value={String(selected.yieldStrength)} unit="MPa"
                icon={<Shield className="w-4 h-4" />} color="bg-emerald-500/15 text-emerald-400" />
              <PropCard label="Tensile Strength" value={String(selected.tensileStrength)} unit="MPa"
                icon={<Zap className="w-4 h-4" />} color="bg-red-500/15 text-red-400" />
              <PropCard label="Poisson's Ratio" value={String(selected.poissonRatio)} unit="dimensionless"
                icon={<Layers className="w-4 h-4" />} color="bg-sky-500/15 text-sky-400" />
            </div>

            {/* Melting point */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-muted-foreground">Melting / Decomposition Point:</span>
              <span className="font-mono font-semibold text-amber-400">{selected.meltingPoint.toLocaleString()} °C</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm">Search and select a material above</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Steel · Aluminum · Titanium · Concrete · Copper · Carbon Fiber</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
