import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Wrench, Zap, ArrowRight, CheckCircle2, Sigma } from "lucide-react";

const CARDS = [
  {
    id: "solutions",
    icon: Brain,
    accent: "#4361ee",
    accentBg: "rgba(67,97,238,0.10)",
    accentBorder: "rgba(67,97,238,0.28)",
    glowColor: "rgba(67,97,238,0.14)",
    badge: "Step-by-Step",
    title: "Not Just Answers,\nbut Solutions",
    subtitle:
      "Get full derivations for SSC, Inter, and PhD-level math — every operation shown, every step justified.",
    cta: "Try Math Solver",
    section: "engineering-suite",
    tab: "mathsolver",
    highlights: [
      "Linear & quadratic equations",
      "Calculus, derivatives & integrals",
      "Statistics & regression analysis",
    ],
  },
  {
    id: "accuracy",
    icon: Wrench,
    accent: "#0ea5e9",
    accentBg: "rgba(14,165,233,0.10)",
    accentBorder: "rgba(14,165,233,0.28)",
    glowColor: "rgba(14,165,233,0.14)",
    badge: "Industry-Grade",
    title: "Engineering\nAccuracy",
    subtitle:
      "Precise tools for Civil, Mech, and Electrical — verified by NIST physical constants and international standards.",
    cta: "Open Suite",
    section: "engineering-suite",
    tab: "beam",
    highlights: [
      "Beam deflection & SFD/BMD plots",
      "Unit conversions across 9 categories",
      "Material properties & Eng. constants",
    ],
  },
  {
    id: "speed",
    icon: Zap,
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.10)",
    accentBorder: "rgba(245,158,11,0.28)",
    glowColor: "rgba(245,158,11,0.14)",
    badge: "Symbolic Engine",
    title: "Zero Errors,\nMax Speed",
    subtitle:
      "Powered by a symbolic math engine. Auto-formats input so you focus on the problem, not the syntax.",
    cta: "Start Solving",
    section: "engineering-suite",
    tab: "mathsolver",
    highlights: [
      "Auto-correct expression input",
      "Instant badge detection as you type",
      "Copy results with one click",
    ],
  },
];

function navigateTo(section: string, tab?: string) {
  const el = document.getElementById(section);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    if (tab) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("saim-section-tab", { detail: { section, tab } })
        );
      }, 140);
    }
  }
}

export default function FeatureHighlights() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px 0px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(231,44%,7%) 0%, hsl(231,44%,9%) 100%)",
          }}
        />
        {/* Top separator line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(67,97,238,0.35), rgba(14,165,233,0.3), rgba(67,97,238,0.35), transparent)",
          }}
        />
        {/* Ambient orb centre-left */}
        <div
          className="absolute top-1/3 -left-40 w-[520px] h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(67,97,238,0.06) 0%, transparent 70%)",
          }}
        />
        {/* Ambient orb right */}
        <div
          className="absolute bottom-1/4 -right-40 w-[440px] h-[440px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{
              background: "rgba(67,97,238,0.1)",
              border: "1px solid rgba(67,97,238,0.25)",
              color: "#6b8cff",
              boxShadow: "0 0 20px rgba(67,97,238,0.12)",
            }}
          >
            <Sigma className="w-3.5 h-3.5" />
            Why SaimServices
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display leading-[1.1] mb-5">
            Built for those who demand
            <br />
            <span
              className="shimmer-text"
              style={{
                background:
                  "linear-gradient(135deg, #4361ee 0%, #0ea5e9 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              professional-grade precision
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Not a toy calculator. Not a basic converter.{" "}
            <span className="text-foreground/80 font-medium">
              A complete engineering and academic workspace
            </span>{" "}
            — free, beautiful, and blazing fast.
          </p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {CARDS.map((card, i) => (
            <FeatureCard key={card.id} card={card} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardData {
  id: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
  accentBorder: string;
  glowColor: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  section: string;
  tab: string;
  highlights: string[];
}

function FeatureCard({
  card,
  index,
  inView,
}: {
  card: CardData;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: 0.1 + index * 0.13,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="relative group flex flex-col gap-6 rounded-3xl p-7"
      style={{
        background:
          "linear-gradient(145deg, rgba(14,20,55,0.92) 0%, rgba(10,16,42,0.96) 100%)",
        border: `1px solid ${card.accentBorder}`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: `0 0 50px ${card.glowColor}, 0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      {/* Top accent shimmer line */}
      <div
        className="absolute top-0 left-8 right-8 h-px rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accent}90, transparent)`,
        }}
      />

      {/* Corner glow orb */}
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-tr-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 100% 0%, ${card.accentBg} 0%, transparent 70%)`,
        }}
      />

      {/* Icon + Badge row */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: card.accentBg,
            border: `1px solid ${card.accentBorder}`,
            boxShadow: `0 0 24px ${card.glowColor}`,
          }}
        >
          <card.icon className="w-6 h-6" style={{ color: card.accent }} />
        </div>
        <div
          className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide mt-1"
          style={{
            background: card.accentBg,
            border: `1px solid ${card.accentBorder}`,
            color: card.accent,
          }}
        >
          {card.badge}
        </div>
      </div>

      {/* Title + Subtitle */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-foreground leading-snug mb-3 whitespace-pre-line">
          {card.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {card.subtitle}
        </p>
      </div>

      {/* Feature bullets */}
      <ul className="space-y-2">
        {card.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <CheckCircle2
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: card.accent }}
            />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigateTo(card.section, card.tab)}
        className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group/btn"
        style={{
          background: `linear-gradient(135deg, ${card.accent}22 0%, ${card.accent}12 100%)`,
          border: `1px solid ${card.accentBorder}`,
          color: card.accent,
          boxShadow: `0 4px 16px ${card.glowColor}`,
        }}
      >
        <span>{card.cta}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
      </motion.button>
    </motion.div>
  );
}
