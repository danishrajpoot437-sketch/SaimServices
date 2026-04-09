import { motion } from "framer-motion";
import { useState } from "react";
import { BookOpen, GraduationCap, DollarSign, FileCheck } from "lucide-react";

type Tab = "USA" | "Europe" | "Scholarships" | "Visa Guide";
const tabs: Tab[] = ["USA", "Europe", "Scholarships", "Visa Guide"];

const content: Record<Tab, { icon: React.ComponentType<{ className?: string }>; cards: { title: string; points: string[] }[] }> = {
  USA: {
    icon: BookOpen,
    cards: [
      {
        title: "Top Universities",
        points: ["MIT, Stanford, Harvard, Caltech", "Carnegie Mellon, UC Berkeley, Columbia", "State schools: UCLA, University of Michigan, Georgia Tech", "Rankings: US News, QS World University Rankings"],
      },
      {
        title: "Admission Requirements",
        points: ["GRE: 300-340 (avg 310+ for top schools)", "IELTS: 7.0+ / TOEFL: 90+ (most schools)", "GPA: 3.5+ out of 4.0 preferred", "Statement of Purpose + 3 Letters of Recommendation"],
      },
      {
        title: "Cost & Living",
        points: ["Tuition: $20,000–$60,000/year", "Cost of living: $15,000–$25,000/year", "Graduate assistantships often cover tuition", "On-campus housing vs off-campus options"],
      },
      {
        title: "Important Deadlines",
        points: ["Fall intake: Apply by December–February", "Spring intake: Apply by September–October", "Submit all documents 6 months before deadline", "Apply to 8-12 universities for best chances"],
      },
    ],
  },
  Europe: {
    icon: GraduationCap,
    cards: [
      {
        title: "Top Destinations",
        points: ["UK: Oxford, Cambridge, Imperial, UCL", "Germany: TU Munich, Heidelberg, Humboldt", "Netherlands: Delft, Leiden, Amsterdam", "France: Sciences Po, HEC Paris, INSEAD"],
      },
      {
        title: "Erasmus+ Program",
        points: ["EU-funded exchange program for students", "Covers 33 European countries", "Monthly stipend + travel support", "Available for bachelor, master, PhD"],
      },
      {
        title: "Germany (Free Tuition)",
        points: ["Most public universities: free tuition", "Semester fees: ~300 EUR only", "Strong engineering and research programs", "Blocked account: ~11,200 EUR required"],
      },
      {
        title: "Admission Process",
        points: ["IELTS 6.5–7.5 for English programs", "Motivation letter + academic transcripts", "Some schools require German language (B2)", "Apply through uni-assist.de or directly"],
      },
    ],
  },
  Scholarships: {
    icon: DollarSign,
    cards: [
      {
        title: "Fulbright Scholarship (USA)",
        points: ["US government-funded, highly prestigious", "Full funding: tuition + living + travel", "Open to international students", "Deadline: varies by country (usually August–October)"],
      },
      {
        title: "DAAD (Germany)",
        points: ["German Academic Exchange Service", "Various programs: masters, PhD, research", "Monthly stipend + travel allowance", "Strong in engineering, science, arts"],
      },
      {
        title: "Chevening (UK)",
        points: ["UK government scholarship for masters", "Full funding including visa & flights", "2+ years work experience required", "Apply October–November each year"],
      },
      {
        title: "Commonwealth Scholarship",
        points: ["For students from Commonwealth nations", "Covers tuition, living, travel", "Targets developing country students", "Postgraduate level: masters and PhD"],
      },
    ],
  },
  "Visa Guide": {
    icon: FileCheck,
    cards: [
      {
        title: "US F-1 Student Visa",
        points: ["Apply at US Embassy/Consulate in your country", "Required: I-20 from university, SEVIS fee", "Show financial proof: $30,000–$50,000", "Book appointment 3–4 months before start"],
      },
      {
        title: "UK Student Visa",
        points: ["Apply online via UKVI portal", "CAS number from university required", "English proficiency: IELTS 6.0–7.0", "Financial proof: 9+ months statements"],
      },
      {
        title: "Schengen Visa (Europe)",
        points: ["Required for non-EU students initially", "Apply at target country's embassy", "Once enrolled, get residence permit", "Health insurance mandatory in Germany"],
      },
      {
        title: "Key Documents",
        points: ["Valid passport (2+ years validity)", "Acceptance letter from university", "Bank statements (last 6 months)", "Academic transcripts, language test scores"],
      },
    ],
  },
};

export default function StudyGuides() {
  const [activeTab, setActiveTab] = useState<Tab>("USA");
  const current = content[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/10"
            }`}
            data-testid={`tab-study-${tab.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {current.cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <current.icon className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
            </div>
            <ul className="space-y-2">
              {card.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
