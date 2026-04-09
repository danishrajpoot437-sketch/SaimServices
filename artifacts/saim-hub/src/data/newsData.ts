export interface NewsItem {
  id: number;
  category: "AI" | "Tech" | "Education";
  title: string;
  summary: string;
  date: string;
  source: string;
  image: string;
  url: string;
}

export const newsData: NewsItem[] = [
  {
    id: 1,
    category: "AI",
    title: "GPT-5 Launches with Multimodal Reasoning",
    summary: "OpenAI unveils GPT-5, featuring breakthrough reasoning and real-time image understanding capabilities that redefine what AI assistants can do.",
    date: "2026-04-08",
    source: "TechCrunch",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    url: "#",
  },
  {
    id: 2,
    category: "Tech",
    title: "Apple Vision Pro 2 Enters Mass Production",
    summary: "Apple's second-generation spatial computing headset reaches manufacturing scale ahead of its highly anticipated summer release.",
    date: "2026-04-07",
    source: "The Verge",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    url: "#",
  },
  {
    id: 3,
    category: "Education",
    title: "EU Announces 2B Euro Erasmus+ Expansion",
    summary: "The European Commission doubles Erasmus+ funding to support student mobility and academic exchange programs across 40+ countries through 2030.",
    date: "2026-04-06",
    source: "EduNews EU",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
    url: "#",
  },
  {
    id: 4,
    category: "AI",
    title: "MIT Develops AI That Writes Peer-Reviewed Papers",
    summary: "A groundbreaking model from MIT's CSAIL generates scientifically accurate research papers that have been accepted in top academic journals worldwide.",
    date: "2026-04-05",
    source: "MIT News",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    url: "#",
  },
  {
    id: 5,
    category: "Tech",
    title: "Quantum Computing Achieves Commercial Viability",
    summary: "IBM's latest 1000-qubit processor marks a historic turning point, making quantum applications in cryptography and drug discovery commercially feasible.",
    date: "2026-04-04",
    source: "Wired",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    url: "#",
  },
  {
    id: 6,
    category: "Education",
    title: "US Universities See Record International Applications",
    summary: "Applications from international students hit a historic peak for the 2026 admissions cycle, especially from South Asia, the Middle East, and Europe.",
    date: "2026-04-03",
    source: "Inside Higher Ed",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
    url: "#",
  },
];
