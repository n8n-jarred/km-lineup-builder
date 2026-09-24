import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTeam } from "@/lib/use-team";
import { gameScore } from "@/lib/games";
import { Stat } from "@/components/Chips";
import { PointLogger } from "@/components/PointLogger";

export const Route = createFileRoute("/games/$id")({
  head: () => ({
    meta: [
      { title: "Game log — KM Ultimate" },
      {
        name: "description",
        content: "Log every point from the sideline: blocks, assists, goals and notes.",
      },
      { property: "og:title", content: "Game log — KM Ultimate" },
      {
        property: "og:description",
        content: "Point-by-point game tracking with player stats and notes for KM Ultimate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameDetail,
});

function GameDetail() {
  const { id } = Route.useParams();
  const { hydrated, roster, games, updateGame, deleteGame, addPoint, removePoint } = useTeam();

  const game = games.find((g) => g.id === id);
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-sm text-muted-foreground">This game doesn't exist anymore.</p>
        <Link
          to="/games"
          className="rounded-md bg-brand px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
        >
          Back to games
        </Link>
      </div>
    );
  }

  const nameOf = (pid: string) => roster.find((p) => p.id === pid)?.name ?? "Unknown";
  const { us, them } = gameScore(game);
  const lastLine = game.points.length ? game.points[game.points.length - 1]!.playerIds : [];
  const playedIds = [...new Set(game.points.flatMap((p) => p.playerIds))];
  const noteTargets = showAllPlayers
    ? roster
    : roster.filter((p) => playedIds.includes(p.id) || (game.playerNotes[p.id] ?? "").trim());

  const setPlayerNote = (pid: string, note: string) =>
    updateGame(game.id, { playerNotes: { ...game.playerNotes, [pid]: note } });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/games"
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              ← All games
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  game.status === "live" ? "bg-warn/15 text-warn" : "bg-good/15 text-good"
                }`}
              >
                {game.status === "live" ? "Live" : "Final"}
              </span>
              <button
                onClick={() =>
                  updateGame(game.id, {
                    status: game.status === "live" ? "final" : "live",
                  })
                }
                className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {game.status === "live" ? "Finish game" : "Reopen"}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${game.label}" and all its points?`)) {
                    deleteGame(game.id);
                    window.location.assign("/games");
                  }
                }}
                className="rounded-md border border-border bg-secondary px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <input
              className="field max-w-md flex-1 font-semibold"
              value={game.label}
              onChange={(e) => updateGame(game.id, { label: e.target.value })}
              aria-label="Game name"
            />
            <div className="text-right font-mono">
              <div className="text-2xl font-bold leading-none">
                <span className="text-good">{us}</span>
                <span className="text-muted-foreground"> — </span>
                <span className="text-destructive">{them}</span>
              </div>
              <div className="label-xs mt-1">{game.date}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat label="Points played" value={game.points.length} />
          <Stat label="Our points" value={us} tone="good" />
          <Stat label="Their points" value={them} tone="warn" />
          <Stat
            label="Blocks / assists / goals"
            value={`${game.points.reduce((a, p) => a + p.blocks.length, 0)} / ${game.points.reduce((a, p) => a + p.assists.length, 0)} / ${game.points.reduce((a, p) => a + p.goals.length, 0)}`}
          />
        </div>

        <PointLogger
          roster={roster}
          lastLine={lastLine}
          onLog={(point) => addPoint(game.id, point)}
        />

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Points</h2>
          {game.points.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No points logged yet — pick the seven on the field above and log the first point.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {[...game.points].reverse().map((p, i) => {
                const n = game.points.length - i;
                return (
                  <div key={p.id} className="px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                            p.result === "us" ? "bg-good/15 text-good" : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {p.result === "us" ? "Us" : "Them"}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Point {n} · {p.playerIds.length}/7
                        </span>
                      </div>
                      <button
                        onClick={() => removePoint(game.id, p.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove point ${n}`}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.goals.map((pid) => (
                        <span
                          key={`g-${pid}`}
                          className="rounded-sm border border-good/30 bg-good/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-good"
                        >
                          G · {nameOf(pid)}
                        </span>
                      ))}
                      {p.assists.map((pid) => (
                        <span
                          key={`a-${pid}`}
                          className="rounded-sm border border-intermediate/30 bg-intermediate/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-intermediate"
                        >
                          A · {nameOf(pid)}
                        </span>
                      ))}
                      {p.blocks.map((pid) => (
                        <span
                          key={`b-${pid}`}
                          className="rounded-sm border border-warn/30 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-warn"
                        >
                          B · {nameOf(pid)}
                        </span>
                      ))}
                    </div>
                    {p.note ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">{p.note}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold">Post-game note</h2>
            <p className="text-xs text-muted-foreground">
              How did the game go? What to fix at practice?
            </p>
          </div>
          <textarea
            className="field min-h-28"
            value={game.gameNote}
            onChange={(e) => updateGame(game.id, { gameNote: e.target.value })}
            placeholder="Write your note after the game…"
          />
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold">Player notes</h2>
              <p className="text-xs text-muted-foreground">
                A short note per player for this game — who showed up, who struggled.
              </p>
            </div>
            <button
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {noteTargets.length === roster.length ? "Only players who played" : "Show all players"}
            </button>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {noteTargets.map((p) => (
              <div key={p.id} className="panel flex items-start gap-2 p-3">
                <span className="w-32 shrink-0 truncate pt-2 text-xs font-medium" title={p.name}>
                  {p.name}
                </span>
                <textarea
                  className="field min-h-16 text-xs"
                  value={game.playerNotes[p.id] ?? ""}
                  onChange={(e) => setPlayerNote(p.id, e.target.value)}
                  placeholder={`Note about ${p.name}…`}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
