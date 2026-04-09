import { motion } from "framer-motion";
import { ArrowRight, Calculator, ArrowLeftRight, Ruler, BookOpen, GraduationCap, Building2, FileText, Type, Hash, Newspaper } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  ArrowLeftRight,
  Ruler,
  BookOpen,
  GraduationCap,
  Building2,
  FileText,
  Type,
  Hash,
  Newspaper,
};

const categoryColors: Record<string, string> = {
  Engineering: "text-[#4361ee] bg-[#4361ee]/10 border-[#4361ee]/20",
  Academic: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Content: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  News: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

interface ToolCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  sectionId: string;
  index?: number;
}

export default function ToolCard({ id, name, category, description, icon, sectionId, index = 0 }: ToolCardProps) {
  const IconComp = iconMap[icon] || Calculator;

  const handleClick = () => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={handleClick}
      className="glass-card rounded-2xl p-6 text-left group cursor-pointer tool-card-hover w-full"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.99 }}
      data-testid={`tool-card-${id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
          <IconComp className="w-5 h-5 text-primary" />
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border mb-3 ${categoryColors[category] || categoryColors.Engineering}`}>
        {category}
      </span>
      <h3 className="font-semibold text-foreground mb-2 text-sm leading-snug">{name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}
