import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Plus, Edit2, Trash2, Eye, EyeOff, Save, X,
  FileText, Globe, Clock, Calendar, CheckCircle2, AlertCircle,
  LogOut, Zap,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
  tags: "", coverImage: "", author: "Saim",
  status: "draft", scheduledAt: "",
};

const CATEGORIES = ["general", "engineering", "academic", "tech", "tools", "career", "research"];
const STATUS_MAP: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  draft:     { label: "Draft",     icon: FileText,      color: "text-muted-foreground" },
  published: { label: "Published", icon: Globe,         color: "text-emerald-400" },
  scheduled: { label: "Scheduled", icon: Clock,         color: "text-amber-400" },
};

/* ── Auth helpers ─────────────────────────────────────────────────────────── */
const TOKEN_KEY = "saim_admin_token";
const getToken  = () => localStorage.getItem(TOKEN_KEY) ?? "";
const setToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function AdminPanel() {
  const [authed,    setAuthed]    = useState(!!getToken());
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loginErr,  setLoginErr]  = useState("");
  const [loginLoad, setLoginLoad] = useState(false);
  const [editing,   setEditing]   = useState<number | null>(null);
  const [creating,  setCreating]  = useState(false);
  const [form,      setForm]      = useState<BlogForm>(EMPTY_FORM);
  const [saveMsg,   setSaveMsg]   = useState("");
  const [deleteId,  setDeleteId]  = useState<number | null>(null);

  const qc = useQueryClient();

  /* ── Login ──────────────────────────────────────────────────────────────── */
  const handleLogin = useCallback(async () => {
    setLoginLoad(true); setLoginErr("");
    try {
      const res  = await fetch(`${BASE}/api/admin/login`, {
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
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-blogs"] }); void qc.invalidateQueries({ queryKey: ["blogs"] }); resetForm(); setSaveMsg("Blog created!"); setTimeout(() => setSaveMsg(""), 3000); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, f }: { id: number; f: BlogForm }) => {
      const res = await apiFetch(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(f) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-blogs"] }); void qc.invalidateQueries({ queryKey: ["blogs"] }); resetForm(); setSaveMsg("Blog updated!"); setTimeout(() => setSaveMsg(""), 3000); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiFetch(`/admin/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-blogs"] }); void qc.invalidateQueries({ queryKey: ["blogs"] }); setDeleteId(null); },
  });

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); setCreating(false); };
  const openEdit  = (b: Blog) => {
    setForm({
      title: b.title, excerpt: b.excerpt, content: b.content,
      category: b.category, tags: b.tags, coverImage: b.coverImage ?? "",
      author: b.author, status: b.status as BlogForm["status"],
      scheduledAt: b.scheduledAt ? b.scheduledAt.slice(0,16) : "",
    });
    setEditing(b.id); setCreating(false);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setSaveMsg("Title, excerpt and content are required."); setTimeout(() => setSaveMsg(""), 3000); return;
    }
    if (editing !== null) updateMut.mutate({ id: editing, f: form });
    else createMut.mutate(form);
  };

  const formPanel = creating || editing !== null;

  /* ── Login screen ────────────────────────────────────────────────────────── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl p-8 space-y-6"
          style={{ background: "rgba(10,16,40,0.9)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
        >
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5 glow-blue">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">SaimServices Admin</h1>
            <p className="text-sm text-muted-foreground">Enter your password to manage content</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter password"
                className="w-full bg-muted/40 text-foreground text-sm rounded-xl pl-11 pr-10 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                style={{ background: "rgba(6,14,36,0.6)" }}
              />
              <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {loginErr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-3 py-2.5"
              >
                <AlertCircle className="w-3.5 h-3.5" /> {loginErr}
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleLogin} disabled={loginLoad || !password}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginLoad ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Lock className="w-4 h-4" />}
            {loginLoad ? "Signing in…" : "Sign In"}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Admin dashboard ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: "rgba(8,12,28,0.97)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">SaimServices</span>
              <span className="text-xs text-primary font-semibold ml-2 px-1.5 py-0.5 rounded bg-primary/15">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-xs font-medium flex items-center gap-1.5 ${saveMsg.includes("required") ? "text-red-400" : "text-emerald-400"}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveMsg}
              </motion.span>
            )}
            <a href="/blog" target="_blank" rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" /> View Blog
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/8 border border-white/8 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Blog Manager</h1>
            <p className="text-sm text-muted-foreground">{blogs.length} article{blogs.length !== 1 ? "s" : ""} total</p>
          </div>
          <button onClick={() => { resetForm(); setCreating(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* ── Blog list ──────────────────────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-3">
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
              const st = STATUS_MAP[b.status] ?? STATUS_MAP.draft;
              const Icon = st.icon;
              const isActive = editing === b.id;
              return (
                <motion.div key={b.id} layout
                  className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 ${isActive ? "border-primary/40" : "hover:border-white/15"}`}
                  style={{
                    background: isActive ? "rgba(67,97,238,0.08)" : "rgba(10,16,40,0.6)",
                    border: `1px solid ${isActive ? "rgba(67,97,238,0.35)" : "rgba(255,255,255,0.07)"}`,
                  }}
                  onClick={() => openEdit(b)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${st.color}`}>
                          <Icon className="w-2.5 h-2.5" />{st.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 capitalize">{b.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate mb-1">{b.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{b.excerpt}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <button onClick={e => { e.stopPropagation(); openEdit(b); }}
                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(b.id); }}
                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/8 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Editor ────────────────────────────────────────────────────── */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              {formPanel ? (
                <motion.div key="editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-3xl"
                  style={{ background: "rgba(10,16,40,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Editor header */}
                  <div className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <h2 className="text-base font-bold text-foreground">
                      {editing !== null ? "Edit Post" : "New Post"}
                    </h2>
                    <button onClick={resetForm} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
                      <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Beam Design in Eurocode 3 — A Practical Guide"
                        className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Excerpt * <span className="text-muted-foreground/40">(shown on blog listing)</span></label>
                      <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                        placeholder="A concise summary of what this article covers…"
                        rows={3}
                        className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none resize-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Content * <span className="text-muted-foreground/40">(HTML or Markdown supported)</span>
                      </label>
                      <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder={`# Introduction\n\nStart writing your article here...\n\n## Section 1\n\nParagraph text goes here.\n\n- Bullet point\n- Another point\n\n**Bold text**, *italic text*, \`code snippet\``}
                        rows={14}
                        className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none resize-y font-mono focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Row: Category + Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-3 py-3 border border-white/10 outline-none focus:border-primary/40 capitalize transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BlogForm["status"] }))}
                          className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-3 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>

                    {/* Scheduled date — only when status = scheduled */}
                    <AnimatePresence>
                      {form.status === "scheduled" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div>
                            <label className="text-xs font-medium text-amber-400 flex items-center gap-1.5 mb-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Publish Date & Time
                            </label>
                            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                              className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-amber-400/25 outline-none focus:border-amber-400/40 transition-colors"
                              style={{ background: "rgba(6,14,36,0.6)", colorScheme: "dark" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Row: Author + Cover image */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Author</label>
                        <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                          className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Cover Image URL</label>
                        <input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                          style={{ background: "rgba(6,14,36,0.6)" }}
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags <span className="text-muted-foreground/40">(comma-separated)</span></label>
                      <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="eurocode, beam design, structural engineering"
                        className="w-full bg-muted/40 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/40 transition-colors"
                        style={{ background: "rgba(6,14,36,0.6)" }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                      >
                        {(createMut.isPending || updateMut.isPending)
                          ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          : <Save className="w-4 h-4" />
                        }
                        {editing !== null ? "Save Changes" : "Publish Draft"}
                      </button>
                      <button onClick={resetForm} className="px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty-editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-64 rounded-3xl flex flex-col items-center justify-center text-center"
                  style={{ background: "rgba(10,16,40,0.4)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <FileText className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">Select a post to edit or create a new one</p>
                  <button onClick={() => { resetForm(); setCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/25 text-sm font-semibold hover:bg-primary/25 transition-all"
                  >
                    <Plus className="w-4 h-4" /> New Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
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
                  <h3 className="font-bold text-foreground">Delete Post</h3>
                  <p className="text-xs text-muted-foreground">This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleteMut.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
