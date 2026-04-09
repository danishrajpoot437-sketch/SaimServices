import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about" className="border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8" style={{ background: "rgba(15, 20, 40, 0.8)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text-blue">Saim</span>
                <span className="text-foreground">Services</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              A professional productivity ecosystem for engineers, students, developers, and researchers worldwide.
              Built with precision. Designed for excellence.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Mail, href: "mailto:hello@saimservices.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200 border border-white/10 hover:border-primary/30"
                  aria-label={label}
                  data-testid={`footer-social-${label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {["Scientific Calculator", "Unit Converter", "Case Converter", "Character Counter", "CGPA Converter"].map((item) => (
                <li key={item}>
                  <a href="#tools-overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {["Engineering Suite", "Academic Hub", "Content Tools", "News Feed", "University Tracker"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SaimServices.com. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for engineers, students, and researchers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
