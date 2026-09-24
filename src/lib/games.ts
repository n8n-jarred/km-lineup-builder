/** Game tracking model: point-by-point log, player stats and notes. */

export type PointResult = "us" | "them";

export type GamePoint = {
  id: string;
  result: PointResult;
  /** player ids on the field for this point */
  playerIds: string[];
  /** player ids who recorded a block (D) */
  blocks: string[];
  /** player ids who threw the assist */
  assists: string[];
  /** player ids who scored the goal */
  goals: string[];
  note?: string;
};

export type GameStatus = "live" | "final";

export type Game = {
  id: string;
  /** editable, e.g. "KM vs Team B" */
  label: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  status: GameStatus;
  points: GamePoint[];
  /** note written after the game */
  gameNote: string;
  /** per-player notes for this game: playerId -> note */
  playerNotes: Record<string, string>;
};

export function gameScore(g: Game): { us: number; them: number } {
  let us = 0;
  let them = 0;
  for (const p of g.points) {
    if (p.result === "us") us += 1;
    else them += 1;
  }
  return { us, them };
}

export type PlayerGameStats = {
  played: boolean;
  blocks: number;
  assists: number;
  goals: number;
};

export function playerGameStats(g: Game, playerId: string): PlayerGameStats {
  return {
    played: g.points.some((p) => p.playerIds.includes(playerId)),
    blocks: g.points.filter((p) => p.blocks.includes(playerId)).length,
    assists: g.points.filter((p) => p.assists.includes(playerId)).length,
    goals: g.points.filter((p) => p.goals.includes(playerId)).length,
  };
}

export type PlayerTotals = {
  gamesPlayed: number;
  blocks: number;
  assists: number;
  goals: number;
};

export function playerTotals(games: Game[], playerId: string): PlayerTotals {
  const totals: PlayerTotals = { gamesPlayed: 0, blocks: 0, assists: 0, goals: 0 };
  for (const g of games) {
    const s = playerGameStats(g, playerId);
    if (s.played) totals.gamesPlayed += 1;
    totals.blocks += s.blocks;
    totals.assists += s.assists;
    totals.goals += s.goals;
  }
  return totals;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
