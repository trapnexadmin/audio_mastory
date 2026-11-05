import { create } from "zustand";
import { tracks, Track, Mix, Mood } from "./data";
import { storage } from "./storage";
import { loadTracks, logListen } from "./database";
import { Taste, smartShuffle } from "./recommendations";
type Overlay =
  | "assistant"
  | "queue"
  | "collection"
  | "track"
  | "notifications"
  | null;
type State = {
  catalog: Track[];
  currentId: string;
  queue: string[];
  playing: boolean;
  liked: string[];
  saved: string[];
  taste: Taste;
  context: "For you" | Mood;
  shuffle: boolean;
  repeat: boolean;
  volume: number;
  theme: "dark" | "light" | "system";
  language: "English" | "தமிழ்";
  name: string;
  overlay: Overlay;
  collection: Mix | null;
  selectedTrack: Track | null;
  playerOpen: boolean;
  toast: string | null;
  ready: boolean;
  hydrate: () => Promise<void>;
  persist: () => void;
  play: (id: string, queue?: string[]) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addQueue: (id: string) => void;
  removeQueue: (index: number) => void;
  setContext: (context: State["context"]) => void;
  openCollection: (mix: Mix) => void;
  notify: (message: string) => void;
  update: (patch: Partial<State>) => void;
  record: (seconds: number, trackId?: string) => void;
  importTracks: (songs: Track[]) => void;
  toggleShuffle: () => void;
};
let toastTimer: ReturnType<typeof setTimeout>;
export const useStore = create<State>((set, get) => ({
  catalog: tracks,
  currentId: "1",
  queue: tracks.map((t) => t.id),
  playing: false,
  liked: ["1", "0", "4"],
  saved: [],
  taste: { plays: {}, seconds: 0, recent: [] },
  context: "For you",
  shuffle: false,
  repeat: false,
  volume: 0.75,
  theme: "dark",
  language: "English",
  name: "Kavin",
  overlay: null,
  collection: null,
  selectedTrack: null,
  playerOpen: false,
  toast: null,
  ready: false,
  hydrate: async () => {
    try {
      const saved = JSON.parse((await storage.get("am-preferences")) || "{}");
      const local = await loadTracks();
      const usable = local.filter(
        (t) => t.source === "local" && !t.uri.startsWith("blob:"),
      );
      set({ ...saved, catalog: [...tracks, ...usable], ready: true });
    } catch {
      set({ ready: true });
    }
  },
  persist: () => {
    const { liked, saved, taste, theme, language, name, volume } = get();
    storage
      .set(
        "am-preferences",
        JSON.stringify({ liked, saved, taste, theme, language, name, volume }),
      )
      .catch(() => get().notify("Could not save preferences on this device."));
  },
  play: (id, queue) => {
    set({ currentId: id, playing: true, ...(queue ? { queue } : {}) });
    const taste = get().taste;
    set({
      taste: {
        ...taste,
        plays: { ...taste.plays, [id]: (taste.plays[id] || 0) + 1 },
        recent: [...taste.recent, id].slice(-50),
      },
    });
    get().persist();
  },
  togglePlay: () => {
    if (!get().playing) get().play(get().currentId);
    else set({ playing: false });
  },
  next: () => {
    const { queue, currentId } = get();
    if (!queue.length) return;
    const i = queue.indexOf(currentId);
    get().play(queue[(i + 1) % queue.length]);
  },
  previous: () => {
    const { queue, currentId } = get();
    if (!queue.length) return;
    const i = queue.indexOf(currentId);
    get().play(queue[(i - 1 + queue.length) % queue.length]);
  },
  toggleLike: (id) => {
    set({
      liked: get().liked.includes(id)
        ? get().liked.filter((s) => s !== id)
        : [...get().liked, id],
    });
    get().persist();
  },
  toggleSave: (id) => {
    const exists = get().saved.includes(id);
    set({
      saved: exists
        ? get().saved.filter((s) => s !== id)
        : [...get().saved, id],
    });
    get().persist();
    get().notify(
      exists ? "Mix removed from your library" : "Mix saved to your library",
    );
  },
  addQueue: (id) => {
    if (get().queue.includes(id)) {
      get().notify("This song is already in your queue");
      return;
    }
    set({ queue: [...get().queue, id] });
    get().notify("Added to your queue");
  },
  removeQueue: (index) => {
    set({ queue: get().queue.filter((_, i) => i !== index) });
  },
  setContext: (context) => set({ context }),
  openCollection: (collection) => set({ collection, overlay: "collection" }),
  notify: (toast) => {
    clearTimeout(toastTimer);
    set({ toast });
    toastTimer = setTimeout(() => set({ toast: null }), 3500);
  },
  update: (patch) => {
    set(patch);
    if (["theme", "language", "name", "volume"].some((k) => k in patch))
      get().persist();
  },
  record: (seconds, trackId) => {
    set({ taste: { ...get().taste, seconds: get().taste.seconds + seconds } });
    logListen(trackId || get().currentId, seconds).catch(() => {});
    get().persist();
  },
  importTracks: (songs) => {
    set({ catalog: [...get().catalog, ...songs] });
    get().notify(
      `${songs.length} ${songs.length === 1 ? "song" : "songs"} added to your library`,
    );
  },
  toggleShuffle: () => {
    const on = !get().shuffle;
    const { catalog, taste, liked, context, currentId } = get();
    set({
      shuffle: on,
      queue: on
        ? [
            currentId,
            ...smartShuffle(
              catalog,
              taste,
              liked,
              context === "For you" ? undefined : context,
            )
              .map((t) => t.id)
              .filter((id) => id !== currentId),
          ]
        : catalog.map((t) => t.id),
    });
    get().notify(
      on ? "Smart shuffle on · familiar meets unexpected" : "Smart shuffle off",
    );
  },
}));
