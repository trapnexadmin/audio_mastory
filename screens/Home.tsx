import React, { useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import {
  Txt,
  Icon,
  IconButton,
  Button,
  SectionHeader,
  MixCard,
  TrackRow,
  WaveMark,
  font,
} from "../components/ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { contexts, dailyMix, mixes } from "../lib/data";
import { rankTracks } from "../lib/recommendations";

export function HomeScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const mobile = width < 600;
  const nav = useNavigation<any>();
  const context = useStore((s) => s.context),
    name = useStore((s) => s.name),
    catalog = useStore((s) => s.catalog),
    taste = useStore((s) => s.taste),
    liked = useStore((s) => s.liked),
    saved = useStore((s) => s.saved);
  const [refreshing, setRefreshing] = useState(false);
  const { data: recommended = catalog, refetch } = useQuery({
    queryKey: [
      "recommendations",
      context,
      taste.recent.length,
      liked.join(","),
      catalog.length,
    ],
    queryFn: async () =>
      rankTracks(
        catalog,
        taste,
        liked,
        context === "For you" ? undefined : context,
      ),
  });
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pad = mobile ? 22 : 38;
  const contentWidth = Math.min(width - (wide ? 220 : 0), 1450) - pad * 2;
  const cards = mobile ? 230 : (contentWidth - 60) / 4;
  const filteredMixes =
    context === "For you"
      ? mixes
      : [...mixes].sort(
          (a, b) => Number(b.mood === context) - Number(a.mood === context),
        );
  const update = useStore((s) => s.update);
  const translated = useStore((s) => s.language) === "தமிழ்";
  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={["header", "contexts", "hero", "mixes", "rotation", "footer"]}
        keyExtractor={(i) => i}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={t.accent}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: pad,
          paddingTop: wide ? 28 : 21,
          paddingBottom: wide ? 125 : 170,
          maxWidth: 1450,
          width: "100%",
          alignSelf: "center",
        }}
        renderItem={({ item }) => {
          if (item === "header")
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 22,
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        height: 5,
                        width: 5,
                        borderRadius: 3,
                        backgroundColor: t.accent,
                      }}
                    />
                    <Txt
                      size={10}
                      weight="semibold"
                      style={{ letterSpacing: 1.8, color: t.accent }}
                    >
                      {mobile
                        ? "AUDIO MASTERY"
                        : `வணக்கம், ${name.toUpperCase()}`}
                    </Txt>
                  </View>
                  <Txt
                    weight="heading"
                    size={mobile ? 25 : 29}
                    style={{ letterSpacing: -0.8 }}
                  >
                    {translated
                      ? "உங்கள் இசை. உங்கள் தருணம்."
                      : `${greeting}, ${name}.`}
                  </Txt>
                  <Txt muted size={12} style={{ marginTop: 7 }}>
                    Your music. Your mood. Your moment.
                  </Txt>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {!mobile && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 7,
                        marginRight: 7,
                      }}
                    >
                      <Icon
                        name={hour >= 17 ? "moon-outline" : "sunny-outline"}
                        size={15}
                        color={t.subtle}
                      />
                      <Txt muted size={10} style={{ letterSpacing: 1.1 }}>
                        {new Date()
                          .toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                          .toUpperCase()}
                      </Txt>
                    </View>
                  )}
                  {!mobile && (
                    <IconButton
                      name="notifications-outline"
                      label="Listening updates"
                      onPress={() => update({ overlay: "notifications" })}
                      style={{ borderWidth: 1, borderColor: t.line }}
                    />
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open your profile"
                    onPress={() => nav.navigate("Profile")}
                    style={{
                      width: 39,
                      height: 39,
                      borderRadius: 20,
                      backgroundColor: "#403729",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#69523b",
                    }}
                  >
                    <Txt weight="bold" size={15} style={{ color: "#edc595" }}>
                      {name[0]}
                    </Txt>
                  </Pressable>
                </View>
              </View>
            );
          if (item === "contexts")
            return (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={contexts}
                keyExtractor={(c) => c.name}
                contentContainerStyle={{ gap: 9, paddingBottom: 21 }}
                renderItem={({ item: c }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: context === c.name }}
                    onPress={() => useStore.getState().setContext(c.name)}
                    style={({ hovered }: any) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      borderRadius: 7,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      backgroundColor:
                        context === c.name
                          ? t.accentBg
                          : hovered
                            ? t.raised
                            : t.surface,
                      borderWidth: 1,
                      borderColor: context === c.name ? "#66503b" : t.line,
                    })}
                  >
                    <Icon
                      name={c.icon}
                      size={15}
                      color={context === c.name ? t.accent : t.muted}
                    />
                    <Txt
                      size={11}
                      weight={context === c.name ? "bold" : "medium"}
                      style={{ color: context === c.name ? t.accent : t.muted }}
                    >
                      {c.name}
                    </Txt>
                  </Pressable>
                )}
              />
            );
          if (item === "hero")
            return (
              <View
                style={{
                  height: mobile ? 320 : 280,
                  borderRadius: 13,
                  overflow: "hidden",
                  marginBottom: 28,
                  backgroundColor: "#3d3930",
                }}
              >
                <Image
                  source={require("../assets/images/hero.jpg")}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  contentPosition={{ top: "65%", left: "center" }}
                  transition={0}
                />
                <LinearGradient
                  colors={[
                    "rgba(13,17,18,.97)",
                    "rgba(19,22,23,.83)",
                    "rgba(12,18,20,.18)",
                  ]}
                  locations={[0, 0.37, 1]}
                  start={{ x: 0, y: 0.4 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={["transparent", "rgba(9,14,15,.35)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={{
                    padding: mobile ? 26 : 34,
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 15,
                    }}
                  >
                    <Icon name="sparkles" size={12} color="#eeb78b" />
                    <Txt
                      size={9}
                      weight="bold"
                      style={{ color: "#e8bb96", letterSpacing: 2 }}
                    >
                      MADE FOR YOUR MOMENT
                    </Txt>
                  </View>
                  <Txt
                    weight="display"
                    size={mobile ? 31 : 45}
                    style={{
                      color: "#f8f4ed",
                      lineHeight: mobile ? 40 : 54,
                      letterSpacing: mobile ? -1.2 : -1.8,
                    }}
                  >
                    {context === "Focus"
                      ? "Less noise.\nMore possibility."
                      : context === "On the move"
                        ? "Take the long way.\nFeel every note."
                        : context === "Feel good"
                          ? "A little louder.\nA little lighter."
                          : context === "Tamil classics"
                            ? "Some melodies\nnever leave you."
                            : "Let the world wait.\nStay for the music."}
                  </Txt>
                  <Txt
                    size={12}
                    style={{
                      color: "#c1bcb4",
                      marginTop: 14,
                      lineHeight: 20,
                      maxWidth: mobile ? 240 : 370,
                    }}
                  >
                    A little Rahman. A little nostalgia. A whole lot of you.
                  </Txt>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <Button
                      icon="play"
                      onPress={() => {
                        const ids = recommended.map((t) => t.id);
                        useStore.getState().play(ids[0], ids);
                      }}
                    >
                      Play my mix
                    </Button>
                    <IconButton
                      name={saved.includes("daily") ? "checkmark" : "add"}
                      label={
                        saved.includes("daily")
                          ? "Remove daily mix"
                          : "Save daily mix"
                      }
                      onPress={() => useStore.getState().toggleSave("daily")}
                      size={23}
                      color="#e7e3dc"
                      style={{
                        width: 43,
                        height: 43,
                        borderWidth: 1,
                        borderColor: "#b3afa34a",
                        backgroundColor: "#ffffff0a",
                        borderRadius: 8,
                      }}
                    />
                  </View>
                </View>
                {!mobile && (
                  <Pressable
                    onPress={() => useStore.getState().openCollection(dailyMix)}
                    style={{
                      position: "absolute",
                      right: 28,
                      bottom: 25,
                      alignItems: "flex-end",
                      gap: 7,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <WaveMark size={15} color="#fff6e8" />
                      <Txt
                        size={9}
                        weight="semibold"
                        style={{ color: "#fff3dc", letterSpacing: 1.6 }}
                      >
                        THE TAMIL SLOWDOWN
                      </Txt>
                    </View>
                    <Txt size={10} style={{ color: "#e0d6c1b0" }}>
                      8 songs · Familiar voices, fresh feelings
                    </Txt>
                  </Pressable>
                )}
              </View>
            );
          if (item === "mixes")
            return (
              <View style={{ marginBottom: 33 }}>
                <SectionHeader
                  title={
                    translated
                      ? "உங்களுக்காக உருவாக்கப்பட்டது"
                      : "Made for your many moods"
                  }
                  subtitle="Not just what you like. What you need right now."
                  action={mobile ? undefined : "View all mixes"}
                  onPress={() =>
                    nav.navigate("Library", { filter: "Mixes", explore: true })
                  }
                />
                <FlatList
                  horizontal
                  data={filteredMixes}
                  keyExtractor={(m) => m.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 20, paddingBottom: 3 }}
                  renderItem={({ item: m, index }) => (
                    <MixCard mix={m} width={cards} index={index} />
                  )}
                />
              </View>
            );
          if (item === "rotation")
            return (
              <View
                style={{
                  flexDirection: contentWidth > 900 ? "row" : "column",
                  gap: 34,
                }}
              >
                <View style={{ flex: 1 }}>
                  <SectionHeader
                    title={
                      taste.recent.length
                        ? "Finding your rhythm"
                        : "Always a good idea"
                    }
                    subtitle={
                      taste.recent.length
                        ? "A selection shaped by your listening."
                        : "The familiar songs that feel like coming home."
                    }
                    action="See all"
                    onPress={() => nav.navigate("Library")}
                  />
                  {recommended.slice(0, 3).map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      onPress={() =>
                        useStore.getState().play(
                          track.id,
                          recommended.map((t) => t.id),
                        )
                      }
                    />
                  ))}
                </View>
                {contentWidth > 900 && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => update({ overlay: "assistant" })}
                    style={({ hovered }: any) => ({
                      width: 285,
                      backgroundColor: hovered ? t.raised : t.surface,
                      borderRadius: 12,
                      padding: 23,
                      justifyContent: "space-between",
                      alignSelf: "stretch",
                    })}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Icon
                        name="sparkles-outline"
                        size={25}
                        color={t.accent}
                      />
                      <Txt
                        size={8}
                        style={{ color: t.muted, letterSpacing: 1.5 }}
                      >
                        YOUR MUSIC COMPANION
                      </Txt>
                    </View>
                    <View>
                      <Txt
                        weight="heading"
                        size={22}
                        style={{ lineHeight: 30 }}
                      >
                        A mood in mind?
                      </Txt>
                      <Txt
                        muted
                        size={12}
                        style={{ lineHeight: 21, marginTop: 7 }}
                      >
                        {"Tell us how you feel.\nWe'll find the soundtrack."}
                      </Txt>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 17,
                      }}
                    >
                      <Txt
                        size={12}
                        weight="semibold"
                        style={{ color: t.accent }}
                      >
                        Find my moment
                      </Txt>
                      <Icon name="arrow-forward" size={17} color={t.accent} />
                    </View>
                  </Pressable>
                )}
              </View>
            );
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                paddingTop: 28,
              }}
            >
              <Icon name="infinite-outline" size={14} color={t.subtle} />
              <Txt size={10} style={{ color: t.subtle }}>
                Less algorithm. More you.
              </Txt>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
