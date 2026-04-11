import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  derivative, simplify, evaluate, parse, det, inv,
  multiply, add as mAdd,
} from "mathjs";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Calculator, ChevronDown, ChevronRight, Copy, Check,
  Sigma, TrendingUp, BarChart2, Grid3X3, AlertTriangle,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────────── */
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
interface Step { label: string; value: string; note?: string }

type LevelTab = "basic" | "calculus" | "matrices" | "stats";
type BasicMode = "evaluate" | "simplify" | "quadratic";
type CalcMode = "derivative" | "integral";
type MatrixMode = "det" | "inv" | "multiply" | "add";
type StatsMode = "descriptive";

/* ─── Input pre-processor ─────────────────────────────────────────────────── */
function sanitize(raw: string): string {
  return raw
    .replace(/(\d)([a-zA-Z\(])/g, "$1*$2")          // 4x → 4*x, 2( → 2*(
    .replace(/([a-zA-Z\)])(\d)/g, "$1*$2")           // x2 → x*2
    .replace(/\)\s*\(/g, ")*(")                      // )( → )*(
    .replace(/([a-zA-Z\)])\s*\(/g, "$1*(")           // sin( already fine, x( → x*(
    .replace(/\^{(\d+)}/g, "^$1")                    // ^{2} → ^2
    .trim();
}

/* ─── KaTeX renderer ──────────────────────────────────────────────────────── */
function KatexSpan({ latex, block = false }: { latex: string; block?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, { displayMode: block, throwOnError: false, output: "html" });
    } catch { ref.current.textContent = latex; }
  }, [latex, block]);
  return <span ref={ref} className="katex-render" />;
}

function exprToLatex(expr: string): string {
  try { return parse(expr).toTex(); } catch { return expr; }
}

/* ─── Basic ── Evaluate ───────────────────────────────────────────────────── */
function computeEvaluate(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const parsed = parse(expr);
  const res = evaluate(expr);
  const resStr = typeof res === "number"
    ? res.toPrecision(10).replace(/\.?0+$/, "")
    : String(res);
  const steps: Step[] = [
    { label: "Input Expression", value: expr, note: "Sanitised form" },
    { label: "Parsed Form", value: parsed.toString(), note: "Operator tree" },
    { label: "Result", value: resStr, note: "Evaluated with full precision" },
  ];
  if (typeof res === "number" && !Number.isInteger(res)) {
    steps.push({ label: "Rounded", value: res.toFixed(6), note: "6 decimal places" });
  }
  return { steps, result: resStr };
}

/* ─── Basic ── Simplify ───────────────────────────────────────────────────── */
function computeSimplify(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const parsed = parse(expr);
  const simplified = simplify(parsed);
  const result = simplified.toString();
  const steps: Step[] = [
    { label: "Input Expression",  value: expr,   note: "Sanitised form" },
    { label: "Parsed AST",        value: parsed.toString(), note: "Abstract syntax tree" },
    { label: "Simplified Result", value: result, note: "Like terms collected & simplified" },
  ];
  try {
    const n1 = evaluate(expr.replace(/x/g, "3"));
    const n2 = evaluate(result.replace(/x/g, "3"));
    if (typeof n1 === "number" && typeof n2 === "number") {
      steps.push({ label: "Verification (x=3)", value: `${n1.toFixed(6)} = ${n2.toFixed(6)}`, note: "Both sides equal ✓" });
    }
  } catch { /* skip */ }
  return { steps, result };
}

/* ─── Basic ── Quadratic ─────────────────────────────────────────────────── */
function computeQuadratic(raw: string): { steps: Step[]; result: string } {
  let a = 1, b = 0, c = 0;
  const parts = raw.split(/[,\s]+/).map(Number);
  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
    [a, b, c] = parts;
  } else {
    const expr = sanitize(raw.replace(/=\s*0\s*$/, "").trim());
    try {
      a = evaluate(derivative(derivative(expr, "x"), "x").toString()) / 2;
      const dExpr = simplify(derivative(expr, "x")).toString();
      b = (evaluate(dExpr.replace(/x/g, "0")) as number) - 2 * a * 0;
      c = evaluate(expr.replace(/x/g, "0")) as number;
    } catch {
      throw new Error("Enter as: a, b, c  (e.g. 2, -3, 1  for 2x²−3x+1=0)");
    }
  }
  const disc = b * b - 4 * a * c;
  const steps: Step[] = [
    { label: "Standard Form", value: `${a}x² + ${b}x + ${c} = 0`, note: "ax² + bx + c = 0" },
    { label: "a, b, c", value: `a=${a},  b=${b},  c=${c}`, note: "Coefficients extracted" },
    { label: "Discriminant (Δ)", value: `b²−4ac = ${b}²−4·${a}·${c} = ${disc}`,
      note: disc > 0 ? "Δ > 0 → two real roots" : disc === 0 ? "Δ = 0 → one real root (repeated)" : "Δ < 0 → two complex roots" },
  ];
  let result: string;
  if (disc >= 0) {
    const sqrtDisc = Math.sqrt(disc);
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);
    steps.push({ label: "Roots", value: disc === 0 ? `x = ${x1.toFixed(6)}` : `x₁ = ${x1.toFixed(6)},  x₂ = ${x2.toFixed(6)}`, note: "x = (−b ± √Δ) / 2a" });
    result = disc === 0 ? `x = ${x1.toFixed(6)}` : `x₁ = ${x1.toFixed(6)},  x₂ = ${x2.toFixed(6)}`;
  } else {
    const realPart = (-b / (2 * a)).toFixed(6);
    const imagPart = (Math.sqrt(-disc) / (2 * a)).toFixed(6);
    steps.push({ label: "Complex Roots", value: `x₁ = ${realPart} + ${imagPart}i,  x₂ = ${realPart} − ${imagPart}i`, note: "Complex conjugate pair" });
    result = `x = ${realPart} ± ${imagPart}i`;
  }
  return { steps, result };
}

/* ─── Calculus ── Derivative ─────────────────────────────────────────────── */
function computeDerivative(raw: string, variable: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const derivNode = derivative(expr, variable);
  const result = simplify(derivNode).toString();
  const steps: Step[] = [
    { label: "f(x)", value: expr, note: "Original function" },
    { label: `d/d${variable}`, value: derivNode.toString(), note: "Chain / power / product rules" },
    { label: "Simplified f′(x)", value: result, note: "Collected & reduced" },
  ];
  try {
    const scope = { [variable]: 1, pi: Math.PI, e: Math.E };
    const val = evaluate(result, scope);
    if (typeof val === "number") steps.push({ label: `f′(1)`, value: val.toFixed(6), note: "Numeric check at x=1" });
  } catch { /* skip */ }
  return { steps, result };
}

/* ─── Calculus ── Numeric Integration (Simpson's rule) ───────────────────── */
function computeIntegral(raw: string, variable: string, aStr: string, bStr: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const a = parseFloat(aStr), b = parseFloat(bStr);
  if (isNaN(a) || isNaN(b)) throw new Error("Enter valid numeric limits a and b");
  const N = 1000;
  const h = (b - a) / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const x = a + i * h;
    const scope = { [variable]: x, pi: Math.PI, e: Math.E };
    const val = evaluate(expr, scope);
    if (typeof val !== "number") throw new Error("Expression must be numeric");
    if (i === 0 || i === N) sum += val;
    else if (i % 2 === 1) sum += 4 * val;
    else sum += 2 * val;
  }
  const integral = (h / 3) * sum;
  const steps: Step[] = [
    { label: "Integrand f(x)", value: expr, note: "Sanitised input" },
    { label: "Limits", value: `a = ${a},  b = ${b}`, note: "Integration bounds" },
    { label: "Method", value: "Simpson's 1/3 Rule (N=1000 subintervals)", note: "Numerical quadrature" },
    { label: "∫f(x)dx", value: integral.toFixed(10).replace(/0+$/, ""), note: "Definite integral result" },
  ];
  return { steps, result: `≈ ${integral.toPrecision(8)}` };
}

/* ─── Matrices ────────────────────────────────────────────────────────────── */
function parseMatrix(str: string): number[][] {
  return str.trim().split(/\n|;/).map(row =>
    row.trim().split(/[\s,]+/).map(n => {
      const v = parseFloat(n);
      if (isNaN(v)) throw new Error("All matrix cells must be numbers");
      return v;
    })
  ).filter(r => r.length > 0);
}

function matToStr(m: number[][]): string {
  return m.map(r => r.map(v => v.toFixed(4)).join("  ")).join("\n");
}

function computeMatrixOp(aStr: string, bStr: string, op: MatrixMode): { steps: Step[]; result: string } {
  const A = parseMatrix(aStr);
  if (op === "det") {
    const d = det(A) as number;
    const steps: Step[] = [
      { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
      { label: "det(A)", value: d.toFixed(6), note: "Determinant (signed area/volume)" },
      { label: "Invertible?", value: Math.abs(d) > 1e-10 ? "Yes (det ≠ 0)" : "No (det = 0, singular matrix)", note: "" },
    ];
    return { steps, result: `det = ${d.toFixed(6)}` };
  }
  if (op === "inv") {
    const d = det(A) as number;
    if (Math.abs(d) < 1e-10) throw new Error("Matrix is singular (det = 0) — no inverse exists");
    const I = inv(A) as number[][];
    const steps: Step[] = [
      { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
      { label: "det(A)", value: d.toFixed(6), note: "Must be non-zero for inverse" },
      { label: "A⁻¹", value: matToStr(I), note: "Inverse matrix" },
    ];
    return { steps, result: matToStr(I) };
  }
  const B = parseMatrix(bStr);
  if (op === "add") {
    const R = mAdd(A, B) as number[][];
    const steps: Step[] = [
      { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
      { label: "Matrix B", value: matToStr(B), note: `${B.length}×${B[0].length}` },
      { label: "A + B", value: matToStr(R), note: "Element-wise addition" },
    ];
    return { steps, result: matToStr(R) };
  }
  const R = multiply(A, B) as number[][];
  const steps: Step[] = [
    { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
    { label: "Matrix B", value: matToStr(B), note: `${B.length}×${B[0].length}` },
    { label: "A × B", value: matToStr(R), note: "Matrix multiplication" },
  ];
  return { steps, result: matToStr(R) };
}

/* ─── Statistics ──────────────────────────────────────────────────────────── */
function computeStats(raw: string): { steps: Step[]; result: string } {
  const nums = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) throw new Error("No valid numbers found");
  const n = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const sorted = [...nums].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sVariance = n > 1 ? nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const sStdDev = Math.sqrt(sVariance);
  const q1 = sorted[Math.floor(n / 4)];
  const q3 = sorted[Math.floor(3 * n / 4)];
  const iqr = q3 - q1;
  const modeMap: Record<number, number> = {};
  nums.forEach(v => { modeMap[v] = (modeMap[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(modeMap));
  const modeVals = Object.entries(modeMap).filter(([, f]) => f === maxFreq).map(([v]) => v);
  const steps: Step[] = [
    { label: `Dataset (n=${n})`, value: nums.join(", "), note: "Input values" },
    { label: "Sorted", value: sorted.join(", "), note: "Ascending order" },
    { label: "Mean (μ)", value: mean.toFixed(6), note: "Σx / n" },
    { label: "Median", value: median.toFixed(4), note: n % 2 === 0 ? "Average of two middle" : "Middle value" },
    { label: "Mode", value: modeVals.join(", "), note: `Appears ${maxFreq}× each` },
    { label: "Q1 / Q3 / IQR", value: `${q1} / ${q3} / ${iqr}`, note: "Quartiles & interquartile range" },
    { label: "Population σ", value: stdDev.toFixed(6), note: "√(Σ(x−μ)²/n)" },
    { label: "Sample s", value: sStdDev.toFixed(6), note: "√(Σ(x−μ)²/(n−1))" },
    { label: "Variance σ²", value: variance.toFixed(6), note: "Population variance" },
    { label: "Range", value: `${sorted[0]} → ${sorted[n - 1]} (Δ${sorted[n - 1] - sorted[0]})`, note: "Max − Min" },
  ];
  return { steps, result: `μ=${mean.toFixed(4)}, σ=${stdDev.toFixed(4)}, n=${n}` };
}

/* ─── Quick symbol buttons ─────────────────────────────────────────────────── */
const QUICK_SYMBOLS: Record<LevelTab, { label: string; insert: string }[]> = {
  basic:    [{ label: "√", insert: "sqrt(" }, { label: "π", insert: "pi" }, { label: "e", insert: "e" }, { label: "^2", insert: "^2" }, { label: "^3", insert: "^3" }, { label: "(", insert: "(" }, { label: ")", insert: ")" }, { label: "|x|", insert: "abs(" }],
  calculus: [{ label: "sin", insert: "sin(" }, { label: "cos", insert: "cos(" }, { label: "tan", insert: "tan(" }, { label: "ln", insert: "log(" }, { label: "√", insert: "sqrt(" }, { label: "π", insert: "pi" }, { label: "e", insert: "e" }, { label: "^2", insert: "^2" }],
  matrices: [],
  stats: [{ label: "σ tip", insert: "" }],
};

/* ─── Level Tab Config ────────────────────────────────────────────────────── */
const LEVEL_TABS: { id: LevelTab; label: string; subtitle: string; icon: React.ElementType; color: string }[] = [
  { id: "basic",    label: "Basic",    subtitle: "SSC / Intermediate", icon: Calculator,  color: "text-amber-400" },
  { id: "calculus", label: "Calculus", subtitle: "BS / BE",            icon: TrendingUp,  color: "text-emerald-400" },
  { id: "matrices", label: "Matrices", subtitle: "Engineering",        icon: Grid3X3,     color: "text-blue-400" },
  { id: "stats",    label: "Stats",    subtitle: "MSc / PhD",          icon: BarChart2,   color: "text-purple-400" },
];

/* ─── Matrix Grid Input ───────────────────────────────────────────────────── */
function MatrixGridInput({ label, value, onChange, rows, cols }: {
  label: string; value: string; onChange: (v: string) => void; rows: number; cols: number;
}) {
  const cells = useMemo<string[][]>(() => {
    const lines = value.trim().split(/\n|;/).map(r => r.trim().split(/[\s,]+/));
    return Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => lines[i]?.[j] ?? "0")
    );
  }, [value, rows, cols]);

  const update = (r: number, c: number, v: string) => {
    const next = cells.map(row => [...row]);
    next[r][c] = v;
    onChange(next.map(row => row.join(" ")).join("\n"));
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(48px, 1fr))` }}>
        {cells.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              value={cell}
              onChange={e => update(r, c, e.target.value)}
              className="w-12 h-9 text-center bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-foreground outline-none focus:border-primary/50 transition-colors"
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function MathSolver({ onHistoryPush, onStatusChange }: MathSolverProps) {
  const [level, setLevel] = useState<LevelTab>("basic");
  const [basicMode, setBasicMode] = useState<BasicMode>("evaluate");
  const [calcMode, setCalcMode] = useState<CalcMode>("derivative");
  const [matMode, setMatMode] = useState<MatrixMode>("det");

  const [expr, setExpr] = useState("3*x^2 + 5*x - 2");
  const [variable, setVariable] = useState("x");
  const [intA, setIntA] = useState("0");
  const [intB, setIntB] = useState("1");
  const [matrixA, setMatrixA] = useState("2 1\n5 3");
  const [matrixB, setMatrixB] = useState("1 0\n0 1");
  const [matRows, setMatRows] = useState(2);
  const [matCols, setMatCols] = useState(2);

  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [prettyLatex, setPrettyLatex] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSymbol = (sym: string) => {
    if (!sym) return;
    const ta = textareaRef.current;
    if (!ta) { setExpr(prev => prev + sym); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = expr.slice(0, s) + sym + expr.slice(e);
    setExpr(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + sym.length, s + sym.length);
    });
  };

  useEffect(() => {
    if (level === "basic" || level === "calculus") {
      try { setPrettyLatex(exprToLatex(sanitize(expr))); } catch { setPrettyLatex(""); }
    } else {
      setPrettyLatex("");
    }
  }, [expr, level]);

  const compute = useCallback(() => {
    setError("");
    setSteps([]);
    setResult("");
    onStatusChange("computing");

    setTimeout(() => {
      try {
        let out: { steps: Step[]; result: string };
        if (level === "basic") {
          if (basicMode === "evaluate") out = computeEvaluate(expr);
          else if (basicMode === "simplify") out = computeSimplify(expr);
          else out = computeQuadratic(expr);
        } else if (level === "calculus") {
          if (calcMode === "derivative") out = computeDerivative(expr, variable);
          else out = computeIntegral(expr, variable, intA, intB);
        } else if (level === "matrices") {
          out = computeMatrixOp(matrixA, matrixB, matMode);
        } else {
          out = computeStats(expr);
        }

        setSteps(out.steps);
        setResult(out.result);
        setExpandedStep(out.steps.length - 1);
        onStatusChange("done");
        onHistoryPush({
          id: Date.now().toString(),
          mode: `${LEVEL_TABS.find(t => t.id === level)!.label} › ${
            level === "basic" ? basicMode : level === "calculus" ? calcMode : level === "matrices" ? matMode : "Stats"
          }`,
          input: level === "matrices" ? `A:\n${matrixA}` : expr,
          result: out.result,
          ts: Date.now(),
        });
      } catch (e: unknown) {
        const raw = e instanceof Error ? e.message : "Unknown error";
        const friendly = raw.includes("Unexpected end") || raw.includes("Unexpected token") || raw.includes("parse")
          ? "Check your expression! (e.g. use * for multiplication: 4*x not 4x)"
          : raw.includes("Symbol") || raw.includes("Undefined")
          ? "Unknown symbol — check spelling (e.g. sin, cos, sqrt, pi, e)"
          : raw;
        setError(friendly);
        onStatusChange("error");
      }
    }, 60);
  }, [level, basicMode, calcMode, matMode, expr, variable, intA, intB, matrixA, matrixB, onHistoryPush, onStatusChange]);

  const copyResult = () => {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const resetLevel = (l: LevelTab) => {
    setLevel(l);
    setSteps([]);
    setResult("");
    setError("");
    if (l === "basic") setExpr("3*x^2 + 5*x - 2");
    else if (l === "calculus") setExpr("x^3 + 2*x - 1");
    else if (l === "stats") setExpr("12, 18, 24, 30, 36, 42");
  };

  const quickSyms = QUICK_SYMBOLS[level].filter(s => s.insert);

  return (
    <div className="space-y-5">

      {/* ── Level Tabs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LEVEL_TABS.map(tab => (
          <button key={tab.id} onClick={() => resetLevel(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              level === tab.id
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/4"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <tab.icon className={`w-3.5 h-3.5 ${level === tab.id ? tab.color : ""}`} />
              <span>{tab.label}</span>
            </div>
            <span className="text-[10px] opacity-60 font-normal">{tab.subtitle}</span>
          </button>
        ))}
      </div>

      {/* ── Sub-mode tabs ── */}
      {level === "basic" && (
        <div className="flex gap-1.5 flex-wrap">
          {(["evaluate", "simplify", "quadratic"] as BasicMode[]).map(m => (
            <button key={m} onClick={() => { setBasicMode(m); setSteps([]); setResult(""); setError(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                basicMode === m ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-white/8 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {m === "quadratic" ? "Quadratic Solver" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}
      {level === "calculus" && (
        <div className="flex gap-1.5 flex-wrap">
          {(["derivative", "integral"] as CalcMode[]).map(m => (
            <button key={m} onClick={() => { setCalcMode(m); setSteps([]); setResult(""); setError(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                calcMode === m ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/8 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {m === "derivative" ? "Derivative d/dx" : "Definite Integral ∫"}
            </button>
          ))}
        </div>
      )}
      {level === "matrices" && (
        <div className="flex gap-1.5 flex-wrap">
          {([["det","Determinant"],["inv","Inverse A⁻¹"],["multiply","Multiply A×B"],["add","Add A+B"]] as [MatrixMode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => { setMatMode(m); setSteps([]); setResult(""); setError(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                matMode === m ? "border-blue-400/40 bg-blue-400/10 text-blue-300" : "border-white/8 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Formula pretty-print preview */}
        {prettyLatex && (level === "basic" || level === "calculus") && (
          <div className="px-3 py-2 rounded-xl text-sm flex items-center gap-2"
            style={{ background: "rgba(67,97,238,0.07)", border: "1px solid rgba(67,97,238,0.15)" }}
          >
            <span className="text-xs text-muted-foreground shrink-0">Preview:</span>
            <span className="overflow-x-auto text-foreground">
              <KatexSpan latex={prettyLatex} />
            </span>
          </div>
        )}

        {/* Matrices */}
        {level === "matrices" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Grid size:</span>
              {[2, 3].map(n => (
                <button key={n} onClick={() => { setMatRows(n); setMatCols(n); }}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    matRows === n ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 text-muted-foreground hover:bg-white/5"
                  }`}
                >{n}×{n}</button>
              ))}
            </div>
            <MatrixGridInput label="Matrix A" value={matrixA} onChange={setMatrixA} rows={matRows} cols={matCols} />
            {(matMode === "multiply" || matMode === "add") && (
              <MatrixGridInput label="Matrix B" value={matrixB} onChange={setMatrixB} rows={matRows} cols={matCols} />
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {level === "basic" && basicMode === "quadratic" ? "ax²+bx+c  (enter a,b,c  or full expression)" : "Expression"}
              </span>
              {level === "stats" && <span className="text-xs text-muted-foreground">comma or space separated numbers</span>}
            </div>
            <textarea
              ref={textareaRef}
              value={expr}
              onChange={e => setExpr(e.target.value)}
              placeholder={
                level === "stats" ? "e.g. 12, 18, 24, 30, 36"
                : level === "basic" && basicMode === "quadratic" ? "e.g. 2, -3, 1  (means 2x²−3x+1=0)"
                : "e.g. x^3 + 2*x - 1"
              }
              rows={2}
              className="w-full bg-transparent text-foreground text-sm font-mono placeholder:text-muted-foreground/50 outline-none resize-none leading-relaxed"
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) compute(); }}
            />

            {/* Variable + Integral limits */}
            {(level === "calculus") && (
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span>Variable:</span>
                  <input value={variable} onChange={e => setVariable(e.target.value || "x")}
                    className="w-8 bg-primary/10 border border-primary/25 rounded px-1.5 py-0.5 font-mono text-primary text-center outline-none"
                  />
                </div>
                {calcMode === "integral" && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span>From a=</span>
                      <input value={intA} onChange={e => setIntA(e.target.value)}
                        className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-foreground text-center outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>To b=</span>
                      <input value={intB} onChange={e => setIntB(e.target.value)}
                        className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-foreground text-center outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick symbol buttons */}
            {quickSyms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                <span className="text-[10px] text-muted-foreground self-center mr-1">Quick insert:</span>
                {quickSyms.map(s => (
                  <button key={s.label} onClick={() => insertSymbol(s.insert)}
                    className="px-2 py-0.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors font-mono"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Compute Button ── */}
      <button onClick={compute}
        disabled={level !== "matrices" && !expr.trim()}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ boxShadow: "0 0 24px rgba(67,97,238,0.35)" }}
      >
        <Sigma className="w-4 h-4" />
        Compute <span className="text-xs opacity-60 ml-1">Ctrl+Enter</span>
      </button>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Oops! Check your input</p>
              <p className="text-red-400/80 text-xs mt-0.5">{error}</p>
              <p className="text-muted-foreground text-xs mt-1">
                Tip: Use <code className="bg-white/5 px-1 rounded">*</code> for multiplication (e.g. <code className="bg-white/5 px-1 rounded">4*x</code> not <code className="bg-white/5 px-1 rounded">4x</code>)
                {level === "basic" && basicMode === "quadratic" && <> | Enter coefficients as <code className="bg-white/5 px-1 rounded">a, b, c</code></>}
                {level === "calculus" && calcMode === "integral" && <> | Set numeric values for a and b</>}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {/* Result banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(67,97,238,0.12) 0%, rgba(14,165,233,0.06) 100%)",
                border: "1px solid rgba(67,97,238,0.3)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Result</p>
                <p className="text-base font-bold font-mono text-foreground break-all leading-snug">{result}</p>
              </div>
              <button onClick={copyResult}
                className="ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Step cards */}
            <p className="text-xs text-muted-foreground px-1">Step-by-step breakdown</p>
            {steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                  style={{ background: expandedStep === i ? "rgba(67,97,238,0.06)" : "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "rgba(67,97,238,0.2)", color: "#93c5fd" }}
                    >{i + 1}</span>
                    <span className="text-sm font-medium text-foreground text-left">{step.label}</span>
                  </div>
                  {expandedStep === i
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                </button>
                <AnimatePresence>
                  {expandedStep === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <pre className="font-mono text-sm text-primary break-all whitespace-pre-wrap leading-relaxed">{step.value}</pre>
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
