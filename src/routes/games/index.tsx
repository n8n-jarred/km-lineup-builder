import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTeam } from "@/lib/use-team";
import { gameScore } from "@/lib/games";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Games — KM Ultimate" },
      {
        name: "description",
        content:
          "Track every KM Ultimate game: point-by-point log with blocks, assists and goals, post-game notes and player ratings.",
      },
      { property: "og:title", content: "Games — KM Ultimate" },
      {
        property: "og:description",
        content: "Point-by-point game tracking with player stats and notes for KM Ultimate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function GamesPage() {
  const { hydrated, games, createGame, deleteGame } = useTeam();
  const [label, setLabel] = useState("KM vs ");
  const [date, setDate] = useState(todayISO);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  const create = () => {
    const trimmed = label.trim() || "KM vs ?";
    const game = createGame(trimmed, date);
    window.location.assign(`/games/${game.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-2xl font-extrabold uppercase leading-none text-brand-bright">
              Games
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">KM Ultimate · game log</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/pitch"
              className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Pitch
            </Link>
            <Link
              to="/"
              className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              ← Line builder
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section className="panel space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">New game</h2>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="label-xs">Game name</span>
              <input
                className="field mt-1"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="KM vs Team B"
              />
            </label>
            <label className="block">
              <span className="label-xs">Date</span>
              <input
                type="date"
                className="field mt-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <button
              onClick={create}
              className="rounded-md bg-brand px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:bg-brand-bright active:scale-[0.98]"
            >
              Start game
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">All games</h2>
          {games.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No games yet. Name your first game above and hit Start.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {games.map((g) => {
                const { us, them } = gameScore(g);
                return (
                  <div key={g.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                    <Link to="/games/$id" params={{ id: g.id }} className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold hover:text-brand-bright">
                          {g.label}
                        </span>
                        <span
                          className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                            g.status === "live"
                              ? "bg-warn/15 text-warn"
                              : "bg-good/15 text-good"
                          }`}
                        >
                          {g.status === "live" ? "Live" : "Final"}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {g.date} · {g.points.length} point{g.points.length === 1 ? "" : "s"}
                      </div>
                    </Link>
                    <div className="font-mono text-sm font-semibold">
                      <span className="text-good">{us}</span>
                      <span className="text-muted-foreground"> — </span>
                      <span className="text-destructive">{them}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/games/$id"
                        params={{ id: g.id }}
                        className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${g.label}" and all its points?`))
                            deleteGame(g.id);
                        }}
                        className="rounded-md border border-border bg-secondary px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${g.label}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
