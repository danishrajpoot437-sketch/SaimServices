import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Search } from "lucide-react";

interface Constant {
  symbol: string;
  name: string;
  value: string;
  numeric: number;
  unit: string;
  category: string;
  description: string;
  color: string;
}

const constants: Constant[] = [
  {
    symbol: "g",
    name: "Standard Gravity",
    value: "9.80665",
    numeric: 9.80665,
    unit: "m/s²",
    category: "Mechanics",
    description: "Standard acceleration due to gravity at Earth's surface",
    color: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
  {
    symbol: "G",
    name: "Gravitational Constant",
    value: "6.67430 × 10⁻¹¹",
    numeric: 6.6743e-11,
    unit: "m³/(kg·s²)",
    category: "Mechanics",
    description: "Proportionality constant in Newton's law of universal gravitation",
    color: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
  {
    symbol: "c",
    name: "Speed of Light",
    value: "299,792,458",
    numeric: 299792458,
    unit: "m/s",
    category: "Electromagnetic",
    description: "Speed of light in vacuum — universal speed limit",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  {
    symbol: "μ₀",
    name: "Permeability of Free Space",
    value: "1.25664 × 10⁻⁶",
    numeric: 1.25664e-6,
    unit: "H/m",
    category: "Electromagnetic",
    description: "Measure of the resistance of vacuum to magnetic fields",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  {
    symbol: "ε₀",
    name: "Permittivity of Free Space",
    value: "8.85419 × 10⁻¹²",
    numeric: 8.85419e-12,
    unit: "F/m",
    category: "Electromagnetic",
    description: "Measure of vacuum's ability to permit electric field lines",
    color: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  {
    symbol: "R",
    name: "Universal Gas Constant",
    value: "8.31446",
    numeric: 8.31446,
    unit: "J/(mol·K)",
    category: "Thermodynamics",
    description: "Relates energy scale to temperature in ideal gas law: PV = nRT",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    symbol: "k_B",
    name: "Boltzmann Constant",
    value: "1.38065 × 10⁻²³",
    numeric: 1.38065e-23,
    unit: "J/K",
    category: "Thermodynamics",
    description: "Relates thermal energy to temperature: E = k_B T",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    symbol: "σ",
    name: "Stefan-Boltzmann Constant",
    value: "5.67037 × 10⁻⁸",
    numeric: 5.67037e-8,
    unit: "W/(m²·K⁴)",
    category: "Thermodynamics",
    description: "Total energy radiated by a black body per unit area",
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    symbol: "h",
    name: "Planck Constant",
    value: "6.62607 × 10⁻³⁴",
    numeric: 6.62607e-34,
    unit: "J·s",
    category: "Quantum",
    description: "Fundamental quantum of action, relates photon energy to frequency",
    color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  },
  {
    symbol: "ħ",
    name: "Reduced Planck (Dirac)",
    value: "1.05457 × 10⁻³⁴",
    numeric: 1.05457e-34,
    unit: "J·s",
    category: "Quantum",
    description: "h / 2π — appears in quantum wave mechanics",
    color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  },
  {
    symbol: "Nₐ",
    name: "Avogadro's Number",
    value: "6.02214 × 10²³",
    numeric: 6.02214e23,
    unit: "mol⁻¹",
    category: "Chemistry",
    description: "Number of constituent particles in one mole of substance",
    color: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  },
  {
    symbol: "e",
    name: "Elementary Charge",
    value: "1.60218 × 10⁻¹⁹",
    numeric: 1.60218e-19,
    unit: "C",
    category: "Quantum",
    description: "Electric charge of one proton (or magnitude of one electron)",
    color: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  },
];

const categories = ["All", ...Array.from(new Set(constants.map(c => c.category)))];

const catColors: Record<string, string> = {
  Mechanics: "bg-blue-500/12 text-blue-300 border-blue-500/20 hover:bg-blue-500/22",
  Electromagnetic: "bg-amber-500/12 text-amber-300 border-amber-500/20 hover:bg-amber-500/22",
  Thermodynamics: "bg-emerald-500/12 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/22",
  Quantum: "bg-purple-500/12 text-purple-300 border-purple-500/20 hover:bg-purple-500/22",
  Chemistry: "bg-sky-500/12 text-sky-300 border-sky-500/20 hover:bg-sky-500/22",
};

function ConstantCard({ c, index }: { c: Constant; index: number }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(String(c.numeric));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 cursor-pointer"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      whileHover={{
        background: "rgba(67,97,238,0.06)",
        borderColor: "rgba(67,97,238,0.2)",
      }}
      onClick={copy}
      data-testid={`const-card-${c.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
    >
      {/* Symbol */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-mono font-bold text-lg"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <span className={c.color.split(" ")[0]}>{c.symbol}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{c.name}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${c.color}`}>
            {c.category}
          </span>
        </div>
        <div className="text-sm font-mono font-bold text-primary">{c.value}</div>
        <div className="text-xs text-muted-foreground">{c.description}</div>
      </div>

      {/* Unit badge */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-xs font-mono text-muted-foreground/70 bg-white/5 border border-white/8 px-2 py-1 rounded-lg">
          {c.unit}
        </div>
        <motion.div
          whileTap={{ scale: 0.88 }}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 ${
            copied
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-muted-foreground/50 bg-white/3 border-white/6 group-hover:text-primary group-hover:bg-primary/8 group-hover:border-primary/20"
          }`}
          data-testid={`btn-copy-${c.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function EngineeringConstants() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = constants.filter(c => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch = search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Search + categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search constant name or symbol..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-foreground border border-white/8 bg-white/4 outline-none focus:border-primary/40 transition-colors"
            data-testid="input-constants-search"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary/0 shadow shadow-primary/25"
                : catColors[cat] || "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
            }`}
            data-testid={`filter-cat-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Constants list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <ConstantCard key={c.symbol} c={c} index={i} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground/50">
            No constants match your search.
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/40 text-center">
        Click any card to copy the numeric value to clipboard
      </p>
    </div>
  );
}
