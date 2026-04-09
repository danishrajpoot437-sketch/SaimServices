export interface Tool {
  id: string;
  name: string;
  category: "Engineering" | "Academic" | "Content" | "News";
  description: string;
  icon: string;
  sectionId: string;
}

export const toolsData: Tool[] = [
  {
    id: "calculator",
    name: "Scientific Calculator",
    category: "Engineering",
    description: "Advanced expression evaluator with history, keyboard support, and basic/advanced modes.",
    icon: "Calculator",
    sectionId: "engineering-suite",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    category: "Engineering",
    description: "Instantly convert between Length, Mass, Temperature, Speed, Pressure, and Power units.",
    icon: "ArrowLeftRight",
    sectionId: "engineering-suite",
  },
  {
    id: "beam-calculator",
    name: "Beam Deflection Calculator",
    category: "Engineering",
    description: "Structural analysis tool for simply supported and cantilever beams. Engineering preview.",
    icon: "Ruler",
    sectionId: "engineering-suite",
  },
  {
    id: "study-guides",
    name: "Study Guides",
    category: "Academic",
    description: "Comprehensive guides for studying in USA and Europe, including scholarships and visa info.",
    icon: "BookOpen",
    sectionId: "academic-hub",
  },
  {
    id: "cgpa-converter",
    name: "CGPA Converter",
    category: "Academic",
    description: "Convert CGPA to percentage for Pakistan, India, and USA grading systems.",
    icon: "GraduationCap",
    sectionId: "academic-hub",
  },
  {
    id: "university-tracker",
    name: "University Tracker",
    category: "Academic",
    description: "Track applications, deadlines, document checklists, and admission statuses.",
    icon: "Building2",
    sectionId: "academic-hub",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    category: "Content",
    description: "Drag and drop Word documents to convert them to PDF instantly.",
    icon: "FileText",
    sectionId: "content-powerhouse",
  },
  {
    id: "case-converter",
    name: "Case Converter",
    category: "Content",
    description: "Transform text between uppercase, lowercase, title case, sentence case, and more.",
    icon: "Type",
    sectionId: "content-powerhouse",
  },
  {
    id: "character-counter",
    name: "Character Counter",
    category: "Content",
    description: "Count characters, words, sentences, reading time, and analyze keyword density.",
    icon: "Hash",
    sectionId: "content-powerhouse",
  },
  {
    id: "news-feed",
    name: "Tech & Education News",
    category: "News",
    description: "Stay current with AI, Technology, and Education news curated for students and engineers.",
    icon: "Newspaper",
    sectionId: "news-feed",
  },
];
