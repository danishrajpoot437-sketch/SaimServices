import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Footer() {
  return (
    <footer id="about" className="relative overflow-hidden" style={{ background: "rgba(10, 14, 32, 0.95)" }}>
      {/* Top gradient border */}
      <div className="section-divider w-full" />

      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(67,97,238,0.06) 0%, transparent 70%)" }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <motion.div
              className="flex items-center gap-2 mb-5"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-blue">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text-blue">Saim</span>
                <span className="text-foreground">Services</span>
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              A professional productivity ecosystem for engineers, students, developers, and researchers worldwide.
              Built with precision. Designed for excellence.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Mail, href: "mailto:hello@saimservices.com", label: "Email" },
              ].map(({ icon: Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                  whileHover={{
                    scale: 1.12,
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 18 },
                  }}
                  whileTap={{ scale: 0.92 }}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200 border border-white/10 hover:border-primary/35"
                  aria-label={label}
                  data-testid={`footer-social-${label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Tools */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-foreground mb-5 tracking-wide">Tools</h4>
            <ul className="space-y-3">
              {["Scientific Calculator", "Unit Converter", "Case Converter", "Character Counter", "CGPA Converter"].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#tools-overview"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1.5 group"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-150" />
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-foreground mb-5 tracking-wide">Platform</h4>
            <ul className="space-y-3">
              {["Engineering Suite", "Academic Hub", "Content Tools", "News Feed", "University Tracker"].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1.5 group"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-150" />
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={itemVariants}
          className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SaimServices.com. All rights reserved.
          </p>
          <motion.p
            className="text-xs text-muted-foreground/60"
            whileHover={{ color: "rgba(255,255,255,0.5)" }}
          >
            Built for engineers, students, and researchers worldwide.
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
