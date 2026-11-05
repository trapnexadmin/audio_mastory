import React, { createContext, useContext, useEffect } from "react";
import { Platform } from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { useStore } from "./store";
type AudioContextType = {
  position: number;
  duration: number;
  buffering: boolean;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
};
const AudioContext = createContext<AudioContextType>({
  position: 0,
  duration: 0,
  buffering: false,
  seek: () => {},
  setVolume: () => {},
});
export const useAudio = () => useContext(AudioContext);
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const currentId = useStore((s) => s.currentId),
    catalog = useStore((s) => s.catalog),
    playing = useStore((s) => s.playing),
    volume = useStore((s) => s.volume),
    repeat = useStore((s) => s.repeat);
  const track = catalog.find((t) => t.id === currentId)!;
  const player = useAudioPlayer({ uri: track.uri }, { updateInterval: 300 });
  const status = useAudioPlayerStatus(player);
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, []);
  useEffect(() => {
    try {
      if (playing) {
        player.play();
        if (Platform.OS !== "web")
          player.setActiveForLockScreen(true, {
            title: track.title,
            artist: track.artist,
            albumTitle: track.album,
          });
      } else player.pause();
    } catch {
      useStore.getState().update({ playing: false });
      useStore
        .getState()
        .notify(
          "Audio could not play. Try another track or import your music.",
        );
    }
  }, [playing, currentId, player, status.isLoaded]);
  useEffect(() => {
    player.volume = volume;
  }, [volume, player]);
  useEffect(() => {
    player.loop = repeat;
  }, [repeat, player]);
  useEffect(() => {
    if (status.didJustFinish && !repeat) useStore.getState().next();
  }, [status.didJustFinish, repeat]);
  useEffect(() => {
    if (!status.playing) return;
    let started = Date.now();
    const record = () => {
      const elapsed = Math.min(12, (Date.now() - started) / 1000);
      started = Date.now();
      if (elapsed >= 1) useStore.getState().record(elapsed, currentId);
    };
    const timer = setInterval(record, 10000);
    return () => {
      clearInterval(timer);
      record();
    };
  }, [status.playing, currentId]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (!player.isLoaded) {
        useStore.getState().update({ playing: false });
        useStore
          .getState()
          .notify(
            "Preview unavailable. Check your connection or play a local file.",
          );
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [playing, currentId, player]);
  return (
    <AudioContext.Provider
      value={{
        position: status.currentTime || 0,
        duration: status.duration || 0,
        buffering: status.isBuffering,
        seek: (seconds) => {
          player
            .seekTo(seconds)
            .catch(() =>
              useStore.getState().notify("Unable to seek in this track."),
            );
        },
        setVolume: (volume) => useStore.getState().update({ volume }),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
