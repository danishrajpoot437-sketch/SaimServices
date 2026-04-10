import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  BookOpen, GraduationCap, DollarSign, CalendarClock,
  Star, Award, Landmark, Globe, CheckCircle2,
} from "lucide-react";

type Region = "USA" | "UK";

interface GuideCard {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  points: { text: string; highlight?: boolean }[];
}

const usaCards: GuideCard[] = [
  {
    title: "Ivy League & Top Schools",
    icon: Star,
    color: "text-blue-300",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    points: [
      { text: "Harvard, Yale, Princeton, Columbia, Penn, Brown, Dartmouth, Cornell" },
      { text: "MIT, Stanford, Caltech — top STEM alternatives", highlight: true },
      { text: "GPA 3.7+ on 4.0 scale strongly preferred" },
      { text: "SAT 1450+ / ACT 33+ for competitive applicants" },
      { text: "Common App is the primary application portal" },
    ],
  },
  {
    title: "F-1 Student Visa",
    icon: Globe,
    color: "text-sky-300",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
    points: [
      { text: "Obtain I-20 form from your US university first" },
      { text: "Pay SEVIS fee ($350) before scheduling interview" },
      { text: "Financial proof: $30,000–$60,000 USD typically required" },
      { text: "DS-160 form + visa interview at US Embassy/Consulate" },
      { text: "Apply 3–4 months before your program start date", highlight: true },
    ],
  },
  {
    title: "SAT, ACT & Tests",
    icon: BookOpen,
    color: "text-purple-300",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    points: [
      { text: "SAT: 1600 max score — Math + Evidence-Based Reading" },
      { text: "ACT: 36 max — English, Math, Reading, Science" },
      { text: "GRE required for most graduate programs (130–170 scale)" },
      { text: "TOEFL 90+ / IELTS 7.0+ for non-native English speakers" },
      { text: "Many schools have gone test-optional post-pandemic", highlight: true },
    ],
  },
  {
    title: "Application Timeline",
    icon: CalendarClock,
    color: "text-amber-300",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    points: [
      { text: "Early Decision/Action: November 1–15 deadline", highlight: true },
      { text: "Regular Decision (Fall): January 1–March 1" },
      { text: "Spring intake: Apply August–October" },
      { text: "Financial Aid (FAFSA): Opens October 1 each year" },
      { text: "Apply to 10–15 schools — safety, match, reach strategy" },
    ],
  },
];

const ukCards: GuideCard[] = [
  {
    title: "Russell Group Universities",
    icon: Landmark,
    color: "text-emerald-300",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    points: [
      { text: "Oxford, Cambridge, Imperial, UCL, LSE, KCL — elite tier" },
      { text: "Edinburgh, Manchester, Warwick, Durham — strong research", highlight: true },
      { text: "UK undergrad: 3 years (England/Wales), 4 years (Scotland)" },
      { text: "Masters: typically 1 year full-time — highly efficient" },
      { text: "UCAS is the single portal for all UK undergraduate applications" },
    ],
  },
  {
    title: "Student Route Visa",
    icon: Globe,
    color: "text-teal-300",
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.2)",
    points: [
      { text: "Replaces the Tier 4 student visa post-Brexit" },
      { text: "CAS (Confirmation of Acceptance) number from university required" },
      { text: "Financial proof: £1,334/month London, £1,023/month elsewhere", highlight: true },
      { text: "IELTS 6.0–7.0 (SELT approved) for English proficiency" },
      { text: "Graduate Route Visa: 2 years post-study work rights" },
    ],
  },
  {
    title: "Personal Statement",
    icon: Award,
    color: "text-rose-300",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
    points: [
      { text: "4,000 characters (≈ 650 words) — one statement for all 5 choices" },
      { text: "80% academic motivation, 20% extracurriculars recommended", highlight: true },
      { text: "Show genuine subject passion — UK unis value academic focus" },
      { text: "No generic openings — start with a hook or specific example" },
      { text: "Oxford/Cambridge require subject-specific super-curricular evidence" },
    ],
  },
  {
    title: "UK Application Timeline",
    icon: CalendarClock,
    color: "text-indigo-300",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    points: [
      { text: "Oxford/Cambridge deadline: October 15 (early priority)", highlight: true },
      { text: "All other UK universities: January 31" },
      { text: "Clearing opens in July for remaining university places" },
      { text: "UCAS Extra: February–July for applicants with no offers" },
      { text: "Apply a full year in advance for September intake" },
    ],
  },
];

// ── Scholarships ─────────────────────────────────────────────────────────────
const scholarships = [
  { name: "Chevening Scholarship", country: "🇬🇧 UK", coverage: "Full Funding", description: "UK government's flagship scholarship. Covers tuition, living costs, return flights, and visa fees. Requires 2+ years work experience.", deadline: "Nov each year", color: "border-emerald-500/25 bg-emerald-500/5", badge: "text-emerald-300 bg-emerald-500/12 border-emerald-500/20" },
  { name: "Gates Cambridge Scholarship", country: "🇬🇧 UK", coverage: "Full Funding", description: "Full-cost scholarship at the University of Cambridge for outstanding postgraduate students globally.", deadline: "Oct/Dec each year", color: "border-blue-500/25 bg-blue-500/5", badge: "text-blue-300 bg-blue-500/12 border-blue-500/20" },
  { name: "Rhodes Scholarship", country: "🇬🇧 Oxford", coverage: "Full Funding", description: "Covers all Oxford University fees, stipend for living expenses, and airfare. Extremely competitive.", deadline: "Aug–Oct each year", color: "border-purple-500/25 bg-purple-500/5", badge: "text-purple-300 bg-purple-500/12 border-purple-500/20" },
  { name: "Fulbright Scholarship", country: "🇺🇸 USA", coverage: "Full Funding", description: "US government scholarship for international students. Covers tuition, living allowance, and travel.", deadline: "Varies by country", color: "border-sky-500/25 bg-sky-500/5", badge: "text-sky-300 bg-sky-500/12 border-sky-500/20" },
  { name: "Commonwealth Scholarship", country: "🇬🇧 UK", coverage: "Full Funding", description: "For students from Commonwealth nations. Covers tuition, living, travel. Targets developing countries.", deadline: "Dec each year", color: "border-amber-500/25 bg-amber-500/5", badge: "text-amber-300 bg-amber-500/12 border-amber-500/20" },
  { name: "Erasmus Mundus", country: "🇪🇺 Europe", coverage: "Full Funding", description: "EU-funded joint master's degrees across European universities with monthly living stipend and travel allowance.", deadline: "Jan each year", color: "border-rose-500/25 bg-rose-500/5", badge: "text-rose-300 bg-rose-500/12 border-rose-500/20" },
];

// ── Deadlines ─────────────────────────────────────────────────────────────────
const deadlines = [
  { country: "🇺🇸 USA", intake: "Fall (September)", steps: [
    { month: "Sep–Oct", event: "GRE / TOEFL / IELTS exams", type: "test" },
    { month: "Nov 1–15", event: "Early Decision / Early Action deadline", type: "critical" },
    { month: "Jan 1–Mar 1", event: "Regular Decision deadline", type: "deadline" },
    { month: "Oct 1", event: "FAFSA opens for financial aid", type: "aid" },
    { month: "Apr 1", event: "Admission decisions released", type: "result" },
    { month: "May 1", event: "Final enrollment commitment", type: "commit" },
  ]},
  { country: "🇬🇧 UK", intake: "September (Academic Year)", steps: [
    { month: "Sep–Oct", event: "IELTS / English proficiency testing", type: "test" },
    { month: "Oct 15", event: "Oxford & Cambridge UCAS deadline", type: "critical" },
    { month: "Jan 31", event: "All other UK universities UCAS deadline", type: "deadline" },
    { month: "Feb–Jul", event: "UCAS Extra for unmatched applicants", type: "aid" },
    { month: "Jul", event: "A-level results & Clearing opens", type: "result" },
    { month: "Sep", event: "Course start / Induction week", type: "commit" },
  ]},
];

const stepColors: Record<string, string> = {
  test: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  deadline: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  aid: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  result: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  commit: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

type ActiveTab = "USA" | "UK" | "scholarships" | "deadlines";
const navTabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "USA",          label: "🇺🇸 USA Guide",      icon: BookOpen },
  { id: "UK",           label: "🇬🇧 UK Guide",       icon: GraduationCap },
  { id: "scholarships", label: "💰 Scholarships",    icon: DollarSign },
  { id: "deadlines",    label: "📅 Deadlines",       icon: CalendarClock },
];

function CardGrid({ cards, region }: { cards: GuideCard[]; region: Region }) {
  return (
    <motion.div key={region} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: card.bg, border: `1px solid ${card.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <h4 className="text-sm font-bold text-foreground">{card.title}</h4>
          </div>
          <ul className="space-y-2">
            {card.points.map((pt, j) => (
              <li key={j} className={`flex items-start gap-2 text-xs leading-relaxed ${pt.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${pt.highlight ? card.color : "text-muted-foreground/40"}`} />
                {pt.text}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function StudyGuides() {
  const [active, setActive] = useState<ActiveTab>("USA");

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
          {navTabs.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                active === tab.id
                  ? "border-emerald-500/40 text-emerald-300"
                  : "glass-card text-muted-foreground hover:text-foreground border-white/10"
              }`}
              style={active === tab.id ? { background: "rgba(16,185,129,0.12)", boxShadow: "0 0 16px rgba(16,185,129,0.12)" } : {}}
              data-testid={`tab-study-${tab.id.toLowerCase()}`}>
              {active === tab.id && (
                <motion.div layoutId="study-active-tab" className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(16,185,129,0.08)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }} />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {active === "USA" && (
          <motion.div key="usa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <CardGrid cards={usaCards} region="USA" />
          </motion.div>
        )}
        {active === "UK" && (
          <motion.div key="uk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <CardGrid cards={ukCards} region="UK" />
          </motion.div>
        )}
        {active === "scholarships" && (
          <motion.div key="scholarships" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scholarships.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl p-5 border space-y-3 ${s.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground leading-tight">{s.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.badge}`}>
                    {s.coverage}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground/70">{s.country}</span>
                  <span className="text-xs font-semibold text-foreground/70">📅 {s.deadline}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {active === "deadlines" && (
          <motion.div key="deadlines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deadlines.map(d => (
              <div key={d.country} className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {d.country}
                  <span className="text-xs font-normal text-muted-foreground">· {d.intake}</span>
                </h4>
                <div className="space-y-2">
                  {d.steps.map((step, i) => (
                    <motion.div key={step.event} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 w-20 text-center ${stepColors[step.type]}`}>
                        {step.month}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.event}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
