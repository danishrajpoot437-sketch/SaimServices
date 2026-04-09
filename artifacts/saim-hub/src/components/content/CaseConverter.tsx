import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

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
  { label: "UPPERCASE", fn: (s: string) => s.toUpperCase(), testId: "btn-uppercase" },
  { label: "lowercase", fn: (s: string) => s.toLowerCase(), testId: "btn-lowercase" },
  { label: "Title Case", fn: toTitleCase, testId: "btn-titlecase" },
  { label: "Sentence case", fn: toSentenceCase, testId: "btn-sentencecase" },
  { label: "Remove Spaces", fn: (s: string) => s.replace(/\s+/g, " ").trim(), testId: "btn-removespaces" },
  { label: "Remove Emojis", fn: removeEmojis, testId: "btn-removeemojis" },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const applyTransform = (fn: (s: string) => string) => {
    const result = fn(input || output);
    setOutput(result);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Transformation Buttons */}
      <div className="flex flex-wrap gap-2">
        {transformations.map((t) => (
          <motion.button
            key={t.label}
            onClick={() => applyTransform(t.fn)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 text-sm font-medium text-muted-foreground hover:text-primary border border-white/10 hover:border-primary/30 transition-all duration-200"
            data-testid={t.testId}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            rows={10}
            className="w-full bg-muted/30 text-foreground text-sm rounded-2xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50 transition-colors leading-relaxed"
            data-testid="textarea-case-input"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            <button
              onClick={copyOutput}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-copy-output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div
            className="w-full bg-muted/20 text-foreground text-sm rounded-2xl px-4 py-3 border border-white/10 min-h-[240px] leading-relaxed whitespace-pre-wrap break-words"
            data-testid="text-case-output"
          >
            {output || <span className="text-muted-foreground/40">Converted text will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
