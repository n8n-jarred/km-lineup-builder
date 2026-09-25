import type { Player, Role, Skill } from "./team-data";

export type StrategyId =
  | "balanced"
  | "defense"
  | "quick-offense"
  | "short-ball"
  | "cup-defense"
  | "deep-game";

export type Strategy = {
  id: StrategyId;
  name: string;
  blurb: string;
  /** weights applied to player attributes */
  w: { throwing: number; speed: number; defense: number; stamina: number; exp: number };
  /** preferred count of each role on the field of 7 */
  want: Record<Role, number>;
};

export const STRATEGIES: Strategy[] = [
  {
    id: "balanced",
    name: "Balanced",
    blurb: "All-purpose line. Even handler/cutter split, best overall players.",
    w: { throwing: 1, speed: 1, defense: 1, stamina: 1, exp: 0.6 },
    want: { Handler: 2, Cutter: 3, "All-arounder": 2 },
  },
  {
    id: "defense",
    name: "Defense",
    blurb: "Pure D-line. Fast, physical markers who force the turn.",
    w: { throwing: 0.4, speed: 1.5, defense: 2, stamina: 1.2, exp: 0.4 },
    want: { Handler: 1, Cutter: 4, "All-arounder": 2 },
  },
  {
    id: "quick-offense",
    name: "Quick Offense",
    blurb: "Fast break after the turn. Speed and decision-making first.",
    w: { throwing: 1.2, speed: 1.8, defense: 0.6, stamina: 1.2, exp: 0.8 },
    want: { Handler: 2, Cutter: 3, "All-arounder": 2 },
  },
  {
    id: "short-ball",
    name: "Short-ball Offense",
    blurb: "Patient give-and-go. Disc security and handler depth.",
    w: { throwing: 2, speed: 0.8, defense: 0.5, stamina: 1, exp: 1.2 },
    want: { Handler: 4, Cutter: 1, "All-arounder": 2 },
  },
  {
    id: "cup-defense",
    name: "Cup Defense",
    blurb: "Zone cup. Stamina, communication and experienced wings/deep.",
    w: { throwing: 0.6, speed: 1.2, defense: 1.8, stamina: 2, exp: 1.2 },
    want: { Handler: 2, Cutter: 3, "All-arounder": 2 },
  },
  {
    id: "deep-game",
    name: "Deep Game",
    blurb: "Hucks and big cuts. Throwers who can send it, cutters who can run.",
    w: { throwing: 1.8, speed: 1.6, defense: 0.6, stamina: 1, exp: 0.8 },
    want: { Handler: 2, Cutter: 4, "All-arounder": 1 },
  },
];

export const skillBonus: Record<Skill, number> = {
  Elite: 2,
  Intermediate: 0.75,
  Beginner: 0,
};

/** 0-100 rating of a player for a given strategy */
export function playerScore(p: Player, s: Strategy): number {
  const { w } = s;
  const weighted =
    p.throwing * w.throwing +
    p.speed * w.speed +
    p.defense * w.defense +
    p.stamina * w.stamina +
    Math.min(p.years, 10) * w.exp;
  const maxWeighted = 10 * (w.throwing + w.speed + w.defense + w.stamina + w.exp);
  const base = (weighted / maxWeighted) * 100;
  return Math.round(Math.min(100, base + skillBonus[p.skill] * 3));
}

export type LineMetrics = {
  rating: number;
  successRate: number;
  conversionRate: number;
  turnoversPerPoint: number;
  handlers: number;
  cutters: number;
  allArounders: number;
  elite: number;
  avgYears: number;
  strength: string;
  weakness: string;
};

export type GeneratedLine = {
  id: string;
  createdAt: number;
  strategy: StrategyId;
  strategyName: string;
  ratio: string;
  playerIds: string[];
  playerNames: string[];
  metrics: LineMetrics;
};

const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

export function lineMetrics(line: Player[], s: Strategy): LineMetrics {
  if (line.length === 0) {
    return {
      rating: 0,
      successRate: 0,
      conversionRate: 0,
      turnoversPerPoint: 0,
      handlers: 0,
      cutters: 0,
      allArounders: 0,
      elite: 0,
      avgYears: 0,
      strength: "—",
      weakness: "—",
    };
  }

  const throwing = avg(line.map((p) => p.throwing));
  const speed = avg(line.map((p) => p.speed));
  const defense = avg(line.map((p) => p.defense));
  const stamina = avg(line.map((p) => p.stamina));
  const years = avg(line.map((p) => p.years));

  const handlers = line.filter((p) => p.role === "Handler").length;
  const cutters = line.filter((p) => p.role === "Cutter").length;
  const allArounders = line.filter((p) => p.role === "All-arounder").length;
  const elite = line.filter((p) => p.skill === "Elite").length;
  const beginners = line.filter((p) => p.skill === "Beginner").length;

  const rating = Math.round(avg(line.map((p) => playerScore(p, s))));

  // role fit: how close the line is to the strategy's preferred shape
  const flexH = handlers + allArounders;
  const flexC = cutters + allArounders;
  const roleGap =
    Math.max(0, s.want.Handler - flexH) + Math.max(0, s.want.Cutter - flexC);
  const roleFit = Math.max(0, 1 - roleGap * 0.15);

  // turnovers per point: driven by weak throwing, inexperience, beginners
  const turnoversPerPoint = Math.max(
    0.2,
    Math.round(
      (2.6 - throwing * 0.16 - Math.min(years, 8) * 0.06 + beginners * 0.18) * 10,
    ) / 10,
  );

  const conversionRate = Math.round(
    Math.max(
      15,
      Math.min(
        95,
        30 + throwing * 3.6 + elite * 3 - turnoversPerPoint * 7 + roleFit * 10,
      ),
    ),
  );

  const successRate = Math.round(
    Math.max(
      10,
      Math.min(
        97,
        conversionRate * 0.5 + defense * 3.2 + stamina * 1.4 + rating * 0.18 - 18,
      ),
    ),
  );

  // strength / weakness from the strongest and weakest normalised axis
  const axes: Array<[string, number, string, string]> = [
    ["Throwing", throwing, "Disc skills and break throws", "Throws break down under pressure"],
    ["Speed", speed, "Wins races deep and on the reset", "Gets beaten in footraces"],
    ["Defense", defense, "Forces turns with tight marks", "Soft marks, gives up easy unders"],
    ["Stamina", stamina, "Holds shape through long points", "Fades late in long points"],
  ];
  const sorted = [...axes].sort((a, b) => b[1] - a[1]);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;

  let strength = best[2];
  let weakness = worst[3];

  if (handlers + allArounders >= 4) strength = "Deep handler pool — never stuck on a reset";
  if (elite >= 4) strength = "Stacked with elite players — can win any matchup";
  if (flexH < 2) weakness = "Thin at handler — reset will get pressured";
  if (beginners >= 3) weakness = "Three-plus beginners — high turnover risk";
  if (cutters + allArounders < 3) weakness = "Not enough downfield cutting options";

  return {
    rating,
    successRate,
    conversionRate,
    turnoversPerPoint,
    handlers,
    cutters,
    allArounders,
    elite,
    avgYears: Math.round(years * 10) / 10,
    strength,
    weakness,
  };
}

/**
 * Greedy build: fill the required gender counts while steering the role mix
 * toward the strategy's preferred shape, always taking the highest scorer.
 */
export function buildLine(
  pool: Player[],
  strategy: Strategy,
  males: number,
  females: number,
): Player[] {
  const need = { M: males, F: females };
  const picked: Player[] = [];

  const roleNeed: Record<Role, number> = { ...strategy.want };

  const candidates = [...pool].sort(
    (a, b) => playerScore(b, strategy) - playerScore(a, strategy),
  );

  const take = (p: Player) => {
    picked.push(p);
    need[p.gender] -= 1;
    if (roleNeed[p.role] > 0) roleNeed[p.role] -= 1;
  };

  // pass 1: satisfy role targets with the best available of each gender
  for (const role of ["Handler", "Cutter", "All-arounder"] as Role[]) {
    while (roleNeed[role] > 0) {
      const next = candidates.find(
        (p) => !picked.includes(p) && p.role === role && need[p.gender] > 0,
      );
      if (!next) break;
      take(next);
    }
  }

  // pass 2: fill remaining slots with the best available per gender
  for (const g of ["M", "F"] as const) {
    while (need[g] > 0) {
      const next = candidates.find((p) => !picked.includes(p) && p.gender === g);
      if (!next) break;
      take(next);
    }
  }

  return picked;
}
