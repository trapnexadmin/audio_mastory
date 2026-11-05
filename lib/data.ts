export type Mood =
  | "Unwind"
  | "On the move"
  | "Focus"
  | "Feel good"
  | "Tamil classics";
export type Track = {
  id: string;
  title: string;
  tamil?: string;
  artist: string;
  album: string;
  artwork: any;
  color: string;
  moods: Mood[];
  energy: number;
  duration: number;
  uri: string;
  source: "preview" | "local";
  fingerprint?: string;
};
const source = require("../assets/catalog-source.json");
const artworks = [
  require("../assets/images/album-0.jpg"),
  require("../assets/images/album-1.jpg"),
  require("../assets/images/album-2.jpg"),
  require("../assets/images/album-3.jpg"),
  require("../assets/images/album-4.jpg"),
  require("../assets/images/album-5.jpg"),
  require("../assets/images/album-6.jpg"),
  require("../assets/images/album-7.jpg"),
];
const names = [
  "Naan Pizhai",
  "Nenjukkule",
  "Vaseegara",
  "Munbe Vaa",
  "Maruvaarthai",
  "The Life of Ram",
  "New York Nagaram",
  "Kanave Kanave",
];
const tamil = [
  "நான் பிழை",
  "நெஞ்சுக்குள்ளே",
  "வசீகரா",
  "முன்பே வா",
  "மறுவார்த்தை",
  "தி லைஃப் ஆஃப் ராம்",
  "நியூயார்க் நகரம்",
  "கனவே கனவே",
];
const artists = [
  "Anirudh Ravichander, Ravi G",
  "A.R. Rahman, Shakthisree Gopalan",
  "Bombay Jayashri, Harris Jayaraj",
  "A.R. Rahman, Shreya Ghoshal",
  "Sid Sriram, Darbuka Siva",
  "Pradeep Kumar, Govind Vasantha",
  "A.R. Rahman",
  "Anirudh Ravichander",
];
const albums = [
  "Kaathuvaakula Rendu Kaadhal",
  "Kadal",
  "Minnale",
  "Sillunu Oru Kaadhal",
  "Enai Noki Paayum Thota",
  "96",
  "Sillunu Oru Kaadhal",
  "David",
];
const colors = [
  "#775b3e",
  "#436967",
  "#66572d",
  "#85503e",
  "#5c656e",
  "#867449",
  "#6a4b46",
  "#525949",
];
export const tracks: Track[] = source.map((s: any, i: number) => ({
  id: String(i),
  title: names[i],
  tamil: tamil[i],
  artist: artists[i],
  album: albums[i],
  artwork: artworks[i],
  color: colors[i],
  moods:
    i === 2 || i === 3
      ? ["Tamil classics", "Feel good", "Unwind"]
      : i === 5 || i === 6
        ? ["On the move", "Focus", "Unwind"]
        : ["Unwind", "Focus"],
  energy: [0.4, 0.3, 0.55, 0.6, 0.4, 0.25, 0.35, 0.3][i],
  duration: Math.round(s.duration / 1000),
  uri: s.preview,
  source: "preview",
}));
export type Mix = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image: any;
  color: string;
  ids: string[];
  mood: Mood;
  subtitle: string;
  artTitle: string;
  artSub: string;
};
export const mixes: Mix[] = [
  {
    id: "after-hours",
    title: "After hours, before sleep",
    eyebrow: "THE WIND-DOWN",
    description:
      "Let the day fall away. Intimate vocals, unhurried melodies, and a little room to breathe.",
    image: require("../assets/images/after-hours.jpg"),
    color: "#727285",
    ids: ["1", "0", "7", "4", "6"],
    mood: "Unwind",
    subtitle: "Soft Tamil melodies · Unwind",
    artTitle: "after\nhours.",
    artSub: "SLOW DOWN. SINK IN.",
  },
  {
    id: "timeless",
    title: "Tamil, timeless",
    eyebrow: "THE EVERGREENS",
    description:
      "The songs you know by heart. A love letter to melodies that only get better with time.",
    image: require("../assets/images/timeless.jpg"),
    color: "#8d7f5d",
    ids: ["2", "3", "6", "1"],
    mood: "Tamil classics",
    subtitle: "Rahman, Harris & a little nostalgia",
    artTitle: "Tamil,\ntimeless.",
    artSub: "ALWAYS FINDS YOU.",
  },
  {
    id: "drive",
    title: "Take the long way home",
    eyebrow: "THE OPEN ROAD",
    description:
      "Windows down. Volume up. A soundtrack for taking the scenic route, wherever you are going.",
    image: require("../assets/images/drive.jpg"),
    color: "#847568",
    ids: ["5", "6", "4", "0", "3"],
    mood: "On the move",
    subtitle: "Open roads · Wandering minds",
    artTitle: "the long\nway home.",
    artSub: "NO HURRY TO ARRIVE.",
  },
  {
    id: "focus",
    title: "A softer state of mind",
    eyebrow: "THE DEEP FOCUS",
    description:
      "A soft place to land. Low-energy melodies that stay in the background while you find your flow.",
    image: require("../assets/images/focus.jpg"),
    color: "#4b7b82",
    ids: ["5", "1", "7", "6"],
    mood: "Focus",
    subtitle: "Less noise · More flow",
    artTitle: "soft\nfocus.",
    artSub: "MAKE ROOM FOR YOU.",
  },
];
export const dailyMix: Mix = {
  id: "daily",
  title: "The Tamil Slowdown",
  eyebrow: "YOUR DAILY SOUNDTRACK",
  description:
    "Familiar voices. Beautiful discoveries. A thoughtful little mix to make this moment yours.",
  image: require("../assets/images/hero.jpg"),
  color: "#9d754e",
  ids: ["1", "0", "4", "5", "2", "3", "6", "7"],
  mood: "Unwind",
  subtitle: "Handpicked Tamil melodies",
  artTitle: "The Tamil\nSlowdown",
  artSub: "YOUR MUSIC. YOUR MOMENT.",
};
export const contexts: { name: "For you" | Mood; icon: string }[] = [
  { name: "For you", icon: "sparkles-outline" },
  { name: "Unwind", icon: "moon-outline" },
  { name: "On the move", icon: "car-outline" },
  { name: "Focus", icon: "scan-outline" },
  { name: "Feel good", icon: "sunny-outline" },
  { name: "Tamil classics", icon: "musical-notes-outline" },
];
export const formatTime = (n: number) =>
  `${Math.floor((n || 0) / 60)}:${String(Math.floor((n || 0) % 60)).padStart(2, "0")}`;
