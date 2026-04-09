import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckSquare, Square, Calendar, Building2 } from "lucide-react";

type Status = "Planning" | "Applied" | "Accepted" | "Rejected" | "Waitlisted";

const statusConfig: Record<Status, { color: string; bg: string; border: string }> = {
  Planning: { color: "text-muted-foreground", bg: "bg-white/5", border: "border-white/10" },
  Applied: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  Accepted: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Rejected: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  Waitlisted: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

const docItems = ["SOP", "LOR (1)", "LOR (2)", "LOR (3)", "Transcript", "Resume", "IELTS/TOEFL", "GRE Score"];

interface University {
  id: string;
  name: string;
  country: string;
  program: string;
  deadline: string;
  status: Status;
  docs: Record<string, boolean>;
}

const STORAGE_KEY = "saimservices_universities";

function loadFromStorage(): University[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function UniversityTracker() {
  const [universities, setUniversities] = useState<University[]>(loadFromStorage);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", program: "", deadline: "", status: "Planning" as Status });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(universities));
  }, [universities]);

  const addUniversity = () => {
    if (!form.name.trim()) return;
    const newUni: University = {
      id: crypto.randomUUID(),
      ...form,
      docs: Object.fromEntries(docItems.map((d) => [d, false])),
    };
    setUniversities((prev) => [newUni, ...prev]);
    setForm({ name: "", country: "", program: "", deadline: "", status: "Planning" });
    setShowForm(false);
  };

  const removeUniversity = (id: string) => {
    setUniversities((prev) => prev.filter((u) => u.id !== id));
  };

  const updateStatus = (id: string, status: Status) => {
    setUniversities((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
  };

  const toggleDoc = (id: string, doc: string) => {
    setUniversities((prev) =>
      prev.map((u) => u.id === id ? { ...u, docs: { ...u.docs, [doc]: !u.docs[doc] } } : u)
    );
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return diff;
  };

  const stats = {
    total: universities.length,
    applied: universities.filter((u) => u.status === "Applied").length,
    accepted: universities.filter((u) => u.status === "Accepted").length,
    rejected: universities.filter((u) => u.status === "Rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Applied", value: stats.applied, color: "text-blue-400" },
          { label: "Accepted", value: stats.accepted, color: "text-emerald-400" },
          { label: "Rejected", value: stats.rejected, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm font-semibold transition-all duration-200"
        data-testid="button-add-university"
      >
        <Plus className="w-4 h-4" />
        Add University
      </button>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="University Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="e.g. MIT" testId="input-uni-name" />
                <FormInput label="Country" value={form.country} onChange={(v) => setForm((p) => ({ ...p, country: v }))} placeholder="e.g. USA" testId="input-uni-country" />
                <FormInput label="Program" value={form.program} onChange={(v) => setForm((p) => ({ ...p, program: v }))} placeholder="e.g. MS Computer Science" testId="input-uni-program" />
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                    className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50"
                    data-testid="input-uni-deadline"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(statusConfig) as Status[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, status: s }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.status === s
                          ? `${statusConfig[s].bg} ${statusConfig[s].color} ${statusConfig[s].border}`
                          : "bg-white/3 text-muted-foreground border-white/10"
                      }`}
                      data-testid={`btn-status-${s.toLowerCase()}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addUniversity}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                  data-testid="button-save-university"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-muted-foreground text-sm font-medium"
                  data-testid="button-cancel-add"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* University List */}
      {universities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No universities added yet. Click "Add University" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {universities.map((uni) => {
            const daysLeft = getDaysLeft(uni.deadline);
            const sc = statusConfig[uni.status];
            const docsCompleted = Object.values(uni.docs).filter(Boolean).length;
            return (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card rounded-2xl p-5"
                data-testid={`uni-card-${uni.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-foreground">{uni.name}</h4>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                        {uni.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uni.program}{uni.country && ` · ${uni.country}`}
                    </p>
                    {uni.deadline && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(uni.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {daysLeft !== null && (
                            <span className={`ml-1.5 font-medium ${daysLeft < 0 ? "text-red-400" : daysLeft < 30 ? "text-amber-400" : "text-emerald-400"}`}>
                              ({daysLeft < 0 ? "Expired" : `${daysLeft}d left`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeUniversity(uni.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    data-testid={`button-remove-uni-${uni.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Update */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(Object.keys(statusConfig) as Status[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(uni.id, s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        uni.status === s
                          ? `${statusConfig[s].bg} ${statusConfig[s].color} ${statusConfig[s].border}`
                          : "bg-white/3 text-muted-foreground border-white/8 hover:bg-white/8"
                      }`}
                      data-testid={`btn-update-status-${uni.id}-${s.toLowerCase()}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Document Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Documents</span>
                    <span className="text-xs text-muted-foreground">{docsCompleted}/{docItems.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docItems.map((doc) => (
                      <button
                        key={doc}
                        onClick={() => toggleDoc(uni.id, doc)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                          uni.docs[doc]
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-white/3 text-muted-foreground border-white/8 hover:bg-white/8"
                        }`}
                        data-testid={`btn-doc-${uni.id}-${doc.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {uni.docs[doc] ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                        {doc}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, testId }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; testId: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted/50 text-foreground text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
        data-testid={testId}
      />
    </div>
  );
}
