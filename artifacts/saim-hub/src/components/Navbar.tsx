import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Menu, X, Zap, ChevronDown, Ruler, FlaskConical, LineChart, BookOpenCheck, GraduationCap, Library, FileInput, AlignLeft, Rss, LogIn } from "lucide-react";
import AuthModal from "./AuthModal";

interface DropdownItem {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

const dropdownMenus: Record<string, DropdownItem[]> = {
  "Engineering Suite": [
    { label: "Unit Pro", description: "Convert 9 categories of units instantly", icon: Ruler, href: "#engineering-suite" },
    { label: "Materials Finder", description: "Properties of 8 engineering materials", icon: FlaskConical, href: "#engineering-suite" },
    { label: "Function Grapher", description: "2D live plotter with math.js engine", icon: LineChart, href: "#engineering-suite" },
    { label: "Eng. Constants", description: "12 click-to-copy physical constants", icon: BookOpenCheck, href: "#engineering-suite" },
  ],
  "Academic Hub": [
    { label: "GPA Converter", description: "USA 4.0 ↔ UK Honours dual system", icon: GraduationCap, href: "#academic-hub" },
    { label: "Study Guides", description: "USA & UK guides, scholarships, deadlines", icon: Library, href: "#academic-hub" },
    { label: "Resource Center", description: "Common App, FAFSA, UCAS & more", icon: BookOpenCheck, href: "#academic-hub" },
  ],
  "Resources": [
    { label: "File Converter", description: "Word, PDF, Image & Text conversions", icon: FileInput, href: "#content-powerhouse" },
    { label: "Content Analyzer", description: "Case transform, word count, keywords", icon: AlignLeft, href: "#content-powerhouse" },
    { label: "News Feed", description: "Curated AI, Engineering & Scholarship news", icon: Rss, href: "#news-feed" },
  ],
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.13, ease: "easeIn" } },
};

const simpleLinks = [
  { label: "Tools", href: "#tools-overview" },
  { label: "News", href: "#news-feed" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<Set<string>>(new Set());
  const [authOpen, setAuthOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMobileAccordion = (label: string) => {
    setMobileAccordion(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
    setActiveDropdown(null);
  };

  const openDropdown = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const keepOpen = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(22, 33, 62, 0.94)" : "rgba(22, 33, 62, 0.60)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(67, 97, 238, 0.2)"
            : "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 group flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              data-testid="logo-link"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg glow-blue">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="gradient-text-blue">Saim</span>
                <span className="text-foreground">Services</span>
              </span>
            </motion.a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {/* Tools link */}
              {simpleLinks.slice(0, 1).map((link) => (
                <NavLinkSimple key={link.label} href={link.href} label={link.label} onClick={handleNavClick} />
              ))}

              {/* Dropdown links */}
              {Object.keys(dropdownMenus).map((label) => (
                <div
                  key={label}
                  className="relative"
                  onMouseEnter={() => openDropdown(label)}
                  onMouseLeave={closeDropdown}
                >
                  <button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group rounded-lg"
                    onClick={() => setActiveDropdown(activeDropdown === label ? null : label)}
                    data-testid={`nav-dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === label ? "rotate-180" : ""}`} />
                    <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === label && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onMouseEnter={keepOpen}
                        onMouseLeave={closeDropdown}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl overflow-hidden z-50 shadow-2xl"
                        style={{
                          background: "rgba(18, 28, 58, 0.98)",
                          backdropFilter: "blur(24px)",
                          border: "1px solid rgba(67,97,238,0.25)",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
                        }}
                        data-testid={`dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {/* Top shine */}
                        <div className="h-px w-full"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.5), transparent)" }} />
                        <div className="p-2">
                          {dropdownMenus[label].map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={(e) => handleNavClick(e, item.href)}
                              className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/6 transition-colors group/item"
                              data-testid={`dropdown-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                                <item.icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">
                                  {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Remaining simple links */}
              {simpleLinks.slice(1).map((link) => (
                <NavLinkSimple key={link.label} href={link.href} label={link.label} onClick={handleNavClick} />
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <motion.button
                onClick={() => setAuthOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all border border-white/8"
                data-testid="btn-sign-in"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </motion.button>
              <motion.button
                onClick={() => setAuthOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
                style={{ boxShadow: "0 0 16px rgba(67,97,238,0.35)" }}
                data-testid="button-get-started"
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden border-t border-white/5"
              style={{ background: "rgba(22, 33, 62, 0.97)", backdropFilter: "blur(20px)" }}
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {simpleLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-sm font-medium"
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </a>
                ))}

                {Object.entries(dropdownMenus).map(([label, items]) => {
                  const isOpen = mobileAccordion.has(label);
                  return (
                    <div key={label} className="rounded-xl overflow-hidden border border-white/5 mt-1">
                      <button
                        onClick={() => toggleMobileAccordion(label)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-white/5 transition-colors"
                        data-testid={`mobile-accordion-${label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span className="text-primary">{label}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-1.5 px-1">
                              {items.map((item) => (
                                <a
                                  key={item.label}
                                  href={item.href}
                                  onClick={(e) => handleNavClick(e, item.href)}
                                  className="flex items-center gap-2.5 py-2.5 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-sm"
                                  data-testid={`mobile-dropdown-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                                >
                                  <item.icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
                                  {item.label}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-sm font-semibold text-foreground text-center hover:bg-white/5 transition-colors"
                    data-testid="mobile-btn-sign-in"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold text-center"
                    data-testid="mobile-btn-get-started"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function NavLinkSimple({
  href, label, onClick,
}: {
  href: string; label: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <motion.a
      href={href}
      onClick={(e) => onClick(e, href)}
      className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      whileHover={{ y: -1 }}
      data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {label}
      <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.a>
  );
}
