import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { STRATEGIES, buildLine, lineMetrics, type GeneratedLine, type StrategyId } from "@/lib/lineup";
import { useTeam } from "@/lib/use-team";
import { GenderChip, Meter, RoleChip, SkillChip, Stat } from "@/components/Chips";
import { RosterTable } from "@/components/RosterTable";
import { HistorySection } from "@/components/HistorySection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KM Ultimate — Roster & Line Builder" },
      {
        name: "description",
        content:
          "Captain's tool for KM Ultimate: rate every player by skill, role and experience, then build the best 4:3 or 3:4 line for defense, quick offense, short-ball or cup.",
      },
      { property: "og:title", content: "KM Ultimate — Roster & Line Builder" },
      {
        property: "og:description",
        content:
          "Build and compare mixed-ratio ultimate frisbee lines with success rate, turnovers and conversion for every strategy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type RatioId = "4-3" | "3-4";

const RATIOS: Record<RatioId, { males: number; females: number; label: string }> = {
  "4-3": { males: 4, females: 3, label: "4 Male : 3 Female" },
  "3-4": { males: 3, females: 4, label: "3 Male : 4 Female" },
};

function Index() {
  const { hydrated, roster, history, updatePlayer, saveLine, removeLine, clearHistory, resetRoster } =
    useTeam();

  const [strategyId, setStrategyId] = useState<StrategyId>("balanced");
  const [ratio, setRatio] = useState<RatioId>("4-3");
  const [lineIds, setLineIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const strategy = STRATEGIES.find((s) => s.id === strategyId) ?? STRATEGIES[0]!;
  const { males, females, label: ratioLabel } = RATIOS[ratio];

  const line = useMemo(
    () => lineIds.map((id) => roster.find((p) => p.id === id)!).filter(Boolean),
    [lineIds, roster],
  );
  const metrics = useMemo(() => lineMetrics(line, strategy), [line, strategy]);

  const lineMales = line.filter((p) => p.gender === "M").length;
  const lineFemales = line.filter((p) => p.gender === "F").length;
  const ratioOk = lineMales === males && lineFemales === females;

  const generate = () => {
    setLineIds(buildLine(roster, strategy, males, females).map((p) => p.id));
    setSaved(false);
  };

  const toggleInLine = (id: string) => {
    setSaved(false);
    setLineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 7 ? prev : [...prev, id],
    );
  };

  const save = () => {
    if (line.length !== 7) return;
    const entry: GeneratedLine = {
      id: `${Date.now()}`,
      createdAt: Date.now(),
      strategy: strategy.id,
      strategyName: strategy.name,
      ratio: ratioLabel,
      playerIds: line.map((p) => p.id),
      playerNames: line.map((p) => p.name),
      metrics,
    };
    saveLine(entry);
    setSaved(true);
  };

  const bestPerStrategy = useMemo(
    () =>
      STRATEGIES.map((s) => {
        const built = buildLine(roster, s, males, females);
        return { strategy: s, metrics: lineMetrics(built, s) };
      }).sort((a, b) => b.metrics.successRate - a.metrics.successRate),
    [roster, males, females],
  );

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-2xl font-extrabold uppercase leading-none text-brand-bright">
              KM Ultimate
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span className="rounded-sm bg-brand px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Captain · Jarred Leysa
              </span>
              <span className="rounded-sm border border-good/40 bg-good/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-good">
                Spirit · Yno
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/games"
              className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Games
            </Link>
            <div className="text-right">
              <div className="label-xs">Roster</div>
              <div className="font-mono text-sm font-semibold">{roster.length} players</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-8">
        {/* Controls */}
        <section className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label-xs">Game plan</span>
                <select
                  className="field mt-1"
                  value={strategyId}
                  onChange={(e) => {
                    setStrategyId(e.target.value as StrategyId);
                    setSaved(false);
                  }}
                >
                  {STRATEGIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-xs">Gender ratio</span>
                <select
                  className="field mt-1"
                  value={ratio}
                  onChange={(e) => {
                    setRatio(e.target.value as RatioId);
                    setSaved(false);
                  }}
                >
                  <option value="4-3">4 Male : 3 Female</option>
                  <option value="3-4">3 Male : 4 Female</option>
                </select>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={generate}
                className="w-full rounded-md bg-brand px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:bg-brand-bright active:scale-[0.98] lg:w-auto"
              >
                Generate best line
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{strategy.blurb}</p>
        </section>

        {/* Current line */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">On the field</h2>
              <p className="text-xs text-muted-foreground">
                {line.length}/7 selected ·{" "}
                <span className={ratioOk ? "text-good" : "text-warn"}>
                  {lineMales}M / {lineFemales}F {ratioOk ? "— ratio OK" : `— need ${males}M / ${females}F`}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLineIds([]);
                  setSaved(false);
                }}
                className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Clear line
              </button>
              <button
                onClick={save}
                disabled={line.length !== 7 || saved}
                className="rounded-md border border-brand-bright px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-bright disabled:opacity-40"
              >
                {saved ? "Saved ✓" : "Save to history"}
              </button>
            </div>
          </div>

          {line.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Pick a game plan and ratio, then generate a line — or tap Add on any player.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {line.map((p) => (
                  <div key={p.id} className="panel flex flex-col gap-2 p-3">
                    <div className="flex items-center justify-between">
                      <GenderChip gender={p.gender} />
                      <button
                        onClick={() => toggleInLine(p.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${p.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{p.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <SkillChip skill={p.skill} />
                      <RoleChip role={p.role} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.years} yr{p.years === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Stat label="Success rate" value={metrics.successRate} suffix="%" tone="good" />
                <Stat label="Conversion rate" value={metrics.conversionRate} suffix="%" />
                <Stat label="Turnovers / point" value={metrics.turnoversPerPoint} tone="warn" />
                <Stat label="Line rating" value={metrics.rating} />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="panel p-4">
                  <div className="label-xs text-good">Main strength</div>
                  <p className="mt-1.5 text-sm font-medium">{metrics.strength}</p>
                </div>
                <div className="panel p-4">
                  <div className="label-xs text-warn">Main weakness</div>
                  <p className="mt-1.5 text-sm font-medium">{metrics.weakness}</p>
                </div>
              </div>

              <div className="panel grid grid-cols-2 gap-4 p-4 sm:grid-cols-5">
                {[
                  ["Handlers", metrics.handlers],
                  ["Cutters", metrics.cutters],
                  ["All-arounders", metrics.allArounders],
                  ["Elite players", metrics.elite],
                  ["Avg years", metrics.avgYears],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="label-xs">{label}</div>
                    <div className="mt-1 font-mono text-lg font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Best plan comparison */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Which plan suits this roster</h2>
            <p className="text-xs text-muted-foreground">
              Best possible line per game plan at {ratioLabel} — ranked by projected success rate.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bestPerStrategy.map(({ strategy: s, metrics: m }, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setStrategyId(s.id);
                  setLineIds(buildLine(roster, s, males, females).map((p) => p.id));
                  setSaved(false);
                }}
                className={`panel p-4 text-left transition-colors hover:border-brand-bright ${
                  s.id === strategyId ? "border-brand-bright bg-brand-soft/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{s.name}</h3>
                  {i === 0 ? (
                    <span className="rounded-sm bg-good/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-good">
                      Best fit
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.blurb}</p>
                <div className="mt-3">
                  <Meter value={m.successRate} tone={i === 0 ? "good" : "brand"} />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>{m.successRate}% success</span>
                  <span>{m.turnoversPerPoint} TO/pt</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <RosterTable
          roster={roster}
          strategy={strategy}
          lineIds={lineIds}
          onUpdate={updatePlayer}
          onToggleInLine={toggleInLine}
        />

        <HistorySection history={history} onRemove={removeLine} onClear={clearHistory} />

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Ratings are starting estimates — open any player to adjust their level, role, years and
            attributes. Everything saves on this device.
          </p>
          <button
            onClick={resetRoster}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Reset ratings
          </button>
        </footer>
      </main>
    </div>
  );
}
