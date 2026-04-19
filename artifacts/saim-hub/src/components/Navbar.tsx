import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Menu, X, Zap, ChevronDown, Ruler, FlaskConical, LineChart, BookOpenCheck, GraduationCap, Library, FileInput, AlignLeft, Rss, LogIn, Quote, Search, Sigma, BarChart2, Building2, Terminal, LogOut, User, Wrench } from "lucide-react";
import { Link } from "wouter";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

interface DropdownItem {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  tab?: string;
}

const dropdownMenus: Record<string, DropdownItem[]> = {
  "Engineering Suite": [
    { label: "Unit Pro",          description: "Convert 9 categories of units instantly",   icon: Ruler,        href: "#engineering-suite", tab: "unitpro"    },
    { label: "Materials Finder",  description: "Properties of 8 engineering materials",     icon: FlaskConical, href: "#engineering-suite", tab: "materials"  },
    { label: "Function Grapher",  description: "2D live plotter with math.js engine",       icon: LineChart,    href: "#engineering-suite", tab: "plotter"    },
    { label: "Eng. Constants",    description: "12 click-to-copy physical constants",       icon: BookOpenCheck,href: "#engineering-suite", tab: "constants"  },
    { label: "Math Solver",       description: "Symbolic & numeric computation engine",     icon: Sigma,        href: "#engineering-suite", tab: "mathsolver" },
    { label: "Stat Suite",        description: "Descriptive stats & regression analysis",   icon: BarChart2,    href: "#engineering-suite", tab: "stats"      },
    { label: "Beam Analyst",      description: "SFD · BMD · deflection — free vs £40/mo",  icon: Building2,    href: "#engineering-suite", tab: "beam"       },
    { label: "Dev Kit",           description: "JSON · Hash · Regex · Color · Timestamp",  icon: Terminal,     href: "#engineering-suite", tab: "devkit"     },
    { label: "Quick Tools",       description: "Ohm's Law · Resistor · Triangle · % · Color · Date", icon: Wrench, href: "#engineering-suite", tab: "quicktools" },
  ],
  "Academic Hub": [
    { label: "Study Guides",       description: "USA & UK guides, scholarships, deadlines",      icon: Library,       href: "#academic-hub", tab: "study"     },
    { label: "GPA Converter",      description: "USA 4.0 ↔ UK Honours dual system",              icon: GraduationCap, href: "#academic-hub", tab: "gpa"       },
    { label: "Citation Generator", description: "APA · MLA · Harvard · Chicago · Vancouver",     icon: Quote,         href: "#academic-hub", tab: "citations" },
    { label: "Research Finder",    description: "Search arXiv, PubMed & 200M+ papers",           icon: Search,        href: "#academic-hub", tab: "research"  },
    { label: "Resource Center",    description: "Common App, FAFSA, UCAS & more",                icon: BookOpenCheck, href: "#academic-hub", tab: "tracker"   },
  ],
  "Resources": [
    { label: "File Converter",    description: "Word, PDF, Image & Text conversions",        icon: FileInput, href: "#content-powerhouse" },
    { label: "Content Analyzer",  description: "Case transform, word count, keywords",       icon: AlignLeft, href: "#content-powerhouse" },
    { label: "News Feed",         description: "Curated AI, Engineering & Scholarship news", icon: Rss,       href: "#news-feed"          },
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

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_GRADIENT = "linear-gradient(135deg, #4361ee 0%, #0ea5e9 100%)";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<Set<string>>(new Set());
  const [authOpen, setAuthOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuRef   = useRef<HTMLDivElement>(null);

  const toggleMobileAccordion = (label: string) => {
    setMobileAccordion((prev) => {
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, tab?: string) => {
    e.preventDefault();
    setActiveDropdown(null);

    const targetEl = document.querySelector(href);
    if (!targetEl) {
      const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      const query = tab ? `?tab=${tab}` : "";
      window.location.assign(`${base}/${query}${href}`);
      return;
    }

    const scrollAndSwitch = () => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      if (tab) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("saim-section-tab", { detail: { section: href.slice(1), tab } })
          );
        }, 120);
      }
    };

    if (mobileOpen) {
      setMobileOpen(false);
      setTimeout(scrollAndSwitch, 300);
    } else {
      scrollAndSwitch();
    }
  };

  const openDropdown  = (label: string) => { if (dropdownTimer.current) clearTimeout(dropdownTimer.current); setActiveDropdown(label); };
  const closeDropdown = () => { dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120); };
  const keepOpen      = () => { if (dropdownTimer.current) clearTimeout(dropdownTimer.current); };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(22, 33, 62, 0.94)" : "rgba(22, 33, 62, 0.60)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(67, 97, 238, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
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
              {simpleLinks.slice(0, 1).map((link) => (
                <NavLinkSimple key={link.label} href={link.href} label={link.label} onClick={handleNavClick} />
              ))}

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
                        <div className="h-px w-full"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.5), transparent)" }} />
                        <div className="p-2">
                          {dropdownMenus[label].map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={(e) => handleNavClick(e, item.href, item.tab)}
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

              {simpleLinks.slice(1).map((link) => (
                <NavLinkSimple key={link.label} href={link.href} label={link.label} onClick={handleNavClick} />
              ))}
              <Link href="/blog"
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                Blog
              </Link>
            </div>

            {/* Desktop CTA — signed out */}
            {!user ? (
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
            ) : (
              /* Desktop CTA — signed in */
              <div className="hidden md:flex items-center gap-3 relative" ref={userMenuRef}>
                <span className="text-sm text-muted-foreground hidden lg:block">
                  Hi, <span className="text-foreground font-semibold">{user.name.split(" ")[0]}</span>
                </span>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none group"
                  data-testid="btn-user-menu"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
                    style={{ background: AVATAR_GRADIENT, boxShadow: "0 0 14px rgba(67,97,238,0.3)" }}
                  >
                    {getInitials(user.name)}
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{
                        background: "rgba(18, 28, 58, 0.98)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(67,97,238,0.25)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.5), transparent)" }} />
                      <div className="p-3">
                        <div className="px-3 py-2.5 mb-1">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: AVATAR_GRADIENT }}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="h-px bg-white/6 my-2" />
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                          onClick={() => { setUserMenuOpen(false); }}
                          data-testid="btn-my-account"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </button>
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-colors"
                          onClick={() => { setUserMenuOpen(false); signOut(); }}
                          data-testid="btn-sign-out"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                <Link href="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-sm font-medium block"
                  data-testid="mobile-nav-blog"
                >
                  Blog
                </Link>

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
                                  onClick={(e) => handleNavClick(e, item.href, item.tab)}
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

                {/* Mobile auth section */}
                {user ? (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: AVATAR_GRADIENT }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 py-3 px-4 rounded-xl text-rose-400 hover:bg-rose-500/8 transition-colors text-sm font-semibold"
                      data-testid="mobile-btn-sign-out"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
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
                      style={{ boxShadow: "0 0 16px rgba(67,97,238,0.3)" }}
                      data-testid="mobile-btn-get-started"
                    >
                      Get Started
                    </button>
                  </div>
                )}
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
