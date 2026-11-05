import { storage } from "./storage";
import { Track } from "./data";
export async function initializeDatabase() {
  return true;
}
export async function clearListeningHistory() {
  await storage.set("am-events", "[]");
}
export async function saveTracks(tracks: Track[]) {
  await storage.set("am-library", JSON.stringify(tracks));
}
export async function loadTracks(): Promise<Track[]> {
  return JSON.parse((await storage.get("am-library")) || "[]");
}
export async function logListen(trackId: string, seconds: number) {
  const events = JSON.parse((await storage.get("am-events")) || "[]");
  events.push({ trackId, seconds, at: Date.now() });
  await storage.set("am-events", JSON.stringify(events.slice(-1000)));
}
