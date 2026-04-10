import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Clock, X } from "lucide-react";
import { evaluate } from "mathjs";

type Mode = "Basic" | "Scientific";
type AngleUnit = "DEG" | "RAD";

interface HistoryItem {
  expr: string;
  result: string;
}

const scientificRows = [
  ["sin", "cos", "tan", "log"],
  ["asin", "acos", "atan", "ln"],
  ["√", "x²", "xʸ", "1/x"],
  ["π", "e", "(", ")"],
];

const basicRows = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

export default function Calculator() {
  const [mode, setMode] = useState<Mode>("Basic");
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("DEG");
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isDeg = angleUnit === "DEG";

  const buildScope = useCallback(() => ({
    sin:  (x: number) => Math.sin(isDeg ? (x * Math.PI) / 180 : x),
    cos:  (x: number) => Math.cos(isDeg ? (x * Math.PI) / 180 : x),
    tan:  (x: number) => Math.tan(isDeg ? (x * Math.PI) / 180 : x),
    asin: (x: number) => isDeg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x),
    acos: (x: number) => isDeg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x),
    atan: (x: number) => isDeg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x),
    ln:   (x: number) => Math.log(x),
    log:  (x: number) => Math.log10(x),
    pi: Math.PI,
    e: Math.E,
  }), [isDeg]);

  const formatResult = (num: number): string => {
    if (!Number.isFinite(num)) return "Infinity";
    const s = parseFloat(num.toPrecision(12)).toString();
    return s;
  };

  const handleInput = useCallback((val: string) => {
    setError(false);

    if (val === "C") {
      setExpression("");
      setDisplay("0");
      setJustEvaluated(false);
      return;
    }

    if (val === "⌫") {
      if (justEvaluated) {
        setExpression("");
        setDisplay("0");
        setJustEvaluated(false);
        return;
      }
      setExpression(prev => {
        const next = prev.slice(0, -1);
        setDisplay(next || "0");
        return next;
      });
      return;
    }

    if (val === "=") {
      const expr = expression.trim();
      if (!expr) return;
      try {
        const normalized = expr
          .replace(/π/g, "pi")
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-")
          .replace(/√\(/g, "sqrt(")
          .replace(/\^/g, "^");
        const raw = evaluate(normalized, buildScope());
        const num = typeof raw === "number" ? raw : Number(raw);
        const resultStr = formatResult(num);
        setHistory(prev => [{ expr, result: resultStr }, ...prev.slice(0, 14)]);
        setDisplay(resultStr);
        setExpression(resultStr);
        setJustEvaluated(true);
      } catch {
        setDisplay("Error");
        setError(true);
        setJustEvaluated(false);
      }
      return;
    }

    if (val === "±") {
      if (expression.startsWith("-")) {
        const next = expression.slice(1);
        setExpression(next);
        setDisplay(next || "0");
      } else if (expression) {
        const next = "-" + expression;
        setExpression(next);
        setDisplay(next);
      }
      return;
    }

    if (val === "%") {
      const newExpr = (justEvaluated ? expression : expression) + "/100";
      setExpression(newExpr);
      setDisplay(newExpr);
      setJustEvaluated(false);
      return;
    }

    if (val === "x²") {
      const base = justEvaluated ? expression : expression;
      const newExpr = base + "^2";
      setExpression(newExpr);
      setDisplay(newExpr);
      setJustEvaluated(false);
      return;
    }

    if (val === "xʸ") {
      const base = justEvaluated ? expression : expression;
      const newExpr = base + "^";
      setExpression(newExpr);
      setDisplay(newExpr);
      setJustEvaluated(false);
      return;
    }

    if (val === "1/x") {
      const inner = justEvaluated ? expression : (expression || "0");
      const newExpr = "1/(" + inner + ")";
      setExpression(newExpr);
      setDisplay(newExpr);
      setJustEvaluated(false);
      return;
    }

    const funcAppend: Record<string, string> = {
      sin: "sin(",
      cos: "cos(",
      tan: "tan(",
      asin: "asin(",
      acos: "acos(",
      atan: "atan(",
      ln: "ln(",
      log: "log(",
      "√": "√(",
    };

    const isOperator = ["+", "−", "×", "÷", "^"].includes(val);
    const base = justEvaluated
      ? isOperator ? expression : ""
      : expression;

    const toAppend = funcAppend[val] ?? val;
    const newExpr = base + toAppend;
    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  }, [expression, justEvaluated, buildScope]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key >= "0" && e.key <= "9") handleInput(e.key);
      else if (e.key === "+") handleInput("+");
      else if (e.key === "-") handleInput("−");
      else if (e.key === "*") handleInput("×");
      else if (e.key === "/") { e.preventDefault(); handleInput("÷"); }
      else if (e.key === ".") handleInput(".");
      else if (e.key === "(") handleInput("(");
      else if (e.key === ")") handleInput(")");
      else if (e.key === "^") handleInput("^");
      else if (e.key === "Enter" || e.key === "=") handleInput("=");
      else if (e.key === "Backspace") handleInput("⌫");
      else if (e.key === "Escape") handleInput("C");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleInput]);

  const getBasicVariant = (btn: string) => {
    if (btn === "=") return "primary";
    if (["C", "⌫"].includes(btn)) return "danger";
    if (["+", "−", "×", "÷", "%", "±"].includes(btn)) return "operator";
    return "default";
  };

  const getSciVariant = (btn: string) => {
    if (["π", "e"].includes(btn)) return "constant";
    if (["(", ")"].includes(btn)) return "paren";
    return "sci";
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        {/* Controls row */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex gap-0.5 p-1 rounded-xl bg-white/5 border border-white/[0.07]">
            {(["Basic", "Scientific"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-calc-${m.toLowerCase()}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-1 rounded-xl bg-white/5 border border-white/[0.07]">
              {(["DEG", "RAD"] as AngleUnit[]).map(u => (
                <button
                  key={u}
                  onClick={() => setAngleUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    angleUnit === u
                      ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`toggle-angle-${u.toLowerCase()}`}
                >
                  {u}
                </button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowHistory(h => !h)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                showHistory
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-white/5 border-white/[0.07] text-muted-foreground hover:text-foreground"
              }`}
              data-testid="btn-toggle-history"
              title="Toggle history"
            >
              <Clock className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Display */}
        <div
          className="rounded-2xl mb-3 px-5 py-4 min-h-[96px] flex flex-col justify-end overflow-hidden"
          style={{
            background: "rgba(6, 14, 36, 0.9)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <div className="text-xs text-muted-foreground/50 font-mono h-5 w-full text-right truncate mb-0.5 select-none">
            {justEvaluated ? "" : expression}
          </div>
          <motion.div
            key={display}
            initial={{ opacity: 0.6, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.13 }}
            className={`font-mono font-bold w-full text-right select-all leading-none ${
              error
                ? "text-red-400 text-2xl"
                : display.length > 14
                ? "text-xl"
                : display.length > 10
                ? "text-2xl"
                : "text-4xl"
            } ${error ? "" : "text-foreground"}`}
            data-testid="text-calc-display"
          >
            {display}
          </motion.div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest">
              {angleUnit}
            </span>
            {mode === "Scientific" && (
              <span className="text-[10px] font-mono text-purple-400/40 uppercase tracking-widest">
                · Scientific
              </span>
            )}
          </div>
        </div>

        {/* Scientific function rows */}
        <AnimatePresence initial={false}>
          {mode === "Scientific" && (
            <motion.div
              key="sci-btns"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-1.5">
                {scientificRows.flat().map(btn => (
                  <CalcButton
                    key={btn}
                    label={btn}
                    onClick={() => handleInput(btn)}
                    variant={getSciVariant(btn)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Basic numpad */}
        <div className="grid grid-cols-4 gap-1.5">
          {basicRows.flat().map(btn => (
            <CalcButton
              key={btn}
              label={btn}
              onClick={() => handleInput(btn)}
              variant={getBasicVariant(btn)}
            />
          ))}
        </div>
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div
              className="w-[200px] rounded-2xl p-4 h-full"
              style={{
                background: "rgba(6, 14, 36, 0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">History</span>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-muted-foreground/50 hover:text-red-400 transition-colors"
                    title="Clear history"
                    data-testid="btn-clear-history"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center py-8 leading-relaxed">
                  No calculations yet
                </p>
              ) : (
                <div className="space-y-1 overflow-y-auto max-h-[360px]">
                  {history.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      onClick={() => {
                        setExpression(item.result);
                        setDisplay(item.result);
                        setJustEvaluated(true);
                        setError(false);
                      }}
                      className="w-full text-right p-2.5 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/15 transition-all duration-150 group"
                      data-testid={`history-item-${i}`}
                    >
                      <div className="text-[11px] text-muted-foreground/60 font-mono truncate">
                        {item.expr}
                      </div>
                      <div className="text-sm font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                        = {item.result}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type BtnVariant = "default" | "primary" | "operator" | "danger" | "sci" | "constant" | "paren";

const variantStyles: Record<BtnVariant, string> = {
  default:  "bg-white/[0.06] hover:bg-white/[0.11] text-foreground border border-white/[0.07] hover:border-white/[0.13]",
  primary:  "bg-primary hover:bg-primary/85 text-primary-foreground border border-primary/0 shadow-lg shadow-primary/25",
  operator: "bg-blue-500/14 hover:bg-blue-500/24 text-blue-300 border border-blue-500/20",
  danger:   "bg-red-500/12 hover:bg-red-500/22 text-red-400 border border-red-500/15",
  sci:      "bg-purple-500/12 hover:bg-purple-500/22 text-purple-300 border border-purple-500/18 text-xs",
  constant: "bg-amber-500/12 hover:bg-amber-500/22 text-amber-300 border border-amber-500/18 text-xs",
  paren:    "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/15",
};

function CalcButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: BtnVariant;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.91, transition: { duration: 0.07 } }}
      whileHover={{ scale: 1.04, transition: { type: "spring", stiffness: 500, damping: 22 } }}
      className={`rounded-xl py-3.5 font-semibold flex items-center justify-center transition-colors duration-150 select-none ${variantStyles[variant]}`}
      style={{ fontSize: label.length > 3 ? "11px" : "14px" }}
      data-testid={`calc-btn-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
    >
      {label === "⌫" ? <Delete className="w-4 h-4" /> : label}
    </motion.button>
  );
}
