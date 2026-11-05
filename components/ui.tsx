import React from "react";
import {
  Text,
  TextProps,
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme, design } from "../lib/theme";
import { Mix, Track, formatTime } from "../lib/data";
import { useStore } from "../lib/store";
export const font = design.font;
export function Txt({
  children,
  style,
  muted,
  size = 14,
  weight = "body",
  ...props
}: TextProps & { muted?: boolean; size?: number; weight?: keyof typeof font }) {
  const t = useTheme();
  return (
    <Text
      {...props}
      style={[
        {
          color: muted ? t.muted : t.text,
          fontFamily: font[weight],
          fontSize: size,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 20,
  color,
  ...props
}: {
  name: any;
  size?: number;
  color?: string;
  style?: any;
}) {
  const t = useTheme();
  return (
    <Ionicons name={name} size={size} color={color || t.text} {...props} />
  );
}
export function IconButton({
  name,
  onPress,
  size = 20,
  color,
  label,
  style,
  active = false,
}: {
  name: any;
  onPress: () => void;
  size?: number;
  color?: string;
  label: string;
  style?: ViewStyle;
  active?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={5}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        {
          width: 38,
          height: 38,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 24,
          backgroundColor: hovered ? t.raised : "transparent",
          opacity: pressed ? 0.55 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={name}
        size={size}
        color={color || (active ? t.accent : t.muted)}
      />
    </Pressable>
  );
}
export function Button({
  children,
  onPress,
  icon,
  secondary = false,
  style,
  loading = false,
  small = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: string;
  secondary?: boolean;
  style?: ViewStyle;
  loading?: boolean;
  small?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          backgroundColor: secondary
            ? hovered
              ? t.raised
              : t.surface
            : t.accent,
          paddingHorizontal: small ? 16 : 22,
          height: small ? 40 : 46,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? t.text : "#21160f"} />
      ) : icon ? (
        <Icon name={icon} size={17} color={secondary ? t.text : "#21160f"} />
      ) : null}
      <Txt
        weight="bold"
        size={small ? 12 : 13}
        style={{ color: secondary ? t.text : "#21160f" }}
      >
        {children}
      </Txt>
    </Pressable>
  );
}
export function WaveMark({
  size = 30,
  color,
}: {
  size?: number;
  color?: string;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        height: size,
        width: size,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      {[0.35, 0.7, 1, 0.65, 0.35].map((h, i) => (
        <View
          key={i}
          style={{
            width: size / 8,
            height: size * h,
            backgroundColor: color || t.accent,
            borderRadius: 3,
          }}
        />
      ))}
    </View>
  );
}
export function SectionHeader({
  title,
  subtitle,
  action,
  onPress,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 19,
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Txt weight="heading" size={21}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={12} style={{ marginTop: 5 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      {action && (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 8,
          }}
        >
          <Txt size={12} style={{ color: t.muted }}>
            {action}
          </Txt>
          <Icon name="arrow-forward" color={t.muted} size={15} />
        </Pressable>
      )}
    </View>
  );
}
export function MixArtwork({
  mix,
  style,
  large = false,
}: {
  mix: Mix;
  style?: ViewStyle;
  large?: boolean;
}) {
  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: 10,
          aspectRatio: 1.3,
          backgroundColor: mix.color,
        },
        style,
      ]}
    >
      <Image
        source={mix.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
      />
      <LinearGradient
        colors={["rgba(4,7,10,.14)", "rgba(4,7,10,.2)", "rgba(4,7,10,.6)"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flex: 1,
          padding: large ? 30 : 21,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <WaveMark size={16} color="#ffffffbb" />
          <Text
            style={{
              fontFamily: font.medium,
              color: "#ffffffba",
              fontSize: 8,
              letterSpacing: 2,
            }}
          >
            AUDIO MASTERY
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "#fff8eb",
              fontFamily: font.heading,
              fontSize: large ? 44 : 32,
              lineHeight: large ? 49 : 35,
              letterSpacing: -1,
            }}
          >
            {mix.artTitle}
          </Text>
          <Text
            style={{
              color: "#fff5e0ba",
              fontFamily: font.medium,
              fontSize: 8,
              letterSpacing: 2,
              marginTop: 13,
            }}
          >
            {mix.artSub}
          </Text>
        </View>
      </View>
    </View>
  );
}
export function MixCard({
  mix,
  width,
  index = 0,
}: {
  mix: Mix;
  width: number;
  index?: number;
}) {
  const open = useStore((s) => s.openCollection);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(450)}
      style={{ width }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${mix.title}`}
        onPress={() => open(mix)}
        style={({ pressed, hovered }: any) => ({
          opacity: pressed ? 0.75 : 1,
          transform: [{ translateY: hovered ? -3 : 0 }],
        })}
      >
        <MixArtwork mix={mix} />
        <Txt
          weight="semibold"
          size={14}
          style={{ marginTop: 13 }}
          numberOfLines={1}
        >
          {mix.title}
        </Txt>
        <Txt muted size={11} style={{ marginTop: 5 }} numberOfLines={1}>
          {mix.subtitle}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}
export function TrackRow({
  track,
  index,
  compact = false,
  onPress,
  trailing,
}: {
  track: Track;
  index?: number;
  compact?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const t = useTheme();
  const current = useStore((s) => s.currentId);
  const playing = useStore((s) => s.playing);
  const liked = useStore((s) => s.liked.includes(track.id));
  const update = useStore((s) => s.update);
  const { width } = useWindowDimensions();
  return (
    <Pressable
      onPress={onPress || (() => useStore.getState().play(track.id))}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${track.artist}`}
      style={({ hovered, pressed }: any) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: compact ? 12 : 16,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: hovered ? t.surface : "transparent",
        opacity: pressed ? 0.65 : 1,
      })}
    >
      {index !== undefined && (
        <View style={{ width: 19, alignItems: "center" }}>
          {current === track.id && playing ? (
            <WaveMark size={15} />
          ) : (
            <Txt size={12} muted>
              {String(index + 1).padStart(2, "0")}
            </Txt>
          )}
        </View>
      )}
      <Image
        source={track.artwork}
        style={{
          width: compact ? 44 : 48,
          height: compact ? 44 : 48,
          borderRadius: 6,
        }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt
          weight="semibold"
          size={13}
          numberOfLines={1}
          style={{ color: current === track.id ? t.accent : t.text }}
        >
          {track.title}
        </Txt>
        <Txt muted size={11} numberOfLines={1} style={{ marginTop: 5 }}>
          {track.artist}
        </Txt>
      </View>
      {!compact && width > 750 && (
        <Txt muted size={12} numberOfLines={1} style={{ width: "23%" }}>
          {track.album}
        </Txt>
      )}
      {!compact && (
        <Txt muted size={11}>
          {track.duration ? formatTime(track.duration) : "Local"}
        </Txt>
      )}
      {trailing || (
        <>
          {!compact && (
            <IconButton
              name={liked ? "heart" : "heart-outline"}
              color={liked ? t.accent : t.subtle}
              size={17}
              label={liked ? "Unlike song" : "Like song"}
              onPress={() => useStore.getState().toggleLike(track.id)}
            />
          )}
          <IconButton
            name="ellipsis-horizontal"
            size={18}
            label={`Options for ${track.title}`}
            onPress={() => update({ overlay: "track", selectedTrack: track })}
          />
        </>
      )}
    </Pressable>
  );
}
export function EmptyState({
  icon = "musical-notes-outline",
  title,
  description,
  action,
  onPress,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: "center", padding: 40, gap: 14 }}>
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: 24,
          backgroundColor: t.accentBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={28} color={t.accent} />
      </View>
      <Txt weight="heading" size={19}>
        {title}
      </Txt>
      <Txt muted style={{ textAlign: "center", maxWidth: 350, lineHeight: 23 }}>
        {description}
      </Txt>
      {action && onPress && (
        <Button onPress={onPress} small>
          {action}
        </Button>
      )}
    </View>
  );
}
