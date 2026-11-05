import React from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { HomeScreen } from "../screens/Home";
import { SearchScreen } from "../screens/Search";
import { LibraryScreen } from "../screens/Library";
import { ProfileScreen } from "../screens/Profile";
import { Txt, Icon, WaveMark, IconButton } from "./ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { mixes } from "../lib/data";
import { scanMusic } from "../lib/scanner";
import { MiniPlayer, FullPlayer } from "./Player";
import { Overlays } from "./Overlays";
const Tabs = createBottomTabNavigator();
const icons: Record<string, string> = {
  Home: "grid-outline",
  Search: "search-outline",
  Library: "albums-outline",
  Profile: "person-outline",
};
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const liked = useStore((s) => s.liked);
  const update = useStore((s) => s.update);
  if (!wide)
    return (
      <View
        style={{
          flexDirection: "row",
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 9,
          height: 66 + Math.max(insets.bottom, 8),
          backgroundColor: t.sidebar,
          borderTopWidth: 1,
          borderColor: t.line,
        }}
      >
        {state.routes.map((route, index) => {
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={route.name}
              accessibilityState={{ selected: active }}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Icon
                name={
                  active
                    ? icons[route.name].replace("-outline", "")
                    : icons[route.name]
                }
                size={21}
                color={active ? t.accent : t.muted}
              />
              <Txt
                size={9}
                weight={active ? "bold" : "medium"}
                style={{ color: active ? t.accent : t.muted }}
              >
                {route.name}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    );
  return (
    <View
      style={{
        width: 220,
        height: "100%",
        flexShrink: 0,
        backgroundColor: t.sidebar,
        borderRightWidth: 1,
        borderColor: t.line,
        paddingHorizontal: 19,
        paddingTop: 36,
        paddingBottom: 25,
      }}
    >
      <Pressable
        onPress={() => navigation.navigate("Home")}
        accessibilityRole="button"
        accessibilityLabel="Audio Mastery home"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingLeft: 6,
          marginBottom: 43,
        }}
      >
        <WaveMark size={33} />
        <View>
          <Txt
            weight="display"
            size={14}
            style={{ letterSpacing: 2.5, lineHeight: 20 }}
          >
            AUDIO
          </Txt>
          <Txt
            weight="display"
            size={14}
            style={{ letterSpacing: 1.5, lineHeight: 20 }}
          >
            MASTERY
          </Txt>
        </View>
      </Pressable>
      <Txt
        size={9}
        weight="medium"
        style={{
          color: t.subtle,
          letterSpacing: 1.8,
          paddingLeft: 15,
          marginBottom: 13,
        }}
      >
        YOUR DAILY ESCAPE
      </Txt>
      <View style={{ gap: 6 }}>
        {state.routes.map((route, index) => {
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={route.name}
              accessibilityState={{ selected: active }}
              onPress={() => navigation.navigate(route.name)}
              style={({ hovered }: any) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                height: 47,
                paddingHorizontal: 15,
                borderRadius: 8,
                backgroundColor: active
                  ? t.accentBg
                  : hovered
                    ? t.surface
                    : "transparent",
              })}
            >
              <Icon
                name={
                  active
                    ? icons[route.name].replace("-outline", "")
                    : icons[route.name]
                }
                color={active ? t.accent : t.muted}
                size={20}
              />
              <Txt
                weight={active ? "semibold" : "medium"}
                size={13}
                style={{ color: active ? t.accent : t.muted }}
              >
                {route.name === "Library" ? "Your Library" : route.name}
              </Txt>
              {active && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: t.accent,
                    marginLeft: "auto",
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          height: 1,
          backgroundColor: t.line,
          marginVertical: 28,
          marginHorizontal: 13,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 15,
          paddingRight: 4,
          marginBottom: 12,
        }}
      >
        <Txt
          size={9}
          weight="medium"
          style={{ color: t.subtle, letterSpacing: 1.8 }}
        >
          YOUR COLLECTION
        </Txt>
        <IconButton
          name="add"
          size={16}
          label="Import local music"
          onPress={() =>
            scanMusic().catch(() =>
              useStore
                .getState()
                .notify("Could not open your files. Please try again."),
            )
          }
          style={{ width: 25, height: 25 }}
        />
      </View>
      <Pressable
        onPress={() => navigation.navigate("Library", { filter: "Liked" })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          paddingHorizontal: 15,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 27,
            height: 27,
            borderRadius: 6,
            backgroundColor: "#382522",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="heart-outline" color="#dca99e" size={14} />
        </View>
        <Txt muted size={12} style={{ flex: 1 }}>
          Liked songs
        </Txt>
        <Txt size={10} style={{ color: t.subtle }}>
          {liked.length}
        </Txt>
      </Pressable>
      {mixes.slice(0, 2).map((mix, i) => (
        <Pressable
          key={mix.id}
          onPress={() => useStore.getState().openCollection(mix)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 13,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 27,
              height: 27,
              borderRadius: 6,
              backgroundColor: i ? "#2a3028" : "#282a35",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={i ? "musical-notes-outline" : "moon-outline"}
              size={14}
              color={i ? "#a7b19a" : "#b0adc6"}
            />
          </View>
          <Txt muted size={12}>
            {i ? "Tamil essentials" : "After hours"}
          </Txt>
        </Pressable>
      ))}
      <View style={{ flex: 1, minHeight: 24 }} />
      <Pressable
        accessibilityRole="button"
        onPress={() => update({ overlay: "assistant" })}
        style={({ hovered }: any) => ({
          backgroundColor: hovered ? t.raised : t.surface,
          borderWidth: 1,
          borderColor: t.line,
          padding: 16,
          borderRadius: 10,
          marginBottom: 22,
        })}
      >
        <Icon name="sparkles-outline" color={t.accent} size={23} />
        <Txt weight="semibold" size={12} style={{ marginTop: 11 }}>
          A mood. A moment.
        </Txt>
        <Txt muted size={10} style={{ lineHeight: 17, marginTop: 5 }}>
          Let's find its soundtrack.
        </Txt>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
            marginTop: 13,
          }}
        >
          <Txt size={11} style={{ color: t.accent }}>
            Ask Mastery
          </Txt>
          <Icon name="arrow-forward" size={14} color={t.accent} />
        </View>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingLeft: 8,
        }}
      >
        <Icon name="shield-checkmark-outline" size={14} color={t.subtle} />
        <Txt size={9} style={{ color: t.subtle }}>
          Local first. Always personal.
        </Txt>
      </View>
    </View>
  );
}
export function AppShell() {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const t = useTheme();
  const toast = useStore((s) => s.toast);
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Tabs.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: wide ? "left" : "bottom",
          sceneStyle: { backgroundColor: t.bg },
          animation: "fade",
        }}
      >
        <Tabs.Screen name="Home" component={HomeScreen} />
        <Tabs.Screen name="Search" component={SearchScreen} />
        <Tabs.Screen name="Library" component={LibraryScreen} />
        <Tabs.Screen name="Profile" component={ProfileScreen} />
      </Tabs.Navigator>
      <MiniPlayer />
      <FullPlayer />
      <Overlays />
      {toast && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(180)}
          style={{
            position: "absolute",
            bottom: wide ? 106 : 158 + insets.bottom,
            left: wide ? 240 : 20,
            right: 20,
            alignItems: "center",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 19,
              paddingVertical: 14,
              backgroundColor: t.raised,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: t.line,
              maxWidth: 560,
              boxShadow: "0px 8px 30px #00000035",
            }}
          >
            <Icon name="checkmark-circle" color={t.accent} size={19} />
            <Txt size={12} style={{ flexShrink: 1 }}>
              {toast}
            </Txt>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
