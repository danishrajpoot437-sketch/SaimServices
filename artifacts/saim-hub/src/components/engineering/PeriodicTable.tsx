import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Atom } from "lucide-react";
import { ELEMENTS, ELEMENT_BY_Z, CATEGORY_COLORS, type ChemElement } from "@/data/periodicData";

const F_BLOCK = new Set([
  ...Array.from({ length: 14 }, (_, i) => 58 + i),  // Ce (58) – Lu (71)
  ...Array.from({ length: 14 }, (_, i) => 90 + i),  // Th (90) – Lr (103)
]);

const mainGrid: (ChemElement | null)[][] = Array.from({ length: 7 }, () => new Array(18).fill(null));
ELEMENTS.forEach(el => {
  if (!F_BLOCK.has(el.Z) && el.group > 0 && el.period >= 1 && el.period <= 7) {
    mainGrid[el.period - 1][el.group - 1] = el;
  }
});

const lanthanides = Array.from({ length: 14 }, (_, i) => ELEMENT_BY_Z[58 + i]).filter(Boolean);
const actinides   = Array.from({ length: 14 }, (_, i) => ELEMENT_BY_Z[90 + i]).filter(Boolean);

function ElementCell({
  el, size = "md", selected, dimmed, onClick,
}: {
  el: ChemElement | null;
  size?: "sm" | "md";
  selected?: boolean;
  dimmed?: boolean;
  onClick?: (el: ChemElement) => void;
}) {
  if (!el) return <div className={size === "sm" ? "w-[42px] h-[46px]" : "w-[48px] h-[52px]"} />;
  const c = CATEGORY_COLORS[el.category];
  const sm = size === "sm";

  return (
    <motion.button
      whileHover={{ scale: 1.12, zIndex: 10 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick?.(el)}
      className={`relative rounded flex flex-col items-center justify-center cursor-pointer select-none transition-opacity ${dimmed ? "opacity-25" : "opacity-100"}`}
      style={{
        width: sm ? 42 : 48,
        height: sm ? 46 : 52,
        background: selected
          ? `${c.bg.replace("0.18", "0.45")}`
          : c.bg,
        border: `1px solid ${selected ? c.border.replace("0.4", "0.8") : c.border}`,
        boxShadow: selected ? `0 0 12px ${c.border}` : undefined,
      }}
      title={`${el.name} (${el.Z})`}
    >
      <span className={`${sm ? "text-[8px]" : "text-[9px]"} text-muted-foreground leading-none mb-0.5`}>{el.Z}</span>
      <span className={`${sm ? "text-[11px]" : "text-sm"} font-bold leading-none`} style={{ color: c.text }}>{el.symbol}</span>
      <span className={`${sm ? "text-[7px]" : "text-[8px]"} text-muted-foreground/60 leading-none mt-0.5`}>{el.mass.toFixed(el.mass < 100 ? 3 : 2)}</span>
    </motion.button>
  );
}

const STATE_LABELS: Record<string, string> = { solid: "Solid at STP", liquid: "Liquid at STP", gas: "Gas at STP", unknown: "Unknown state" };
const STATE_COLORS: Record<string, string> = { solid: "#94a3b8", liquid: "#38bdf8", gas: "#86efac", unknown: "#64748b" };

function DetailPanel({ el, onClose }: { el: ChemElement; onClose: () => void }) {
  const c = CATEGORY_COLORS[el.category];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-5 relative"
      style={{
        background: "rgba(10,16,40,0.95)",
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 40px ${c.bg}`,
        minWidth: 240,
      }}
    >
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.bg}` }}
        >
          <span className="text-[10px] text-muted-foreground">{el.Z}</span>
          <span className="text-2xl font-bold" style={{ color: c.text }}>{el.symbol}</span>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{el.name}</p>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: c.text }}>
            {CATEGORY_COLORS[el.category].label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5" style={{ color: STATE_COLORS[el.state] }}>
            {STATE_LABELS[el.state]}
          </p>
        </div>
      </div>

      {/* Properties grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Atomic Mass",       value: `${el.mass} u` },
          { label: "Atomic Number",     value: `${el.Z}` },
          { label: "Period",            value: `${el.period}` },
          { label: "Group",             value: el.group > 0 ? `${el.group}` : "f-block" },
          ...(el.electronegativity ? [{ label: "Electronegativity", value: `${el.electronegativity} (Pauling)` }] : []),
          ...(el.discovery ? [{ label: "Discovered",  value: `${el.discovery}` }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
            <p className="text-xs font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Electron config */}
      <div className="rounded-xl px-3 py-2.5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-[10px] text-muted-foreground mb-1">Electron Configuration</p>
        <p className="text-xs font-mono text-foreground">{el.electrons}</p>
      </div>
    </motion.div>
  );
}

export default function PeriodicTable() {
  const [selected, setSelected] = useState<ChemElement | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const matchedZ = useMemo(() => {
    if (!search && !filterCat) return null;
    const q = search.toLowerCase();
    return new Set(
      ELEMENTS.filter(el =>
        (!q || el.symbol.toLowerCase().includes(q) || el.name.toLowerCase().includes(q) || String(el.Z).includes(q)) &&
        (!filterCat || el.category === filterCat)
      ).map(e => e.Z)
    );
  }, [search, filterCat]);

  const isDimmed = (el: ChemElement | null) => {
    if (!el) return false;
    return matchedZ !== null && !matchedZ.has(el.Z);
  };

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search element, symbol, or Z…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white/4 border border-white/8 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40"
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        {filterCat && (
          <button onClick={() => setFilterCat(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" /> {CATEGORY_COLORS[filterCat as keyof typeof CATEGORY_COLORS]?.label ?? filterCat}
          </button>
        )}
      </div>

      {/* Category legend (filter buttons) */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
          <button
            key={cat}
            onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all"
            style={{
              background: filterCat === cat ? style.bg.replace("0.18", "0.35") : style.bg,
              borderColor: filterCat === cat ? style.border.replace("0.4", "0.8").replace("0.35", "0.8") : style.border,
              color: style.text,
            }}
          >
            {style.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        {/* Periodic table grid - scrollable */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px] space-y-0.5">
            {/* Main periods */}
            {mainGrid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-0.5">
                {row.map((el, colIdx) => {
                  const isEmpty = !el;
                  if (isEmpty) {
                    // Show period label at start of row
                    if (colIdx === 0) return <div key={colIdx} className="w-[48px] h-[52px] flex items-center justify-end pr-1">
                      <span className="text-[9px] text-muted-foreground/40">{rowIdx + 1}</span>
                    </div>;
                    return <div key={colIdx} className="w-[48px] h-[52px]" />;
                  }
                  return (
                    <ElementCell
                      key={colIdx}
                      el={el}
                      selected={selected?.Z === el.Z}
                      dimmed={isDimmed(el)}
                      onClick={el => setSelected(selected?.Z === el.Z ? null : el)}
                    />
                  );
                })}
              </div>
            ))}

            {/* Gap row with label */}
            <div className="h-3 flex items-center pl-1">
              <div className="flex gap-1 items-center ml-[198px]">
                <span className="text-[8px] text-primary/50 tracking-wider">LANTHANIDES 57-71</span>
              </div>
            </div>

            {/* Lanthanide row */}
            <div className="flex gap-0.5">
              <div className="w-[48px] h-[46px] flex items-center justify-center">
                <span className="text-[9px] text-cyan-400/60">*</span>
              </div>
              <div className="w-[48px] h-[46px]" />
              <div className="w-[48px] h-[46px]" />
              {lanthanides.map(el => (
                <ElementCell
                  key={el.Z} el={el} size="sm"
                  selected={selected?.Z === el.Z}
                  dimmed={isDimmed(el)}
                  onClick={el => setSelected(selected?.Z === el.Z ? null : el)}
                />
              ))}
            </div>

            {/* Actinide row */}
            <div className="flex gap-0.5">
              <div className="w-[48px] h-[46px] flex items-center justify-center">
                <span className="text-[9px] text-indigo-400/60">**</span>
              </div>
              <div className="w-[48px] h-[46px]" />
              <div className="w-[48px] h-[46px]" />
              {actinides.map(el => (
                <ElementCell
                  key={el.Z} el={el} size="sm"
                  selected={selected?.Z === el.Z}
                  dimmed={isDimmed(el)}
                  onClick={el => setSelected(selected?.Z === el.Z ? null : el)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <DetailPanel key={selected.Z} el={selected} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* No results */}
      {matchedZ !== null && matchedZ.size === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <Atom className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No elements match "{search}"</p>
        </div>
      )}
    </div>
  );
}
