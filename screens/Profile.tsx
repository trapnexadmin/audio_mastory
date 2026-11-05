import React, { useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  useWindowDimensions,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Txt, Icon, IconButton, Button, font } from "../components/ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { clearListeningHistory } from "../lib/database";
export function ProfileScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const name = useStore((s) => s.name),
    taste = useStore((s) => s.taste),
    liked = useStore((s) => s.liked),
    theme = useStore((s) => s.theme),
    language = useStore((s) => s.language),
    catalog = useStore((s) => s.catalog);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [confirm, setConfirm] = useState(false);
  const update = useStore((s) => s.update);
  const top = Object.entries(taste.plays).sort((a, b) => b[1] - a[1])[0];
  const track = top ? catalog.find((t) => t.id === top[0]) : null;
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={["profile", "taste", "preferences", "privacy"]}
        keyExtractor={(i) => i}
        contentContainerStyle={{
          padding: width < 600 ? 22 : 38,
          paddingBottom: 180,
          maxWidth: 1000,
          width: "100%",
          alignSelf: "center",
        }}
        renderItem={({ item }) => {
          if (item === "profile")
            return (
              <View style={{ marginBottom: 32 }}>
                <Txt
                  size={10}
                  style={{ color: t.accent, letterSpacing: 2 }}
                  weight="semibold"
                >
                  THE PERSON BEHIND THE PLAYLIST
                </Txt>
                <Txt
                  weight="heading"
                  size={34}
                  style={{ marginTop: 10, marginBottom: 28, letterSpacing: -1 }}
                >
                  A sound that's all yours.
                </Txt>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 22,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: t.accentBg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#9a734840",
                    }}
                  >
                    <Txt size={32} weight="heading" style={{ color: t.accent }}>
                      {name[0]}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    {editing ? (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <TextInput
                          autoFocus
                          accessibilityLabel="Your name"
                          value={draft}
                          onChangeText={setDraft}
                          maxLength={24}
                          returnKeyType="done"
                          onSubmitEditing={() => {
                            if (draft.trim()) update({ name: draft.trim() });
                            setEditing(false);
                          }}
                          style={{
                            backgroundColor: t.surface,
                            color: t.text,
                            fontSize: 20,
                            fontFamily: font.heading,
                            padding: 10,
                            borderRadius: 6,
                            flex: 1,
                          }}
                        />
                        <IconButton
                          name="checkmark"
                          color={t.accent}
                          label="Save name"
                          onPress={() => {
                            if (draft.trim()) update({ name: draft.trim() });
                            setEditing(false);
                          }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Txt size={25} weight="heading">
                          {name}
                        </Txt>
                        <IconButton
                          name="create-outline"
                          size={17}
                          label="Edit your name"
                          onPress={() => {
                            setDraft(name);
                            setEditing(true);
                          }}
                        />
                      </View>
                    )}
                    <Txt muted size={12}>
                      A curious ear. A Tamil heart.
                    </Txt>
                  </View>
                  {width > 600 && (
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 5,
                        backgroundColor: t.accentBg,
                      }}
                    >
                      <Txt
                        size={9}
                        style={{ color: t.accent, letterSpacing: 1 }}
                      >
                        FOUNDING LISTENER
                      </Txt>
                    </View>
                  )}
                </View>
              </View>
            );
          if (item === "taste")
            return (
              <View
                style={{
                  backgroundColor: t.surface,
                  borderRadius: 13,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon name="finger-print-outline" color={t.accent} />
                  <Txt weight="heading" size={19}>
                    Your listening fingerprint
                  </Txt>
                </View>
                <View style={{ flexDirection: "row", marginVertical: 28 }}>
                  {[
                    {
                      number: Math.floor(taste.seconds / 60),
                      label: "minutes together",
                    },
                    { number: liked.length, label: "favourite songs" },
                    {
                      number: Object.keys(taste.plays).length,
                      label: "songs discovered",
                    },
                  ].map((x) => (
                    <View
                      key={x.label}
                      style={{
                        flex: 1,
                        borderRightWidth:
                          x.label === "songs discovered" ? 0 : 1,
                        borderColor: t.line,
                        alignItems: "center",
                      }}
                    >
                      <Txt size={29} weight="heading">
                        {x.number}
                      </Txt>
                      <Txt muted size={11} style={{ marginTop: 6 }}>
                        {x.label}
                      </Txt>
                    </View>
                  ))}
                </View>
                <Txt muted size={12} style={{ lineHeight: 21 }}>
                  {track
                    ? `Your current favourite is ${track.title}. Your mixes gently adapt as you listen, like, and explore.`
                    : "A fresh start. As you listen and like songs, your mixes will become a little more you."}
                </Txt>
              </View>
            );
          if (item === "preferences")
            return (
              <View style={{ marginBottom: 25 }}>
                <Txt weight="heading" size={20} style={{ marginBottom: 18 }}>
                  Make yourself at home
                </Txt>
                <View
                  style={{
                    backgroundColor: t.surface,
                    borderRadius: 13,
                    padding: 22,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 15,
                      marginBottom: 24,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Txt weight="semibold">Appearance</Txt>
                      <Txt muted size={11} style={{ marginTop: 5 }}>
                        Your preferred light, at any hour.
                      </Txt>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: t.bg,
                        borderRadius: 7,
                        padding: 3,
                      }}
                    >
                      {(["dark", "light", "system"] as const).map((x) => (
                        <Pressable
                          key={x}
                          accessibilityLabel={`${x} theme`}
                          onPress={() => update({ theme: x })}
                          style={{
                            padding: 10,
                            backgroundColor:
                              theme === x ? t.accentBg : "transparent",
                            borderRadius: 5,
                          }}
                        >
                          <Icon
                            name={
                              x === "dark"
                                ? "moon-outline"
                                : x === "light"
                                  ? "sunny-outline"
                                  : "phone-portrait-outline"
                            }
                            size={17}
                            color={theme === x ? t.accent : t.muted}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 15,
                      paddingTop: 22,
                      borderTopWidth: 1,
                      borderColor: t.line,
                    }}
                  >
                    <View>
                      <Txt weight="semibold">A little closer to home</Txt>
                      <Txt muted size={11} style={{ marginTop: 5 }}>
                        Tamil home headings
                      </Txt>
                    </View>
                    <Switch
                      accessibilityLabel="Tamil home headings"
                      value={language === "தமிழ்"}
                      onValueChange={(v) =>
                        update({ language: v ? "தமிழ்" : "English" })
                      }
                      trackColor={{ false: t.raised, true: "#8b613e" }}
                      thumbColor={language === "தமிழ்" ? t.accent : t.muted}
                    />
                  </View>
                </View>
              </View>
            );
          return (
            <View>
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <Icon name="shield-checkmark-outline" color={t.accent} />
                <Txt weight="heading" size={19}>
                  Your music. Your business.
                </Txt>
              </View>
              <Txt muted size={12} style={{ lineHeight: 22, marginTop: 12 }}>
                Your listening profile stays on your device. No account, no
                tracking pixels, no selling your taste. Recommendations use
                mood, artist affinity, favourites, and recent listening—not a
                black box.
              </Txt>
              <Pressable
                onPress={() => setConfirm(!confirm)}
                style={{ alignSelf: "flex-start", paddingVertical: 17 }}
              >
                <Txt size={12} style={{ color: t.accent }}>
                  Reset listening history
                </Txt>
              </Pressable>
              {confirm && (
                <View
                  style={{
                    backgroundColor: t.surface,
                    padding: 17,
                    borderRadius: 10,
                    gap: 12,
                  }}
                >
                  <Txt size={12}>
                    Start a fresh listening fingerprint? Your music and
                    favourites will stay.
                  </Txt>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Button
                      small
                      onPress={async () => {
                        try {
                          await clearListeningHistory();
                          update({
                            taste: { plays: {}, seconds: 0, recent: [] },
                          });
                          useStore.getState().persist();
                          setConfirm(false);
                          useStore
                            .getState()
                            .notify(
                              "A fresh start. Your listening profile has been reset.",
                            );
                        } catch {
                          useStore
                            .getState()
                            .notify(
                              "Could not reset history. Please try again.",
                            );
                        }
                      }}
                    >
                      Reset history
                    </Button>
                    <Button small secondary onPress={() => setConfirm(false)}>
                      Keep it
                    </Button>
                  </View>
                </View>
              )}
              <Txt muted size={10} style={{ marginTop: 18 }}>
                {
                  "AUDIO MASTERY · FOUNDATION 1.0\nCrafted for the way music makes you feel."
                }
              </Txt>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
