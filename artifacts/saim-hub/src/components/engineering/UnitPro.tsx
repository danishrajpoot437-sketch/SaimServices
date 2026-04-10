import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, ChevronDown, Search, Zap } from "lucide-react";

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

type Category =
  | "Length" | "Mass" | "Temperature" | "Speed" | "Pressure" | "Power"
  | "Force" | "Torque" | "Energy";

const units: Record<Category, UnitDef[]> = {
  Length: [
    { label: "Millimeter (mm)", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: "Centimeter (cm)", toBase: v => v / 100, fromBase: v => v * 100 },
    { label: "Meter (m)", toBase: v => v, fromBase: v => v },
    { label: "Kilometer (km)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Inch (in)", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { label: "Foot (ft)", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { label: "Yard (yd)", toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { label: "Mile (mi)", toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
  ],
  Mass: [
    { label: "Milligram (mg)", toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { label: "Gram (g)", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { label: "Kilogram (kg)", toBase: v => v, fromBase: v => v },
    { label: "Tonne (t)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Ounce (oz)", toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    { label: "Pound (lb)", toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
  ],
  Temperature: [
    { label: "Celsius (°C)", toBase: v => v, fromBase: v => v },
    { label: "Fahrenheit (°F)", toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
    { label: "Kelvin (K)", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  ],
  Speed: [
    { label: "m/s", toBase: v => v, fromBase: v => v },
    { label: "km/h", toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { label: "mph", toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { label: "Knots (kn)", toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    { label: "ft/s", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
  ],
  Force: [
    { label: "Newton (N)", toBase: v => v, fromBase: v => v },
    { label: "Kilonewton (kN)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Pound-force (lbf)", toBase: v => v * 4.44822, fromBase: v => v / 4.44822 },
    { label: "Dyne (dyn)", toBase: v => v * 1e-5, fromBase: v => v / 1e-5 },
    { label: "Kilogram-force (kgf)", toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
  ],
  Torque: [
    { label: "Newton·metre (N·m)", toBase: v => v, fromBase: v => v },
    { label: "Kilonewton·metre (kN·m)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Pound·foot (lb·ft)", toBase: v => v * 1.35582, fromBase: v => v / 1.35582 },
    { label: "Pound·inch (lb·in)", toBase: v => v * 0.112985, fromBase: v => v / 0.112985 },
    { label: "kgf·metre (kgf·m)", toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
  ],
  Energy: [
    { label: "Joule (J)", toBase: v => v, fromBase: v => v },
    { label: "Kilojoule (kJ)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Megajoule (MJ)", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { label: "Calorie (cal)", toBase: v => v * 4.184, fromBase: v => v / 4.184 },
    { label: "Kilocalorie (kcal)", toBase: v => v * 4184, fromBase: v => v / 4184 },
    { label: "BTU", toBase: v => v * 1055.06, fromBase: v => v / 1055.06 },
    { label: "Watt·hour (Wh)", toBase: v => v * 3600, fromBase: v => v / 3600 },
    { label: "Kilowatt·hour (kWh)", toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 },
    { label: "Electronvolt (eV)", toBase: v => v * 1.60218e-19, fromBase: v => v / 1.60218e-19 },
  ],
  Pressure: [
    { label: "Pascal (Pa)", toBase: v => v, fromBase: v => v },
    { label: "Kilopascal (kPa)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Megapascal (MPa)", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { label: "Bar", toBase: v => v * 100000, fromBase: v => v / 100000 },
    { label: "PSI", toBase: v => v * 6894.76, fromBase: v => v / 6894.76 },
    { label: "Atmosphere (atm)", toBase: v => v * 101325, fromBase: v => v / 101325 },
  ],
  Power: [
    { label: "Watt (W)", toBase: v => v, fromBase: v => v },
    { label: "Kilowatt (kW)", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { label: "Megawatt (MW)", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { label: "Horsepower (hp)", toBase: v => v * 745.7, fromBase: v => v / 745.7 },
    { label: "BTU/hr", toBase: v => v * 0.29307, fromBase: v => v / 0.29307 },
  ],
};

const categoryGroups: { label: string; items: Category[]; color: string }[] = [
  { label: "Mechanical", items: ["Length", "Mass", "Force", "Torque", "Energy"], color: "text-blue-300 bg-blue-500/12 border-blue-500/20 hover:bg-blue-500/20" },
  { label: "Thermal", items: ["Temperature", "Pressure", "Power"], color: "text-amber-300 bg-amber-500/12 border-amber-500/20 hover:bg-amber-500/20" },
  { label: "Speed", items: ["Speed"], color: "text-emerald-300 bg-emerald-500/12 border-emerald-500/20 hover:bg-emerald-500/20" },
];

const allCategories = Object.keys(units) as Category[];

function UnitDropdown({ options, selectedIdx, onSelect, testId }: {
  options: UnitDef[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter(u => u.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative" data-testid={testId}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 text-foreground text-sm rounded-xl px-3 py-2.5 border border-white/10 hover:border-primary/40 outline-none transition-colors duration-200"
        style={{ background: "rgba(255,255,255,0.04)" }}
        data-testid={`${testId}-trigger`}
      >
        <span className="truncate text-left text-sm">{options[selectedIdx]?.label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "rgba(14, 22, 50, 0.98)", backdropFilter: "blur(20px)" }}
          >
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search units..." className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                  data-testid={`${testId}-search`} />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0
                ? <div className="px-3 py-3 text-xs text-muted-foreground text-center">No units found</div>
                : filtered.map(u => {
                    const idx = options.indexOf(u);
                    return (
                      <button key={u.label} onClick={() => { onSelect(idx); setOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${idx === selectedIdx ? "text-primary bg-primary/10" : "text-foreground hover:bg-white/5"}`}
                        data-testid={`${testId}-option-${idx}`}>
                        {u.label}
                      </button>
                    );
                  })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UnitPro() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(2);
  const [fromValue, setFromValue] = useState("1");

  const cat = units[category];
  const base = cat[fromIdx].toBase(Number(fromValue) || 0);
  const toValue = cat[toIdx].fromBase(base);
  const toDisplay = isFinite(toValue) ? Number(toValue.toPrecision(10)).toString() : "—";

  const swap = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    setFromValue(isFinite(toValue) ? toDisplay : "0");
  };

  const handleCategoryChange = (c: Category) => {
    setCategory(c);
    setFromIdx(0);
    setToIdx(Math.min(1, units[c].length - 1));
    setFromValue("1");
  };

  return (
    <div className="space-y-5">
      {/* Category pills by group */}
      <div className="space-y-2">
        {categoryGroups.map(group => (
          <div key={group.label} className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest w-16 flex-shrink-0">{group.label}</span>
            {group.items.map(c => (
              <button key={c} onClick={() => handleCategoryChange(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  category === c ? "bg-primary text-primary-foreground border-primary/0 shadow shadow-primary/25" : group.color
                }`}
                data-testid={`tab-unit-${c.toLowerCase()}`}>
                {c}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Converter */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr] gap-3 items-center">
        {/* From */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">From</label>
          <UnitDropdown options={cat} selectedIdx={fromIdx} onSelect={setFromIdx} testId="select-unit-from" />
          <input type="number" value={fromValue} onChange={e => setFromValue(e.target.value)}
            className="w-full bg-transparent text-foreground text-4xl font-bold outline-none placeholder:text-muted-foreground/30 font-mono"
            placeholder="0" data-testid="input-unit-from" />
          <div className="text-xs text-muted-foreground/50 font-mono">{cat[fromIdx]?.label}</div>
        </div>

        {/* Swap */}
        <motion.button onClick={swap} whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-12 h-12 rounded-full bg-primary/15 hover:bg-primary/30 flex items-center justify-center text-primary border border-primary/25 mx-auto transition-colors"
          style={{ boxShadow: "0 0 16px rgba(67,97,238,0.15)" }}
          data-testid="button-swap-units">
          <ArrowLeftRight className="w-4 h-4" />
        </motion.button>

        {/* To */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.2)" }}>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">To</label>
          <UnitDropdown options={cat} selectedIdx={toIdx} onSelect={setToIdx} testId="select-unit-to" />
          <div className="text-4xl font-bold text-primary font-mono" data-testid="text-unit-result">
            {toDisplay}
          </div>
          <div className="text-xs text-primary/50 font-mono">{cat[toIdx]?.label}</div>
        </div>
      </div>

      {/* Conversion bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-muted-foreground font-mono"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Zap className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
        <span className="text-foreground font-semibold">{fromValue || "0"}</span>
        <span>{cat[fromIdx]?.label}</span>
        <span className="text-primary mx-1">=</span>
        <span className="text-primary font-semibold">{toDisplay}</span>
        <span>{cat[toIdx]?.label}</span>
      </div>
    </div>
  );
}
