import { useRef } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Clock, Bookmark, BookmarkCheck, ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/data/newsData";

const categoryColors: Record<string, string> = {
  AI: "text-purple-400 bg-purple-400/10 border-purple-400/25",
  Tech: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  Engineering: "text-orange-400 bg-orange-400/10 border-orange-400/25",
  Scholarships: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Education: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
};

const categoryGlows: Record<string, string> = {
  AI: "rgba(167,139,250,0.18)",
  Tech: "rgba(96,165,250,0.18)",
  Engineering: "rgba(251,146,60,0.18)",
  Scholarships: "rgba(251,191,36,0.18)",
  Education: "rgba(52,211,153,0.18)",
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
  bookmarked?: boolean;
  onOpenArticle: (item: NewsItem) => void;
  onToggleBookmark: (id: number) => void;
}

export default function NewsCard({
  id, category, title, subheading, summary, date, source, image, readTime,
  index = 0, bookmarked = false, onOpenArticle, onToggleBookmark,
  ...rest
}: NewsCardProps) {
  const glowColor = categoryGlows[category] || categoryGlows.Tech;
  const cardRef = useRef<HTMLElement>(null);
  const item: NewsItem = { id, category, title, subheading, summary, date, source, image, readTime, ...rest } as NewsItem;

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 350, damping: 22 },
      }}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col cursor-pointer"
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
      onClick={() => onOpenArticle(item)}
      data-testid={`news-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          loading="lazy"
          data-testid={`img-news-${id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryColors[category] || categoryColors.Tech}`}
          style={{ backdropFilter: "blur(8px)" }}
        >
          {category}
        </span>

        {/* Read time badge */}
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-md"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <Clock className="w-3 h-3" />
          {readTime} min read
        </span>

        {/* Bookmark button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(id); }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
          style={{ backdropFilter: "blur(8px)" }}
          title={bookmarked ? "Remove bookmark" : "Save for later"}
          data-testid={`btn-bookmark-card-${id}`}
        >
          {bookmarked
            ? <BookmarkCheck className="w-4 h-4 text-amber-400" />
            : <Bookmark className="w-4 h-4 text-white/70" />
          }
        </motion.button>

        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-base leading-snug mb-1.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 italic">
          {subheading}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">{summary}</p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">{source}</span>
            <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
            Read More
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
