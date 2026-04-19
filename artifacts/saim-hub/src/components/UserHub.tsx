import { motion } from "framer-motion";
import { Star, Clock, Trash2, ArrowRight } from "lucide-react";
import { useUserData } from "@/context/UserDataContext";
import { useAuth } from "@/context/AuthContext";
import { toolsData, type Tool } from "@/data/toolsData";

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000)    return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

function navigateTool(tool: Tool) {
  const el = document.getElementById(tool.sectionId);
  if (el) el.scrollIntoView({ behavior: "smooth" });
  if (tool.tab) {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("saim-section-tab", { detail: { section: tool.sectionId, tab: tool.tab } }));
    }, 200);
  }
}

const toolMap = new Map(toolsData.map(t => [t.id, t]));

export default function UserHub() {
  const { user } = useAuth();
  const { favorites, recents, toggleFavorite, clearRecents } = useUserData();

  if (!user) return null;
  if (favorites.length === 0 && recents.length === 0) return null;

  const favTools    = favorites.map(id => toolMap.get(id)).filter((t): t is Tool => !!t);
  const recentTools = recents.map(r => ({ ...r, tool: toolMap.get(r.toolId) })).filter(r => !!r.tool);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(145deg, rgba(14,20,55,0.8) 0%, rgba(10,16,42,0.9) 100%)",
            border: "1px solid rgba(67,97,238,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 40px rgba(67,97,238,0.08), 0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">Your Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Welcome back, <span className="gradient-text-blue">{user.name.split(" ")[0]}</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Pick up where you left off.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Favorites */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold text-foreground">Favorites</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-muted-foreground">{favTools.length}</span>
                </div>
              </div>
              {favTools.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">Bookmark tools using the star icon to pin them here.</p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {favTools.slice(0, 5).map(tool => (
                    <li key={tool.id}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-primary/25 transition-all group"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => navigateTool(tool)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateTool(tool); } }}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
                        data-testid={`fav-${tool.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.category}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <button
                        onClick={() => toggleFavorite(tool.id)}
                        className="p-1.5 rounded-md text-amber-400 hover:bg-amber-400/10 transition-colors flex-shrink-0"
                        title="Remove from favorites"
                        aria-label={`Remove ${tool.name} from favorites`}
                        data-testid={`fav-remove-${tool.id}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recently Used */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-foreground">Recently Used</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-muted-foreground">{recentTools.length}</span>
                </div>
                {recentTools.length > 0 && (
                  <button onClick={clearRecents}
                    className="text-[10px] text-muted-foreground hover:text-rose-400 transition-colors flex items-center gap-1"
                    data-testid="btn-clear-recents"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              {recentTools.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">Tools you open will appear here.</p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {recentTools.slice(0, 5).map(({ tool, ts }) => tool && (
                    <li key={tool.id}>
                      <button
                        onClick={() => navigateTool(tool)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-primary/25 transition-all group text-left"
                        data-testid={`recent-${tool.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.category} · {timeAgo(ts)}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
