import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Plus, Edit2, Trash2, Eye, EyeOff, Save, X,
  FileText, Globe, Clock, Calendar, CheckCircle2, AlertCircle,
  LogOut, Zap, Bold, Italic, List, Link2, Code, Heading2,
  Heading3, Image as ImageIcon, ListOrdered, SplitSquareHorizontal,
  PenLine, CloudCheck, BookOpen, Users, Cpu, Star,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const AUTOSAVE_KEY = "saim_admin_draft";
const TOKEN_KEY    = "saim_admin_token";

interface Blog {
  id: number; title: string; slug: string; excerpt: string; content: string;
  category: string; tags: string; coverImage: string | null;
  author: string; readTime: number; status: string;
  scheduledAt: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string;
}

type BlogForm = {
  title: string; excerpt: string; content: string; category: string;
  tags: string; coverImage: string; author: string;
  status: "draft" | "published" | "scheduled"; scheduledAt: string;
};

const EMPTY_FORM: BlogForm = {
  title: "", excerpt: "", content: "", category: "general",
  tags: "", coverImage: "", author: "Saim", status: "draft", scheduledAt: "",
};

const CATEGORIES = ["general", "engineering", "academic", "tech", "tools", "career", "research"];

const STATUS_MAP: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  draft:     { label: "Draft",     icon: FileText, color: "text-muted-foreground" },
  published: { label: "Published", icon: Globe,    color: "text-emerald-400" },
  scheduled: { label: "Scheduled", icon: Clock,    color: "text-amber-400" },
};

const getToken   = () => localStorage.getItem(TOKEN_KEY) ?? "";
const setToken   = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
}

/* ── Markdown → HTML renderer (safe subset) ─────────────────────────────── */
function renderContent(content: string): string {
  if (!content) return "";
  if (content.trim().startsWith("<")) {
    /* Admin-authored HTML: strip dangerous tags/attrs before preview rendering */
    return content
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
  }
  return content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3 style='color:#e2e8f0;font-size:1.05rem;font-weight:700;margin:1.5rem 0 0.5rem'>$1</h3>")
    .replace(/^## (.+)$/gm,  "<h2 style='color:#e2e8f0;font-size:1.2rem;font-weight:700;margin:2rem 0 0.75rem'>$1</h2>")
    .replace(/^# (.+)$/gm,   "<h1 style='color:#e2e8f0;font-size:1.5rem;font-weight:800;margin:2rem 0 1rem'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:#e2e8f0;font-weight:700'>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:rgba(67,97,238,0.12);color:#93c5fd;padding:1px 6px;border-radius:4px;font-size:0.85em;font-family:monospace'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' style='color:#60a5fa;text-decoration:underline' target='_blank' rel='noreferrer'>$1</a>")
    .replace(/^- (.+)$/gm, "<li style='margin:0.25rem 0;padding-left:0.5rem'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li style='margin:0.25rem 0;padding-left:0.5rem'>$2</li>")
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style='margin:0.75rem 0 0.75rem 1.5rem;list-style:disc'>${m}</ul>`)
    .replace(/\n\n+/g, "</p><p style='margin:0.75rem 0'>")
    .replace(/^(<p)/, "<p style='margin:0.75rem 0'")
    .replace(/\n/g, "<br/>");
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ── Admin Panel ─────────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const [authed,      setAuthed]      = useState(!!getToken());
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loginErr,    setLoginErr]    = useState("");
  const [loginLoad,   setLoginLoad]   = useState(false);
  const [editing,     setEditing]     = useState<number | null>(null);
  const [creating,    setCreating]    = useState(false);
  const [form,        setForm]        = useState<BlogForm>(EMPTY_FORM);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [deleteId,    setDeleteId]    = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [autosaved,   setAutosaved]   = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const qc = useQueryClient();

  /* ── Autosave / restore ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!creating && editing === null) return;
    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(form));
      setAutosaved(true);
      setTimeout(() => setAutosaved(false), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [form, creating, editing]);

  const restoreAutosave = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        setForm(JSON.parse(saved) as BlogForm);
        setEditing(null);
        setCreating(true);
        setShowPreview(false);
      }
    } catch { /* ignore */ }
  };

  /* ── Word count ────────────────────────────────────────────────────────── */
  const words   = useMemo(() => wordCount(form.content), [form.content]);
  const readMin = useMemo(() => Math.max(1, Math.ceil(words / 200)), [words]);

  /* ── Login ──────────────────────────────────────────────────────────────── */
  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoginLoad(true); setLoginErr("");
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setLoginErr("Wrong password. Try again."); setLoginLoad(false); return; }
      const data = await res.json() as { token: string };
      setToken(data.token);
      setAuthed(true);
    } catch {
      setLoginErr("Connection error. Is the server running?");
    }
    setLoginLoad(false);
  }, [password]);

  const handleLogout = useCallback(async () => {
    await apiFetch("/admin/logout", { method: "POST" });
    clearToken();
    setAuthed(false);
    setPassword("");
  }, []);

  /* ── Blog queries ────────────────────────────────────────────────────────── */
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["admin-blogs"],
    queryFn:  async () => {
      const res = await apiFetch("/admin/blogs");
      if (res.status === 401) { clearToken(); setAuthed(false); return []; }
      return res.json() as Promise<Blog[]>;
    },
    enabled: authed,
  });

  const createMut = useMutation({
    mutationFn: async (f: BlogForm) => {
      const res = await apiFetch("/admin/blogs", { method: "POST", body: JSON.stringify(f) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      void qc.invalidateQueries({ queryKey: ["blogs"] });
      localStorage.removeItem(AUTOSAVE_KEY);
      resetForm();
      setSaveMsg("Post created!");
      setTimeout(() => setSaveMsg(""), 3000);
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, f }: { id: number; f: BlogForm }) => {
      const res = await apiFetch(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(f) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      void qc.invalidateQueries({ queryKey: ["blogs"] });
      localStorage.removeItem(AUTOSAVE_KEY);
      resetForm();
      setSaveMsg("Post updated!");
      setTimeout(() => setSaveMsg(""), 3000);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/admin/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      void qc.invalidateQueries({ queryKey: ["blogs"] });
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(false);
    setShowPreview(false);
  };

  const openEdit = (b: Blog) => {
    setForm({
      title: b.title, excerpt: b.excerpt, content: b.content,
      category: b.category, tags: b.tags, coverImage: b.coverImage ?? "",
      author: b.author, status: b.status as BlogForm["status"],
      scheduledAt: b.scheduledAt ? b.scheduledAt.slice(0, 16) : "",
    });
    setEditing(b.id);
    setCreating(false);
    setShowPreview(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setSaveMsg("Title, excerpt and content are required.");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    if (editing !== null) updateMut.mutate({ id: editing, f: form });
    else createMut.mutate(form);
  };

  /* ── Formatting toolbar ──────────────────────────────────────────────────── */
  const insertFormat = (prefix: string, suffix: string, placeholder: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.slice(start, end) || placeholder;
    const before = el.value.slice(0, start);
    const after  = el.value.slice(end);
    const newVal = `${before}${prefix}${sel}${suffix}${after}`;
    setForm(f => ({ ...f, content: newVal }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
    });
  };

  const insertLine = (linePrefix: string, placeholder: string) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = el.value.lastIndexOf("\n", start - 1) + 1;
    const before    = el.value.slice(0, lineStart);
    const rest      = el.value.slice(lineStart);
    const newVal = `${before}${linePrefix}${placeholder}\n${rest}`;
    setForm(f => ({ ...f, content: newVal }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = lineStart + linePrefix.length + placeholder.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const TOOLBAR: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; action: () => void }> = [
    { icon: Bold,         label: "Bold",       action: () => insertFormat("**", "**", "bold text") },
    { icon: Italic,       label: "Italic",     action: () => insertFormat("*", "*", "italic text") },
    { icon: Heading2,     label: "Heading 2",  action: () => insertLine("## ", "Section title") },
    { icon: Heading3,     label: "Heading 3",  action: () => insertLine("### ", "Sub-section") },
    { icon: List,         label: "Bullet",     action: () => insertLine("- ", "List item") },
    { icon: ListOrdered,  label: "Numbered",   action: () => insertLine("1. ", "List item") },
    { icon: Link2,        label: "Link",       action: () => insertFormat("[", "](url)", "link text") },
    { icon: Code,         label: "Inline code",action: () => insertFormat("`", "`", "code") },
    { icon: ImageIcon,    label: "Image",      action: () => insertLine("![Alt text](", "https://image-url.jpg)") },
  ];

  const formPanel = creating || editing !== null;

  /* ══════════════════════════════════════════════════════════════════════════
   *  LOGIN SCREEN
   * ══════════════════════════════════════════════════════════════════════════ */
  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">

        {/* ── Left branding panel (desktop only) ───────────────────────── */}
        <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 flex-col justify-between p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(67,97,238,0.12) 0%, rgba(14,165,233,0.05) 50%, rgba(8,12,28,0.98) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Background glows */}
          <div className="absolute top-20 left-10 w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(67,97,238,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-20 right-0 w-[250px] h-[250px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 70%)" }} />

          {/* Logo */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">SaimServices</span>
                <div className="text-[10px] text-primary font-semibold tracking-widest uppercase">Admin Console</div>
              </div>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold text-foreground font-display leading-tight mb-4">
              Manage your<br />
              <span className="gradient-text-blue">content platform</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs">
              Full control over your blog, articles, and content. Write in Markdown with live preview, schedule posts, and publish to your global audience.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                { icon: PenLine,   label: "Rich Markdown editor with live preview" },
                { icon: CloudCheck,label: "Autosave — never lose your work" },
                { icon: Calendar,  label: "Schedule posts for future publish dates" },
                { icon: BookOpen,  label: "Formatting toolbar for quick markdown" },
                { icon: Star,      label: "Draft, publish, or schedule workflow" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Stats footer */}
          <div className="relative flex items-center gap-6">
            {[
              { icon: Users,  val: "10K+", label: "Monthly readers" },
              { icon: Cpu,    val: "10+",  label: "Tools published" },
              { icon: Globe,  val: "50+",  label: "Countries reached" },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-bold text-foreground">{val}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right login panel ────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 lg:py-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">SaimServices</span>
                <div className="text-[10px] text-primary font-semibold tracking-widest uppercase">Admin Console</div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Enter your admin password to access the content dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="w-full text-foreground text-sm rounded-xl pl-11 pr-11 py-3.5 border border-white/10 outline-none focus:border-primary/50 transition-colors"
                    style={{ background: "rgba(6,14,36,0.8)" }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {loginErr && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 text-xs text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-3 py-3"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loginErr}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loginLoad || !password}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                {loginLoad
                  ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <Lock className="w-4 h-4" />
                }
                {loginLoad ? "Signing in…" : "Sign In to Admin"}
              </button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Set <code className="text-primary/80 bg-primary/8 px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code> in your environment Secrets to configure the admin password.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
   *  ADMIN DASHBOARD
   * ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: "rgba(8,12,28,0.97)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">SaimServices</span>
              <span className="text-[10px] text-primary font-semibold px-1.5 py-0.5 rounded bg-primary/15 tracking-wide">ADMIN</span>
            </div>
            <span className="hidden sm:block text-muted-foreground/20 text-xs">|</span>
            <span className="hidden sm:block text-xs text-muted-foreground">Blog Manager</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AnimatePresence>
              {autosaved && (
                <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-[10px] text-emerald-400 flex items-center gap-1 hidden sm:flex"
                >
                  <CloudCheck className="w-3 h-3" /> Draft saved
                </motion.span>
              )}
              {saveMsg && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`text-xs font-medium flex items-center gap-1.5 ${saveMsg.includes("required") ? "text-red-400" : "text-emerald-400"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saveMsg}
                </motion.span>
              )}
            </AnimatePresence>

            <a href="/blog" target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Globe className="w-3.5 h-3.5" /> View Blog
            </a>

            {localStorage.getItem(AUTOSAVE_KEY) && !formPanel && (
              <button onClick={restoreAutosave}
                className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-400/20 px-2.5 py-1.5 rounded-lg hover:bg-amber-400/5 transition-all"
              >
                <CloudCheck className="w-3 h-3" /> Restore draft
              </button>
            )}

            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/8 border border-white/8 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {blogs.length} post{blogs.length !== 1 ? "s" : ""} · {blogs.filter(b => b.status === "published").length} published
            </p>
          </div>
          <button onClick={() => { resetForm(); setCreating(true); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Post</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-6">
          {/* ── Post list ─────────────────────────────────────────────────── */}
          <div className="space-y-2.5 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:pr-1">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            )}
            {!isLoading && blogs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground rounded-2xl glass-card">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No posts yet — create your first!</p>
              </div>
            )}
            {blogs.map(b => {
              const st     = STATUS_MAP[b.status] ?? STATUS_MAP.draft;
              const Icon   = st.icon;
              const active = editing === b.id;
              return (
                <motion.div key={b.id} layout
                  className="rounded-2xl p-3.5 cursor-pointer transition-all duration-200"
                  style={{
                    background: active ? "rgba(67,97,238,0.08)" : "rgba(10,16,40,0.6)",
                    border: `1px solid ${active ? "rgba(67,97,238,0.35)" : "rgba(255,255,255,0.07)"}`,
                  }}
                  onClick={() => openEdit(b)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${st.color}`}>
                          <Icon className="w-2.5 h-2.5" />{st.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 capitalize">{b.category}</span>
                        <span className="text-[10px] text-muted-foreground/40">{b.readTime}m</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{b.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{b.excerpt}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <button onClick={e => { e.stopPropagation(); openEdit(b); }}
                        className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-primary hover:bg-primary/10 transition-all"
                      ><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(b.id); }}
                        className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/8 transition-all"
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Editor ────────────────────────────────────────────────────── */}
          <div>
            <AnimatePresence mode="wait">
              {formPanel ? (
                <motion.div key="editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-3xl"
                  style={{ background: "rgba(10,16,40,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Editor header */}
                  <div className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-primary" />
                      {editing !== null ? "Edit Post" : "New Post"}
                    </h2>
                    <div className="flex items-center gap-2">
                      {/* Save button (in header for quick access) */}
                      <button type="button" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
                      >
                        {(createMut.isPending || updateMut.isPending)
                          ? <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          : <Save className="w-3 h-3" />
                        }
                        <span className="hidden sm:inline">{editing !== null ? "Save" : "Create"}</span>
                      </button>
                      <button type="button" onClick={resetForm} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
                      <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Beam Design in Eurocode 3 — A Practical Guide"
                        className="w-full text-foreground text-sm font-semibold rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Excerpt * <span className="text-muted-foreground/40">(shown on listing card)</span>
                      </label>
                      <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                        placeholder="A concise summary of what this article covers…"
                        rows={2}
                        className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none resize-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Content editor + preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          Content *
                          {words > 0 && (
                            <span className="text-muted-foreground/50 font-normal">
                              {words} words · ~{readMin} min read
                            </span>
                          )}
                        </label>
                        <button type="button" onClick={() => setShowPreview(s => !s)}
                          className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                            showPreview
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-white/10 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {showPreview ? <PenLine className="w-3 h-3" /> : <SplitSquareHorizontal className="w-3 h-3" />}
                          <span className="hidden sm:inline">{showPreview ? "Write" : "Preview"}</span>
                        </button>
                      </div>

                      {/* Formatting toolbar */}
                      {!showPreview && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {TOOLBAR.map(({ icon: Icon, label, action }) => (
                            <button key={label} type="button" onClick={action} title={label}
                              className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/8 border border-transparent hover:border-white/10 transition-all text-[10px] flex items-center gap-1"
                            >
                              <Icon className="w-3 h-3" />
                            </button>
                          ))}
                          <span className="text-muted-foreground/20 self-center px-1 text-xs">|</span>
                          <span className="text-[10px] text-muted-foreground/30 self-center">Markdown supported</span>
                        </div>
                      )}

                      {/* Editor / Preview split */}
                      <div className={showPreview ? "" : "xl:grid xl:grid-cols-2 xl:gap-4"}>
                        {!showPreview && (
                          <textarea
                            ref={contentRef}
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            placeholder={`# Introduction\n\nStart writing your article here...\n\n## Section 1\n\nParagraph text goes here.\n\n- Bullet point\n- Another point\n\n**Bold text**, *italic text*, \`code snippet\`, [link](url)`}
                            rows={16}
                            className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none resize-y font-mono focus:border-primary/40 transition-colors"
                            style={{ background: "rgba(6,14,36,0.6)" }}
                          />
                        )}
                        {/* Preview panel — hidden on mobile when in write mode, always visible on xl+, full-width when toggle is on */}
                        <div className={`rounded-xl p-4 overflow-auto ${showPreview ? "" : "hidden xl:block"}`}
                          style={{
                            background: "rgba(6,14,36,0.4)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            minHeight: "16rem",
                            maxHeight: "32rem",
                          }}
                        >
                          <div className="text-[10px] text-muted-foreground/40 mb-2 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                            <Eye className="w-3 h-3" /> Preview
                          </div>
                          {form.content ? (
                            <div
                              className="prose prose-invert prose-xs max-w-none text-sm"
                              style={{ color: "rgba(203,213,225,0.85)", lineHeight: "1.75" }}
                              dangerouslySetInnerHTML={{ __html: renderContent(form.content) }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-32 text-muted-foreground/25 text-xs">
                              Start writing to see a preview…
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row: Category + Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full text-foreground text-sm rounded-xl px-3 py-3 border border-white/10 outline-none focus:border-primary/40 capitalize transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BlogForm["status"] }))}
                          className="w-full text-foreground text-sm rounded-xl px-3 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>

                    {/* Scheduled datetime */}
                    <AnimatePresence>
                      {form.status === "scheduled" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <label className="text-xs font-medium text-amber-400 flex items-center gap-1.5 mb-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Publish Date & Time
                          </label>
                          <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                            className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-amber-400/25 outline-none focus:border-amber-400/40 transition-colors"
                            style={{ background: "rgba(6,14,36,0.6)", colorScheme: "dark" }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Row: Author + Cover image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Author</label>
                        <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                          className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Cover Image URL</label>
                        <input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        />
                        {form.coverImage && (
                          <div className="mt-2 rounded-xl overflow-hidden h-24 relative">
                            <img
                              src={form.coverImage}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Tags <span className="text-muted-foreground/40">(comma-separated)</span>
                      </label>
                      <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="eurocode, beam design, structural engineering"
                        className="w-full text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Bottom action bar */}
                    <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                      >
                        {(createMut.isPending || updateMut.isPending)
                          ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          : <Save className="w-4 h-4" />
                        }
                        {editing !== null ? "Save Changes" : "Create Post"}
                      </button>
                      <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                      </button>
                      {words > 0 && (
                        <span className="ml-auto text-[10px] text-muted-foreground/40">
                          {words} words · ~{readMin} min read
                        </span>
                      )}
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-3xl flex flex-col items-center justify-center text-center py-20"
                  style={{ background: "rgba(10,16,40,0.3)", border: "1px dashed rgba(255,255,255,0.08)" }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <PenLine className="w-8 h-8 text-primary/30" />
                  </div>
                  <p className="text-base font-semibold text-foreground/40 mb-2">No post selected</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">Click any post on the left to edit it, or create a brand new article.</p>
                  <button onClick={() => { resetForm(); setCreating(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" /> Write New Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Delete confirm dialog ────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl p-6 max-w-sm w-full space-y-4"
              style={{ background: "rgba(10,16,40,0.97)", border: "1px solid rgba(239,68,68,0.25)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Delete Post</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleteMut.isPending ? "Deleting…" : "Delete Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
