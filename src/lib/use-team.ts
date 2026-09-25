import { useCallback, useEffect, useState } from "react";
import { INITIAL_ROSTER, type Player } from "./team-data";
import type { GeneratedLine } from "./lineup";
import { newId, type Game, type GamePoint } from "./games";
import { db } from "./firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export function useTeam() {
  const [hydrated, setHydrated] = useState(false);
  const [roster, setRoster] = useState<Player[]>(INITIAL_ROSTER);
  const [history, setHistory] = useState<GeneratedLine[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  // 1. Real-time Firestore Listeners
  useEffect(() => {
    // Subscribe to Roster Collection
    const unsubRoster = onSnapshot(
      collection(db, "players"),
      (snapshot) => {
        if (!snapshot.empty) {
          const playersData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Player
          );
          setRoster(playersData);
        }
      },
      (err) => console.error("Error listening to roster updates:", err)
    );

    // Subscribe to Games Collection
    const unsubGames = onSnapshot(
      collection(db, "games"),
      (snapshot) => {
        const gamesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Game
        );
        setGames(gamesData);
      },
      (err) => console.error("Error listening to games updates:", err)
    );

    // Subscribe to Line History Collection
    const unsubHistory = onSnapshot(
      collection(db, "history"),
      (snapshot) => {
        const historyData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as GeneratedLine
        );
        setHistory(historyData);
      },
      (err) => console.error("Error listening to history updates:", err)
    );

    setHydrated(true);

    return () => {
      unsubRoster();
      unsubGames();
      unsubHistory();
    };
  }, []);

  // 2. Roster Operations
  const updatePlayer = useCallback(async (id: string, patch: Partial<Player>) => {
    setRoster((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    try {
      await updateDoc(doc(db, "players", id), patch);
    } catch (err) {
      console.error("Failed to update player in Firestore:", err);
    }
  }, []);

  const resetRoster = useCallback(async () => {
    setRoster(INITIAL_ROSTER);
    try {
      for (const player of INITIAL_ROSTER) {
        await setDoc(doc(db, "players", player.id), player, { merge: true });
      }
    } catch (err) {
      console.error("Failed to reset roster in Firestore:", err);
    }
  }, []);

  // 3. Line History Operations
  const saveLine = useCallback(async (line: GeneratedLine) => {
    setHistory((prev) => [line, ...prev].slice(0, 40));
    try {
      await setDoc(doc(db, "history", line.id), {
        ...line,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save line to Firestore:", err);
    }
  }, []);

  const removeLine = useCallback(async (id: string) => {
    setHistory((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteDoc(doc(db, "history", id));
    } catch (err) {
      console.error("Failed to remove line from Firestore:", err);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      for (const item of history) {
        await deleteDoc(doc(db, "history", item.id));
      }
    } catch (err) {
      console.error("Failed to clear history in Firestore:", err);
    }
  }, [history]);

  // 4. Game & Point Operations
  const createGame = useCallback(async (label: string, date: string) => {
    const id = newId();
    const game: Game = {
      id,
      label,
      date,
      status: "live",
      points: [],
      gameNote: "",
      playerNotes: {},
    };
    setGames((prev) => [game, ...prev]);

    try {
      await setDoc(doc(db, "games", id), {
        ...game,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to create game in Firestore:", err);
    }
    return game;
  }, []);

  const updateGame = useCallback(async (id: string, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    try {
      await updateDoc(doc(db, "games", id), patch);
    } catch (err) {
      console.error("Failed to update game in Firestore:", err);
    }
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteDoc(doc(db, "games", id));
    } catch (err) {
      console.error("Failed to delete game in Firestore:", err);
    }
  }, []);

  const addPoint = useCallback(
    async (gameId: string, point: Omit<GamePoint, "id">) => {
      const pointWithId: GamePoint = { ...point, id: newId() };

      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId ? { ...g, points: [...g.points, pointWithId] } : g
        )
      );

      const targetGame = games.find((g) => g.id === gameId);
      if (targetGame) {
        try {
          await updateDoc(doc(db, "games", gameId), {
            points: [...targetGame.points, pointWithId],
          });
        } catch (err) {
          console.error("Failed to add point to Firestore:", err);
        }
      }
    },
    [games]
  );

  const updatePoint = useCallback(
    async (gameId: string, pointId: string, patch: Partial<GamePoint>) => {
      let updatedPoints: GamePoint[] = [];

      setGames((prev) =>
        prev.map((g) => {
          if (g.id === gameId) {
            updatedPoints = g.points.map((p) =>
              p.id === pointId ? { ...p, ...patch } : p
            );
            return { ...g, points: updatedPoints };
          }
          return g;
        })
      );

      try {
        await updateDoc(doc(db, "games", gameId), {
          points: updatedPoints,
        });
      } catch (err) {
        console.error("Failed to update point in Firestore:", err);
      }
    },
    []
  );

  const removePoint = useCallback(
    async (gameId: string, pointId: string) => {
      let updatedPoints: GamePoint[] = [];

      setGames((prev) =>
        prev.map((g) => {
          if (g.id === gameId) {
            updatedPoints = g.points.filter((p) => p.id !== pointId);
            return { ...g, points: updatedPoints };
          }
          return g;
        })
      );

      try {
        await updateDoc(doc(db, "games", gameId), {
          points: updatedPoints,
        });
      } catch (err) {
        console.error("Failed to remove point from Firestore:", err);
      }
    },
    []
  );

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