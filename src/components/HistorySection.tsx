import type { GeneratedLine } from "@/lib/lineup";
import { Stat } from "./Chips";

export function HistorySection({
  history,
  onRemove,
  onClear,
}: {
  history: GeneratedLine[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const avg = (pick: (l: GeneratedLine) => number) =>
    history.length
      ? Math.round((history.reduce((a, l) => a + pick(l), 0) / history.length) * 10) / 10
      : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Line history</h2>
          <p className="text-xs text-muted-foreground">
            {history.length
              ? `Averages across your last ${history.length} saved line${history.length === 1 ? "" : "s"}`
              : "Save a line to start tracking averages"}
          </p>
        </div>
        {history.length ? (
          <button
            onClick={onClear}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Clear history
          </button>
        ) : null}
      </div>

      {history.length ? (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Avg success rate" value={avg((l) => l.metrics.successRate)} suffix="%" tone="good" />
            <Stat label="Avg conversion" value={avg((l) => l.metrics.conversionRate)} suffix="%" />
            <Stat label="Avg turnovers / pt" value={avg((l) => l.metrics.turnoversPerPoint)} tone="warn" />
            <Stat label="Avg line rating" value={avg((l) => l.metrics.rating)} />
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {history.map((l) => (
              <div key={l.id} className="px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-brand px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {l.strategyName}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {l.ratio} · {new Date(l.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-good">{l.metrics.successRate}% success</span>
                    <span className="text-muted-foreground">
                      {l.metrics.conversionRate}% conv
                    </span>
                    <span className="text-warn">{l.metrics.turnoversPerPoint} TO</span>
                    <button
                      onClick={() => onRemove(l.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove line"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {l.playerNames.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Generate a line and hit Save to history.
          </p>
        </div>
      )}
    </section>
  );
}
