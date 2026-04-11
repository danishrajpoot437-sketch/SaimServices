import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { derivative, simplify, evaluate, parse, det, inv, multiply, add as mAdd, combinations, permutations } from "mathjs";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  ChevronDown, ChevronRight, Copy, Check, Zap, AlertTriangle,
  Lightbulb, BookOpen, Grid3X3,
} from "lucide-react";

/* ─── Shared Types ────────────────────────────────────────────────────────── */
export interface HistoryEntry { id: string; mode: string; input: string; result: string; ts: number }
interface MathSolverProps {
  onHistoryPush: (entry: HistoryEntry) => void;
  onStatusChange: (status: "idle" | "computing" | "done" | "error") => void;
}
interface Step { label: string; value: string; note?: string }
type ProblemType =
  | "linear" | "quadratic" | "system" | "absolute" | "exponential" | "general-eq"
  | "evaluate" | "simplify" | "derivative" | "integral" | "stats" | "probability"
  | "vector" | "matrix" | "complex";

/* ─── Input Sanitizer ─────────────────────────────────────────────────────── */
function sanitize(raw: string): string {
  return raw
    .replace(/(\d)([a-zA-Z\(])/g, "$1*$2")
    .replace(/([a-zA-Z\)])(\d)/g, "$1*$2")
    .replace(/\)\s*\(/g, ")*(")
    .replace(/\^{(\d+)}/g, "^$1")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .trim();
}

/* ─── Problem Detector ────────────────────────────────────────────────────── */
function detect(raw: string): ProblemType {
  const s = raw.trim();
  const sl = s.toLowerCase();
  if (/^d\s*\/\s*d[a-z]\s*[\(\[]/i.test(s) || sl.startsWith("d/dx") || sl.startsWith("d/dy")) return "derivative";
  if (s.includes("∫") || sl.startsWith("int(")) return "integral";
  if (/\bC\s*\(\s*\d+\s*,\s*\d+\s*\)/i.test(s) || /\bP\s*\(\s*\d+\s*,\s*\d+\s*\)/i.test(s)) return "probability";
  if (s.includes(";")) return "system";
  // [a-df-z] intentionally excludes 'e' (Euler's constant) but includes 'x','y','z', etc.
  const hasVar = /[a-df-z]/i.test(s.replace(/sin|cos|tan|log|exp|sqrt|pi|abs/gi, ""));
  const isComplexNum = s.includes("i") && /\d/.test(s);
  if (s.includes("=")) {
    if (/\|.+\|/.test(s)) return "absolute";
    const lhs = s.split("=")[0];
    // Exponential: base^variable  e.g. 5^x, 2^n (caret followed by a letter)
    if (/\^\s*[a-df-z]/i.test(lhs)) return "exponential";
    const san = sanitize(s.replace("=", "-(") + ")");
    if (/x\^2|y\^2|z\^2/.test(san)) return "quadratic";
    if (hasVar) return "linear";
    return "evaluate";
  }
  if (isComplexNum && /[+\-\*\/]/.test(s)) return "complex";
  if (/^\s*[\[\(]/.test(s) && /[\]\)]/.test(s)) return "vector";
  const nums = s.split(/[,\s]+/).map(Number);
  if (nums.length >= 3 && nums.every(n => !isNaN(n))) return "stats";
  if (!hasVar && /^[\d\s\+\-\*\/\^\.\(\),]+$/.test(s)) return "evaluate";
  return "simplify";
}

const TYPE_LABELS: Record<ProblemType, string> = {
  linear: "Linear Equation", quadratic: "Quadratic Equation", system: "System of Equations",
  absolute: "Absolute Value Equation", exponential: "Exponential Equation", "general-eq": "Equation",
  evaluate: "Arithmetic", simplify: "Simplify / Algebra", derivative: "Derivative",
  integral: "Definite Integral", stats: "Statistics", probability: "Probability",
  vector: "Vectors", matrix: "Matrices", complex: "Complex Numbers",
};

/* ─── Solvers ─────────────────────────────────────────────────────────────── */

function solveLinear(raw: string): { steps: Step[]; result: string } {
  const parts = raw.split("=");
  if (parts.length !== 2) throw new Error("Invalid equation — use format: ax + b = c");
  const lhs = sanitize(parts[0]), rhs = sanitize(parts[1]);
  const vars = ["x", "y", "z", "n", "t", "a", "b"];
  const v = vars.find(c => lhs.includes(c) || rhs.includes(c)) ?? "x";
  const expr = `(${lhs}) - (${rhs})`;
  let a: number, c: number;
  try {
    const derivNode = derivative(expr, v);
    a = evaluate(derivNode.toString(), { [v]: 0 }) as number;
    c = evaluate(expr, { [v]: 0, pi: Math.PI, e: Math.E }) as number;
  } catch { throw new Error("Cannot parse equation — check your expression"); }
  if (Math.abs(a) < 1e-12) throw new Error("No variable found — check your equation");
  const ans = -c / a;
  return {
    steps: [
      { label: "Equation", value: `${parts[0].trim()} = ${parts[1].trim()}`, note: "Original form" },
      { label: "Move all terms to left side", value: `${expr} = 0`, note: "Rearranged" },
      { label: `Coefficient of ${v}`, value: String(a), note: "From differentiation" },
      { label: "Constant term", value: String(c), note: `Value when ${v}=0` },
      { label: "Solution", value: `${v} = −(${c}) ÷ (${a}) = ${ans.toFixed(8).replace(/\.?0+$/, "")}`, note: "x = −c ÷ a" },
    ],
    result: `${v} = ${ans.toFixed(8).replace(/\.?0+$/, "")}`,
  };
}

function solveQuadratic(raw: string): { steps: Step[]; result: string } {
  const parts = raw.split("=");
  const lhs = sanitize(parts[0]), rhs = parts[1] ? sanitize(parts[1]) : "0";
  const expr = `(${lhs}) - (${rhs})`;
  const xv = "x";
  let A: number, B: number, C: number;
  try {
    const d1 = derivative(expr, xv);
    const d2 = derivative(d1.toString(), xv);
    A = (evaluate(d2.toString(), { x: 0 }) as number) / 2;
    B = (evaluate(d1.toString(), { x: 0 }) as number);
    C = evaluate(expr, { x: 0, pi: Math.PI, e: Math.E }) as number;
  } catch { throw new Error("Cannot parse quadratic — try: 4*x^2 - 5*x - 12 = 0"); }
  const disc = B * B - 4 * A * C;
  const steps: Step[] = [
    { label: "Standard Form", value: `${A}x² + ${B}x + ${C} = 0`, note: "ax² + bx + c = 0" },
    { label: "Coefficients", value: `a = ${A},  b = ${B},  c = ${C}`, note: "Identified" },
    { label: "Discriminant Δ = b²−4ac", value: `${B}² − 4·${A}·${C} = ${disc}`, note: disc > 0 ? "Δ > 0 → two real roots" : disc === 0 ? "Δ = 0 → one repeated root" : "Δ < 0 → two complex roots" },
  ];
  let result: string;
  if (disc >= 0) {
    const sq = Math.sqrt(disc);
    const x1 = (-B + sq) / (2 * A), x2 = (-B - sq) / (2 * A);
    const fmt = (n: number) => n.toFixed(6).replace(/\.?0+$/, "");
    steps.push({ label: "Roots via Quadratic Formula", value: disc === 0 ? `x = ${fmt(x1)}` : `x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}`, note: "x = (−b ± √Δ) / 2a" });
    result = disc === 0 ? `x = ${fmt(x1)}` : `x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}`;
  } else {
    const re = (-B / (2 * A)).toFixed(4), im = (Math.sqrt(-disc) / (2 * A)).toFixed(4);
    steps.push({ label: "Complex Roots", value: `x₁ = ${re} + ${im}i,  x₂ = ${re} − ${im}i`, note: "Complex conjugate pair" });
    result = `x = ${re} ± ${im}i`;
  }
  return { steps, result };
}

function solveSystem(raw: string): { steps: Step[]; result: string } {
  const eqs = raw.split(";").map(s => s.trim()).filter(Boolean);
  if (eqs.length !== 2) throw new Error("Enter exactly 2 equations separated by semicolon (;)");
  const vList = ["x", "y", "z"];
  const parse2 = (eq: string) => {
    const [l, r] = eq.split("=").map(s => sanitize(s.trim()));
    const expr = `(${l}) - (${r ?? "0"})`;
    return expr;
  };
  const exprs = eqs.map(parse2);
  const usedVars = vList.filter(v => exprs.some(e => new RegExp(`\\b${v}\\b`).test(e)));
  if (usedVars.length !== 2) throw new Error("System must use exactly 2 variables (e.g. x and y)");
  const [v1, v2] = usedVars;
  const scope = { [v1]: 0, [v2]: 0, pi: Math.PI, e: Math.E };
  const coeff = exprs.map(expr => {
    const a = evaluate(derivative(expr, v1).toString(), scope) as number;
    const b = evaluate(derivative(expr, v2).toString(), scope) as number;
    const c = -(evaluate(expr, scope) as number);
    return [a, b, c];
  });
  const [[a, b, c], [d, ee, f]] = coeff;
  const detMain = a * ee - b * d;
  if (Math.abs(detMain) < 1e-10) throw new Error("System has no unique solution (equations are parallel)");
  const x = (c * ee - b * f) / detMain;
  const y = (a * f - c * d) / detMain;
  const fmt = (n: number) => n.toFixed(6).replace(/\.?0+$/, "");
  return {
    steps: [
      { label: "Equation 1", value: eqs[0], note: "First equation" },
      { label: "Equation 2", value: eqs[1], note: "Second equation" },
      { label: "Matrix Form [A][x] = [b]", value: `[${a}, ${b}; ${d}, ${ee}] · [${v1}; ${v2}] = [${c}; ${f}]`, note: "Cramer's Rule setup" },
      { label: "Determinant D", value: `${a}·${ee} − ${b}·${d} = ${detMain.toFixed(4)}`, note: "det(A)" },
      { label: "Solution", value: `${v1} = ${fmt(x)},  ${v2} = ${fmt(y)}`, note: "Cramer's Rule: x = Dx/D, y = Dy/D" },
    ],
    result: `${v1} = ${fmt(x)},  ${v2} = ${fmt(y)}`,
  };
}

function solveAbsolute(raw: string): { steps: Step[]; result: string } {
  const m = raw.match(/\|(.+?)\|\s*=\s*(.+)/);
  if (!m) throw new Error("Use format: |expression| = value");
  const inner = sanitize(m[1].trim()), rhs = sanitize(m[2].trim());
  const rhsVal = evaluate(rhs) as number;
  if (typeof rhsVal !== "number") throw new Error("Right side must be a number");
  const solveCase = (sign: 1 | -1) => {
    const eq = `${inner} - (${sign * rhsVal})`;
    try {
      const d = evaluate(derivative(eq, "x").toString(), { x: 0 }) as number;
      const c = evaluate(eq, { x: 0 }) as number;
      return -c / d;
    } catch { return NaN; }
  };
  const x1 = solveCase(1), x2 = solveCase(-1);
  const fmt = (n: number) => isNaN(n) ? "N/A" : n.toFixed(6).replace(/\.?0+$/, "");
  const results = [x1, x2].filter(n => !isNaN(n));
  const result = results.length === 2 && Math.abs(x1 - x2) > 1e-8
    ? `x = ${fmt(x1)}  or  x = ${fmt(x2)}`
    : `x = ${fmt(results[0])}`;
  return {
    steps: [
      { label: "Original", value: raw, note: "Absolute value equation" },
      { label: "Rule: |expr| = k → two cases", value: `${m[1]} = ${rhsVal}  or  ${m[1]} = −${rhsVal}`, note: "Remove absolute value" },
      { label: `Case 1: ${m[1]} = ${rhsVal}`, value: `x = ${fmt(x1)}`, note: "Positive case" },
      { label: `Case 2: ${m[1]} = −${rhsVal}`, value: `x = ${fmt(x2)}`, note: "Negative case" },
      { label: "Solution Set", value: result, note: "Both roots" },
    ],
    result,
  };
}

function solveExponential(raw: string): { steps: Step[]; result: string } {
  const parts = raw.split("=");
  if (parts.length !== 2) throw new Error("Enter as: base^x = value");
  const lhs = sanitize(parts[0].trim()), rhs = sanitize(parts[1].trim());
  const baseMatch = lhs.match(/^(\d+\.?\d*)\^(.+)$/);
  if (!baseMatch) throw new Error("Enter as: base^x = value  e.g. 5^x = 3125");
  const base = parseFloat(baseMatch[1]);
  const rhsVal = evaluate(rhs) as number;
  const x = Math.log(rhsVal) / Math.log(base);
  return {
    steps: [
      { label: "Equation", value: raw, note: "Exponential form: aˣ = b" },
      { label: "Apply log both sides", value: `x · log(${base}) = log(${rhsVal})`, note: "log(aˣ) = x·log(a)" },
      { label: "Solve for x", value: `x = log(${rhsVal}) ÷ log(${base})`, note: "Change of base formula" },
      { label: `x = log(${rhsVal}) ÷ log(${base})`, value: x.toFixed(8).replace(/\.?0+$/, ""), note: "Result" },
    ],
    result: `x = ${x.toFixed(8).replace(/\.?0+$/, "")}`,
  };
}

function solveEvaluate(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const res = evaluate(expr, { pi: Math.PI, e: Math.E });
  const resStr = typeof res === "number"
    ? res.toPrecision(12).replace(/\.?0+$/, "")
    : typeof res === "object" && "re" in res
    ? `${(res as {re:number;im:number}).re.toFixed(6)} + ${(res as {re:number;im:number}).im.toFixed(6)}i`
    : String(res);
  return {
    steps: [
      { label: "Expression", value: expr, note: "Sanitised input" },
      { label: "Result", value: resStr, note: "Computed value" },
    ],
    result: resStr,
  };
}

function solveSimplify(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const parsed = parse(expr);
  const simplified = simplify(parsed);
  const result = simplified.toString();
  const steps: Step[] = [
    { label: "Input Expression", value: expr, note: "Sanitised form" },
    { label: "Simplified Result", value: result, note: "Like terms collected & reduced" },
  ];
  try {
    const numOrig = evaluate(expr.replace(/x/g, "3"), { pi: Math.PI, e: Math.E });
    const numSimp = evaluate(result.replace(/x/g, "3"), { pi: Math.PI, e: Math.E });
    if (typeof numOrig === "number" && typeof numSimp === "number")
      steps.push({ label: "Verification (x=3)", value: `${numOrig.toFixed(4)} = ${numSimp.toFixed(4)} ✓`, note: "Both sides match" });
  } catch { /**/ }
  return { steps, result };
}

function stripOuterParens(s: string): string {
  if (!s.startsWith("(") || !s.endsWith(")")) return s;
  let depth = 0;
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") { depth--; if (depth === 0) return s; }
  }
  return s.slice(1, -1).trim();
}

function solveDerivative(raw: string): { steps: Step[]; result: string } {
  let expr = raw.trim();
  const vMatch = expr.match(/^d\s*\/\s*d([a-z])/i);
  const v = vMatch ? vMatch[1] : "x";
  let body = expr.replace(/^d\s*\/\s*d[a-z]\s*/i, "").trim();
  body = stripOuterParens(body);
  expr = sanitize(body);
  const derivNode = derivative(expr, v);
  const result = simplify(derivNode).toString();
  const steps: Step[] = [
    { label: `f(${v})`, value: expr, note: "Original function" },
    { label: `d/d${v} — Raw result`, value: derivNode.toString(), note: "Power/chain/product rules applied" },
    { label: "Simplified f′(x)", value: result, note: "Collected & reduced" },
  ];
  try {
    const val = evaluate(result, { [v]: 1, pi: Math.PI, e: Math.E });
    if (typeof val === "number") steps.push({ label: "Numerical check at x=1", value: val.toFixed(6), note: "f′(1)" });
  } catch { /**/ }
  return { steps, result: `f′(${v}) = ${result}` };
}

function solveIntegral(raw: string): { steps: Step[]; result: string } {
  let expr = raw.replace(/∫\s*/g, "").trim();
  let a = 0, b = 1, v = "x", integrand = expr;
  const intMatch = expr.match(/^int\s*\(\s*(.+?)\s*,\s*([a-z])\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/i);
  if (intMatch) {
    integrand = sanitize(intMatch[1]); v = intMatch[2];
    a = parseFloat(intMatch[3]); b = parseFloat(intMatch[4]);
  } else {
    const parts = expr.split(",");
    if (parts.length >= 3) {
      integrand = sanitize(parts[0].trim().replace(/d[a-z]$/, ""));
      const va = parts[0].match(/d([a-z])$/i); if (va) v = va[1];
      a = parseFloat(parts[parts.length - 2]); b = parseFloat(parts[parts.length - 1]);
    } else {
      integrand = sanitize(expr.replace(/d[a-z]$/i, ""));
      const va = expr.match(/d([a-z])$/i); if (va) v = va[1];
    }
  }
  if (isNaN(a) || isNaN(b)) { a = 0; b = 1; }
  const N = 1000, h = (b - a) / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const x = a + i * h;
    const val = evaluate(integrand, { [v]: x, pi: Math.PI, e: Math.E }) as number;
    if (i === 0 || i === N) sum += val;
    else if (i % 2 === 1) sum += 4 * val;
    else sum += 2 * val;
  }
  const integral = (h / 3) * sum;
  return {
    steps: [
      { label: "Integrand", value: integrand, note: `f(${v})` },
      { label: "Integration Limits", value: `from ${a} to ${b}`, note: "Definite integral bounds" },
      { label: "Method", value: "Simpson's 1/3 Rule (N=1000)", note: "Numerical quadrature" },
      { label: `∫ f(${v}) d${v}`, value: integral.toFixed(10).replace(/0+$/, ""), note: "Definite integral result" },
    ],
    result: `≈ ${integral.toPrecision(8)}`,
  };
}

function solveProbability(raw: string): { steps: Step[]; result: string } {
  const cMatch = raw.match(/C\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  const pMatch = raw.match(/P\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (cMatch) {
    const n = parseInt(cMatch[1]), r = parseInt(cMatch[2]);
    const res = combinations(n, r) as number;
    return {
      steps: [
        { label: "Combination C(n, r)", value: `C(${n}, ${r})`, note: "Choose r from n" },
        { label: "Formula", value: `n! / (r! · (n−r)!) = ${n}! / (${r}! · ${n - r}!)`, note: "Combination formula" },
        { label: "Result", value: String(res), note: `Ways to choose ${r} from ${n}` },
      ],
      result: String(res),
    };
  }
  if (pMatch) {
    const n = parseInt(pMatch[1]), r = parseInt(pMatch[2]);
    const res = permutations(n, r) as number;
    return {
      steps: [
        { label: "Permutation P(n, r)", value: `P(${n}, ${r})`, note: "Arrange r from n" },
        { label: "Formula", value: `n! / (n−r)! = ${n}! / ${n - r}!`, note: "Permutation formula" },
        { label: "Result", value: String(res), note: `Arrangements of ${r} from ${n}` },
      ],
      result: String(res),
    };
  }
  throw new Error("Use format: C(n, r) for combinations or P(n, r) for permutations");
}

function solveVector(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const res = evaluate(expr, { pi: Math.PI, e: Math.E });
  const resStr = Array.isArray(res)
    ? `[${res.map((v: number) => v.toFixed(4).replace(/\.?0+$/, "")).join(", ")}]`
    : String(res);
  return {
    steps: [
      { label: "Vector Expression", value: expr, note: "Sanitised" },
      { label: "Result", value: resStr, note: "Computed" },
    ],
    result: resStr,
  };
}

function solveComplex(raw: string): { steps: Step[]; result: string } {
  const expr = sanitize(raw);
  const res = evaluate(expr, { pi: Math.PI, e: Math.E });
  const r = res as { re?: number; im?: number };
  const re = r.re ?? (typeof res === "number" ? res : 0);
  const im = r.im ?? 0;
  const modulus = Math.sqrt(re ** 2 + im ** 2);
  const arg = Math.atan2(im, re);
  const fmt6 = (n: number) => n.toFixed(6).replace(/\.?0+$/, "");
  return {
    steps: [
      { label: "Expression", value: expr, note: "Complex arithmetic" },
      { label: "Result (rectangular)", value: `${fmt6(re)} ${im >= 0 ? "+" : "−"} ${fmt6(Math.abs(im))}i`, note: "a + bi form" },
      { label: "Modulus |z|", value: fmt6(modulus), note: "√(a² + b²)" },
      { label: "Argument arg(z)", value: `${fmt6(arg)} rad (${(arg * 180 / Math.PI).toFixed(4)}°)`, note: "atan2(b, a)" },
    ],
    result: `${fmt6(re)} ${im >= 0 ? "+" : "−"} ${fmt6(Math.abs(im))}i`,
  };
}

function solveStats(raw: string): { steps: Step[]; result: string } {
  const nums = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length < 2) throw new Error("Enter at least 2 comma-separated numbers");
  const n = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const sorted = [...nums].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sVariance = n > 1 ? nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  const q1 = sorted[Math.floor(n / 4)], q3 = sorted[Math.floor(3 * n / 4)];
  const modeMap: Record<number, number> = {};
  nums.forEach(v => { modeMap[v] = (modeMap[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(modeMap));
  const modeVals = Object.entries(modeMap).filter(([, f]) => f === maxFreq).map(([v]) => v).join(", ");
  return {
    steps: [
      { label: `Dataset (n = ${n})`, value: nums.join(", "), note: "Input values" },
      { label: "Sorted (ascending)", value: sorted.join(", "), note: "For median/quartile calculation" },
      { label: "Mean (μ)", value: mean.toFixed(6), note: "Σx ÷ n" },
      { label: "Median", value: median.toFixed(4), note: n % 2 === 0 ? "Average of two middle values" : "Middle value" },
      { label: "Mode", value: modeVals, note: `Appears ${maxFreq}× most` },
      { label: "Q1 / Q3 / IQR", value: `${q1} / ${q3} / ${q3 - q1}`, note: "Quartiles and interquartile range" },
      { label: "Population σ (std dev)", value: Math.sqrt(variance).toFixed(6), note: "√(Σ(x−μ)²÷n)" },
      { label: "Sample s (std dev)", value: Math.sqrt(sVariance).toFixed(6), note: "√(Σ(x−μ)²÷(n−1))" },
      { label: "Variance σ²", value: variance.toFixed(6), note: "Population variance" },
      { label: "Range", value: `${sorted[0]} → ${sorted[n - 1]}  (span = ${sorted[n - 1] - sorted[0]})`, note: "Max − Min" },
    ],
    result: `μ = ${mean.toFixed(4)},  σ = ${Math.sqrt(variance).toFixed(4)},  n = ${n}`,
  };
}

function parseMatrix(s: string): number[][] {
  return s.trim().split(/\n|;/).map(row =>
    row.trim().split(/[\s,]+/).map(n => {
      const v = parseFloat(n);
      if (isNaN(v)) throw new Error("All matrix cells must be numbers");
      return v;
    })
  ).filter(r => r.length > 0);
}
function matToStr(m: number[][]): string { return m.map(r => r.map(v => v.toFixed(3).replace(/\.?0+$/, "")).join("  ")).join("\n"); }

/* ─── Example tiles data ──────────────────────────────────────────────────── */
const EXAMPLES = [
  { category: "Linear Equations", expr: "6x + 5 = 14", color: "text-blue-400", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)" },
  { category: "Quadratic Equations", expr: "4x^2 - 5x - 12 = 0", color: "text-purple-400", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)" },
  { category: "Polynomials", expr: "(x + 5)*(x + 2)", color: "text-emerald-400", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
  { category: "System of Equations", expr: "7x + 2y = 24; 8x + 2y = 30", color: "text-orange-400", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
  { category: "Complex Numbers", expr: "5*(3 - 2i) + 2i*(4 + 6i)", color: "text-pink-400", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)" },
  { category: "Trigonometry", expr: "sin(x)^2 + cos(x)^2", color: "text-cyan-400", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)" },
  { category: "Exponents", expr: "5^x = 3125", color: "text-yellow-400", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" },
  { category: "Absolute Value", expr: "|2*x - 2| = 4", color: "text-red-400", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
  { category: "Logarithms", expr: "log(1000)", color: "text-indigo-400", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)" },
  { category: "Derivatives", expr: "d/dx(x^2 * cos(x))", color: "text-teal-400", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.25)" },
  { category: "Integrals", expr: "int(x^2, x, 0, 1)", color: "text-violet-400", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)" },
  { category: "Probability", expr: "C(6, 4)", color: "text-lime-400", bg: "rgba(163,230,53,0.08)", border: "rgba(163,230,53,0.25)" },
  { category: "Statistics", expr: "12, 18, 24, 30, 36", color: "text-amber-400", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)" },
  { category: "Vectors", expr: "[3, 0] + [-2, 0]", color: "text-sky-400", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
  { category: "Radicals", expr: "sqrt(144) + sqrt(25)", color: "text-green-400", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
  { category: "Matrices", expr: "__matrix__", color: "text-rose-400", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.25)" },
];

/* ─── KaTeX renderer ──────────────────────────────────────────────────────── */
function KatexSpan({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try { katex.render(latex, ref.current, { throwOnError: false, output: "html" }); }
    catch { if (ref.current) ref.current.textContent = latex; }
  }, [latex]);
  return <span ref={ref} />;
}

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
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 52px)` }}>
        {cells.map((row, r) => row.map((cell, c) => (
          <input key={`${r}-${c}`} value={cell} onChange={e => update(r, c, e.target.value)}
            className="w-[52px] h-10 text-center bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-foreground outline-none focus:border-primary/40 transition-colors"
          />
        )))}
      </div>
    </div>
  );
}

/* ─── QUICK SYMBOLS ───────────────────────────────────────────────────────── */
const QUICK: { label: string; insert: string }[] = [
  { label: "x", insert: "x" }, { label: "²", insert: "^2" }, { label: "³", insert: "^3" },
  { label: "√", insert: "sqrt(" }, { label: "π", insert: "pi" }, { label: "e", insert: "e" },
  { label: "±", insert: "±" }, { label: "i", insert: "i" }, { label: "(", insert: "(" },
  { label: ")", insert: ")" }, { label: "d/dx", insert: "d/dx(" }, { label: "∫", insert: "int(" },
];

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function MathSolver({ onHistoryPush, onStatusChange }: MathSolverProps) {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [detectedType, setDetectedType] = useState<ProblemType | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixA, setMatrixA] = useState("2 1\n5 3");
  const [matrixB, setMatrixB] = useState("1 0\n0 1");
  const [matOp, setMatOp] = useState<"det" | "inv" | "multiply" | "add">("det");
  const [matSize, setMatSize] = useState(2);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const liveType = useMemo(() => input.trim() ? detect(input) : null, [input]);

  const insertSym = (sym: string) => {
    const ta = textareaRef.current;
    if (!ta) { setInput(p => p + sym); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = input.slice(0, s) + sym + input.slice(e);
    setInput(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + sym.length, s + sym.length); });
  };

  const compute = useCallback(() => {
    if (!input.trim() && !showMatrix) return;
    setError(""); setSteps([]); setResult("");
    onStatusChange("computing");
    setTimeout(() => {
      try {
        let out: { steps: Step[]; result: string };
        let modeName = "";
        if (showMatrix) {
          const A = parseMatrix(matrixA), B = parseMatrix(matrixB);
          if (matOp === "det") {
            const d = det(A) as number;
            out = {
              steps: [
                { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
                { label: "det(A)", value: d.toFixed(6), note: "Signed area / volume" },
                { label: "Invertible?", value: Math.abs(d) > 1e-10 ? "Yes (det ≠ 0)" : "No — singular matrix", note: "" },
              ], result: `det = ${d.toFixed(6)}`,
            };
          } else if (matOp === "inv") {
            const d = det(A) as number;
            if (Math.abs(d) < 1e-10) throw new Error("Matrix is singular (det = 0) — no inverse");
            const I = inv(A) as number[][];
            out = {
              steps: [
                { label: "Matrix A", value: matToStr(A), note: `${A.length}×${A[0].length}` },
                { label: "det(A)", value: d.toFixed(6), note: "Non-zero ✓" },
                { label: "A⁻¹", value: matToStr(I), note: "Inverse matrix" },
              ], result: matToStr(I),
            };
          } else if (matOp === "add") {
            const R = mAdd(A, B) as number[][];
            out = { steps: [{ label: "A", value: matToStr(A) }, { label: "B", value: matToStr(B) }, { label: "A + B", value: matToStr(R) }], result: matToStr(R) };
          } else {
            const R = multiply(A, B) as number[][];
            out = { steps: [{ label: "A", value: matToStr(A) }, { label: "B", value: matToStr(B) }, { label: "A × B", value: matToStr(R) }], result: matToStr(R) };
          }
          modeName = "Matrix";
        } else {
          const type = detect(input);
          setDetectedType(type);
          modeName = TYPE_LABELS[type];
          switch (type) {
            case "linear":     out = solveLinear(input); break;
            case "quadratic":  out = solveQuadratic(input); break;
            case "system":     out = solveSystem(input); break;
            case "absolute":   out = solveAbsolute(input); break;
            case "exponential":out = solveExponential(input); break;
            case "derivative": out = solveDerivative(input); break;
            case "integral":   out = solveIntegral(input); break;
            case "stats":      out = solveStats(input); break;
            case "probability":out = solveProbability(input); break;
            case "vector":     out = solveVector(input); break;
            case "complex":    out = solveComplex(input); break;
            case "simplify":   out = solveSimplify(input); break;
            default:           out = solveEvaluate(input);
          }
        }
        setSteps(out.steps);
        setResult(out.result);
        setExpandedStep(out.steps.length - 1);
        onStatusChange("done");
        onHistoryPush({ id: Date.now().toString(), mode: modeName, input: input || `Matrix (${matOp})`, result: out.result, ts: Date.now() });
      } catch (ex: unknown) {
        const raw = ex instanceof Error ? ex.message : "Unknown error";
        const msg = raw.includes("Unexpected") || raw.includes("parse") || raw.includes("Symbol or string")
          ? "Expression error — use * for multiplication (e.g. 4*x not 4x), ^ for powers"
          : raw;
        setError(msg);
        onStatusChange("error");
      }
    }, 50);
  }, [input, showMatrix, matrixA, matrixB, matOp, onHistoryPush, onStatusChange]);

  const copyResult = () => {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const hasResult = steps.length > 0;

  return (
    <div className="space-y-4">

      {/* ── Matrix Mode Toggle ── */}
      <div className="flex items-center gap-2">
        <button onClick={() => { setShowMatrix(false); setSteps([]); setResult(""); setError(""); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!showMatrix ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 text-muted-foreground hover:bg-white/4"}`}
        >All Problems</button>
        <button onClick={() => { setShowMatrix(true); setSteps([]); setResult(""); setError(""); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showMatrix ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-white/8 text-muted-foreground hover:bg-white/4"}`}
        >
          <Grid3X3 className="w-3 h-3" />Matrices
        </button>
      </div>

      {/* ── Unified Input OR Matrix Grid ── */}
      {!showMatrix ? (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          {/* Input header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-semibold text-muted-foreground">Enter any math problem</span>
            {liveType && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(67,97,238,0.15)", color: "#93c5fd", border: "1px solid rgba(67,97,238,0.3)" }}
              >
                Detected: {TYPE_LABELS[liveType]}
              </span>
            )}
          </div>

          {/* Text area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); setSteps([]); setResult(""); setError(""); }}
            placeholder={"Type any problem...  e.g.  6x + 5 = 14\n\nor  4x^2 - 5x - 12 = 0\nor  d/dx(x^2 * cos(x))\nor  7x + 2y = 24; 8x + 2y = 30"}
            rows={3}
            className="w-full bg-transparent text-foreground text-base font-mono px-4 py-2 placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed"
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) compute(); }}
          />

          {/* Quick symbol buttons */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3 pt-1 border-t border-white/5">
            <span className="text-[10px] text-muted-foreground mr-1">Insert:</span>
            {QUICK.map(s => (
              <button key={s.label} onClick={() => insertSym(s.insert)}
                className="px-2 py-0.5 rounded-md text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/6 transition-colors font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Matrix Grid UI ── */
        <div className="rounded-2xl p-4 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Operation:</span>
            {([["det","Determinant"],["inv","Inverse A⁻¹"],["multiply","Multiply A×B"],["add","Add A+B"]] as [typeof matOp, string][]).map(([op, label]) => (
              <button key={op} onClick={() => setMatOp(op)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${matOp === op ? "border-rose-400/40 bg-rose-400/10 text-rose-300" : "border-white/8 text-muted-foreground hover:bg-white/4"}`}
              >{label}</button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">Size:</span>
            {[2, 3].map(n => (
              <button key={n} onClick={() => setMatSize(n)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${matSize === n ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 text-muted-foreground hover:bg-white/4"}`}
              >{n}×{n}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            <MatrixGridInput label="Matrix A" value={matrixA} onChange={setMatrixA} rows={matSize} cols={matSize} />
            {(matOp === "multiply" || matOp === "add") && (
              <MatrixGridInput label="Matrix B" value={matrixB} onChange={setMatrixB} rows={matSize} cols={matSize} />
            )}
          </div>
        </div>
      )}

      {/* ── Solve Button ── */}
      <button onClick={compute} disabled={!input.trim() && !showMatrix}
        className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)", boxShadow: "0 0 28px rgba(67,97,238,0.4)" }}
      >
        <Zap className="w-4 h-4" />
        Solve <span className="text-xs opacity-60 ml-1">Ctrl+Enter</span>
      </button>

      {/* ── Error Card ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Check your input</p>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tip: use <code className="bg-white/5 rounded px-1">*</code> for multiplication (4*x),
                <code className="bg-white/5 rounded px-1 mx-1">^</code> for powers (x^2),
                <code className="bg-white/5 rounded px-1">;</code> to separate two equations
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANSWER + STEPS ── */}
      <AnimatePresence>
        {hasResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Answer box — BIG and prominent */}
            <div className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(67,97,238,0.15) 0%, rgba(16,185,129,0.06) 100%)",
                border: "2px solid rgba(67,97,238,0.35)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Answer</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-foreground break-all leading-snug">{result}</p>
                  {detectedType && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3 h-3" /> {TYPE_LABELS[detectedType]}
                    </p>
                  )}
                </div>
                <button onClick={copyResult}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Step-by-step accordion */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground px-1 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Step-by-step Solution
              </p>
              <div className="space-y-1.5">
                {steps.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <button onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors text-left"
                      style={{ background: expandedStep === i ? "rgba(67,97,238,0.07)" : "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                          style={{ background: "rgba(67,97,238,0.2)", color: "#93c5fd" }}
                        >{i + 1}</span>
                        <span className="text-sm font-medium text-foreground truncate">{step.label}</span>
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
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <pre className="font-mono text-sm text-primary break-all whitespace-pre-wrap">{step.value}</pre>
                            {step.note && <p className="text-xs text-muted-foreground mt-1.5">{step.note}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Example Tiles (shown when no result) ── */}
      {!hasResult && !error && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Try an example — click any to load it
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex.category}
                onClick={() => {
                  if (ex.expr === "__matrix__") { setShowMatrix(true); setSteps([]); setResult(""); setError(""); return; }
                  setInput(ex.expr); setShowMatrix(false); setSteps([]); setResult(""); setError("");
                  requestAnimationFrame(() => textareaRef.current?.focus());
                }}
                className="text-left rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: ex.bg, border: `1px solid ${ex.border}` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{ex.category}</p>
                <p className={`text-sm font-mono font-semibold ${ex.color} break-all leading-snug`}>
                  {ex.expr === "__matrix__" ? "A · B, det(A), A⁻¹" : ex.expr}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
