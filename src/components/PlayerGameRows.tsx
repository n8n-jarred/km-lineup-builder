import { useTeam } from "@/lib/use-team";
import { playerGameStats } from "@/lib/games";

/** Per-game rows for a player: stats in that game plus an editable note. */
export function PlayerGameRows({ playerId }: { playerId: string }) {
  const { games, updateGame } = useTeam();

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No games logged yet — notes will appear here after your first game.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {games.map((g) => {
        const s = playerGameStats(g, playerId);
        return (
          <div key={g.id} className="panel p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{g.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {g.date}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {s.played ? (
                <>
                  <span className="rounded-sm border border-warn/30 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-warn">
                    {s.blocks} blk
                  </span>
                  <span className="rounded-sm border border-intermediate/30 bg-intermediate/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-intermediate">
                    {s.assists} ast
                  </span>
                  <span className="rounded-sm border border-good/30 bg-good/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-good">
                    {s.goals} gls
                  </span>
                </>
              ) : (
                <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Didn't play
                </span>
              )}
            </div>
            <textarea
              className="field mt-2 min-h-16 text-xs"
              value={g.playerNotes[playerId] ?? ""}
              onChange={(e) =>
                updateGame(g.id, {
                  playerNotes: { ...g.playerNotes, [playerId]: e.target.value },
                })
              }
              placeholder={`Your note about this player in ${g.label}…`}
            />
          </div>
        );
      })}
    </div>
  );
}
