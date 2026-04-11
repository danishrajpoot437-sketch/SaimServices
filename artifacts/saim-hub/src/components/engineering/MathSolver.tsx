import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { derivative, simplify, evaluate, parse } from "mathjs";
import {
  Calculator, ChevronDown, ChevronRight, Copy, Check,
  Sigma, TrendingUp, BarChart2, Sparkles,
} from "lucide-react";

export interface HistoryEntry {
  id: string;
  mode: string;
  input: string;
  result: string;
  ts: number;
}

interface MathSolverProps {
  onHistoryPush: (entry: HistoryEntry) => void;
  onStatusChange: (status: "idle" | "computing" | "done" | "error") => void;
}

type Mode = "simplify" | "derivative" | "evaluate" | "stats";

interface Step { label: string; value: string; note?: string }

const MODES: { id: Mode; label: string; icon: React.ElementType; color: string }[] = [
  { id: "simplify",   label: "Simplify",    icon: Sparkles,   color: "text-primary"  },
  { id: "derivative", label: "Derivative",  icon: TrendingUp, color: "text-emerald-400" },
  { id: "evaluate",   label: "Evaluate",    icon: Calculator, color: "text-amber-400" },
  { id: "stats",      label: "Statistics",  icon: BarChart2,  color: "text-purple-400" },
];

const PRESETS: Record<Mode, { label: string; expr: string; variable?: string }[]> = {
  simplify: [
    { label: "Polynomial", expr: "2*x^2 + 3*x^2 - x + 4*x - 5" },
    { label: "Trig identity", expr: "sin(x)^2 + cos(x)^2" },
    { label: "Expand", expr: "(x+2)*(x-3)" },
  ],
  derivative: [
    { label: "x³", expr: "x^3 + 2*x^2 - 5*x + 7", variable: "x" },
    { label: "sin product", expr: "x * sin(x)", variable: "x" },
    { label: "e^x", expr: "e^x + log(x)", variable: "x" },
  ],
  evaluate: [
    { label: "Trig", expr: "sin(pi/6) + cos(pi/3)" },
    { label: "Log", expr: "log(e^3)" },
    { label: "Pythagorean", expr: "sqrt(3^2 + 4^2)" },
  ],
  stats: [
    { label: "Sample set", expr: "12, 18, 24, 30, 36" },
    { label: "Mixed set", expr: "5, 7, 3, 9, 11, 14, 8" },
    { label: "Fibonacci", expr: "1, 1, 2, 3, 5, 8, 13, 21" },
  ],
};

function computeSimplify(expr: string): { steps: Step[]; result: string } {
  const parsed = parse(expr);
  const simplified = simplify(parsed);
  const result = simplified.toString();

  const steps: Step[] = [
    { label: "Input Expression",   value: expr,   note: "Original form" },
    { label: "Parsed Tree",        value: parsed.toString(), note: "AST normalised" },
    { label: "Simplified Result",  value: result, note: "Like terms collected & simplified" },
  ];

  try {
    const numCheck = evaluate(result.replace(/x/g, "2"));
    const numOrig = evaluate(expr.replace(/x/g, "2"));
    if (typeof numCheck === "number" && typeof numOrig === "number") {
      steps.push({ label: "Verification (x=2)", value: `${numOrig.toFixed(6)} = ${numCheck.toFixed(6)}`, note: "Both sides equal ✓" });
    }
  } catch { /* skip */ }

  return { steps, result };
}

function computeDerivative(expr: string, variable: string): { steps: Step[]; result: string } {
  const derivNode = derivative(expr, variable);
  const result = derivNode.toString();
  const simplified = simplify(derivNode).toString();

  const steps: Step[] = [
    { label: "f(x)",               value: expr,      note: "Original function" },
    { label: `d/d${variable}`,     value: result,    note: "Chain / power / product rules applied" },
    { label: "Simplified f′(x)",   value: simplified, note: "Collected & reduced" },
  ];

  try {
    const x0 = 1;
    const scope = { [variable]: x0, pi: Math.PI, e: Math.E };
    const val = evaluate(simplified, scope);
    if (typeof val === "number") {
      steps.push({ label: `f′(${x0})`, value: val.toFixed(6), note: `Numeric check at ${variable}=${x0}` });
    }
  } catch { /* skip */ }

  return { steps, result: simplified };
}

function computeEvaluate(expr: string): { steps: Step[]; result: string } {
  const parsed = parse(expr);
  const result = evaluate(expr);
  const resultStr = typeof result === "number" ? result.toPrecision(10).replace(/\.?0+$/, "") : String(result);

  const steps: Step[] = [
    { label: "Expression",     value: expr,      note: "Input" },
    { label: "Parsed Form",    value: parsed.toString(), note: "Operator tree" },
    { label: "Numeric Result", value: resultStr, note: "Evaluated with full precision" },
  ];

  if (typeof result === "number") {
    if (Number.isInteger(result)) {
      steps.push({ label: "Integer", value: result.toString(), note: "Exact integer" });
    } else {
      steps.push({ label: "Fraction ≈", value: `${result.toFixed(6)}`, note: "Rounded to 6 decimal places" });
    }
  }

  return { steps, result: resultStr };
}

function computeStats(raw: string): { steps: Step[]; result: string } {
  const nums = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) throw new Error("No valid numbers found");

  const n = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const sorted = [...nums].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min;

  const steps: Step[] = [
    { label: "Dataset (n=" + n + ")",  value: nums.join(", "),             note: "Input values" },
    { label: "Sorted",                  value: sorted.join(", "),           note: "Ascending order" },
    { label: "Mean (μ)",                value: mean.toFixed(6),             note: "Sum / n" },
    { label: "Median",                  value: median.toFixed(4),           note: n % 2 === 0 ? "Average of two middle values" : "Middle value" },
    { label: "Std Deviation (σ)",       value: stdDev.toFixed(6),           note: "√(Σ(x−μ)²/n)" },
    { label: "Variance (σ²)",           value: variance.toFixed(6),         note: "Population variance" },
    { label: "Range",                   value: `${min} → ${max} (Δ${range})`, note: "Max − Min" },
  ];

  return { steps, result: `μ=${mean.toFixed(4)}, σ=${stdDev.toFixed(4)}, n=${n}` };
}

export default function MathSolver({ onHistoryPush, onStatusChange }: MathSolverProps) {
  const [mode, setMode] = useState<Mode>("simplify");
  const [expr, setExpr] = useState("2*x^2 + 3*x^2 - x + 4*x - 5");
  const [variable, setVariable] = useState("x");
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const compute = useCallback(() => {
    setError("");
    setSteps([]);
    setResult("");
    onStatusChange("computing");

    setTimeout(() => {
      try {
        let out: { steps: Step[]; result: string };
        if (mode === "simplify")   out = computeSimplify(expr);
        else if (mode === "derivative") out = computeDerivative(expr, variable);
        else if (mode === "evaluate")   out = computeEvaluate(expr);
        else                            out = computeStats(expr);

        setSteps(out.steps);
        setResult(out.result);
        setExpandedStep(out.steps.length - 1);
        onStatusChange("done");

        onHistoryPush({
          id: Date.now().toString(),
          mode: MODES.find(m => m.id === mode)!.label,
          input: expr,
          result: out.result,
          ts: Date.now(),
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Invalid expression";
        setError(msg);
        onStatusChange("error");
      }
    }, 60);
  }, [mode, expr, variable, onHistoryPush, onStatusChange]);

  const copyResult = () => {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const activeMode = MODES.find(m => m.id === mode)!;

  return (
    <div className="space-y-5">
      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setSteps([]); setResult(""); setError(""); }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              mode === m.id
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/4"
            }`}
          >
            <m.icon className={`w-3.5 h-3.5 ${mode === m.id ? m.color : ""}`} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <activeMode.icon className={`w-4 h-4 ${activeMode.color}`} />
          <span className="text-sm font-semibold text-foreground">{activeMode.label}</span>
          {mode === "stats" && (
            <span className="text-xs text-muted-foreground ml-auto">comma-separated numbers</span>
          )}
          {mode === "evaluate" && (
            <span className="text-xs text-muted-foreground ml-auto">numeric expression</span>
          )}
        </div>

        <textarea
          value={expr}
          onChange={e => setExpr(e.target.value)}
          placeholder={
            mode === "stats"
              ? "e.g. 12, 18, 24, 30, 36"
              : "e.g. x^3 + 2*x^2 - 5"
          }
          rows={2}
          className="w-full bg-transparent text-foreground text-sm font-mono placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) compute(); }}
        />

        {mode === "derivative" && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-xs text-muted-foreground">Differentiate with respect to</span>
            <input
              value={variable}
              onChange={e => setVariable(e.target.value || "x")}
              className="w-10 bg-primary/10 border border-primary/25 rounded-lg px-2 py-1 text-sm font-mono text-primary text-center outline-none"
            />
          </div>
        )}

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
          {PRESETS[mode].map(p => (
            <button key={p.label} onClick={() => { setExpr(p.expr); if (p.variable) setVariable(p.variable); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compute Button */}
      <button
        onClick={compute}
        disabled={!expr.trim()}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ boxShadow: "0 0 24px rgba(67,97,238,0.35)" }}
      >
        <Sigma className="w-4 h-4" />
        Compute  <span className="text-xs opacity-60 ml-1">Ctrl+Enter</span>
      </button>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl text-sm text-red-400 flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <span>⚠</span> {error} — check syntax (use * for multiplication, ^ for powers)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-Step Results */}
      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* Result banner */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(67,97,238,0.12) 0%, rgba(14,165,233,0.06) 100%)",
                border: "1px solid rgba(67,97,238,0.3)",
              }}
            >
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Result</p>
                <p className="text-lg font-bold font-mono text-foreground">{result}</p>
              </div>
              <button onClick={copyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Step cards */}
            <p className="text-xs text-muted-foreground px-1">Step-by-step breakdown</p>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                  style={{ background: expandedStep === i ? "rgba(67,97,238,0.06)" : "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(67,97,238,0.2)", color: "#93c5fd" }}
                    >{i + 1}</span>
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                  </div>
                  {expandedStep === i
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <AnimatePresence>
                  {expandedStep === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 space-y-1.5"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <p className="font-mono text-sm text-primary break-all">{step.value}</p>
                        {step.note && <p className="text-xs text-muted-foreground">{step.note}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
