import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolsOverview from "@/components/ToolsOverview";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const EngineeringSuite  = lazy(() => import("@/components/engineering/EngineeringSuite"));
const AcademicHub       = lazy(() => import("@/components/academic/AcademicHub"));
const ContentPowerhouse = lazy(() => import("@/components/content/ContentPowerhouse"));
const NewsFeed          = lazy(() => import("@/components/NewsFeed"));
const AboutSection      = lazy(() => import("@/components/AboutSection"));

function SectionSkeleton() {
  return (
    <div className="py-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ToolsOverview />
        <Suspense fallback={<SectionSkeleton />}>
          <EngineeringSuite />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <AcademicHub />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ContentPowerhouse />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <NewsFeed />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
