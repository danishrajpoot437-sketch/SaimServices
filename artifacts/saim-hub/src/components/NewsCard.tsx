import { useRef } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/data/newsData";

const categoryColors: Record<string, string> = {
  AI: "text-purple-400 bg-purple-400/10 border-purple-400/25",
  Tech: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  Education: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
};

const categoryGlows: Record<string, string> = {
  AI: "rgba(167,139,250,0.2)",
  Tech: "rgba(96,165,250,0.2)",
  Education: "rgba(52,211,153,0.2)",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface NewsCardProps extends NewsItem {
  index?: number;
}

export default function NewsCard({ id, category, title, summary, date, source, image, url, index = 0 }: NewsCardProps) {
  const glowColor = categoryGlows[category] || categoryGlows.Tech;
  const cardRef = useRef<HTMLElement>(null);

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      whileHover={{
        y: -6,
        transition: { type: "spring", stiffness: 350, damping: 22 },
      }}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col"
      style={{ transition: "border-color 0.25s ease, box-shadow 0.25s ease" }}
      onHoverStart={() => {
        if (!cardRef.current) return;
        cardRef.current.style.borderColor = `rgba(255,255,255,0.14)`;
        cardRef.current.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06), 0 0 28px ${glowColor}, 0 20px 60px rgba(0,0,0,0.4), 0 2px 0 rgba(255,255,255,0.07) inset`;
      }}
      onHoverEnd={() => {
        if (!cardRef.current) return;
        cardRef.current.style.borderColor = '';
        cardRef.current.style.boxShadow = '';
      }}
      data-testid={`news-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          loading="lazy"
          data-testid={`img-news-${id}`}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category badge */}
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryColors[category] || categoryColors.Tech}`}
          style={{ backdropFilter: "blur(8px)" }}
        >
          {category}
        </motion.span>

        {/* Top shine line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-base leading-snug mb-2.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">{summary}</p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">{source}</span>
            <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
          </div>
          <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link"
            whileHover={{ x: 1 }}
            data-testid={`link-read-more-${id}`}
          >
            Read More
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-150" />
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
