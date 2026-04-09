import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Tools", href: "#tools-overview" },
  { label: "Engineering Suite", href: "#engineering-suite" },
  { label: "Academic Hub", href: "#academic-hub" },
  { label: "Resources", href: "#content-powerhouse" },
  { label: "News", href: "#news-feed" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(22, 33, 62, 0.92)"
          : "rgba(22, 33, 62, 0.60)",
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
            className="flex items-center gap-2 group"
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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.label} href={link.href} label={link.label} onClick={handleNavClick} />
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="#engineering-suite"
              onClick={(e) => handleNavClick(e, "#engineering-suite")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              data-testid="button-get-started"
            >
              Get Started
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
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
            style={{
              background: "rgba(22, 33, 62, 0.97)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-sm font-medium"
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#engineering-suite"
                onClick={(e) => handleNavClick(e, "#engineering-suite")}
                className="mt-2 py-3 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center"
                data-testid="mobile-button-get-started"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
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
