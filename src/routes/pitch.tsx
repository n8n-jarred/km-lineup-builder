import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Pitch — KM Ultimate" },
      {
        name: "description",
        content:
          "KM Ultimate offensive pitch structures: vertical stack (5 cutters, 2 handlers, no dump) and horizontal stack (3 handlers, 4 cutters).",
      },
      { property: "og:title", content: "Pitch — KM Ultimate" },
      {
        property: "og:description",
        content: "Vertical and horizontal stack formations for the KM Ultimate offense.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PitchPage,
});

type PlayerRole = "handler" | "cutter" | "thrower";

type FieldPlayer = {
  id: string;
  x: number;
  y: number;
  role: PlayerRole;
  label: string;
};

type StructureId = "vertical" | "horizontal";

type Structure = {
  id: StructureId;
  name: string;
  ratio: string;
  tagline: string;
  notes: string[];
  players: FieldPlayer[];
};

// Field geometry (shared by both diagrams)
// viewBox 0 0 360 620 — attacking endzone at the top, thrower near the bottom.
const FIELD = { left: 24, right: 336, goalLine: 96, bottom: 600 };

const STRUCTURES: Structure[] = [
  {
    id: "vertical",
    name: "Vertical Stack",
    ratio: "5 Cutters : 2 Handlers",
    tagline: "One column of cutters up the middle, two lateral handlers, no dump.",
    notes: [
      "5 cutters line up single-file on the centerline, spaced ~10–12 yards apart, first cutter about 10 yards off the thrower.",
      "2 handlers set up wide and level with the thrower on either side — not directly behind. No dedicated dump; both are live lateral reset options.",
      "Front of the stack clears first: initiates cuts, opens the lane, then resets to the back so the next cutter can go.",
      "Keeps the middle of the field clear for cutters to break in or deep, while the disc always has two side-to-side outlets.",
    ],
    players: [
      { id: "h1", x: 110, y: 528, role: "handler", label: "H" },
      { id: "th", x: 180, y: 552, role: "thrower", label: "T" },
      { id: "h2", x: 250, y: 528, role: "handler", label: "H" },
      { id: "c1", x: 180, y: 466, role: "cutter", label: "C1" },
      { id: "c2", x: 180, y: 396, role: "cutter", label: "C2" },
      { id: "c3", x: 180, y: 326, role: "cutter", label: "C3" },
      { id: "c4", x: 180, y: 256, role: "cutter", label: "C4" },
      { id: "c5", x: 180, y: 186, role: "cutter", label: "C5" },
    ],
  },
  {
    id: "horizontal",
    name: "Horizontal Stack",
    ratio: "3 Handlers : 4 Cutters",
    tagline: "A handler triangle near the disc, four cutters spread across the width.",
    notes: [
      "3 handlers form a shallow triangle just behind the thrower, moving the disc side-to-side to isolate a matchup.",
      "4 cutters spread out on a line across the field (the 'ho-line'), each holding a separate lane from sideline to sideline.",
      "Only one cutter attacks the open space at a time — usually straight up the open lane or deep — while the other three hold their spacing.",
      "Wide spacing creates more one-on-one isolation and more direct up-line/deep looks than the vertical stack.",
    ],
    players: [
      { id: "h1", x: 100, y: 560, role: "handler", label: "H" },
      { id: "th", x: 180, y: 574, role: "thrower", label: "T" },
      { id: "h2", x: 260, y: 560, role: "handler", label: "H" },
      { id: "c1", x: 48, y: 286, role: "cutter", label: "C1" },
      { id: "c2", x: 138, y: 260, role: "cutter", label: "C2" },
      { id: "c3", x: 222, y: 260, role: "cutter", label: "C3" },
      { id: "c4", x: 312, y: 286, role: "cutter", label: "C4" },
    ],
  },
];

function FieldDiagram({ structure }: { structure: Structure }) {
  const width = FIELD.right - FIELD.left;
  return (
    <svg
      viewBox="0 0 360 620"
      className="w-full max-w-sm"
      role="img"
      aria-label={`${structure.name} formation diagram`}
    >
      {/* field */}
      <rect
        x={FIELD.left}
        y={8}
        width={width}
        height={FIELD.bottom - 8}
        rx={4}
        className="fill-card stroke-border"
        strokeWidth={1.5}
      />
      {/* attacking endzone */}
      <rect
        x={FIELD.left}
        y={8}
        width={width}
        height={FIELD.goalLine - 8}
        className="fill-brand-soft"
      />
      <line
        x1={FIELD.left}
        y1={FIELD.goalLine}
        x2={FIELD.right}
        y2={FIELD.goalLine}
        className="stroke-brand-bright"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <text
        x={180}
        y={40}
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: 10, letterSpacing: "0.15em" }}
      >
        END ZONE
      </text>
      <text
        x={180}
        y={FIELD.bottom - 14}
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: 9, letterSpacing: "0.1em" }}
      >
        DIRECTION OF ATTACK ↑
      </text>

      {/* players */}
      {structure.players.map((p) => {
        const isThrower = p.role === "thrower";
        const isHandler = p.role === "handler";
        const fillClass = isThrower
          ? "fill-brand-bright"
          : isHandler
            ? "fill-intermediate"
            : "fill-good";
        return (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isThrower ? 15 : 13}
              className={fillClass}
              stroke="var(--color-background)"
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              className="fill-background font-mono font-bold"
              style={{ fontSize: isThrower ? 10 : 9 }}
            >
              {p.label}
            </text>
            {isThrower ? (
              <circle
                cx={p.x + 16}
                cy={p.y - 10}
                r={4}
                className="fill-foreground"
                stroke="var(--color-background)"
                strokeWidth={1}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function PitchPage() {
  const [structureId, setStructureId] = useState<StructureId>("vertical");
  const structure = useMemo(
    () => STRUCTURES.find((s) => s.id === structureId) ?? STRUCTURES[0]!,
    [structureId],
  );
  const handlerCount = structure.players.filter(
    (p) => p.role === "handler" || p.role === "thrower",
  ).length;
  const cutterCount = structure.players.filter((p) => p.role === "cutter").length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-2xl font-extrabold uppercase leading-none text-brand-bright">
              Pitch
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              KM Ultimate · offensive pitch structures
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/games"
              className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Games
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

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Structure picker */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Pitch structure</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {STRUCTURES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStructureId(s.id)}
                className={`panel p-4 text-left transition-colors hover:border-brand-bright ${
                  s.id === structureId ? "border-brand-bright bg-brand-soft/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{s.name}</h3>
                  <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.ratio}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{s.tagline}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Diagram + notes */}
        <section className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="panel flex flex-col items-center gap-4 p-4">
            <FieldDiagram structure={structure} />
            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-brand-bright" /> Thrower
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-intermediate" /> Handler
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-good" /> Cutter
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="panel px-3 py-2.5">
                <div className="label-xs">Structure</div>
                <div className="mt-1 font-mono text-lg font-semibold">{structure.name}</div>
              </div>
              <div className="panel px-3 py-2.5">
                <div className="label-xs">Handlers</div>
                <div className="mt-1 font-mono text-lg font-semibold">{handlerCount}</div>
              </div>
              <div className="panel px-3 py-2.5">
                <div className="label-xs">Cutters</div>
                <div className="mt-1 font-mono text-lg font-semibold">{cutterCount}</div>
              </div>
              <div className="panel px-3 py-2.5">
                <div className="label-xs">On field</div>
                <div className="mt-1 font-mono text-lg font-semibold">
                  {handlerCount + cutterCount}
                </div>
              </div>
            </div>

            {structure.id === "vertical" ? (
              <div className="rounded-md border border-brand-bright/40 bg-brand-soft/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-bright">
                No dump — both handlers are lateral resets, none set up directly behind the thrower
              </div>
            ) : null}

            <div className="panel space-y-2.5 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">How it plays</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {structure.notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-brand-bright">›</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
