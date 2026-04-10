import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Download, CheckCircle, X, FileText,
  FileImage, File, Zap, Sparkles,
} from "lucide-react";

type ConvertState = "idle" | "uploading" | "processing" | "optimizing" | "done";

interface FormatDef {
  ext: string[];
  label: string;
  output: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  description: string;
}

const formats: FormatDef[] = [
  { ext: [".doc", ".docx"],       label: "Word → PDF",  output: "PDF",  icon: FileText,  color: "text-blue-300",   bg: "rgba(59,130,246,0.12)",  description: "Microsoft Word document to PDF" },
  { ext: [".pdf"],                label: "PDF → Word",  output: "DOCX", icon: FileText,  color: "text-amber-300",  bg: "rgba(245,158,11,0.12)",  description: "PDF document to editable Word" },
  { ext: [".jpg", ".jpeg", ".png", ".webp"], label: "Image → PDF", output: "PDF", icon: FileImage, color: "text-purple-300", bg: "rgba(168,85,247,0.12)", description: "Image files to PDF document" },
  { ext: [".txt"],                label: "Text → PDF",  output: "PDF",  icon: File,      color: "text-emerald-300", bg: "rgba(16,185,129,0.12)", description: "Plain text file to PDF" },
];

const stages = [
  { label: "Uploading file...",        pct: 20,  icon: Upload },
  { label: "AI-Powered Processing...", pct: 55,  icon: Zap },
  { label: "AI Optimizing output...",  pct: 85,  icon: Sparkles },
  { label: "Finalizing document...",   pct: 100, icon: CheckCircle },
];

function detectFormat(file: File): FormatDef | null {
  const name = file.name.toLowerCase();
  for (const f of formats) {
    if (f.ext.some(e => name.endsWith(e))) return f;
  }
  return null;
}

function PulseRing() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-amber-400/20"
          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
          transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
          style={{ width: 72, height: 72 }}
        />
      ))}
    </div>
  );
}

export default function FileConversionEngine() {
  const [state, setState] = useState<ConvertState>("idle");
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<FormatDef | null>(null);
  const [dragging, setDragging] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runConversion = (f: File) => {
    const fmt = detectFormat(f);
    if (!fmt) { setUnsupported(true); setTimeout(() => setUnsupported(false), 3000); return; }
    setFile(f); setFormat(fmt); setUnsupported(false);
    setState("uploading"); setProgress(0); setStageIdx(0);

    const runStage = (idx: number) => {
      if (idx >= stages.length) return;
      const target = stages[idx].pct;
      setStageIdx(idx);

      let cur = idx === 0 ? 0 : stages[idx - 1].pct;
      const iv = setInterval(() => {
        cur += Math.random() * 6 + 2;
        if (cur >= target) {
          cur = target;
          clearInterval(iv);
          setProgress(target);
          if (idx === stages.length - 1) {
            setTimeout(() => setState("done"), 400);
          } else {
            if (idx === 0) setState("processing");
            if (idx === 1) setState("optimizing");
            setTimeout(() => runStage(idx + 1), 350);
          }
        }
        setProgress(Math.min(cur, target));
      }, 80);
    };
    runStage(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) runConversion(f);
  };

  const reset = () => { setState("idle"); setFile(null); setFormat(null); setProgress(0); setStageIdx(0); };

  const StageIcon = stages[stageIdx]?.icon ?? Zap;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* ── Drop Zone ── */}
        {state === "idle" && (
          <motion.div key="drop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="relative flex flex-col items-center justify-center rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden"
              style={{
                minHeight: 260,
                background: dragging ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.025)",
                border: `2px dashed ${dragging ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.12)"}`,
                boxShadow: dragging ? "0 0 40px rgba(245,158,11,0.12)" : "none",
              }}
              data-testid="dropzone-file"
            >
              {/* Pulse rings */}
              <div className="relative flex items-center justify-center mb-5">
                <PulseRing />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <Upload className={`w-7 h-7 transition-colors duration-200 ${dragging ? "text-amber-300" : "text-amber-400/80"}`} />
                </div>
              </div>

              <p className="text-base font-bold text-foreground mb-1">
                {dragging ? "Release to convert" : "Drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mb-5">or click to browse files</p>

              {/* Format badges */}
              <div className="flex flex-wrap gap-2 justify-center px-4">
                {formats.map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                      style={{ background: f.bg, borderColor: f.bg.replace("0.12", "0.25"), color: f.color.replace("text-", "") }}>
                      <Icon className={`w-3 h-3 ${f.color}`} />
                      <span className={f.color}>{f.label}</span>
                    </div>
                  );
                })}
              </div>

              <input ref={inputRef} type="file"
                accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.webp,.txt"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) runConversion(e.target.files[0]); }}
                data-testid="input-file-upload"
              />

              {/* Unsupported warning */}
              <AnimatePresence>
                {unsupported && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/12 border border-red-500/25 text-xs text-red-400">
                    <X className="w-3.5 h-3.5" /> Unsupported format. Use .doc, .pdf, .jpg, .png, or .txt
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Format info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {formats.map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="rounded-2xl p-3.5 text-center"
                    style={{ background: f.bg, border: `1px solid ${f.bg.replace("0.12", "0.2")}` }}>
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${f.color}`} />
                    <div className={`text-xs font-bold mb-0.5 ${f.color}`}>{f.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{f.description}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {(state === "uploading" || state === "processing" || state === "optimizing") && (
          <motion.div key="converting"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-8 space-y-6"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)" }}
          >
            {/* File info */}
            <div className="flex items-center gap-4">
              {format && (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: format.bg, border: `1px solid ${format.bg.replace("0.12", "0.25")}` }}>
                  <format.icon className={`w-6 h-6 ${format.color}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file ? (file.size / 1024).toFixed(1) + " KB" : ""} → {format?.output}
                </p>
              </div>
              <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-cancel-convert">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage indicator */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <StageIcon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-amber-300 font-semibold">{stages[stageIdx]?.label}</span>
                  <span className="text-muted-foreground font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.25 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)", backgroundSize: "200% 100%",
                      boxShadow: "0 0 12px rgba(245,158,11,0.5)" }} />
                </div>
              </div>
            </div>

            {/* Stage steps */}
            <div className="grid grid-cols-4 gap-2">
              {stages.map((s, i) => {
                const SIcon = s.icon;
                const done = i < stageIdx;
                const active = i === stageIdx;
                return (
                  <div key={s.label} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-300 ${
                    active ? "bg-amber-500/12 border border-amber-500/25" : done ? "opacity-60" : "opacity-25"
                  }`}>
                    <SIcon className={`w-4 h-4 ${active ? "text-amber-400" : done ? "text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="text-[9px] text-center text-muted-foreground leading-tight hidden sm:block">
                      {s.label.replace("...", "").replace("AI-Powered ", "AI ")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/70" />
              <span className="text-xs text-amber-400/70 font-semibold">AI-Powered Conversion Engine</span>
            </div>
          </motion.div>
        )}

        {/* ── Done ── */}
        {state === "done" && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-10 text-center space-y-5"
            style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 0 40px rgba(16,185,129,0.08)" }}
          >
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"
                style={{ boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </motion.div>
            <div>
              <p className="text-xl font-bold text-foreground mb-1">Conversion Complete!</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-foreground">{file?.name}</span>
                {" "}→{" "}
                <span className="text-emerald-400 font-mono">
                  {file?.name.replace(/\.[^.]+$/, `.${format?.output.toLowerCase()}`)}
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 text-sm font-bold transition-all"
                style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}
                data-testid="button-download-pdf">
                <Download className="w-4 h-4" />
                Download {format?.output}
              </button>
              <button onClick={reset}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-sm font-semibold transition-all border border-white/8">
                Convert Another File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
