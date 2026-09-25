// src/lib/firestore-actions.ts
import { db } from "./firebase";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

// Types matching your player stats
export interface PlayerStatUpdate {
  goals?: number;
  assists?: number;
  blocks?: number;
  turnovers?: number;
  [key: string]: any;
}

// Update or set a player's cumulative stats in Firestore
export async function updatePlayerStat(playerId: string, updatedStats: PlayerStatUpdate) {
  try {
    const playerRef = doc(db, "players", playerId);
    await setDoc(playerRef, updatedStats, { merge: true });
    console.log(`Updated stats for player: ${playerId}`);
  } catch (error) {
    console.error("Error updating player stats in Firestore:", error);
  }
}

// Log a new point or game event to match history
export async function logPointHistory(gameId: string, pointData: object) {
  try {
    const historyRef = collection(db, "games", gameId, "history");
    await addDoc(historyRef, {
      ...pointData,
      timestamp: new Date().toISOString()
    });
    console.log(`Point history logged for game: ${gameId}`);
  } catch (error) {
    console.error("Error logging point history:", error);
  }
}