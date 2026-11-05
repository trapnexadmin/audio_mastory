import React, { useEffect } from "react";
import { Canvas, RoundedRect, Group } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
export function Visualizer({
  playing,
  color,
}: {
  playing: boolean;
  color: string;
}) {
  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = playing
      ? withRepeat(withTiming(1, { duration: 800 }), -1, true)
      : withTiming(0.3);
  }, [playing]);
  const transform = useDerivedValue(() => [{ scaleY: scale.value }]);
  return (
    <Canvas style={{ height: 36, width: 200 }}>
      <Group origin={{ x: 100, y: 18 }} transform={transform}>
        {Array.from({ length: 28 }, (_, i) => {
          const h = 8 + ((i * 7) % 25);
          return (
            <RoundedRect
              key={i}
              x={i * 7}
              y={(36 - h) / 2}
              width={3}
              height={h}
              r={2}
              color={color}
              opacity={0.5 + (i % 4) * 0.1}
            />
          );
        })}
      </Group>
    </Canvas>
  );
}
