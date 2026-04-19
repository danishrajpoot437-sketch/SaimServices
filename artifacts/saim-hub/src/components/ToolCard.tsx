import { motion } from "framer-motion";
import {
  ArrowRight, Calculator, ArrowLeftRight, Ruler, BookOpen, GraduationCap, Building2,
  FileText, Type, Hash, Newspaper, Star, Sigma, BarChart2, FlaskConical, TrendingUp,
  Atom, Layers, Terminal, Zap, Palette, Triangle, Percent, CalendarDays, Quote,
  Search, AlignLeft,
} from "lucide-react";
import { useUserData } from "@/context/UserDataContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator, ArrowLeftRight, Ruler, BookOpen, GraduationCap, Building2,
  FileText, Type, Hash, Newspaper, Sigma, BarChart2, FlaskConical, TrendingUp,
  Atom, Layers, Terminal, Zap, Palette, Triangle, Percent, CalendarDays, Quote,
  Search, AlignLeft,
};

const categoryColors: Record<string, string> = {
  Engineering: "text-[#4361ee] bg-[#4361ee]/10 border-[#4361ee]/25",
  Academic: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  Content: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  News: "text-purple-400 bg-purple-400/10 border-purple-400/25",
};

const categoryGlows: Record<string, string> = {
  Engineering: "rgba(67,97,238,0.18)",
  Academic: "rgba(52,211,153,0.15)",
  Content: "rgba(251,191,36,0.15)",
  News: "rgba(167,139,250,0.15)",
};

const categoryIconBg: Record<string, string> = {
  Engineering: "bg-[#4361ee]/15 group-hover:bg-[#4361ee]/28",
  Academic: "bg-emerald-400/12 group-hover:bg-emerald-400/25",
  Content: "bg-amber-400/12 group-hover:bg-amber-400/25",
  News: "bg-purple-400/12 group-hover:bg-purple-400/25",
};

const categoryIconColor: Record<string, string> = {
  Engineering: "text-[#4361ee]",
  Academic: "text-emerald-400",
  Content: "text-amber-400",
  News: "text-purple-400",
};

interface ToolCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  sectionId: string;
  tab?: string;
  index?: number;
}

export default function ToolCard({ id, name, category, description, icon, sectionId, tab, index = 0 }: ToolCardProps) {
  const { isFavorite, toggleFavorite, trackUse } = useUserData();
  const fav = isFavorite(id);
  const IconComp = iconMap[icon] || Calculator;
  const glowColor = categoryGlows[category] || categoryGlows.Engineering;
  const iconBg = categoryIconBg[category] || categoryIconBg.Engineering;
  const iconColor = categoryIconColor[category] || categoryIconColor.Engineering;

  const handleClick = () => {
    trackUse(id);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    if (tab) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("saim-section-tab", { detail: { section: sectionId, tab } }));
      }, 200);
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };
  const handleFavKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.currentTarget === e.target && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleClick(); } }}
      className="glass-card rounded-2xl p-6 text-left group cursor-pointer tool-card-hover w-full spotlight-card relative outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      whileHover={{
        scale: 1.025,
        y: -4,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 28px ${glowColor}, 0 16px 48px rgba(0,0,0,0.35)`,
        transition: { type: "spring", stiffness: 350, damping: 22 },
      }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      data-testid={`tool-card-${id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${iconBg}`}
          whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
        >
          <IconComp className={`w-5 h-5 ${iconColor}`} />
        </motion.div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleFav}
            onKeyDown={handleFavKey}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              fav ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                  : "text-muted-foreground/40 hover:text-amber-400 hover:bg-amber-400/8 opacity-0 group-hover:opacity-100"
            }`}
            title={fav ? "Remove from favorites" : "Add to favorites"}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            data-testid={`fav-btn-${id}`}
          >
            <Star className={`w-3.5 h-3.5 ${fav ? "fill-amber-400" : ""}`} />
          </button>
          <motion.div
            className="w-6 h-6 flex items-center justify-center"
            animate={{ x: 0, opacity: 0.4 }}
            whileHover={{ x: 3, opacity: 1 }}
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </motion.div>
        </div>
      </div>

      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border mb-3 ${categoryColors[category] || categoryColors.Engineering}`}>
        {category}
      </span>
      <h3 className="font-semibold text-foreground mb-2 text-sm leading-snug group-hover:text-white transition-colors duration-200">{name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-200">{description}</p>

      <motion.div
        className="absolute bottom-0 left-4 right-4 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor.replace(')', ', 0.6)').replace('rgba', 'rgba')}, transparent)` }}
        initial={{ opacity: 0, scaleX: 0 }}
        whileHover={{ opacity: 1, scaleX: 1, transition: { duration: 0.3 } }}
      />
    </motion.div>
  );
}
