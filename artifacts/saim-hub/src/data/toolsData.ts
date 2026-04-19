export interface Tool {
  id: string;
  name: string;
  category: "Engineering" | "Academic" | "Content" | "News";
  description: string;
  icon: string;
  sectionId: string;
  tab?: string;
}

export const toolsData: Tool[] = [
  // ── Engineering ──
  { id: "calculator",        name: "Scientific Calculator",     category: "Engineering", description: "Advanced expression evaluator with history, keyboard support, and basic/advanced modes.", icon: "Calculator",     sectionId: "engineering-suite", tab: "mathsolver" },
  { id: "unit-converter",    name: "Unit Pro",                  category: "Engineering", description: "Instantly convert between length, mass, temperature, speed, pressure, power and 4 more categories.", icon: "ArrowLeftRight", sectionId: "engineering-suite", tab: "unitpro" },
  { id: "beam-calculator",   name: "Beam Analyst",              category: "Engineering", description: "Structural analysis: SFD, BMD and deflection for simply supported and cantilever beams.",      icon: "Ruler",          sectionId: "engineering-suite", tab: "beam" },
  { id: "math-solver",       name: "Math Solver",               category: "Engineering", description: "Symbolic & numeric computation engine with step-by-step output.",                                  icon: "Sigma",          sectionId: "engineering-suite", tab: "mathsolver" },
  { id: "stat-suite",        name: "Stat Suite",                category: "Engineering", description: "Descriptive statistics and linear regression analysis on your dataset.",                            icon: "BarChart2",      sectionId: "engineering-suite", tab: "stats" },
  { id: "periodic-table",    name: "Periodic Table",            category: "Engineering", description: "Interactive 118-element periodic table with detailed properties for each element.",                icon: "FlaskConical",   sectionId: "engineering-suite", tab: "periodic" },
  { id: "function-plotter",  name: "Function Plotter",          category: "Engineering", description: "Live 2D plotter powered by math.js — graph any function instantly.",                                icon: "TrendingUp",     sectionId: "engineering-suite", tab: "plotter" },
  { id: "graph-lab",         name: "Graph Lab",                 category: "Engineering", description: "Plot multiple functions simultaneously with overlay comparison.",                                  icon: "TrendingUp",     sectionId: "engineering-suite", tab: "graphlab" },
  { id: "constants",         name: "Engineering Constants",     category: "Engineering", description: "12 NIST-verified physical constants with one-click copy.",                                          icon: "Atom",           sectionId: "engineering-suite", tab: "constants" },
  { id: "materials",         name: "Materials Finder",          category: "Engineering", description: "Properties database for 8 engineering materials — steel, aluminum, copper and more.",              icon: "Layers",         sectionId: "engineering-suite", tab: "materials" },
  { id: "dev-kit",           name: "Dev Kit",                   category: "Engineering", description: "Developer utilities: JSON formatter, hash, regex tester, color & timestamp converter.",            icon: "Terminal",       sectionId: "engineering-suite", tab: "devkit" },
  { id: "ohms-law",          name: "Ohm's Law Calculator",      category: "Engineering", description: "Solve for voltage, current, resistance or power — enter any two values.",                          icon: "Zap",            sectionId: "engineering-suite", tab: "quicktools" },
  { id: "resistor-decoder",  name: "Resistor Color Code",       category: "Engineering", description: "Decode 4-band resistor color codes to resistance and tolerance values.",                           icon: "Palette",        sectionId: "engineering-suite", tab: "quicktools" },
  { id: "triangle-solver",   name: "Triangle Solver",           category: "Engineering", description: "Solve any triangle from sides and angles using law of sines & cosines.",                            icon: "Triangle",       sectionId: "engineering-suite", tab: "quicktools" },
  { id: "percentage-calc",   name: "Percentage Calculator",     category: "Engineering", description: "Three modes: percent of value, X is what % of Y, and percent change.",                              icon: "Percent",        sectionId: "engineering-suite", tab: "quicktools" },
  { id: "color-converter",   name: "Color Converter",           category: "Engineering", description: "Convert between HEX, RGB and HSL with live preview swatch.",                                        icon: "Palette",        sectionId: "engineering-suite", tab: "quicktools" },
  { id: "date-diff",         name: "Date Difference",           category: "Engineering", description: "Calculate days, weeks, months and years between any two dates.",                                   icon: "CalendarDays",   sectionId: "engineering-suite", tab: "quicktools" },

  // ── Academic ──
  { id: "study-guides",      name: "Study Guides",              category: "Academic",    description: "USA & UK study guides, scholarships, deadlines, and visa info.",                                   icon: "BookOpen",       sectionId: "academic-hub", tab: "study" },
  { id: "gpa-converter",     name: "GPA Converter",             category: "Academic",    description: "Convert between USA 4.0 GPA and UK Honours classification systems.",                                icon: "GraduationCap",  sectionId: "academic-hub", tab: "gpa" },
  { id: "citation-generator",name: "Citation Generator",        category: "Academic",    description: "Generate citations in APA, MLA, Harvard, Chicago and Vancouver styles.",                            icon: "Quote",          sectionId: "academic-hub", tab: "citations" },
  { id: "research-finder",   name: "Research Finder",           category: "Academic",    description: "Search arXiv, PubMed and 200M+ academic papers in seconds.",                                        icon: "Search",         sectionId: "academic-hub", tab: "research" },
  { id: "university-tracker",name: "University Tracker",        category: "Academic",    description: "Track applications, deadlines, document checklists and admission statuses.",                        icon: "Building2",      sectionId: "academic-hub", tab: "tracker" },

  // ── Content ──
  { id: "word-to-pdf",       name: "Word to PDF",               category: "Content",     description: "Drag and drop Word documents to convert them to PDF instantly.",                                   icon: "FileText",       sectionId: "content-powerhouse" },
  { id: "case-converter",    name: "Case Converter",            category: "Content",     description: "Transform text between uppercase, lowercase, title, sentence and more.",                            icon: "Type",           sectionId: "content-powerhouse" },
  { id: "character-counter", name: "Character Counter",         category: "Content",     description: "Count characters, words, sentences, reading time and analyze keyword density.",                    icon: "Hash",           sectionId: "content-powerhouse" },
  { id: "content-analyzer",  name: "Content Analyzer",          category: "Content",     description: "Deep content analysis with sentiment, readability and structure insights.",                         icon: "AlignLeft",      sectionId: "content-powerhouse" },

  // ── News ──
  { id: "news-feed",         name: "Tech & Education News",     category: "News",        description: "Stay current with AI, Engineering and scholarship news curated for students and engineers.",       icon: "Newspaper",      sectionId: "news-feed" },
];
