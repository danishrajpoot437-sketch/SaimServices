import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { evaluate, parse } from "mathjs";
import { Plus, Trash2, Download, Play, ZoomIn, ZoomOut } from "lucide-react";
import type { HistoryEntry } from "./types";

interface FnEntry {
  id: string;
  expr: string;
  color: string;
  enabled: boolean;
  label: string;
}

interface GraphLabProps {
  onHistoryPush: (entry: HistoryEntry) => void;
  onStatusChange: (s: "idle" | "computing" | "done" | "error") => void;
}

const PALETTE = ["#4361ee", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

const DEFAULT_FNS: FnEntry[] = [
  { id: "fn1", expr: "x^2",       color: PALETTE[0], enabled: true, label: "f(x)" },
  { id: "fn2", expr: "sin(x)*5",  color: PALETTE[1], enabled: true, label: "g(x)" },
];

function buildSeries(entries: FnEntry[], xMin: number, xMax: number, pts: number) {
  const step = (xMax - xMin) / pts;
  const rows: Record<string, number | null>[] = [];

  for (let i = 0; i <= pts; i++) {
    const x = parseFloat((xMin + i * step).toFixed(5));
    const row: Record<string, number | null> = { x };
    for (const fn of entries) {
      if (!fn.enabled || !fn.expr.trim()) { row[fn.id] = null; continue; }
      try {
        parse(fn.expr);
        const y = evaluate(fn.expr, { x, pi: Math.PI, e: Math.E });
        row[fn.id] = typeof y === "number" && isFinite(y) && Math.abs(y) < 1e6 ? +y.toFixed(5) : null;
      } catch {
        row[fn.id] = null;
      }
    }
    rows.push(row);
  }
  return rows;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: number }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs space-y-1"
      style={{ background: "rgba(12,24,64,0.97)", border: "1px solid rgba(67,97,238,0.3)", backdropFilter: "blur(12px)" }}>
      <p className="text-muted-foreground font-mono mb-1.5">x = {label?.toFixed(3)}</p>
      {payload.map(p => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name} = {p.value?.toFixed(4) ?? "—"}
        </p>
      ))}
    </div>
  );
};

export default function GraphLab({ onHistoryPush, onStatusChange }: GraphLabProps) {
  const [fns, setFns] = useState<FnEntry[]>(DEFAULT_FNS);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [pts, setPts] = useState(300);
  const [plotted, setPlotted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const enabledFns = fns.filter(f => f.enabled && f.expr.trim());

  const data = useMemo(() => {
    if (!plotted) return [];
    return buildSeries(fns, xMin, xMax, pts);
  }, [fns, xMin, xMax, pts, plotted]);

  const plot = useCallback(() => {
    onStatusChange("computing");
    setTimeout(() => {
      setPlotted(true);
      onStatusChange("done");
      if (enabledFns.length > 0) {
        onHistoryPush({
          id: Date.now().toString(),
          mode: "Graph Lab",
          input: enabledFns.map(f => f.expr).join(", "),
          result: `Plotted ${enabledFns.length} function(s) on [${xMin}, ${xMax}]`,
          ts: Date.now(),
        });
      }
    }, 80);
  }, [enabledFns, xMin, xMax, onHistoryPush, onStatusChange]);

  const addFn = () => {
    if (fns.length >= 6) return;
    const id = `fn${Date.now()}`;
    setFns(prev => [...prev, { id, expr: "", color: PALETTE[prev.length % PALETTE.length], enabled: true, label: `h${prev.length}(x)` }]);
  };

  const removeFn = (id: string) => setFns(prev => prev.filter(f => f.id !== id));
  const updateFn = (id: string, patch: Partial<FnEntry>) => setFns(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const saveImage = () => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector("svg");
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("style", "background: #0a1028;");

    const svgStr = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth || 800;
    canvas.height = svg.clientHeight || 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0a1028";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = "graph-lab.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  return (
    <div className="space-y-4">
      {/* Function inputs */}
      <div className="space-y-2">
        {fns.map((fn, i) => (
          <div key={fn.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: fn.color }} />
            <span className="text-xs text-muted-foreground font-mono w-14 flex-shrink-0">{fn.label} =</span>
            <input
              value={fn.expr}
              onChange={e => { updateFn(fn.id, { expr: e.target.value }); setPlotted(false); }}
              placeholder={`function of x (e.g. x^${i + 2})`}
              className="flex-1 bg-transparent border-b border-white/10 focus:border-primary/60 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 outline-none py-1.5 transition-colors"
            />
            <button
              onClick={() => updateFn(fn.id, { enabled: !fn.enabled })}
              className={`w-8 h-5 rounded-full transition-colors flex-shrink-0 ${fn.enabled ? "bg-primary/60" : "bg-white/10"}`}
              title={fn.enabled ? "Disable" : "Enable"}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-auto`} style={{ transform: fn.enabled ? "translateX(4px)" : "translateX(-4px)" }} />
            </button>
            {fns.length > 1 && (
              <button onClick={() => removeFn(fn.id)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {fns.length < 6 && (
          <button onClick={addFn} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg border border-primary/20 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Function
          </button>
        )}
      </div>

      {/* X Range controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">x range:</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">[</span>
          <input type="number" value={xMin} onChange={e => setXMin(+e.target.value)}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-foreground outline-none focus:border-primary/40 text-center"
          />
          <span className="text-xs text-muted-foreground">,</span>
          <input type="number" value={xMax} onChange={e => setXMax(+e.target.value)}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-foreground outline-none focus:border-primary/40 text-center"
          />
          <span className="text-xs text-muted-foreground">]</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => { setXMin(m => m * 2); setXMax(m => m * 2); }} className="p-1.5 rounded-lg border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setXMin(m => Math.round(m / 2)); setXMax(m => Math.round(m / 2)); }} className="p-1.5 rounded-lg border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-muted-foreground mx-2">pts:</span>
          <select value={pts} onChange={e => setPts(+e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground outline-none"
          >
            <option value={150}>150</option>
            <option value={300}>300</option>
            <option value={600}>600</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={plot}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ boxShadow: "0 0 20px rgba(67,97,238,0.3)" }}
        >
          <Play className="w-4 h-4" /> Plot Functions
        </button>
        {plotted && (
          <button onClick={saveImage}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Save PNG
          </button>
        )}
      </div>

      {/* Chart */}
      {plotted && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          ref={chartRef}
          className="rounded-2xl p-3"
          style={{ background: "rgba(10,16,40,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="x" type="number" domain={[xMin, xMax]} tickFormatter={(v: number) => v.toFixed(1)}
                tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }} width={38}
                tickFormatter={(v: number) => v > 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                formatter={(val: string) => {
                  const fn = fns.find(f => f.id === val);
                  return fn ? `${fn.label}: ${fn.expr}` : val;
                }}
              />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
              {fns.filter(f => f.enabled && f.expr.trim()).map(fn => (
                <Line
                  key={fn.id}
                  type="monotone"
                  dataKey={fn.id}
                  name={fn.id}
                  stroke={fn.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, fill: fn.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {!plotted && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
          style={{ background: "rgba(10,16,40,0.4)", border: "1px dashed rgba(255,255,255,0.06)" }}
        >
          <TrendingUpIcon className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">Enter functions above and click Plot</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Supports sin, cos, tan, log, sqrt, pi, e, ^</p>
        </div>
      )}
    </div>
  );
}

function TrendingUpIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
