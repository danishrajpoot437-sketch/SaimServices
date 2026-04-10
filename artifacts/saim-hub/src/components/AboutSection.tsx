import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Eye, Cpu, Globe, Users, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const columns = [
  {
    id: "vision",
    icon: Eye,
    accent: "rgba(67,97,238,1)",
    accentBg: "rgba(67,97,238,0.12)",
    accentBorder: "rgba(67,97,238,0.25)",
    glow: "rgba(67,97,238,0.15)",
    label: "Our Vision",
    headline: "Democratizing Professional Tools",
    body: "We believe premium-grade engineering calculators, academic research tools, and productivity software shouldn't live behind enterprise paywalls. SaimServices puts studio-quality instruments in the hands of every student, researcher, and developer — free, fast, and beautiful.",
    bullets: [
      "Zero cost, zero compromise on quality",
      "Designed to the standard of paid SaaS tools",
      "Open to engineers, students, and self-learners",
    ],
    stat: { value: "10K+", label: "Active Users" },
    StatIcon: Users,
  },
  {
    id: "tech",
    icon: Cpu,
    accent: "rgba(139,92,246,1)",
    accentBg: "rgba(139,92,246,0.12)",
    accentBorder: "rgba(139,92,246,0.25)",
    glow: "rgba(139,92,246,0.15)",
    label: "Our Tech",
    headline: "AI-Driven Precision",
    body: "Every tool is engineered from first principles. Unit conversions use IEEE-754 precision arithmetic. The function plotter runs live symbolic math via math.js. The content analyzer runs real-time NLP in the browser — no round trips, no servers, no latency.",
    bullets: [
      "Client-side computation — your data never leaves",
      "Symbolic math engine (math.js) for the plotter",
      "Real-time NLP for keyword and reading analysis",
    ],
    stat: { value: "< 50ms", label: "Avg. Response Time" },
    StatIcon: TrendingUp,
  },
  {
    id: "reach",
    icon: Globe,
    accent: "rgba(16,185,129,1)",
    accentBg: "rgba(16,185,129,0.12)",
    accentBorder: "rgba(16,185,129,0.25)",
    glow: "rgba(16,185,129,0.15)",
    label: "Our Reach",
    headline: "Supporting US/UK & Global Talent",
    body: "Built specifically for the academic and professional realities of US and UK institutions. GPA tools map directly to the US 4.0 scale and UK Honours system. Our scholarship guides cover Chevening, Fulbright, and Ivy League financial aid in actionable depth.",
    bullets: [
      "Dual-system GPA: US 4.0 ↔ UK Honours",
      "Chevening, Fulbright, Ivy League guides",
      "Used in 40+ countries by engineers & researchers",
    ],
    stat: { value: "40+", label: "Countries Reached" },
    StatIcon: Globe,
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,97,238,0.05) 0%, transparent 70%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 40% 40% at 0% 100%, rgba(139,92,246,0.05) 0%, transparent 70%)" }} className="absolute inset-0" />
        <div style={{ background: "radial-gradient(ellipse 40% 40% at 100% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)" }} className="absolute inset-0" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.15em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.25em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4 block"
          >
            About SaimServices
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 font-display">
            Built with Purpose.{" "}
            <span className="gradient-text-blue">Designed for Impact.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            We started as a toolkit for one engineer. Now we serve thousands of students, developers, and researchers across 40+ countries.
          </p>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="section-divider w-64 mx-auto mt-6"
          />
        </motion.div>

        {/* Three columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {columns.map((col) => (
            <motion.div
              key={col.id}
              variants={cardVariants}
              className="rounded-2xl p-7 flex flex-col relative overflow-hidden group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${col.accentBorder}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset`,
              }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
              data-testid={`about-card-${col.id}`}
            >
              {/* Corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 70% 70% at 100% 0%, ${col.glow} 0%, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{ background: col.accentBg, border: `1px solid ${col.accentBorder}`, boxShadow: `0 0 20px ${col.glow}` }}
              >
                <col.icon className="w-5 h-5" style={{ color: col.accent }} />
              </div>

              {/* Label */}
              <span className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: col.accent }}>
                {col.label}
              </span>

              {/* Headline */}
              <h3 className="text-xl font-bold text-foreground font-display mb-3 leading-snug">
                {col.headline}
              </h3>

              {/* Body */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                {col.body}
              </p>

              {/* Bullets */}
              <ul className="space-y-2 mb-6">
                {col.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: col.accent }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Stat */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl mt-auto"
                style={{ background: col.accentBg, border: `1px solid ${col.accentBorder}` }}
              >
                <col.StatIcon className="w-5 h-5 flex-shrink-0" style={{ color: col.accent }} />
                <div>
                  <p className="text-lg font-bold text-foreground leading-tight">{col.stat.value}</p>
                  <p className="text-xs text-muted-foreground">{col.stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom strip — story / values */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(67,97,238,0.08) 0%, rgba(139,92,246,0.06) 100%)",
            border: "1px solid rgba(67,97,238,0.2)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(67,97,238,0.1) 0%, transparent 70%)" }} />

          <div className="relative flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Our Story</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-display mb-3">
              From a Single Engineer's Toolbox to a Global Platform
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              SaimServices was created by an engineer tired of switching between ten different websites to do basic calculations. Every tool here was built to solve a real problem faced by real students and professionals — and then refined until it matched the quality of paid software.
            </p>
          </div>

          <div className="relative flex-shrink-0 grid grid-cols-2 gap-4 w-full sm:w-auto">
            {[
              { value: "12+", label: "Platform Tools" },
              { value: "4", label: "Core Modules" },
              { value: "99.9%", label: "Uptime" },
              { value: "0$", label: "Cost to Use" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-xl bg-white/4 border border-white/8 min-w-[100px]">
                <p className="text-2xl font-bold gradient-text-blue leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
