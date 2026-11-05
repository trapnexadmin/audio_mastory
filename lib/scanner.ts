import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import { Track } from "./data";
import { useStore } from "./store";
import { saveTracks } from "./database";
export async function scanMusic() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["audio/*", "application/ogg"],
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return { added: 0, skipped: 0 };
  const state = useStore.getState();
  const known = new Set(state.catalog.map((t) => t.fingerprint));
  const additions: Track[] = [];
  let skipped = 0;
  for (const asset of result.assets) {
    const fingerprint = `${asset.name}:${asset.size ?? 0}`;
    if (known.has(fingerprint)) {
      skipped++;
      continue;
    }
    let uri = asset.uri;
    if (Platform.OS !== "web") {
      const source = new File(uri);
      const destination = new File(
        Paths.document,
        `am-${Date.now()}-${asset.name.replace(/[^a-zA-Z0-9.]/g, "_")}`,
      );
      source.copy(destination);
      uri = destination.uri;
    }
    const base = asset.name.replace(/\.[^.]+$/, "");
    const parts = base.split(" - ");
    additions.push({
      id: `local-${Date.now()}-${additions.length}`,
      title: parts.length > 1 ? parts.slice(1).join(" - ") : base,
      artist: parts.length > 1 ? parts[0] : "Your local collection",
      album: "On this device",
      artwork: require("../assets/images/after-hours.jpg"),
      uri,
      source: "local",
      duration: 0,
      color: "#67637a",
      energy: 0.4,
      moods: ["Unwind"],
      fingerprint,
    });
    known.add(fingerprint);
  }
  if (additions.length) {
    const local = [
      ...state.catalog.filter((t) => t.source === "local"),
      ...additions,
    ];
    await saveTracks(local);
    state.importTracks(additions);
  } else state.notify("Your library is up to date. No duplicate songs added.");
  return { added: additions.length, skipped };
}
