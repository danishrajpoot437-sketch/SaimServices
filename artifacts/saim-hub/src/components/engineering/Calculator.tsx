import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Delete, Clock } from "lucide-react";
import { evaluate } from "mathjs";

type Mode = "Basic" | "Advanced";

const basicButtons = [
  ["C", "CE", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const advancedButtons = [
  ["sin(", "cos(", "tan(", "log("],
  ["asin(", "acos(", "atan(", "ln("],
  ["sqrt(", "^", "(", ")"],
  ["π", "e", "abs(", "!"],
];

interface HistoryItem {
  expr: string;
  result: string;
}

export default function Calculator() {
  const [mode, setMode] = useState<Mode>("Basic");
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState(false);

  const handleInput = useCallback((val: string) => {
    setError(false);
    if (val === "C") {
      setExpression("");
      setDisplay("0");
      setJustEvaluated(false);
      return;
    }
    if (val === "CE") {
      setExpression((prev) => prev.slice(0, -1) || "");
      setDisplay((prev) => {
        const next = prev.slice(0, -1);
        return next || "0";
      });
      setJustEvaluated(false);
      return;
    }
    if (val === "=") {
      try {
        let expr = expression;
        expr = expr.replace(/π/g, "pi").replace(/×/g, "*").replace(/÷/g, "/");
        const result = evaluate(expr);
        const resultStr = Number.isFinite(result) ? String(Number(result.toFixed(10)).toString()) : String(result);
        setHistory((prev) => [{ expr: expression, result: resultStr }, ...prev.slice(0, 9)]);
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
        setExpression((prev) => prev.slice(1));
        setDisplay((prev) => prev.startsWith("-") ? prev.slice(1) : prev);
      } else {
        setExpression((prev) => "-" + prev);
        setDisplay((prev) => "-" + prev);
      }
      return;
    }
    if (val === "π") {
      const newExpr = (justEvaluated ? "" : expression) + "π";
      setExpression(newExpr);
      setDisplay(newExpr);
      setJustEvaluated(false);
      return;
    }

    const newExpr = (justEvaluated ? "" : expression) + val;
    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  }, [expression, justEvaluated]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) handleInput(key);
      else if (["+", "-", "*", "/", ".", "(", ")"].includes(key)) handleInput(key);
      else if (key === "Enter" || key === "=") handleInput("=");
      else if (key === "Backspace") handleInput("CE");
      else if (key === "Escape") handleInput("C");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calculator */}
      <div className="lg:col-span-2">
        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-4 w-fit">
          {(["Basic", "Advanced"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-calc-${m.toLowerCase()}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Display */}
        <div className="glass-card rounded-2xl p-5 mb-4 min-h-[90px] flex flex-col items-end justify-end">
          <div className="text-xs text-muted-foreground mb-1 h-4 font-mono truncate w-full text-right">
            {expression || ""}
          </div>
          <div
            className={`font-mono text-3xl font-bold truncate w-full text-right ${error ? "text-destructive" : "text-foreground"}`}
            data-testid="text-calc-display"
          >
            {display}
          </div>
        </div>

        {/* Advanced Buttons */}
        {mode === "Advanced" && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {advancedButtons.flat().map((btn) => (
              <CalcButton key={btn} label={btn} onClick={() => handleInput(btn)} variant="secondary" />
            ))}
          </div>
        )}

        {/* Basic Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {basicButtons.flat().map((btn) => (
            <CalcButton
              key={btn}
              label={btn}
              onClick={() => handleInput(btn)}
              variant={btn === "=" ? "primary" : ["C", "CE", "%", "/", "*", "-", "+"].includes(btn) ? "accent" : "default"}
            />
          ))}
        </div>
      </div>

      {/* History Panel */}
      <div className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-4 h-full">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">History</span>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No history yet. Start calculating.</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setExpression(item.result);
                    setDisplay(item.result);
                    setJustEvaluated(true);
                  }}
                  className="w-full text-right p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  data-testid={`history-item-${i}`}
                >
                  <div className="text-xs text-muted-foreground font-mono truncate">{item.expr}</div>
                  <div className="text-sm font-semibold text-foreground font-mono group-hover:text-primary transition-colors">
                    = {item.result}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalcButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "accent" | "secondary";
}) {
  const base = "rounded-xl py-3.5 text-sm font-semibold transition-all duration-150 flex items-center justify-center active:scale-95";
  const variants = {
    default: "bg-white/5 hover:bg-white/10 text-foreground border border-white/5",
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg",
    accent: "bg-accent/20 hover:bg-accent/30 text-accent border border-accent/20",
    secondary: "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/20 text-xs",
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`${base} ${variants[variant]}`}
      data-testid={`calc-btn-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
    >
      {label === "CE" ? <Delete className="w-4 h-4" /> : label}
    </motion.button>
  );
}
