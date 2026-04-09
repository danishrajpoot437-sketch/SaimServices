import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/data/newsData";

const categoryColors: Record<string, string> = {
  AI: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Tech: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Education: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface NewsCardProps extends NewsItem {
  index?: number;
}

export default function NewsCard({ id, category, title, summary, date, source, image, url, index = 0 }: NewsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group tool-card-hover flex flex-col"
      data-testid={`news-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          data-testid={`img-news-${id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryColors[category] || categoryColors.AI} backdrop-blur-sm`}>
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{summary}</p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">{source}</span>
            <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            data-testid={`link-read-more-${id}`}
          >
            Read More
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
