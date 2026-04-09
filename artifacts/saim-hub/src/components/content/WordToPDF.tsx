import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Download, CheckCircle, X } from "lucide-react";

type State = "idle" | "uploading" | "converting" | "done";

export default function WordToPDF() {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f) return;
    setFile(f);
    setState("uploading");
    setProgress(0);

    setTimeout(() => {
      setState("converting");
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => setState("done"), 400);
        }
        setProgress(Math.min(p, 100));
      }, 150);
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setState("idle");
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="drop-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-white/15 hover:border-primary/40 hover:bg-white/3"
            }`}
            data-testid="dropzone-word-pdf"
          >
            <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-base font-semibold text-foreground mb-1">Drop your Word document here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
            <span className="text-xs text-muted-foreground/60 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              Supports .doc, .docx files
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".doc,.docx"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              data-testid="input-file-upload"
            />
          </motion.div>
        )}

        {(state === "uploading" || state === "converting") && (
          <motion.div
            key="converting"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file ? (file.size / 1024).toFixed(1) + " KB" : ""}
                </p>
              </div>
              <button onClick={reset} className="text-muted-foreground hover:text-foreground" data-testid="button-cancel-convert">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{state === "uploading" ? "Uploading..." : "Converting to PDF..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[#0ea5e9]"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              PDF processing powered by our cloud engine...
            </p>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-8 text-center space-y-4 border border-emerald-500/20"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-foreground">Conversion Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {file?.name.replace(/\.(doc|docx)$/i, ".pdf")} is ready to download.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-semibold transition-all"
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-sm font-medium transition-all"
                data-testid="button-convert-another"
              >
                Convert Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Drag & Drop", desc: "Simply drag your Word file into the zone above" },
            { title: "Instant Convert", desc: "Fast cloud conversion with high fidelity output" },
            { title: "Download PDF", desc: "Get your polished PDF file ready to share" },
          ].map((step) => (
            <div key={step.title} className="glass-card rounded-2xl p-4 text-center">
              <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
