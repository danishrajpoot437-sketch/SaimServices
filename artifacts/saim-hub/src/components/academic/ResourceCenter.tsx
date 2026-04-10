import { motion } from "framer-motion";
import { ExternalLink, ShieldCheck } from "lucide-react";

interface Resource {
  name: string;
  tagline: string;
  description: string;
  url: string;
  flag: string;
  category: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

const usaResources: Resource[] = [
  {
    name: "Common App",
    tagline: "Undergraduate Applications",
    description: "Apply to 1,000+ US colleges with a single online application. The standard portal for undergraduate admissions.",
    url: "https://www.commonapp.org",
    flag: "🇺🇸",
    category: "Application",
    color: "text-blue-300",
    bg: "rgba(59,130,246,0.07)",
    border: "rgba(59,130,246,0.22)",
    glow: "rgba(59,130,246,0.12)",
  },
  {
    name: "FAFSA",
    tagline: "Federal Student Aid",
    description: "Free Application for Federal Student Aid. Determines eligibility for grants, work-study, and federal loans in the USA.",
    url: "https://studentaid.gov/h/apply-for-aid/fafsa",
    flag: "🇺🇸",
    category: "Financial Aid",
    color: "text-emerald-300",
    bg: "rgba(16,185,129,0.07)",
    border: "rgba(16,185,129,0.22)",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    name: "ETS",
    tagline: "GRE & TOEFL Testing",
    description: "Official provider of GRE (graduate admissions) and TOEFL (English proficiency) exams. Register and manage test scores.",
    url: "https://www.ets.org",
    flag: "🇺🇸",
    category: "Testing",
    color: "text-purple-300",
    bg: "rgba(168,85,247,0.07)",
    border: "rgba(168,85,247,0.22)",
    glow: "rgba(168,85,247,0.12)",
  },
];

const ukResources: Resource[] = [
  {
    name: "UCAS",
    tagline: "UK Application Portal",
    description: "Universities and Colleges Admissions Service. Apply to undergraduate courses at UK universities — up to 5 choices per application.",
    url: "https://www.ucas.com",
    flag: "🇬🇧",
    category: "Application",
    color: "text-rose-300",
    bg: "rgba(244,63,94,0.07)",
    border: "rgba(244,63,94,0.22)",
    glow: "rgba(244,63,94,0.12)",
  },
  {
    name: "GOV.UK Student Visa",
    tagline: "Student Route Visa",
    description: "Official UK government portal for Student Route visa (formerly Tier 4). Check requirements, apply, and track your visa status.",
    url: "https://www.gov.uk/student-visa",
    flag: "🇬🇧",
    category: "Visa",
    color: "text-amber-300",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.22)",
    glow: "rgba(245,158,11,0.12)",
  },
  {
    name: "British Council",
    tagline: "IELTS & UK Education",
    description: "Register for IELTS exams, explore UK universities, and access resources for studying in the UK through the British Council.",
    url: "https://www.britishcouncil.org",
    flag: "🇬🇧",
    category: "Testing",
    color: "text-sky-300",
    bg: "rgba(14,165,233,0.07)",
    border: "rgba(14,165,233,0.22)",
    glow: "rgba(14,165,233,0.12)",
  },
];

function ResourceCard({ r, index }: { r: Resource; index: number }) {
  return (
    <motion.a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      className="group rounded-2xl p-5 block transition-all duration-300"
      style={{
        background: r.bg,
        border: `1px solid ${r.border}`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${r.glow}, 0 8px 24px rgba(0,0,0,0.2)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
      data-testid={`resource-${r.name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{r.flag}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground group-hover:text-white transition-colors">
                {r.name}
              </span>
              <ExternalLink className={`w-3 h-3 ${r.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <span className={`text-xs ${r.color} font-medium`}>{r.tagline}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${r.color}`}
          style={{ background: r.bg, borderColor: r.border }}>
          {r.category}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{r.description}</p>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
        <span className="text-[10px] text-emerald-400/70 font-semibold">Verified Official Resource</span>
      </div>
    </motion.a>
  );
}

export default function ResourceCenter() {
  return (
    <div className="mt-14 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
        <div className="text-center px-4">
          <div className="text-xs font-bold text-emerald-400 tracking-[0.2em] uppercase mb-1">Official Resources</div>
          <h3 className="text-lg font-bold text-foreground">Verified Academic Portals</h3>
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, rgba(255,255,255,0.08), transparent)" }} />
      </motion.div>

      {/* Two columns: USA & UK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* USA */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🇺🇸</span>
            <span className="text-sm font-bold text-foreground">USA Resources</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>
          {usaResources.map((r, i) => <ResourceCard key={r.name} r={r} index={i} />)}
        </div>

        {/* UK */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🇬🇧</span>
            <span className="text-sm font-bold text-foreground">UK Resources</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>
          {ukResources.map((r, i) => <ResourceCard key={r.name} r={r} index={i + 3} />)}
        </div>
      </div>
    </div>
  );
}
