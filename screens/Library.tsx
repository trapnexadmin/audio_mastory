import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Txt,
  Icon,
  Button,
  TrackRow,
  EmptyState,
  MixCard,
} from "../components/ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { mixes, dailyMix } from "../lib/data";
import { scanMusic } from "../lib/scanner";
export function LibraryScreen({ route }: any) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState("Songs");
  const [importing, setImporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState(false);
  const catalog = useStore((s) => s.catalog),
    liked = useStore((s) => s.liked),
    saved = useStore((s) => s.saved);
  useEffect(() => {
    if (route.params?.filter) setFilter(route.params.filter);
  }, [route.params?.filter]);
  let songs =
    filter === "Liked"
      ? catalog.filter((s) => liked.includes(s.id))
      : filter === "Local"
        ? catalog.filter((s) => s.source === "local")
        : catalog;
  if (sort) songs = [...songs].sort((a, b) => a.title.localeCompare(b.title));
  const libraryMixes = route.params?.explore
    ? [dailyMix, ...mixes]
    : [dailyMix, ...mixes].filter((m) => saved.includes(m.id));
  const pad = width < 600 ? 22 : 38;
  const importMusic = async () => {
    setImporting(true);
    try {
      await scanMusic();
      setFilter("Local");
    } catch {
      useStore
        .getState()
        .notify("Could not import this file. Try MP3, M4A, WAV, OGG, or FLAC.");
    } finally {
      setImporting(false);
    }
  };
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={filter === "Mixes" ? [] : songs}
        keyExtractor={(s) => s.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={t.accent}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
          />
        }
        contentContainerStyle={{
          padding: pad,
          paddingBottom: 180,
          maxWidth: 1450,
          width: "100%",
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View>
                <Txt
                  size={10}
                  weight="semibold"
                  style={{
                    letterSpacing: 2,
                    color: t.accent,
                    marginBottom: 10,
                  }}
                >
                  COLLECT MOMENTS. NOT JUST SONGS.
                </Txt>
                <Txt
                  weight="heading"
                  size={width < 600 ? 29 : 34}
                  style={{ letterSpacing: -1 }}
                >
                  Your kind of collection.
                </Txt>
                <Txt muted size={12} style={{ marginTop: 9 }}>
                  {catalog.filter((s) => s.source === "local").length} local
                  songs · {liked.length} favourites · Always yours
                </Txt>
              </View>
              {width > 700 && (
                <Button icon="add" onPress={importMusic} loading={importing}>
                  Import music
                </Button>
              )}
            </View>
            <Pressable
              onPress={importMusic}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 18,
                padding: 23,
                backgroundColor: t.surface,
                borderRadius: 12,
                marginTop: 29,
                marginBottom: 26,
                borderWidth: 1,
                borderColor: t.line,
              }}
            >
              <View
                style={{
                  height: 47,
                  width: 47,
                  borderRadius: 14,
                  backgroundColor: t.accentBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="folder-open-outline" color={t.accent} size={23} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt weight="semibold" size={15}>
                  {importing
                    ? "Adding your music…"
                    : "Great music starts with your own."}
                </Txt>
                <Txt muted size={12} style={{ marginTop: 6, lineHeight: 19 }}>
                  Import MP3, M4A, WAV, OGG & FLAC. No duplicates. No uploads.
                </Txt>
              </View>
              <Icon name="arrow-up-circle-outline" color={t.accent} size={27} />
            </Pressable>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 19,
              }}
            >
              <View style={{ flexDirection: "row", gap: 7 }}>
                {["Songs", "Liked", "Mixes", "Local"].map((x) => (
                  <Pressable
                    key={x}
                    onPress={() => setFilter(x)}
                    style={{
                      paddingHorizontal: width < 600 ? 13 : 20,
                      paddingVertical: 10,
                      borderRadius: 7,
                      backgroundColor: filter === x ? t.accentBg : t.surface,
                    }}
                  >
                    <Txt
                      size={12}
                      weight="medium"
                      style={{ color: filter === x ? t.accent : t.muted }}
                    >
                      {x}
                    </Txt>
                  </Pressable>
                ))}
              </View>
              {width > 600 && filter !== "Mixes" && (
                <Pressable
                  onPress={() => setSort(!sort)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    name="swap-vertical-outline"
                    size={15}
                    color={t.muted}
                  />
                  <Txt muted size={12}>
                    {sort ? "A–Z" : "Recently added"}
                  </Txt>
                </Pressable>
              )}
            </View>
            {filter === "Mixes" && libraryMixes.length > 0 && (
              <FlatList
                horizontal
                data={libraryMixes}
                keyExtractor={(m) => m.id}
                contentContainerStyle={{ gap: 20, paddingTop: 4 }}
                renderItem={({ item, index }) => (
                  <MixCard mix={item} width={240} index={index} />
                )}
              />
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            index={index}
            onPress={() =>
              useStore.getState().play(
                item.id,
                songs.map((t) => t.id),
              )
            }
          />
        )}
        ListEmptyComponent={
          filter === "Mixes" ? (
            libraryMixes.length ? null : (
              <EmptyState
                icon="albums-outline"
                title="Make a little space for your moods"
                description="Save a mix from Home and find it right here, whenever you need it."
                action="Explore the daily mix"
                onPress={() => useStore.getState().openCollection(dailyMix)}
              />
            )
          ) : (
            <EmptyState
              icon={
                filter === "Liked" ? "heart-outline" : "musical-notes-outline"
              }
              title={
                filter === "Liked"
                  ? "Your favourites live here"
                  : "Bring your music home"
              }
              description={
                filter === "Liked"
                  ? "Tap the heart on any song to keep it close."
                  : "Choose audio files from your device. Your original files stay private and untouched."
              }
              action={filter === "Local" ? "Choose music files" : undefined}
              onPress={importMusic}
            />
          )
        }
        ListFooterComponent={
          filter === "Local" ? (
            <Txt
              muted
              size={11}
              style={{ marginTop: 20, lineHeight: 19, textAlign: "center" }}
            >
              {Platform.OS === "web"
                ? "Browser imports play for this session. Native builds keep your files on-device."
                : "Imported files are stored on your device for offline listening."}{" "}
              Supported codecs depend on your device.
            </Txt>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
