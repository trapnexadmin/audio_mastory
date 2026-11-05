import { Track, Mood } from "./data";
export type Taste = {
  plays: Record<string, number>;
  seconds: number;
  recent: string[];
};
export function rankTracks(
  catalog: Track[],
  taste: Taste,
  liked: string[],
  context?: Mood,
): Track[] {
  const favouriteArtists = new Set(
    catalog
      .filter((t) => liked.includes(t.id))
      .map((t) => t.artist.split(",")[0]),
  );
  return [...catalog]
    .map((t, index) => ({
      t,
      score:
        (context && t.moods.includes(context) ? 4 : 0) +
        (liked.includes(t.id) ? 2 : 0) +
        (favouriteArtists.has(t.artist.split(",")[0]) ? 1 : 0) +
        Math.min(taste.plays[t.id] || 0, 5) * 0.3 -
        (taste.recent.slice(-3).includes(t.id) ? 1.4 : 0) +
        (catalog.length - index) * 0.015,
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
}
export function smartShuffle(
  catalog: Track[],
  taste: Taste,
  liked: string[],
  context?: Mood,
) {
  const ranked = rankTracks(catalog, taste, liked, context)
    .map((t, index) => ({
      t,
      score:
        Math.random() * 0.7 +
        ((catalog.length - index) / Math.max(catalog.length, 1)) * 0.7 +
        (liked.includes(t.id) ? 0.15 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
  for (let i = 1; i < ranked.length - 1; i++)
    if (ranked[i].artist.split(",")[0] === ranked[i - 1].artist.split(",")[0]) {
      const j = ranked.findIndex(
        (t, k) =>
          k > i &&
          t.artist.split(",")[0] !== ranked[i - 1].artist.split(",")[0],
      );
      if (j > i) [ranked[i], ranked[j]] = [ranked[j], ranked[i]];
    }
  return ranked;
}
export function songRadio(seed: Track, catalog: Track[]) {
  return [
    seed,
    ...catalog
      .filter((t) => t.id !== seed.id)
      .sort((a, b) => {
        const score = (t: Track) =>
          t.moods.filter((m) => seed.moods.includes(m)).length * 2 -
          Math.abs(t.energy - seed.energy) * 3 +
          (t.artist.split(",")[0] === seed.artist.split(",")[0] ? 2 : 0);
        return score(b) - score(a);
      }),
  ];
}
export function interpretRequest(
  prompt: string,
  catalog: Track[],
  taste: Taste,
  liked: string[],
) {
  const p = prompt.toLowerCase();
  let mood: Mood = "Unwind";
  if (/drive|road|travel|பயணம்/.test(p)) mood = "On the move";
  else if (/focus|work|study|கவனம்/.test(p)) mood = "Focus";
  else if (/happy|upbeat|feel good|மகிழ்ச்சி/.test(p)) mood = "Feel good";
  else if (/classic|old|nostalgia|பழைய/.test(p)) mood = "Tamil classics";
  let pool = catalog;
  if (/rahman|ரஹ்மான்/.test(p))
    pool = pool.filter((t) => t.artist.includes("Rahman"));
  if (/anirudh|அனிருத்/.test(p))
    pool = pool.filter((t) => t.artist.includes("Anirudh"));
  if (/local|offline/.test(p)) pool = pool.filter((t) => t.source === "local");
  return {
    mood,
    tracks: rankTracks(pool, taste, liked, mood).slice(0, 6),
    message: `A little ${mood.toLowerCase()}, coming right up. ${mood === "On the move" ? "Melodies for the scenic route." : mood === "Focus" ? "Gentle tracks to help you find your flow." : mood === "Tamil classics" ? "Familiar voices, timeless feelings." : "Warm voices and melodies with room to breathe."}`,
  };
}
