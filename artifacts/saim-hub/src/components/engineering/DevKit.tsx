import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, RefreshCw, Hash, Braces, Code2,
  Palette, Clock, Search, ChevronDown, AlertCircle, CheckCircle2,
} from "lucide-react";

/* ─── Sub-tool tabs ──────────────────────────────────────────────────────── */
type SubTool = "json" | "encode" | "hash" | "regex" | "color" | "time";

const SUB_TOOLS: { id: SubTool; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "json",   label: "JSON",    icon: Braces,     desc: "Format · Validate · Minify" },
  { id: "encode", label: "Encode",  icon: Code2,      desc: "Base64 · URL · HTML" },
  { id: "hash",   label: "Hash",    icon: Hash,       desc: "SHA-256 · SHA-512 · SHA-1" },
  { id: "regex",  label: "Regex",   icon: Search,     desc: "Live test & highlight" },
  { id: "color",  label: "Color",   icon: Palette,    desc: "HEX · RGB · HSL" },
  { id: "time",   label: "Time",    icon: Clock,      desc: "Unix · ISO · Human" },
];

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }, []);
  return { copied, copy };
}

function CopyBtn({ text, id, copied, copy }: { text: string; id: string; copied: string | null; copy: (t: string, k: string) => void }) {
  const ok = copied === id;
  return (
    <button onClick={() => copy(text, id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        ok ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8 border border-white/10"
      }`}
    >
      {ok ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {ok ? "Copied!" : "Copy"}
    </button>
  );
}

function Textarea({ value, onChange, placeholder, mono = true, rows = 6, readOnly = false }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; mono?: boolean; rows?: number; readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={`w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/8 outline-none resize-none transition-colors focus:border-primary/40 ${
        mono ? "font-mono" : ""
      } ${readOnly ? "text-muted-foreground cursor-default" : ""}`}
      style={{ background: "rgba(6,14,36,0.6)" }}
    />
  );
}

/* ─── JSON Tool ──────────────────────────────────────────────────────────── */
function JsonTool() {
  const [input, setInput]   = useState('{\n  "name": "SaimServices",\n  "type": "utility-hub",\n  "premium": false\n}');
  const [indent, setIndent] = useState(2);
  const { copied, copy }    = useCopy();

  const result = (() => {
    if (!input.trim()) return { ok: true, output: "", error: null, size: "" };
    try {
      const parsed = JSON.parse(input);
      return {
        ok: true,
        output: JSON.stringify(parsed, null, indent),
        minified: JSON.stringify(parsed),
        error: null,
        size: `${new Blob([input]).size} bytes`,
      };
    } catch (e: unknown) {
      return { ok: false, output: "", minified: "", error: (e as Error).message, size: "" };
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Indent:</span>
        {[2, 4].map(n => (
          <button key={n} onClick={() => setIndent(n)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${indent === n ? "bg-primary/15 text-primary border border-primary/25" : "glass-card text-muted-foreground hover:text-foreground"}`}
          >{n} spaces</button>
        ))}
        <button onClick={() => setIndent(0)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${indent === 0 ? "bg-primary/15 text-primary border border-primary/25" : "glass-card text-muted-foreground hover:text-foreground"}`}
        >Tab</button>
        {result.ok && result.output && (
          <div className="ml-auto flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">Valid JSON · {result.size}</span>
          </div>
        )}
        {!result.ok && input.trim() && (
          <div className="ml-auto flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] text-red-400">Invalid JSON</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Input JSON</label>
            <button onClick={() => setInput("")} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors">Clear</button>
          </div>
          <Textarea value={input} onChange={setInput} placeholder='{ "key": "value" }' rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Formatted</label>
            {result.output && <CopyBtn text={result.output} id="json-fmt" copied={copied} copy={copy} />}
          </div>
          {result.error ? (
            <div className="rounded-xl px-4 py-3 text-xs font-mono text-red-400 h-[240px] overflow-auto"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {result.error}
            </div>
          ) : (
            <Textarea value={result.output} readOnly rows={10} />
          )}
        </div>
      </div>

      {result.minified && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Minified · {new Blob([result.minified!]).size} bytes</label>
            <CopyBtn text={result.minified!} id="json-min" copied={copied} copy={copy} />
          </div>
          <Textarea value={result.minified!} readOnly rows={2} />
        </div>
      )}
    </div>
  );
}

/* ─── Encode/Decode Tool ─────────────────────────────────────────────────── */
type EncodeMode = "base64" | "url" | "html";
function EncodeTool() {
  const [input,  setInput]  = useState("Hello, SaimServices! Encode/Decode me → free!");
  const [mode,   setMode]   = useState<EncodeMode>("base64");
  const [action, setAction] = useState<"encode" | "decode">("encode");
  const { copied, copy }    = useCopy();

  const output = (() => {
    try {
      if (mode === "base64") {
        return action === "encode" ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
      }
      if (mode === "url") {
        return action === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
      }
      if (mode === "html") {
        if (action === "encode") {
          return input.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
        } else {
          const txt = document.createElement("textarea");
          txt.innerHTML = input;
          return txt.value;
        }
      }
    } catch {
      return "⚠ Error: Invalid input for this operation.";
    }
    return "";
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["base64","url","html"] as EncodeMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === m ? "bg-primary/15 text-primary border border-primary/25" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >{m === "base64" ? "Base64" : m === "url" ? "URL" : "HTML"}</button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {(["encode","decode"] as const).map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                action === a ? "bg-amber-400/15 text-amber-400 border border-amber-400/25" : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >{a}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Input</label>
          <Textarea value={input} onChange={setInput} placeholder="Enter text to encode or decode..." rows={8} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            {output && !output.startsWith("⚠") && <CopyBtn text={output} id="enc-out" copied={copied} copy={copy} />}
          </div>
          <Textarea value={output ?? ""} readOnly rows={8} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setInput(output ?? ""); setAction(a => a === "encode" ? "decode" : "encode"); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-card text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Swap & Flip
        </button>
      </div>
    </div>
  );
}

/* ─── Hash Generator ─────────────────────────────────────────────────────── */
type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const HASH_ALGOS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function HashTool() {
  const [input,   setInput]  = useState("SaimServices free hash generator");
  const [hashes,  setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading]= useState(false);
  const { copied, copy }     = useCopy();
  const computeHashes = useCallback(async (text: string) => {
    if (!text.trim()) { setHashes({}); return; }
    setLoading(true);
    const enc = new TextEncoder().encode(text);
    const results: Record<string, string> = {};
    for (const algo of HASH_ALGOS) {
      try {
        const buf = await crypto.subtle.digest(algo, enc);
        results[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
      } catch { results[algo] = "—"; }
    }
    setHashes(results);
    setLoading(false);
  }, []);

  // Compute hashes on first mount using the default input
  const initRef = useRef(false);
  if (!initRef.current) { initRef.current = true; void computeHashes("SaimServices free hash generator"); }

  const handleChange = useCallback((v: string) => {
    setInput(v);
    computeHashes(v);
  }, [computeHashes]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Input text</label>
        <Textarea value={input} onChange={handleChange} placeholder="Enter text to hash..." rows={4} />
      </div>

      <div className="space-y-2.5">
        {HASH_ALGOS.map(algo => {
          const h = hashes[algo] ?? "";
          return (
            <div key={algo} className="rounded-xl px-4 py-3" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(67,97,238,0.18)", color: "#93c5fd", border: "1px solid rgba(67,97,238,0.25)" }}>
                  {algo}
                </span>
                {h && <CopyBtn text={h} id={algo} copied={copied} copy={copy} />}
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                {loading ? <span className="opacity-40 animate-pulse">Computing…</span> : (h || <span className="opacity-30">—</span>)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl px-4 py-3 text-xs text-muted-foreground" style={{ background: "rgba(67,97,238,0.05)", border: "1px solid rgba(67,97,238,0.12)" }}>
        <span className="text-primary font-semibold">Note: </span>
        All hashing runs locally in your browser via the Web Crypto API — no data is ever sent to a server.
      </div>
    </div>
  );
}

/* ─── Regex Tester ───────────────────────────────────────────────────────── */
function RegexTool() {
  const [pattern, setPattern] = useState("[A-Z][a-z]+");
  const [flags,   setFlags]   = useState("g");
  const [testStr, setTestStr] = useState("Hello World, this is SaimServices Developer Toolkit running Free.");

  type RegexMatch = { match: string; index: number; groups?: Record<string, string> };
  const result = (() => {
    const empty: RegexMatch[] = [];
    if (!pattern) return { matches: empty, error: null, html: testStr };
    try {
      const re = new RegExp(pattern, flags);
      const matches: RegexMatch[] = [];
      let m: RegExpExecArray | null;
      const safeRe = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      while ((m = safeRe.exec(testStr)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.groups as Record<string, string> | undefined });
        if (!flags.includes("g")) break;
      }
      // Build highlighted HTML
      let html = "";
      let last = 0;
      const highlightRe = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      testStr.replace(highlightRe, (match, ...args) => {
        const index = args[args.length - 2] as number;
        html += escHtml(testStr.slice(last, index));
        html += `<mark class="bg-amber-400/25 text-amber-300 rounded px-0.5">${escHtml(match)}</mark>`;
        last = index + match.length;
        return match;
      });
      html += escHtml(testStr.slice(last));
      return { matches, error: null, html };
    } catch (e: unknown) {
      return { matches: empty, error: (e as Error).message, html: escHtml(testStr) };
    }
  })();

  const toggleFlag = (f: string) => setFlags(prev => prev.includes(f) ? prev.replace(f,"") : prev + f);

  return (
    <div className="space-y-4">
      {/* Pattern + flags */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Regular Expression</label>
          <div className="flex items-center rounded-xl border border-white/10 overflow-hidden focus-within:border-primary/40 transition-colors"
            style={{ background: "rgba(6,14,36,0.6)" }}
          >
            <span className="px-3 text-muted-foreground/50 font-mono text-lg select-none">/</span>
            <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="pattern"
              className="flex-1 bg-transparent text-foreground text-sm py-3 outline-none font-mono"
            />
            <span className="px-3 text-muted-foreground/50 font-mono text-lg select-none">/{flags}</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Flags</label>
          <div className="flex gap-1.5 flex-wrap">
            {["g","i","m","s"].map(f => (
              <button key={f} onClick={() => toggleFlag(f)}
                className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  flags.includes(f) ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "glass-card text-muted-foreground"
                }`}
              >{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Test string */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Test String</label>
        <Textarea value={testStr} onChange={setTestStr} rows={4} />
      </div>

      {/* Match count */}
      <div className="flex items-center gap-3">
        {result.error ? (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {result.error}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">{result.matches.length} match{result.matches.length !== 1 ? "es" : ""}</span>
            {result.matches.length > 0 && (
              <span className="text-xs text-muted-foreground">
                — {result.matches.map(m => `"${m.match}"`).slice(0, 6).join(", ")}{result.matches.length > 6 ? "…" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Highlighted output */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Live Preview</label>
        <div className="rounded-xl px-4 py-3 text-sm font-mono leading-relaxed break-words"
          style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)", minHeight: 60 }}
          dangerouslySetInnerHTML={{ __html: result.html }}
        />
      </div>

      {/* Named groups */}
      {result.matches.some(m => m.groups && Object.keys(m.groups).length > 0) && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Named Groups</label>
          {result.matches.map((m, i) =>
            m.groups && Object.keys(m.groups).length > 0 ? (
              <div key={i} className="rounded-xl px-4 py-2 text-xs font-mono" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)" }}>
                Match {i + 1}: {JSON.stringify(m.groups)}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function escHtml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ─── Color Converter ────────────────────────────────────────────────────── */
function ColorTool() {
  const [hex, setHex] = useState("#4361ee");
  const { copied, copy } = useCopy();

  const parsed = (() => {
    const h = hex.replace("#","");
    if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return null;
    const full = h.length === 3 ? h.split("").map(c=>c+c).join("") : h;
    const r = parseInt(full.slice(0,2),16);
    const g = parseInt(full.slice(2,4),16);
    const b = parseInt(full.slice(4,6),16);
    const rn = r/255, gn = g/255, bn = b/255;
    const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn), d = max-min;
    const l = (max+min)/2;
    const s = d===0 ? 0 : d/(1-Math.abs(2*l-1));
    let hue = 0;
    if (d!==0) {
      if (max===rn) hue = ((gn-bn)/d+6)%6;
      else if (max===gn) hue = (bn-rn)/d+2;
      else hue = (rn-gn)/d+4;
      hue *= 60;
    }
    return { r, g, b, h: Math.round(hue), s: Math.round(s*100), l: Math.round(l*100), full:"#"+full };
  })();

  const fromRgb = (r: string, g: string, b: string) => {
    const ri = Math.min(255, parseInt(r)||0);
    const gi = Math.min(255, parseInt(g)||0);
    const bi = Math.min(255, parseInt(b)||0);
    setHex("#" + [ri,gi,bi].map(v=>v.toString(16).padStart(2,"0")).join(""));
  };

  const [rgb, setRgb] = useState({ r: "67", g: "97", b: "238" });
  const updateRgb = (k: "r"|"g"|"b", v: string) => {
    const next = { ...rgb, [k]: v };
    setRgb(next);
    fromRgb(next.r, next.g, next.b);
  };

  return (
    <div className="space-y-5">
      {/* Color picker + preview */}
      <div className="flex items-start gap-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Pick color</label>
          <input type="color" value={parsed?.full ?? "#4361ee"} onChange={e => {
            setHex(e.target.value);
            setRgb({ r: String(parseInt(e.target.value.slice(1,3),16)), g: String(parseInt(e.target.value.slice(3,5),16)), b: String(parseInt(e.target.value.slice(5,7),16)) });
          }}
            className="w-20 h-16 rounded-xl border border-white/10 cursor-pointer bg-transparent p-1"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-16 rounded-xl shadow-lg transition-colors" style={{ background: parsed?.full ?? "#4361ee" }} />
          {parsed && (
            <p className="text-[10px] text-muted-foreground text-center font-mono">
              {parsed.h < 30 || parsed.h > 330 ? "Red" : parsed.h < 90 ? "Yellow/Green" : parsed.h < 150 ? "Green" : parsed.h < 210 ? "Cyan" : parsed.h < 270 ? "Blue" : "Violet/Purple"}
            </p>
          )}
        </div>
      </div>

      {/* Color format cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* HEX */}
        <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">HEX</span>
            {parsed && <CopyBtn text={parsed.full} id="hex" copied={copied} copy={copy} />}
          </div>
          <input value={hex} onChange={e => setHex(e.target.value)}
            className="w-full bg-transparent text-foreground text-sm font-mono outline-none border-b border-white/10 pb-1 focus:border-primary/40 transition-colors"
          />
          {!parsed && hex.length > 1 && <p className="text-[10px] text-red-400">Invalid hex</p>}
        </div>

        {/* RGB */}
        <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">RGB</span>
            {parsed && <CopyBtn text={`rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`} id="rgb" copied={copied} copy={copy} />}
          </div>
          <div className="flex gap-1.5">
            {(["r","g","b"] as const).map(k => (
              <input key={k} value={rgb[k]} onChange={e => updateRgb(k, e.target.value)} type="number" min="0" max="255"
                className="w-full bg-transparent text-foreground text-xs font-mono outline-none border-b border-white/10 pb-1 focus:border-sky-400/40 transition-colors"
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            {parsed ? `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})` : "—"}
          </p>
        </div>

        {/* HSL */}
        <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">HSL</span>
            {parsed && <CopyBtn text={`hsl(${parsed.h}, ${parsed.s}%, ${parsed.l}%)`} id="hsl" copied={copied} copy={copy} />}
          </div>
          <p className="text-2xl font-bold font-mono text-violet-400">
            {parsed ? `${parsed.h}°` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {parsed ? `hsl(${parsed.h}, ${parsed.s}%, ${parsed.l}%)` : "—"}
          </p>
        </div>
      </div>

      {/* CSS snippets */}
      {parsed && (
        <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">CSS Variables</p>
            <CopyBtn text={`:root {\n  --color: ${parsed.full};\n  --color-rgb: ${parsed.r}, ${parsed.g}, ${parsed.b};\n  --color-hsl: ${parsed.h}deg ${parsed.s}% ${parsed.l}%;\n}`}
              id="css" copied={copied} copy={copy} />
          </div>
          <pre className="text-xs font-mono text-muted-foreground leading-relaxed">
{`:root {
  --color:     ${parsed.full};
  --color-rgb: ${parsed.r}, ${parsed.g}, ${parsed.b};
  --color-hsl: ${parsed.h}deg ${parsed.s}% ${parsed.l}%;
}`}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ─── Timestamp Converter ────────────────────────────────────────────────── */
function TimeTool() {
  const now = Math.floor(Date.now() / 1000);
  const [unix,   setUnix]   = useState(String(now));
  const [iso,    setIso]    = useState(new Date(now * 1000).toISOString());
  const [source, setSource] = useState<"unix" | "iso" | "now">("unix");
  const { copied, copy }    = useCopy();

  const computed = (() => {
    try {
      let ms: number;
      if (source === "now")  ms = Date.now();
      else if (source === "unix") ms = (parseInt(unix)||0) * (unix.length > 10 ? 1 : 1000);
      else ms = new Date(iso).getTime();
      if (isNaN(ms)) return null;
      const d = new Date(ms);
      return {
        unix_s:   Math.floor(ms/1000),
        unix_ms:  ms,
        iso:      d.toISOString(),
        utc:      d.toUTCString(),
        local:    d.toLocaleString("en-GB", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, dateStyle: "full", timeStyle: "long" }),
        relative: relativeTime(ms),
        weekday:  d.toLocaleDateString("en-GB", { weekday: "long" }),
        week:     getWeekNumber(d),
      };
    } catch { return null; }
  })();

  const refreshNow = () => {
    const n = Math.floor(Date.now()/1000);
    setUnix(String(n));
    setIso(new Date(n*1000).toISOString());
    setSource("now");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={refreshNow}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Use Now
        </button>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Unix Timestamp (seconds)</label>
          <input value={unix} onChange={e => { setUnix(e.target.value); setSource("unix"); }}
            className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/8 outline-none font-mono focus:border-primary/40 transition-colors"
            style={{ background: "rgba(6,14,36,0.6)" }}
            placeholder="e.g. 1700000000"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">ISO 8601</label>
        <input value={iso} onChange={e => { setIso(e.target.value); setSource("iso"); }}
          className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/8 outline-none font-mono focus:border-primary/40 transition-colors"
          style={{ background: "rgba(6,14,36,0.6)" }}
          placeholder="e.g. 2024-11-14T22:13:20.000Z"
        />
      </div>

      {computed && (
        <div className="space-y-2">
          {[
            { label: "Unix (s)",    val: String(computed.unix_s),  id: "us", color: "primary"  },
            { label: "Unix (ms)",   val: String(computed.unix_ms), id: "um", color: "sky"      },
            { label: "ISO 8601",    val: computed.iso,             id: "is", color: "violet"   },
            { label: "UTC String",  val: computed.utc,             id: "ut", color: "amber"    },
            { label: "Local",       val: computed.local,           id: "lo", color: "emerald"  },
            { label: "Relative",    val: computed.relative,        id: "re", color: "muted"    },
            { label: "Weekday",     val: `${computed.weekday} · Week ${computed.week}`, id: "wd", color: "muted" },
          ].map(({ label, val, id, color }) => (
            <div key={id} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{ background: "rgba(6,14,36,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-[10px] font-semibold text-muted-foreground w-20 flex-shrink-0">{label}</span>
              <span className={`text-xs font-mono flex-1 ${color === "muted" ? "text-muted-foreground" : `text-${color === "primary" ? "primary" : color+"-400"}`}`}>{val}</span>
              <CopyBtn text={val} id={id} copied={copied} copy={copy} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function relativeTime(ms: number) {
  const d = Date.now() - ms;
  const abs = Math.abs(d);
  const future = d < 0;
  if (abs < 60000)   return `${future ? "in " : ""}${Math.round(abs/1000)}s${future ? "" : " ago"}`;
  if (abs < 3600000) return `${future ? "in " : ""}${Math.round(abs/60000)}min${future ? "" : " ago"}`;
  if (abs < 86400000) return `${future ? "in " : ""}${Math.round(abs/3600000)}h${future ? "" : " ago"}`;
  return `${future ? "in " : ""}${Math.round(abs/86400000)}d${future ? "" : " ago"}`;
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
}

/* ─── Main DevKit Component ──────────────────────────────────────────────── */
export default function DevKit() {
  const [activeTool, setActiveTool] = useState<SubTool>("json");
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeData = SUB_TOOLS.find(t => t.id === activeTool)!;

  const content = {
    json:   <JsonTool />,
    encode: <EncodeTool />,
    hash:   <HashTool />,
    regex:  <RegexTool />,
    color:  <ColorTool />,
    time:   <TimeTool />,
  }[activeTool];

  return (
    <div className="space-y-5">
      {/* ── Sub-tool selector (desktop: horizontal pills, mobile: dropdown) ── */}

      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <button onClick={() => setMobileOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-card text-sm font-medium text-foreground"
        >
          <div className="flex items-center gap-2">
            <activeData.icon className="w-4 h-4 text-primary" />
            {activeData.label}
            <span className="text-[10px] text-muted-foreground">· {activeData.desc}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-1 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {SUB_TOOLS.map(t => (
                <button key={t.id} onClick={() => { setActiveTool(t.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${activeTool === t.id ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
                >
                  <t.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">{t.desc}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop pills */}
      <div className="hidden sm:flex flex-wrap gap-1.5">
        {SUB_TOOLS.map(t => {
          const isActive = activeTool === t.id;
          return (
            <motion.button key={t.id} onClick={() => setActiveTool(t.id)}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-colors duration-200 ${
                isActive ? "border-primary/40" : "glass-card hover:border-primary/20"
              }`}
              style={isActive ? { background: "linear-gradient(135deg,rgba(67,97,238,0.16),rgba(14,165,233,0.06))", boxShadow: "0 0 16px rgba(67,97,238,0.15)" } : {}}
            >
              <t.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-semibold text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</span>
              <span className="text-[10px] text-muted-foreground hidden lg:inline">{t.desc}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Tool content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTool}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
