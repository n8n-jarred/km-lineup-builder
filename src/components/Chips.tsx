import type { Gender, Role, Skill } from "@/lib/team-data";

const skillClass: Record<Skill, string> = {
  Elite: "text-elite border-elite/30 bg-elite/10",
  Intermediate: "text-intermediate border-intermediate/30 bg-intermediate/10",
  Beginner: "text-beginner border-beginner/30 bg-beginner/10",
};

export function SkillChip({ skill }: { skill: Skill }) {
  return (
    <span
      className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${skillClass[skill]}`}
    >
      {skill === "Intermediate" ? "Inter" : skill}
    </span>
  );
}

export function RoleChip({ role }: { role: Role }) {
  const short =
    role === "All-arounder" ? "All-around" : role === "Handler" ? "Handler" : "Cutter";
  return (
    <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {short}
    </span>
  );
}

export function GenderChip({ gender }: { gender: Gender }) {
  return (
    <span
      className={`grid size-5 place-items-center rounded-sm font-mono text-[10px] font-bold ${
        gender === "M"
          ? "bg-brand/25 text-brand-bright"
          : "bg-intermediate/20 text-intermediate"
      }`}
    >
      {gender}
    </span>
  );
}

export function Meter({ value, tone = "brand" }: { value: number; tone?: "brand" | "good" | "warn" }) {
  const bg =
    tone === "good" ? "bg-good" : tone === "warn" ? "bg-warn" : "bg-brand-bright";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full transition-all duration-500 ${bg}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tone?: "good" | "warn" | "default";
}) {
  const color =
    tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-foreground";
  return (
    <div className="panel px-3 py-2.5">
      <div className="label-xs">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold ${color}`}>
        {value}
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}
