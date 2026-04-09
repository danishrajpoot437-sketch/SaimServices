import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

type UnitCategory = "Length" | "Mass" | "Temperature" | "Speed" | "Pressure" | "Power";

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const units: Record<UnitCategory, UnitDef[]> = {
  Length: [
    { label: "Millimeter (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Centimeter (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { label: "Meter (m)", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilometer (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Inch (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { label: "Foot (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: "Yard (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { label: "Mile (mi)", toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
  ],
  Mass: [
    { label: "Milligram (mg)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { label: "Gram (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Kilogram (kg)", toBase: (v) => v, fromBase: (v) => v },
    { label: "Tonne (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Ounce (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { label: "Pound (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  ],
  Temperature: [
    { label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    { label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  Speed: [
    { label: "m/s", toBase: (v) => v, fromBase: (v) => v },
    { label: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { label: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { label: "Knots", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { label: "ft/s", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
  Pressure: [
    { label: "Pascal (Pa)", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilopascal (kPa)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Megapascal (MPa)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { label: "Bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
    { label: "PSI", toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
    { label: "Atmosphere (atm)", toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
  ],
  Power: [
    { label: "Watt (W)", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilowatt (kW)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Megawatt (MW)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { label: "Horsepower (hp)", toBase: (v) => v * 745.7, fromBase: (v) => v / 745.7 },
    { label: "BTU/hr", toBase: (v) => v * 0.29307, fromBase: (v) => v / 0.29307 },
  ],
};

const categories = Object.keys(units) as UnitCategory[];

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("Length");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(2);
  const [fromValue, setFromValue] = useState("1");

  const cat = units[category];

  const toBaseValue = cat[fromIdx].toBase(Number(fromValue) || 0);
  const toValue = cat[toIdx].fromBase(toBaseValue);
  const toDisplay = isFinite(toValue) ? Number(toValue.toFixed(8)).toString() : "—";

  const swap = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    setFromValue(isFinite(toValue) ? toDisplay : "0");
  };

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setFromIdx(0); setToIdx(1); setFromValue("1"); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
            }`}
            data-testid={`tab-unit-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* From */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <select
            value={fromIdx}
            onChange={(e) => setFromIdx(Number(e.target.value))}
            className="w-full bg-muted/60 text-foreground text-sm rounded-xl px-3 py-2.5 border border-white/10 focus:border-primary/50 outline-none transition-colors"
            data-testid="select-unit-from"
          >
            {cat.map((u, i) => (
              <option key={u.label} value={i} className="bg-[#16213e]">{u.label}</option>
            ))}
          </select>
          <input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full bg-transparent text-foreground text-3xl font-bold outline-none placeholder:text-muted-foreground"
            placeholder="Enter value"
            data-testid="input-unit-from"
          />
        </div>

        {/* Swap */}
        <motion.button
          onClick={swap}
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center text-primary border border-primary/30 mx-auto"
          data-testid="button-swap-units"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </motion.button>

        {/* To */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <select
            value={toIdx}
            onChange={(e) => setToIdx(Number(e.target.value))}
            className="w-full bg-muted/60 text-foreground text-sm rounded-xl px-3 py-2.5 border border-white/10 focus:border-primary/50 outline-none transition-colors"
            data-testid="select-unit-to"
          >
            {cat.map((u, i) => (
              <option key={u.label} value={i} className="bg-[#16213e]">{u.label}</option>
            ))}
          </select>
          <div className="text-3xl font-bold text-primary font-mono" data-testid="text-unit-result">
            {toDisplay}
          </div>
        </div>
      </div>

      {/* Formula hint */}
      <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-muted-foreground font-mono">
        {fromValue || "0"} {cat[fromIdx].label} = {toDisplay} {cat[toIdx].label}
      </div>
    </div>
  );
}
