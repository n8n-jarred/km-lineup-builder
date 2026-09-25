import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  GENDERS,
  ROLES,
  SKILLS,
  type Gender,
  type Player,
  type Role,
  type Skill,
} from "@/lib/team-data";
import { playerScore, type Strategy } from "@/lib/lineup";
import { GenderChip, Meter, RoleChip, SkillChip } from "./Chips";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

type Props = {
  roster: Player[];
  strategy: Strategy;
  lineIds: string[];
  onUpdate: (id: string, patch: Partial<Player>) => void;
  onDelete?: (id: string) => void;
  onToggleInLine: (id: string) => void;
};

export function RosterTable({
  roster,
  strategy,
  lineIds,
  onUpdate,
  onDelete,
  onToggleInLine,
}: Props) {
  const [gender, setGender] = useState<Gender | "all">("all");
  const [skill, setSkill] = useState<Skill | "all">("all");
  const [role, setRole] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return roster
      .filter((p) => gender === "all" || p.gender === gender)
      .filter((p) => skill === "all" || p.skill === skill)
      .filter((p) => role === "all" || p.role === role)
      .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => playerScore(b, strategy) - playerScore(a, strategy));
  }, [roster, gender, skill, role, query, strategy]);

  const handlePlayerUpdate = async (id: string, patch: Partial<Player>) => {
    // 1. Fire parent state handler immediately for local UI reactivity
    onUpdate(id, patch);

    // 2. Persist update in Firestore
    try {
      setSavingId(id);
      const playerRef = doc(db, "players", id);
      await updateDoc(playerRef, patch);
    } catch (error) {
      console.error(`Failed to update player ${id} in Firestore:`, error);
    } finally {
      setSavingId(null);
    }
  };

  const handlePlayerDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this player?")) return;

    try {
      setSavingId(id);
      await deleteDoc(doc(db, "players", id));
      if (onDelete) onDelete(id);
      if (openId === id) setOpenId(null);
    } catch (error) {
      console.error(`Failed to delete player ${id} from Firestore:`, error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Roster</h2>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {roster.length} players, ranked for{" "}
            <span className="text-brand-bright">{strategy.name}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label-xs">Search</span>
          <input
            className="field mt-1"
            placeholder="Player name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label-xs">Gender</span>
          <select
            className="field mt-1"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | "all")}
          >
            <option value="all">All genders</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g === "M" ? "Male" : "Female"}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-xs">Skill level</span>
          <select
            className="field mt-1"
            value={skill}
            onChange={(e) => setSkill(e.target.value as Skill | "all")}
          >
            <option value="all">All levels</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-xs">Role</span>
          <select
            className="field mt-1"
            value={role}
            onChange={(e) => setRole(e.target.value as Role | "all")}
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {filtered.map((p) => {
          const score = playerScore(p, strategy);
          const onLine = lineIds.includes(p.id);
          const open = openId === p.id;
          const isSaving = savingId === p.id;

          return (
            <div key={p.id} className={onLine ? "bg-brand-soft/50" : ""}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <GenderChip gender={p.gender} />
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                    {p.captain ? (
                      <span className="rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                        Captain
                      </span>
                    ) : null}
                    {p.spiritCaptain ? (
                      <span className="rounded-sm border border-good/40 bg-good/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-good">
                        Spirit
                      </span>
                    ) : null}
                    {isSaving && (
                      <span className="font-mono text-[9px] text-muted-foreground animate-pulse">
                        Saving...
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <SkillChip skill={p.skill} />
                    <RoleChip role={p.role} />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.years} yr{p.years === 1 ? "" : "s"}
                    </span>
                  </div>
                </button>

                <div className="w-16 shrink-0 text-right">
                  <div className="font-mono text-sm font-semibold text-brand-bright">
                    {score}
                  </div>
                  <div className="mt-1">
                    <Meter value={score} />
                  </div>
                </div>

                <Link
                  to="/players/$id"
                  params={{ id: p.id }}
                  className="shrink-0 rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-brand-bright hover:text-foreground"
                  aria-label={`Open card for ${p.name}`}
                >
                  Card
                </Link>

                <button
                  onClick={() => onToggleInLine(p.id)}
                  className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    onLine
                      ? "border-brand-bright bg-brand text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:border-brand-bright hover:text-foreground"
                  }`}
                >
                  {onLine ? "On" : "Add"}
                </button>
              </div>

              {open ? (
                <div className="grid gap-3 border-t border-border bg-background/40 px-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block">
                    <span className="label-xs">Skill level</span>
                    <select
                      className="field mt-1"
                      value={p.skill}
                      onChange={(e) =>
                        handlePlayerUpdate(p.id, { skill: e.target.value as Skill })
                      }
                    >
                      {SKILLS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-xs">Role</span>
                    <select
                      className="field mt-1"
                      value={p.role}
                      onChange={(e) =>
                        handlePlayerUpdate(p.id, { role: e.target.value as Role })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-xs">Gender</span>
                    <select
                      className="field mt-1"
                      value={p.gender}
                      onChange={(e) =>
                        handlePlayerUpdate(p.id, { gender: e.target.value as Gender })
                      }
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-xs">Years playing</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      className="field mt-1"
                      value={p.years}
                      onChange={(e) =>
                        handlePlayerUpdate(p.id, { years: Number(e.target.value) || 0 })
                      }
                    />
                  </label>

                  {(
                    [
                      ["throwing", "Throwing"],
                      ["speed", "Speed"],
                      ["defense", "Defense"],
                      ["stamina", "Stamina"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="label-xs">
                        {label} — {p[key]}/10
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        className="mt-2 w-full accent-[var(--brand-bright)]"
                        value={p[key]}
                        onChange={(e) =>
                          handlePlayerUpdate(p.id, { [key]: Number(e.target.value) })
                        }
                      />
                    </label>
                  ))}

                  <div className="col-span-full flex justify-end pt-2">
                    <button
                      onClick={() => handlePlayerDelete(p.id)}
                      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1 font-mono text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      Delete Player
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No players match those filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}