import * as SQLite from "expo-sqlite";
import { Track } from "./data";
let db: SQLite.SQLiteDatabase | undefined;
export async function initializeDatabase() {
  db = await SQLite.openDatabaseAsync("audio-mastery.db");
  await db.execAsync(
    `PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, fingerprint TEXT UNIQUE, metadata TEXT NOT NULL, updated_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS listening_events (id INTEGER PRIMARY KEY AUTOINCREMENT, song_id TEXT NOT NULL, seconds REAL NOT NULL, played_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, name TEXT NOT NULL, song_ids TEXT NOT NULL); PRAGMA user_version = 1;`,
  );
  return true;
}
async function connection() {
  if (!db) await initializeDatabase();
  return db!;
}
export async function clearListeningHistory() {
  const d = await connection();
  await d.runAsync("DELETE FROM listening_events");
}
export async function saveTracks(tracks: Track[]) {
  const d = await connection();
  await d.withTransactionAsync(async () => {
    for (const t of tracks)
      await d.runAsync(
        "INSERT OR REPLACE INTO songs (id,fingerprint,metadata,updated_at) VALUES (?,?,?,?)",
        t.id,
        t.fingerprint ?? t.id,
        JSON.stringify(t),
        Date.now(),
      );
  });
}
export async function loadTracks(): Promise<Track[]> {
  const d = await connection();
  const rows = await d.getAllAsync<{ metadata: string }>(
    "SELECT metadata FROM songs ORDER BY updated_at DESC",
  );
  return rows.map((r) => JSON.parse(r.metadata));
}
export async function logListen(trackId: string, seconds: number) {
  const d = await connection();
  await d.runAsync(
    "INSERT INTO listening_events (song_id,seconds,played_at) VALUES (?,?,?)",
    trackId,
    seconds,
    Date.now(),
  );
}
