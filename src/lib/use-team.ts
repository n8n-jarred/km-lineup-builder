import { useCallback, useEffect, useState } from "react";
import { INITIAL_ROSTER, type Player } from "./team-data";
import type { GeneratedLine } from "./lineup";
import { newId, type Game, type GamePoint } from "./games";

const ROSTER_KEY = "km-ultimate-roster-v1";
const HISTORY_KEY = "km-ultimate-history-v1";
const GAMES_KEY = "km-ultimate-games-v1";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTeam() {
  const [hydrated, setHydrated] = useState(false);
  const [roster, setRoster] = useState<Player[]>(INITIAL_ROSTER);
  const [history, setHistory] = useState<GeneratedLine[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    setRoster(load(ROSTER_KEY, INITIAL_ROSTER));
    setHistory(load(HISTORY_KEY, [] as GeneratedLine[]));
    setGames(load(GAMES_KEY, [] as Game[]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  }, [roster, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  }, [games, hydrated]);

  const updatePlayer = useCallback((id: string, patch: Partial<Player>) => {
    setRoster((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const saveLine = useCallback((line: GeneratedLine) => {
    setHistory((prev) => [line, ...prev].slice(0, 40));
  }, []);

  const removeLine = useCallback((id: string) => {
    setHistory((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const resetRoster = useCallback(() => setRoster(INITIAL_ROSTER), []);

  const createGame = useCallback((label: string, date: string) => {
    const game: Game = {
      id: newId(),
      label,
      date,
      status: "live",
      points: [],
      gameNote: "",
      playerNotes: {},
    };
    setGames((prev) => [game, ...prev]);
    return game;
  }, []);

  const updateGame = useCallback((id: string, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }, []);

  const deleteGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addPoint = useCallback((gameId: string, point: Omit<GamePoint, "id">) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId ? { ...g, points: [...g.points, { ...point, id: newId() }] } : g,
      ),
    );
  }, []);

  const updatePoint = useCallback(
    (gameId: string, pointId: string, patch: Partial<GamePoint>) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? {
                ...g,
                points: g.points.map((p) => (p.id === pointId ? { ...p, ...patch } : p)),
              }
            : g,
        ),
      );
    },
    [],
  );

  const removePoint = useCallback((gameId: string, pointId: string) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId ? { ...g, points: g.points.filter((p) => p.id !== pointId) } : g,
      ),
    );
  }, []);

  return {
    hydrated,
    roster,
    history,
    games,
    updatePlayer,
    saveLine,
    removeLine,
    clearHistory,
    resetRoster,
    createGame,
    updateGame,
    deleteGame,
    addPoint,
    updatePoint,
    removePoint,
  };
}
