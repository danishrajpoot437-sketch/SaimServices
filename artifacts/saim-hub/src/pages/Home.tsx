import { lazy, Suspense, useEffect } from "react";
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
  // When navigated here from another page (e.g. /blog) with ?tab=xxx#section,
  // scroll to the section and activate the correct tab after content loads.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab    = params.get("tab");
    const hash   = window.location.hash; // e.g. "#engineering-suite"
    if (!hash) return;
    const tryScroll = (attempt = 0) => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        if (tab) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("saim-section-tab", { detail: { section: hash.slice(1), tab } })
            );
          }, 250);
        }
        // Clean up the ?tab param from the URL bar without re-rendering
        const clean = new URL(window.location.href);
        clean.searchParams.delete("tab");
        window.history.replaceState({}, "", clean.toString());
      } else if (attempt < 10) {
        // Section might not be rendered yet — retry up to 10× every 100 ms
        setTimeout(() => tryScroll(attempt + 1), 100);
      }
    };
    tryScroll();
  }, []);

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
