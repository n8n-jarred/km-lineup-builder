import { createFileRoute, Link } from "@tanstack/react-router";
import { useTeam } from "@/lib/use-team";
import { playerTotals } from "@/lib/games";
import { playerScore } from "@/lib/lineup";
import { GenderChip, Meter, RoleChip, SkillChip, Stat } from "@/components/Chips";
import { PlayerGameRows } from "@/components/PlayerGameRows";

export const Route = createFileRoute("/players/$id")({
  head: () => ({
    meta: [
      { title: "Player card — KM Ultimate" },
      {
        name: "description",
        content: "Per-player stats and game-by-game notes: blocks, assists, goals and coach notes.",
      },
      { property: "og:title", content: "Player card — KM Ultimate" },
      {
        property: "og:description",
        content: "Blocks, assists, goals and notes for every game a KM Ultimate player lined up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayerCard,
});

const BALANCED_W = { throwing: 1, speed: 1, defense: 1, stamina: 1, exp: 0.6 };

function PlayerCard() {
  const { id } = Route.useParams();
  const { hydrated, roster, games } = useTeam();

  const player = roster.find((p) => p.id === id);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!player) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-sm text-muted-foreground">This player isn't on the roster.</p>
        <Link
          to="/"
          className="rounded-md bg-brand px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground"
        >
          Back to the builder
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            to="/"
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ← Line builder
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold leading-none">{player.name}</h1>
            {player.captain ? (
              <span className="rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                Captain
              </span>
            ) : null}
            {player.spiritCaptain ? (
              <span className="rounded-sm border border-good/40 bg-good/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-good">
                Spirit
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <GenderChip gender={player.gender} />
            <SkillChip skill={player.skill} />
            <RoleChip role={player.role} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {player.years} yr{player.years === 1 ? "" : "s"} played
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(() => {
            const totals = playerTotals(games, player.id);
            return (
              <>
                <Stat label="Games played" value={totals.gamesPlayed} />
                <Stat label="Blocks" value={totals.blocks} tone="warn" />
                <Stat label="Assists" value={totals.assists} />
                <Stat label="Goals" value={totals.goals} tone="good" />
              </>
            );
          })()}
        </div>

        <section className="panel space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider">Attributes</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Rating {playerScore(player, { id: "balanced", name: "", blurb: "", w: BALANCED_W, want: { Handler: 2, Cutter: 3, "All-arounder": 2 } })}
            </span>
          </div>
          {([
            ["Throwing", player.throwing],
            ["Speed", player.speed],
            ["Defense", player.defense],
            ["Stamina", player.stamina],
          ] as Array<[string, number]>).map(([label, value]) => (
            <div key={label}>
              <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-mono text-muted-foreground">{value}/10</span>
              </div>
              <div className="mt-1">
                <Meter value={value * 10} />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold">Game-by-game</h2>
            <p className="text-xs text-muted-foreground">
              Stats and your notes for every game this player lined up.
            </p>
          </div>
          <PlayerGameRows playerId={player.id} />
        </section>
      </main>
    </div>
  );
}
