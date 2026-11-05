import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Txt, Icon, IconButton, WaveMark } from "./ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { useAudio } from "../lib/audio";
import { formatTime } from "../lib/data";
import { Visualizer } from "./Visualizer";
function Progress({ full = false }: { full?: boolean }) {
  const t = useTheme();
  const { position, duration, seek } = useAudio();
  const [width, setWidth] = useState(1);
  const pct = duration ? Math.min(position / duration, 1) : 0;
  return (
    <View
      style={{
        width: "100%",
        flexDirection: full ? "column" : "row",
        alignItems: full ? "stretch" : "center",
        gap: 10,
      }}
    >
      {!full && (
        <Txt size={9} muted style={{ width: 28, textAlign: "right" }}>
          {formatTime(position)}
        </Txt>
      )}
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Seek through song"
        accessibilityValue={{
          min: 0,
          max: Math.round(duration),
          now: Math.round(position),
        }}
        onAccessibilityAction={(e) =>
          seek(
            Math.max(
              0,
              Math.min(
                duration,
                position + (e.nativeEvent.actionName === "increment" ? 5 : -5),
              ),
            ),
          )
        }
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onPress={(e) =>
          seek(
            Math.min(
              duration,
              Math.max(0, (e.nativeEvent.locationX / width) * duration),
            ),
          )
        }
        style={{
          flex: full ? undefined : 1,
          height: full ? 20 : 14,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            height: full ? 3 : 2,
            backgroundColor: full ? "#ffffff25" : t.line,
            borderRadius: 3,
          }}
        >
          <View
            style={{
              width: `${pct * 100}%`,
              height: "100%",
              backgroundColor: t.accent,
              borderRadius: 3,
            }}
          />
          {full && (
            <View
              style={{
                position: "absolute",
                left: `${pct * 100}%`,
                height: 9,
                width: 9,
                borderRadius: 5,
                backgroundColor: t.accent,
                top: -3,
                marginLeft: -4,
              }}
            />
          )}
        </View>
      </Pressable>
      {full ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: -8,
          }}
        >
          <Txt size={10} muted>
            {formatTime(position)}
          </Txt>
          <Txt size={10} muted>
            {formatTime(duration)}
          </Txt>
        </View>
      ) : (
        <Txt size={9} muted style={{ width: 28 }}>
          {formatTime(duration)}
        </Txt>
      )}
    </View>
  );
}
function PlaybackControls({ full = false }: { full?: boolean }) {
  const t = useTheme();
  const playing = useStore((s) => s.playing),
    shuffle = useStore((s) => s.shuffle),
    repeat = useStore((s) => s.repeat);
  const { buffering } = useAudio();
  const store = useStore.getState();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: full ? 25 : 17,
      }}
    >
      <IconButton
        name="shuffle"
        label="Toggle smart shuffle"
        onPress={store.toggleShuffle}
        color={shuffle ? t.accent : t.muted}
        size={full ? 23 : 16}
        style={{ width: full ? 36 : 26, height: 30 }}
      />
      <IconButton
        name="play-skip-back"
        label="Previous song"
        onPress={store.previous}
        size={full ? 25 : 17}
        color={full ? t.text : t.muted}
        style={{ width: full ? 38 : 25, height: 32 }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? "Pause" : "Play"}
        onPress={store.togglePlay}
        style={({ pressed, hovered }: any) => ({
          width: full ? 69 : 35,
          height: full ? 69 : 35,
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.accent,
          opacity: pressed ? 0.7 : hovered ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        {buffering && playing ? (
          <ActivityIndicator color="#292019" size={full ? "large" : "small"} />
        ) : (
          <Icon
            name={playing ? "pause" : "play"}
            size={full ? 29 : 18}
            color="#272018"
            style={{ marginLeft: playing ? 0 : 2 }}
          />
        )}
      </Pressable>
      <IconButton
        name="play-skip-forward"
        label="Next song"
        onPress={store.next}
        size={full ? 25 : 17}
        color={full ? t.text : t.muted}
        style={{ width: full ? 38 : 25, height: 32 }}
      />
      <IconButton
        name="repeat"
        label="Toggle repeat song"
        onPress={() => {
          store.update({ repeat: !repeat });
          store.notify(repeat ? "Repeat off" : "Repeat this song");
        }}
        color={repeat ? t.accent : t.muted}
        size={full ? 23 : 16}
        style={{ width: full ? 36 : 26, height: 30 }}
      />
    </View>
  );
}
export function MiniPlayer() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const mobile = width < 700;
  const inset = useSafeAreaInsets();
  const track = useStore((s) => s.catalog.find((t) => t.id === s.currentId)!);
  const liked = useStore((s) => s.liked.includes(s.currentId));
  const playing = useStore((s) => s.playing);
  const volume = useStore((s) => s.volume);
  const update = useStore((s) => s.update);
  const [volumeWidth, setVolumeWidth] = useState(1);
  const { setVolume } = useAudio();
  const open = () => update({ playerOpen: true });
  const pan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onEnd((e) => {
      if (e.translationY < -15) runOnJS(open)();
    });
  return (
    <GestureDetector gesture={pan}>
      <View
        style={{
          position: "absolute",
          bottom: wide ? 0 : 66 + Math.max(inset.bottom, 8),
          left: wide ? 220 : mobile ? 10 : 0,
          right: mobile ? 10 : 0,
          height: mobile ? 68 : 88,
          backgroundColor: t.player,
          borderTopWidth: 1,
          borderColor: t.line,
          paddingHorizontal: mobile ? 12 : 25,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          borderRadius: mobile ? 11 : 0,
          boxShadow: mobile ? "0px 0px 25px #00000044" : undefined,
          zIndex: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Expand player: ${track.title}`}
          onPress={open}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            width: mobile ? undefined : "29%",
            flex: mobile ? 1 : undefined,
            minWidth: 0,
          }}
        >
          <Image
            source={track.artwork}
            style={{
              width: mobile ? 45 : 51,
              height: mobile ? 45 : 51,
              borderRadius: 6,
            }}
          />
          <View style={{ flex: 1 }}>
            <Txt numberOfLines={1} weight="semibold" size={mobile ? 12 : 13}>
              {track.title}
            </Txt>
            <Txt muted numberOfLines={1} size={10} style={{ marginTop: 5 }}>
              {track.artist}
            </Txt>
          </View>
          {!mobile && (
            <IconButton
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? t.accent : t.muted}
              label={liked ? "Unlike current song" : "Like current song"}
              onPress={() => useStore.getState().toggleLike(track.id)}
            />
          )}
        </Pressable>
        {mobile ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconButton
              name={liked ? "heart" : "heart-outline"}
              size={18}
              label="Like song"
              onPress={() => useStore.getState().toggleLike(track.id)}
              color={liked ? t.accent : t.muted}
            />
            <IconButton
              name={playing ? "pause" : "play"}
              size={24}
              color={t.text}
              label={playing ? "Pause" : "Play"}
              onPress={() => useStore.getState().togglePlay()}
            />
            <IconButton
              name="play-skip-forward"
              size={19}
              color={t.text}
              label="Next song"
              onPress={() => useStore.getState().next()}
            />
          </View>
        ) : (
          <>
            <View
              style={{ flex: 1, maxWidth: 470, alignItems: "center", gap: 6 }}
            >
              <PlaybackControls />
              <Progress />
            </View>
            <View
              style={{
                width: "25%",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginRight: 7,
                }}
              >
                <Icon
                  name={
                    track.source === "local"
                      ? "phone-portrait-outline"
                      : "headset-outline"
                  }
                  size={13}
                  color={t.subtle}
                />
                <Txt size={8} style={{ color: t.subtle }}>
                  {track.source === "local" ? "LOCAL" : "PREVIEW"}
                </Txt>
              </View>
              <IconButton
                name="list-outline"
                label="Open queue"
                onPress={() => update({ overlay: "queue" })}
                size={18}
              />
              {width > 1180 && (
                <>
                  <IconButton
                    name={
                      volume === 0
                        ? "volume-mute-outline"
                        : "volume-medium-outline"
                    }
                    size={18}
                    label={volume === 0 ? "Unmute" : "Mute"}
                    onPress={() => setVolume(volume === 0 ? 0.75 : 0)}
                    style={{ width: 24 }}
                  />
                  <Pressable
                    accessibilityRole="adjustable"
                    accessibilityLabel="Volume"
                    onLayout={(e) => setVolumeWidth(e.nativeEvent.layout.width)}
                    onPress={(e) =>
                      setVolume(
                        Math.max(
                          0,
                          Math.min(1, e.nativeEvent.locationX / volumeWidth),
                        ),
                      )
                    }
                    style={{ width: 59, height: 30, justifyContent: "center" }}
                  >
                    <View
                      style={{
                        height: 2,
                        backgroundColor: t.line,
                        borderRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          height: 2,
                          width: `${volume * 100}%`,
                          backgroundColor: t.muted,
                        }}
                      />
                    </View>
                  </Pressable>
                </>
              )}
              <IconButton
                name="expand-outline"
                size={17}
                label="Expand full player"
                onPress={open}
              />
            </View>
          </>
        )}
      </View>
    </GestureDetector>
  );
}
export function FullPlayer() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const wide = width >= 850;
  const inset = useSafeAreaInsets();
  const open = useStore((s) => s.playerOpen);
  const track = useStore((s) => s.catalog.find((t) => t.id === s.currentId)!);
  const playing = useStore((s) => s.playing);
  const liked = useStore((s) => s.liked.includes(s.currentId));
  const y = useSharedValue(height);
  const [mounted, setMounted] = useState(false);
  const update = useStore((s) => s.update);
  useEffect(() => {
    if (open) {
      setMounted(true);
      y.value = withTiming(0, {
        duration: 440,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      y.value = withTiming(height, { duration: 330 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [open, height]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  const close = () => update({ playerOpen: false });
  const gesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .onUpdate((e) => {
      if (e.translationY > 0) y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 600) runOnJS(close)();
      else
        y.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
    });
  useEffect(() => {
    if (!open || Platform.OS !== "web") return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);
  if (!mounted) return null;
  const artSize = wide
    ? Math.min(440, height - 250)
    : Math.min(width - 64, height * 0.38);
  return (
    <Animated.View
      testID="full-player"
      accessibilityViewIsModal
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 60, backgroundColor: t.bg },
        style,
      ]}
    >
      <Image
        source={track.artwork}
        style={StyleSheet.absoluteFill}
        blurRadius={90}
        contentFit="cover"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: t.dark ? "#080a0de8" : "#f4f1ebef" },
        ]}
      />
      <LinearGradient
        colors={[`${track.color}66`, "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <GestureDetector gesture={gesture}>
        <View
          style={{
            paddingTop: Math.max(inset.top, 20),
            paddingHorizontal: wide ? 45 : 21,
            paddingBottom: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 3,
              backgroundColor: "#ffffff45",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 10,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton
              name="chevron-down"
              label="Minimize player"
              onPress={close}
              size={27}
              color={t.text}
            />
            <View style={{ alignItems: "center", gap: 6 }}>
              <Txt size={8} style={{ color: t.muted, letterSpacing: 2 }}>
                IN THIS MOMENT
              </Txt>
              <Txt size={12} weight="semibold">
                Your personal soundtrack
              </Txt>
            </View>
            <IconButton
              name="ellipsis-horizontal"
              label="Song options"
              onPress={() => update({ overlay: "track", selectedTrack: track })}
              color={t.text}
            />
          </View>
        </View>
      </GestureDetector>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingBottom: Math.max(inset.bottom, 20),
        }}
      >
        <View
          style={{
            flexDirection: wide ? "row" : "column",
            alignItems: "center",
            gap: wide ? 80 : 28,
            maxWidth: 1100,
          }}
        >
          <Animated.View
            key={track.id}
            entering={FadeIn.duration(450)}
            style={{
              width: artSize,
              height: artSize,
              borderRadius: wide ? 16 : 12,
              boxShadow: "0 22px 65px #00000050",
            }}
          >
            <Image
              source={track.artwork}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: wide ? 16 : 12,
              }}
              transition={450}
            />
          </Animated.View>
          <View style={{ width: wide ? 350 : Math.min(width - 64, 430) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <Icon
                name={
                  track.source === "local"
                    ? "phone-portrait-outline"
                    : "headset-outline"
                }
                size={12}
                color={t.accent}
              />
              <Txt
                size={8}
                weight="semibold"
                style={{ color: t.accent, letterSpacing: 1.5 }}
              >
                {track.source === "local"
                  ? "FROM YOUR LOCAL LIBRARY"
                  : "CATALOG PREVIEW"}
              </Txt>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Txt
                  weight="heading"
                  size={wide ? 31 : 26}
                  numberOfLines={1}
                  style={{ letterSpacing: -0.6 }}
                >
                  {track.title}
                </Txt>
                {track.tamil && (
                  <Txt size={12} muted style={{ marginTop: 5 }}>
                    {track.tamil}
                  </Txt>
                )}
              </View>
              <IconButton
                name={liked ? "heart" : "heart-outline"}
                color={liked ? t.accent : t.text}
                label={liked ? "Unlike song" : "Like song"}
                size={24}
                onPress={() => useStore.getState().toggleLike(track.id)}
              />
            </View>
            <Txt size={12} muted style={{ marginTop: 10, lineHeight: 20 }}>
              {track.artist}
            </Txt>
            <View style={{ marginTop: wide ? 29 : 22, marginBottom: 23 }}>
              <Progress full />
            </View>
            <PlaybackControls full />
            <View style={{ marginTop: wide ? 24 : 19, alignItems: "center" }}>
              <Visualizer playing={playing} color={t.accent} />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: wide ? 22 : 15,
              }}
            >
              <Pressable
                onPress={() => {
                  update({ overlay: "track", selectedTrack: track });
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  padding: 7,
                }}
              >
                <Icon name="radio-outline" size={17} color={t.muted} />
                <Txt size={11} muted>
                  Song radio
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => update({ overlay: "queue" })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  padding: 7,
                }}
              >
                <Txt size={11} muted>
                  Up next
                </Txt>
                <Icon name="list-outline" size={19} color={t.muted} />
              </Pressable>
            </View>
            {track.source === "preview" && (
              <Txt
                size={9}
                style={{
                  color: t.subtle,
                  textAlign: "center",
                  marginTop: 14,
                  lineHeight: 15,
                }}
              >
                A short catalog preview. Import your own music for full-length
                listening.
              </Txt>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
