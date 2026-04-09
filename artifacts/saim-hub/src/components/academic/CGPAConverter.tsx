import { useState } from "react";
import { motion } from "framer-motion";

type System = "Pakistan" | "India" | "USA";

const systems = [
  { id: "Pakistan" as System, maxGPA: 4.0, label: "Pakistan (4.0 Scale)" },
  { id: "India" as System, maxGPA: 10.0, label: "India (10.0 Scale)" },
  { id: "USA" as System, maxGPA: 4.0, label: "USA GPA (4.0 Scale)" },
];

function convertToPercentage(cgpa: number, system: System): number {
  switch (system) {
    case "Pakistan":
      return (cgpa / 4.0) * 100;
    case "India":
      return (cgpa - 0.75) * 10;
    case "USA":
      return (cgpa / 4.0) * 100;
    default:
      return 0;
  }
}

function getGrade(pct: number): { grade: string; color: string; label: string } {
  if (pct >= 90) return { grade: "A+", color: "text-emerald-400", label: "Outstanding" };
  if (pct >= 80) return { grade: "A", color: "text-blue-400", label: "Excellent" };
  if (pct >= 70) return { grade: "B+", color: "text-primary", label: "Very Good" };
  if (pct >= 60) return { grade: "B", color: "text-purple-400", label: "Good" };
  if (pct >= 50) return { grade: "C", color: "text-amber-400", label: "Average" };
  return { grade: "D", color: "text-red-400", label: "Below Average" };
}

function getUSALetterGrade(gpa: number): string {
  if (gpa >= 3.7) return "A / A+";
  if (gpa >= 3.3) return "A-";
  if (gpa >= 3.0) return "B+";
  if (gpa >= 2.7) return "B";
  if (gpa >= 2.3) return "B-";
  if (gpa >= 2.0) return "C+";
  return "C or below";
}

export default function CGPAConverter() {
  const [system, setSystem] = useState<System>("Pakistan");
  const [cgpa, setCgpa] = useState(3.5);

  const maxGPA = systems.find((s) => s.id === system)!.maxGPA;
  const clampedCgpa = Math.max(0, Math.min(maxGPA, cgpa));
  const percentage = Math.max(0, Math.min(100, convertToPercentage(clampedCgpa, system)));
  const { grade, color, label } = getGrade(percentage);

  const formula =
    system === "Pakistan"
      ? `(${clampedCgpa} / 4.0) × 100`
      : system === "India"
      ? `(${clampedCgpa} − 0.75) × 10`
      : `(${clampedCgpa} / 4.0) × 100`;

  return (
    <div className="space-y-6">
      {/* System Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {systems.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSystem(s.id);
              setCgpa(Math.min(cgpa, s.maxGPA));
            }}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 text-center border ${
              system === s.id
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "glass-card text-muted-foreground hover:text-foreground border-white/10"
            }`}
            data-testid={`btn-cgpa-system-${s.id.toLowerCase()}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* CGPA Input */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Enter CGPA</label>
          <span className="text-xs text-muted-foreground">Max: {maxGPA}</span>
        </div>

        <input
          type="range"
          min={0}
          max={maxGPA}
          step={0.01}
          value={clampedCgpa}
          onChange={(e) => setCgpa(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${(clampedCgpa / maxGPA) * 100}%, rgba(255,255,255,0.1) 0%)`,
          }}
          data-testid="slider-cgpa"
        />

        <div className="flex items-center gap-4">
          <input
            type="number"
            value={clampedCgpa}
            onChange={(e) => setCgpa(Number(e.target.value))}
            min={0}
            max={maxGPA}
            step={0.01}
            className="w-28 bg-muted/50 text-foreground text-2xl font-bold rounded-xl px-3 py-2 border border-white/10 outline-none focus:border-emerald-500/50 font-mono text-center"
            data-testid="input-cgpa-value"
          />
          <span className="text-muted-foreground">/ {maxGPA}</span>
        </div>
      </div>

      {/* Result */}
      <motion.div
        key={`${system}-${clampedCgpa}`}
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        className="glass-card rounded-2xl p-6 border border-emerald-500/20"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-1">
              {percentage.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Percentage</div>
          </div>
          <div>
            <div className={`text-4xl font-bold mb-1 ${color}`}>{grade}</div>
            <div className="text-xs text-muted-foreground">Grade</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className={`text-lg font-semibold mb-1 ${color}`}>{label}</div>
            {system === "USA" && (
              <div className="text-sm text-muted-foreground">{getUSALetterGrade(clampedCgpa)}</div>
            )}
            <div className="text-xs text-muted-foreground">Classification</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-muted-foreground font-mono text-center">
            Formula: {formula} = <span className="text-foreground font-bold">{percentage.toFixed(2)}%</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
