import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { evaluate, parse } from "mathjs";
import { Play, AlertCircle, TrendingUp } from "lucide-react";

interface PlotPoint { x: number; y: number | null }

const PRESETS = [
  { label: "x²", fn: "x^2" },
  { label: "sin(x)", fn: "sin(x)" },
  { label: "cos(x)", fn: "cos(x)" },
  { label: "tan(x)", fn: "tan(x)" },
  { label: "e^x", fn: "e^x" },
  { label: "√x", fn: "sqrt(x)" },
  { label: "ln(x)", fn: "log(x)" },
  { label: "1/x", fn: "1/x" },
  { label: "x³−3x", fn: "x^3 - 3*x" },
];

function buildData(fnStr: string, xMin: number, xMax: number, steps: number): { data: PlotPoint[]; error: string | null } {
  try {
    parse(fnStr);
  } catch {
    return { data: [], error: "Invalid expression syntax" };
  }

  const data: PlotPoint[] = [];
  const step = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = parseFloat((xMin + i * step).toFixed(6));
    try {
      const raw = evaluate(fnStr, { x, pi: Math.PI, e: Math.E });
      const y = typeof raw === "number" ? raw : null;
      if (y !== null && !isNaN(y) && isFinite(y) && Math.abs(y) < 1e8) {
        data.push({ x, y });
      } else {
        data.push({ x, y: null });
      }
    } catch {
      data.push({ x, y: null });
    }
  }
  return { data, error: null };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const y = payload[0]?.value;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs font-mono"
      style={{
        background: "rgba(10, 18, 44, 0.95)",
        border: "1px solid rgba(67,97,238,0.4)",
        boxShadow: "0 0 20px rgba(67,97,238,0.2), 0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="text-muted-foreground mb-0.5">x = <span className="text-foreground font-bold">{Number(label).toFixed(3)}</span></div>
      <div className="text-muted-foreground">y = <span className="text-primary font-bold">{typeof y === "number" ? y.toFixed(4) : "—"}</span></div>
    </div>
  );
}

export default function FunctionPlotter() {
  const [input, setInput] = useState("x^2");
  const [activeFn, setActiveFn] = useState("x^2");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const { data } = useMemo(() => {
    const result = buildData(activeFn, xMin, xMax, 400);
    setError(result.error);
    return result;
  }, [activeFn, xMin, xMax]);

  const yValues = data.filter(d => d.y !== null).map(d => d.y as number);
  const yMin = yValues.length ? Math.min(...yValues) : -10;
  const yMax = yValues.length ? Math.max(...yValues) : 10;
  const yPad = (yMax - yMin) * 0.12 || 1;

  const plot = useCallback(() => {
    const { error: e } = buildData(input, xMin, xMax, 10);
    if (e) { setError(e); return; }
    setError(null);
    setActiveFn(input);
  }, [input, xMin, xMax]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") plot();
  };

  return (
    <div className="space-y-5">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono font-bold select-none">
            f(x) =
          </span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="x^2, sin(x), cos(x)*x ..."
            className="w-full rounded-xl pl-16 pr-4 py-3.5 text-sm font-mono text-foreground outline-none border border-white/10 focus:border-primary/50 transition-colors duration-200"
            style={{ background: "rgba(255,255,255,0.04)" }}
            data-testid="input-fn-plotter"
          />
        </div>
        <motion.button
          onClick={plot}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-primary hover:bg-primary/85 text-primary-foreground text-sm font-semibold transition-colors"
          style={{ boxShadow: "0 0 20px rgba(67,97,238,0.3)" }}
          data-testid="btn-plot"
        >
          <Play className="w-4 h-4 fill-current" />
          Plot
        </motion.button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button key={p.fn} onClick={() => { setInput(p.fn); setActiveFn(p.fn); setError(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all duration-200 ${
              activeFn === p.fn
                ? "bg-primary/20 text-primary border-primary/35"
                : "bg-white/5 text-muted-foreground border-white/8 hover:bg-white/10 hover:text-foreground"
            }`}
            data-testid={`preset-${p.label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* X range controls */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">x range:</span>
        <div className="flex items-center gap-1.5">
          <label className="text-muted-foreground/60">from</label>
          <input type="number" value={xMin} onChange={e => setXMin(Number(e.target.value))}
            className="w-20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground border border-white/8 bg-white/4 outline-none focus:border-primary/40"
            data-testid="input-xmin" />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-muted-foreground/60">to</label>
          <input type="number" value={xMax} onChange={e => setXMax(Number(e.target.value))}
            className="w-20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground border border-white/8 bg-white/4 outline-none focus:border-primary/40"
            data-testid="input-xmax" />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded-full" style={{ background: "rgba(14,165,233,1)", boxShadow: "0 0 8px rgba(14,165,233,0.8)" }} />
          <span className="text-muted-foreground font-mono">{activeFn}</span>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error} — check your expression syntax
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(6, 12, 32, 0.85)",
          border: "1px solid rgba(67,97,238,0.18)",
          boxShadow: "0 0 40px rgba(67,97,238,0.08), 0 4px 32px rgba(0,0,0,0.4)",
        }}
      >
        {data.length > 0 && !error ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 24, bottom: 10, left: 8 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[xMin, xMax]}
                tickCount={9}
                tickFormatter={v => Number(v).toFixed(1)}
                tick={{ fontSize: 10, fill: "rgba(148,163,184,0.6)", fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                domain={[yMin - yPad, yMax + yPad]}
                tickFormatter={v => Number(v).toFixed(1)}
                tick={{ fontSize: 10, fill: "rgba(148,163,184,0.6)", fontFamily: "monospace" }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.06)" }}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="rgba(14,165,233,1)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#0ea5e9", stroke: "rgba(14,165,233,0.4)", strokeWidth: 6 }}
                connectNulls={false}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <TrendingUp className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground/50">
              {error ? "Fix the expression above to plot" : "Enter a function and click Plot"}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/40 text-center">
        Supports: <span className="font-mono">sin cos tan log sqrt abs pi e ^ * /</span>
      </p>
    </div>
  );
}
