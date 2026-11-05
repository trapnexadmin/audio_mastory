import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
function Bar({
  index,
  color,
  playing,
}: {
  index: number;
  color: string;
  playing: boolean;
}) {
  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = playing
      ? withRepeat(
          withTiming(0.4 + ((index * 7) % 11) / 11, {
            duration: 450 + (index % 5) * 160,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        )
      : withTiming(0.25);
  }, [playing]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          height: 30,
          width: 3,
          borderRadius: 3,
          backgroundColor: color,
          opacity: 0.5 + (index % 4) * 0.1,
        },
        style,
      ]}
    />
  );
}
export function Visualizer({
  playing,
  color,
}: {
  playing: boolean;
  color: string;
}) {
  return (
    <View
      accessibilityLabel="Ambient playback visualization"
      style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36 }}
    >
      {Array.from({ length: 28 }, (_, i) => (
        <Bar key={i} index={i} color={color} playing={playing} />
      ))}
    </View>
  );
}
