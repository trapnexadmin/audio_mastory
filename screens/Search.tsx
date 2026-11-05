import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Txt,
  Icon,
  IconButton,
  TrackRow,
  EmptyState,
  MixCard,
  SectionHeader,
  font,
} from "../components/ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { mixes } from "../lib/data";
export function SearchScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const catalog = useStore((s) => s.catalog);
  const results = useMemo(
    () =>
      catalog.filter(
        (s) =>
          (filter !== "Local" || s.source === "local") &&
          `${s.title} ${s.artist} ${s.album} ${s.tamil || ""} ${s.moods.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, catalog, filter],
  );
  const pad = width < 600 ? 22 : 38;
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={query || filter === "Local" ? results : []}
        keyExtractor={(s) => s.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: pad,
          paddingBottom: 180,
          maxWidth: 1450,
          width: "100%",
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <>
            <Txt
              size={10}
              weight="semibold"
              style={{ letterSpacing: 2, color: t.accent, marginBottom: 10 }}
            >
              EVERY FEELING HAS A SOUNDTRACK
            </Txt>
            <Txt weight="heading" size={34} style={{ letterSpacing: -1 }}>
              Find your next feeling.
            </Txt>
            <Txt muted style={{ marginTop: 9, marginBottom: 27 }}>
              A song, a voice, a memory. Start anywhere.
            </Txt>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.line,
                borderRadius: 12,
                paddingHorizontal: 17,
                height: 56,
                gap: 12,
              }}
            >
              <Icon name="search-outline" color={t.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Songs, artists, albums… or search in தமிழ்"
                placeholderTextColor={t.subtle}
                returnKeyType="search"
                autoCorrect={false}
                style={{
                  flex: 1,
                  color: t.text,
                  fontFamily: font.body,
                  fontSize: 14,
                  height: 54,
                }}
                accessibilityLabel="Search music"
              />
              {query.length > 0 && (
                <IconButton
                  name="close-circle"
                  label="Clear search"
                  onPress={() => setQuery("")}
                />
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 9, marginVertical: 20 }}>
              {["All", "Local"].map((x) => (
                <Pressable
                  key={x}
                  onPress={() => setFilter(x)}
                  style={{
                    paddingHorizontal: 19,
                    paddingVertical: 9,
                    borderRadius: 20,
                    backgroundColor: filter === x ? t.accentBg : t.surface,
                  }}
                >
                  <Txt
                    size={12}
                    style={{ color: filter === x ? t.accent : t.muted }}
                  >
                    {x === "Local" ? "On this device" : x}
                  </Txt>
                </Pressable>
              ))}
            </View>
            {!query && filter === "All" && (
              <>
                <Pressable
                  onPress={() =>
                    useStore.getState().update({ overlay: "assistant" })
                  }
                  style={{
                    flexDirection: "row",
                    gap: 17,
                    padding: 22,
                    backgroundColor: t.surface,
                    borderRadius: 13,
                    alignItems: "center",
                    marginBottom: 35,
                  }}
                >
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: t.accentBg,
                    }}
                  >
                    <Icon name="sparkles-outline" color={t.accent} size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="heading" size={17}>
                      Don't have a song. Have a mood?
                    </Txt>
                    <Txt muted size={12} style={{ marginTop: 5 }}>
                      Try “a quiet Tamil playlist for a rainy evening”
                    </Txt>
                  </View>
                  <Icon name="arrow-forward" color={t.accent} />
                </Pressable>
                <SectionHeader title="Explore a state of mind" />
                <FlatList
                  data={mixes}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(m) => m.id}
                  contentContainerStyle={{ gap: 20 }}
                  renderItem={({ item, index }) => (
                    <MixCard
                      mix={item}
                      width={
                        width < 600
                          ? 230
                          : (width - (width >= 1000 ? 220 : 0) - pad * 2 - 60) /
                            4
                      }
                      index={index}
                    />
                  )}
                />
                <View style={{ marginTop: 36 }}>
                  <SectionHeader title="Voices that feel like home" />
                  <View
                    style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                  >
                    {[
                      "A.R. Rahman",
                      "Anirudh",
                      "Sid Sriram",
                      "Shreya Ghoshal",
                      "Pradeep Kumar",
                    ].map((a) => (
                      <Pressable
                        key={a}
                        onPress={() => setQuery(a)}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 13,
                          backgroundColor: t.surface,
                          borderRadius: 8,
                        }}
                      >
                        <Txt size={12}>{a}</Txt>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}
            {(query || filter === "Local") && results.length > 0 && (
              <SectionHeader
                title={`${results.length} ${results.length === 1 ? "song" : "songs"}`}
                subtitle="Searches titles, artists, albums, moods, and Tamil names."
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
                results.map((t) => t.id),
              )
            }
          />
        )}
        ListEmptyComponent={
          query || filter === "Local" ? (
            <EmptyState
              icon="search-outline"
              title={
                filter === "Local"
                  ? "Your music belongs here"
                  : "A little too quiet here"
              }
              description={
                filter === "Local"
                  ? "Import songs in Your Library to search your own collection."
                  : "Try another song, artist, mood, or Tamil title. A different spelling might help."
              }
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
