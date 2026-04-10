import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolsOverview from "@/components/ToolsOverview";
import EngineeringSuite from "@/components/engineering/EngineeringSuite";
import AcademicHub from "@/components/academic/AcademicHub";
import ContentPowerhouse from "@/components/content/ContentPowerhouse";
import NewsFeed from "@/components/NewsFeed";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ToolsOverview />
        <EngineeringSuite />
        <AcademicHub />
        <ContentPowerhouse />
        <NewsFeed />
        <AboutSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
