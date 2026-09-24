import { useEffect, useState } from "react";
import type { Player } from "@/lib/team-data";
import type { GamePoint, PointResult } from "@/lib/games";

/** Point entry form used during a live game. Keeps the last line prefilled. */
export function PointLogger({
  roster,
  lastLine,
  onLog,
}: {
  roster: Player[];
  lastLine: string[];
  onLog: (point: Omit<GamePoint, "id">) => void;
}) {
  const [result, setResult] = useState<PointResult>("us");
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [assists, setAssists] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [pointNote, setPointNote] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched && lastLine.length > 0) setPlayerIds(lastLine);
  }, [lastLine, touched]);

  const toggleOnField = (pid: string) => {
    setTouched(true);
    if (playerIds.includes(pid)) {
      setPlayerIds(playerIds.filter((x) => x !== pid));
      setBlocks(blocks.filter((x) => x !== pid));
      setAssists(assists.filter((x) => x !== pid));
      setGoals(goals.filter((x) => x !== pid));
    } else {
      setPlayerIds([...playerIds, pid]);
    }
  };

  const toggleIn =
    (list: string[], setList: (v: string[]) => void) => (pid: string) =>
      setList(list.includes(pid) ? list.filter((x) => x !== pid) : [...list, pid]);

  const toggleBlock = toggleIn(blocks, setBlocks);
  const toggleAssist = toggleIn(assists, setAssists);
  const toggleGoal = toggleIn(goals, setGoals);

  const log = () => {
    onLog({
      result,
      playerIds: [...playerIds],
      blocks,
      assists,
      goals,
      ...(pointNote.trim() ? { note: pointNote.trim() } : {}),
    });
    setBlocks([]);
    setAssists([]);
    setGoals([]);
    setPointNote("");
  };

  const selected = playerIds
    .map((id) => roster.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));

  const statBtn = (active: boolean) =>
    `size-8 rounded-sm border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
      active
        ? "border-brand-bright bg-brand text-primary-foreground"
        : "border-border bg-secondary text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="panel space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider">Log next point</h3>
        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            onClick={() => setResult("us")}
            className={`px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider ${
              result === "us" ? "bg-good text-background" : "bg-secondary text-muted-foreground"
            }`}
          >
            We scored
          </button>
          <button
            onClick={() => setResult("them")}
            className={`px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider ${
              result === "them"
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            They scored
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label-xs">On the field</span>
          <span
            className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
              playerIds.length === 7 ? "text-good" : "text-warn"
            }`}
          >
            {playerIds.length}/7
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {roster.map((p) => {
            const on = playerIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleOnField(p.id)}
                className={`rounded-sm border px-2 py-1 text-xs transition-colors ${
                  on
                    ? "border-brand-bright bg-brand-soft text-foreground"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name}
                <span className="ml-1.5 font-mono text-[9px] text-muted-foreground">
                  {p.gender}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="space-y-1.5">
          <span className="label-xs">This point — tap B / A / G for each player</span>
          {selected.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-sm bg-secondary/60 px-2 py-1.5"
            >
              <span className="truncate text-xs font-medium">{p.name}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => toggleBlock(p.id)}
                  className={statBtn(blocks.includes(p.id))}
                  aria-label={`Block for ${p.name}`}
                >
                  B
                </button>
                <button
                  onClick={() => toggleAssist(p.id)}
                  className={statBtn(assists.includes(p.id))}
                  aria-label={`Assist for ${p.name}`}
                >
                  A
                </button>
                <button
                  onClick={() => toggleGoal(p.id)}
                  className={statBtn(goals.includes(p.id))}
                  aria-label={`Goal for ${p.name}`}
                >
                  G
                </button>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">
            B = block · A = assist (thrower) · G = goal (scorer)
          </p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="label-xs">Point note (optional)</span>
          <input
            className="field mt-1"
            value={pointNote}
            onChange={(e) => setPointNote(e.target.value)}
            placeholder="e.g. broken mark, windy deep looks"
          />
        </label>
        <button
          onClick={log}
          disabled={playerIds.length < 4}
          className="rounded-md bg-brand px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:bg-brand-bright active:scale-[0.98] disabled:opacity-40"
        >
          Log point
        </button>
      </div>
    </div>
  );
}
