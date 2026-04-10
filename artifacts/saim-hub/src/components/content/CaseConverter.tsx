import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowRight, Trash2 } from "lucide-react";

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function toSentenceCase(str: string) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function removeEmojis(str: string) {
  return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim();
}

const transformations = [
  {
    label: "UPPERCASE",
    fn: (s: string) => s.toUpperCase(),
    testId: "btn-uppercase",
    color: "text-blue-300 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    label: "lowercase",
    fn: (s: string) => s.toLowerCase(),
    testId: "btn-lowercase",
    color: "text-purple-300 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20",
  },
  {
    label: "Title Case",
    fn: toTitleCase,
    testId: "btn-titlecase",
    color: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    label: "Sentence case",
    fn: toSentenceCase,
    testId: "btn-sentencecase",
    color: "text-amber-300 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20",
  },
  {
    label: "Remove Spaces",
    fn: (s: string) => s.replace(/\s+/g, ""),
    testId: "btn-removespaces",
    color: "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10",
  },
  {
    label: "Remove Emojis",
    fn: removeEmojis,
    testId: "btn-removeemojis",
    color: "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10",
  },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeTransform, setActiveTransform] = useState<string | null>(null);

  const applyTransform = (fn: (s: string) => string, label: string) => {
    const result = fn(input || output);
    setOutput(result);
    setActiveTransform(label);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setActiveTransform(null);
  };

  return (
    <div className="space-y-5">
      {/* Transformation Buttons */}
      <div className="flex flex-wrap gap-2">
        {transformations.map((t) => (
          <motion.button
            key={t.label}
            onClick={() => applyTransform(t.fn, t.label)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={`relative px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${t.color}`}
            data-testid={t.testId}
          >
            {activeTransform === t.label && (
              <motion.div
                layoutId="active-transform"
                className="absolute inset-0 rounded-xl ring-1 ring-current opacity-30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {t.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Input Text</label>
            {input && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clear}
                className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </motion.button>
            )}
          </div>
          <motion.div
            animate={{
              boxShadow: inputFocused
                ? "0 0 0 3px rgba(67,97,238,0.18), 0 0 32px rgba(67,97,238,0.09)"
                : "0 0 0 0px rgba(67,97,238,0)",
            }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type or paste your text here..."
              rows={10}
              className="w-full bg-muted/30 text-foreground text-sm rounded-2xl px-4 py-3.5 border border-white/10 outline-none resize-none placeholder:text-muted-foreground/40 transition-colors duration-200 leading-relaxed"
              style={{ borderColor: inputFocused ? "rgba(67,97,238,0.5)" : undefined }}
              data-testid="textarea-case-input"
            />
          </motion.div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Output</label>
              <AnimatePresence>
                {activeTransform && (
                  <motion.span
                    key={activeTransform}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium"
                  >
                    <ArrowRight className="w-2.5 h-2.5" />
                    {activeTransform}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={copyOutput}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-copy-output"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy</>
              )}
            </button>
          </div>
          <div
            className="w-full bg-muted/20 text-foreground text-sm rounded-2xl px-4 py-3.5 border border-white/8 min-h-[240px] leading-relaxed whitespace-pre-wrap break-words"
            style={{ boxShadow: output ? "0 0 0 1px rgba(255,255,255,0.04) inset" : undefined }}
            data-testid="text-case-output"
          >
            {output || <span className="text-muted-foreground/35">Converted text will appear here after you click a transformation button...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
