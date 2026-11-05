import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Txt,
  Icon,
  IconButton,
  Button,
  MixArtwork,
  TrackRow,
  EmptyState,
  font,
} from "./ui";
import { useTheme } from "../lib/theme";
import { useStore } from "../lib/store";
import { interpretRequest, songRadio } from "../lib/recommendations";
import { Track } from "../lib/data";

function Sheet({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const inset = useSafeAreaInsets();
  const close = () => useStore.getState().update({ overlay: null });
  const ref = useRef<BottomSheetModal>(null);
  const mobile = width < 700;
  useEffect(() => {
    if (mobile) ref.current?.present();
  }, [mobile]);
  const backdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.65}
      />
    ),
    [],
  );
  const header = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 12,
        borderBottomWidth: 1,
        borderColor: t.line,
      }}
    >
      <View style={{ flex: 1 }}>
        <Txt weight="heading" size={20}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={11} style={{ marginTop: 6, lineHeight: 17 }}>
            {subtitle}
          </Txt>
        )}
      </View>
      <IconButton name="close" label="Close dialog" onPress={close} />
    </View>
  );
  if (mobile && Platform.OS !== "web")
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={["88%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
        onDismiss={close}
        backgroundStyle={{ backgroundColor: t.surface }}
        handleIndicatorStyle={{ backgroundColor: t.subtle }}
        backdropComponent={backdrop}
      >
        <BottomSheetView style={{ flex: 1, paddingBottom: inset.bottom }}>
          {header}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: mobile ? "flex-end" : "center",
          alignItems: "center",
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog backdrop"
          onPress={close}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000af",
            ...(Platform.OS === "web"
              ? { backdropFilter: "blur(8px)" }
              : ({} as any)),
          }}
        />
        <View
          style={{
            backgroundColor: t.surface,
            width: mobile ? "100%" : 590,
            maxHeight: height * (mobile ? 0.9 : 0.87),
            borderRadius: mobile ? 20 : 16,
            borderBottomLeftRadius: mobile ? 0 : 16,
            borderBottomRightRadius: mobile ? 0 : 16,
            paddingBottom: mobile ? inset.bottom : 0,
            borderWidth: 1,
            borderColor: t.line,
            overflow: "hidden",
            boxShadow: "0px 30px 100px #00000060",
          }}
        >
          {header}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function Collection() {
  const t = useTheme();
  const mix = useStore((s) => s.collection)!;
  const catalog = useStore((s) => s.catalog);
  const saved = useStore((s) => s.saved.includes(mix.id));
  const songs = mix.ids
    .map((id) => catalog.find((s) => s.id === id))
    .filter(Boolean) as Track[];
  return (
    <Sheet title={mix.title} subtitle={mix.eyebrow}>
      <FlatList
        data={songs}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 24 }}
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: "row",
                gap: 23,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <MixArtwork
                mix={mix}
                style={{ width: 155, height: 155, aspectRatio: 1 }}
              />
              <View style={{ flex: 1 }}>
                <Txt muted size={12} style={{ lineHeight: 21 }}>
                  {mix.description}
                </Txt>
                <Txt size={10} style={{ color: t.accent, marginTop: 13 }}>
                  {songs.length} songs · Tamil · Curated for you
                </Txt>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
              <Button
                icon="play"
                onPress={() => {
                  useStore.getState().play(
                    songs[0].id,
                    songs.map((s) => s.id),
                  );
                  useStore.getState().update({ overlay: null });
                }}
              >
                Play this moment
              </Button>
              <Button
                secondary
                icon={saved ? "checkmark" : "add"}
                onPress={() => useStore.getState().toggleSave(mix.id)}
              >
                {saved ? "Saved" : "Save mix"}
              </Button>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            index={index}
            compact
            onPress={() =>
              useStore.getState().play(
                item.id,
                songs.map((s) => s.id),
              )
            }
          />
        )}
        ListFooterComponent={
          <Txt muted size={10} style={{ lineHeight: 17, paddingTop: 16 }}>
            Catalog songs play short previews. Add your own audio in Library to
            enjoy full songs.
          </Txt>
        }
      />
    </Sheet>
  );
}
function Queue() {
  const t = useTheme();
  const queue = useStore((s) => s.queue),
    catalog = useStore((s) => s.catalog),
    current = useStore((s) => s.currentId);
  const songs = queue
    .map((id) => catalog.find((t) => t.id === id))
    .filter(Boolean) as Track[];
  return (
    <Sheet
      title="Let the moment continue."
      subtitle={`${songs.length} songs in your queue`}
    >
      <FlatList
        data={songs}
        keyExtractor={(s, i) => `${s.id}-${i}`}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 6,
              marginBottom: 14,
            }}
          >
            <Txt size={10} style={{ letterSpacing: 1.5, color: t.muted }}>
              YOUR SOUNDTRACK
            </Txt>
            <Pressable
              onPress={() => {
                useStore.getState().update({ queue: [current] });
                useStore
                  .getState()
                  .notify("Queue cleared. Keeping your current song.");
              }}
            >
              <Txt size={11} style={{ color: t.accent }}>
                Clear queue
              </Txt>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            compact
            index={index}
            onPress={() => useStore.getState().play(item.id)}
            trailing={
              item.id === current ? (
                <Txt size={8} style={{ color: t.accent }}>
                  NOW
                </Txt>
              ) : (
                <IconButton
                  name="close"
                  size={17}
                  label={`Remove ${item.title} from queue`}
                  onPress={() => useStore.getState().removeQueue(index)}
                />
              )
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="A moment of quiet"
            description="Play a song or a mix to start a new queue."
          />
        }
      />
    </Sheet>
  );
}
function TrackOptions() {
  const t = useTheme();
  const track = useStore((s) => s.selectedTrack)!;
  const liked = useStore((s) => s.liked.includes(track.id));
  const options = [
    {
      icon: liked ? "heart" : "heart-outline",
      title: liked ? "Remove from liked songs" : "Keep this one close",
      sub: liked
        ? "Remove from your favourites"
        : "Add to your favourite songs",
      action: () => useStore.getState().toggleLike(track.id),
    },
    {
      icon: "list-outline",
      title: "Add to queue",
      sub: "A little something for later",
      action: () => useStore.getState().addQueue(track.id),
    },
    {
      icon: "radio-outline",
      title: "Start song radio",
      sub: "Similar moods, new discoveries",
      action: () => {
        const songs = songRadio(track, useStore.getState().catalog);
        useStore.getState().play(
          track.id,
          songs.map((s) => s.id),
        );
        useStore.getState().notify(`Radio started from ${track.title}`);
      },
    },
  ];
  return (
    <Sheet
      title="Stay with this feeling."
      subtitle="A song can lead somewhere beautiful."
    >
      <View style={{ padding: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 17,
            marginBottom: 22,
          }}
        >
          <Image
            source={track.artwork}
            style={{ height: 73, width: 73, borderRadius: 9 }}
          />
          <View style={{ flex: 1 }}>
            <Txt size={19} weight="heading">
              {track.title}
            </Txt>
            <Txt muted size={12} style={{ marginTop: 7 }}>
              {track.artist}
            </Txt>
          </View>
        </View>
        {options.map((o) => (
          <Pressable
            key={o.title}
            onPress={() => {
              o.action();
              useStore.getState().update({ overlay: null });
            }}
            style={({ hovered }: any) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: 9,
              backgroundColor: hovered ? t.raised : "transparent",
            })}
          >
            <Icon name={o.icon} color={t.accent} size={22} />
            <View>
              <Txt size={14} weight="medium">
                {o.title}
              </Txt>
              <Txt muted size={11} style={{ marginTop: 5 }}>
                {o.sub}
              </Txt>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
function Assistant() {
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReturnType<
    typeof interpretRequest
  > | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const ask = (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setBusy(true);
    timer.current = setTimeout(() => {
      const s = useStore.getState();
      setResult(interpretRequest(text, s.catalog, s.taste, s.liked));
      setBusy(false);
    }, 550);
  };
  const prompts = [
    "A rainy evening with Rahman",
    "Tamil songs for a long drive",
    "Something soft while I work",
    "பழைய தமிழ் பாடல்கள்",
  ];
  return (
    <Sheet
      title="A mood. A moment. A melody."
      subtitle="Meet Mastery, your on-device music companion."
    >
      <FlatList
        data={result?.tracks || []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 24 }}
        ListHeaderComponent={
          <>
            <View
              style={{
                width: 51,
                height: 51,
                borderRadius: 15,
                backgroundColor: t.accentBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 17,
              }}
            >
              <Icon name="sparkles-outline" color={t.accent} size={27} />
            </View>
            <Txt size={22} weight="heading">
              What's your kind of moment?
            </Txt>
            <Txt
              muted
              size={12}
              style={{ lineHeight: 21, marginTop: 9, marginBottom: 21 }}
            >
              Tell me a mood, an artist, or where you're headed. I'll find a few
              songs that fit.
            </Txt>
            <View
              style={{
                backgroundColor: t.bg,
                borderWidth: 1,
                borderColor: t.line,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 16,
                paddingRight: 6,
              }}
            >
              <TextInput
                accessibilityLabel="Describe your music mood"
                value={query}
                onChangeText={setQuery}
                placeholder="A little Tamil music for…"
                placeholderTextColor={t.subtle}
                style={{
                  color: t.text,
                  fontFamily: font.body,
                  fontSize: 13,
                  flex: 1,
                  height: 54,
                }}
                returnKeyType="send"
                onSubmitEditing={() => ask(query)}
              />
              <IconButton
                name="arrow-up"
                color={t.accent}
                label="Find my soundtrack"
                onPress={() => ask(query)}
                style={{
                  backgroundColor: t.accentBg,
                  width: 37,
                  height: 37,
                  borderRadius: 8,
                }}
              />
            </View>
            {!result && !busy && (
              <View style={{ gap: 8, marginTop: 18 }}>
                {prompts.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => ask(p)}
                    style={({ hovered }: any) => ({
                      padding: 13,
                      borderRadius: 8,
                      backgroundColor: hovered ? t.raised : t.bg,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    })}
                  >
                    <Txt size={12} muted>
                      {p}
                    </Txt>
                    <Icon
                      name="arrow-up-outline"
                      size={14}
                      color={t.subtle}
                      style={{ transform: [{ rotate: "45deg" }] }}
                    />
                  </Pressable>
                ))}
              </View>
            )}
            {busy && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 13,
                  paddingVertical: 30,
                }}
              >
                <ActivityIndicator color={t.accent} />
                <Txt muted size={12}>
                  Finding your frequency…
                </Txt>
              </View>
            )}
            {result && !busy && (
              <View style={{ marginVertical: 22 }}>
                <Txt size={13} style={{ lineHeight: 23, color: t.accent }}>
                  {result.message}
                </Txt>
                {result.tracks.length > 0 && (
                  <Button
                    icon="play"
                    small
                    style={{ alignSelf: "flex-start", marginTop: 16 }}
                    onPress={() => {
                      useStore.getState().play(
                        result.tracks[0].id,
                        result.tracks.map((s) => s.id),
                      );
                      useStore
                        .getState()
                        .notify("Your personal soundtrack is playing");
                    }}
                  >
                    Play my soundtrack
                  </Button>
                )}
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TrackRow
            track={item}
            compact
            onPress={() =>
              useStore.getState().play(
                item.id,
                result?.tracks.map((t) => t.id),
              )
            }
          />
        )}
        ListEmptyComponent={
          result && !busy ? (
            <EmptyState
              title="Let's add some music first"
              description="Import songs into your Library, then ask for a local playlist."
            />
          ) : null
        }
        ListFooterComponent={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 22,
            }}
          >
            <Icon name="shield-checkmark-outline" size={12} color={t.subtle} />
            <Txt size={9} style={{ color: t.subtle, flex: 1, lineHeight: 15 }}>
              Private, on-device mood matching. This foundation uses an
              explainable intent engine, not a cloud AI model.
            </Txt>
          </View>
        }
      />
    </Sheet>
  );
}
export function Overlays() {
  const overlay = useStore((s) => s.overlay);
  const t = useTheme();
  if (!overlay) return null;
  if (overlay === "collection") return <Collection />;
  if (overlay === "queue") return <Queue />;
  if (overlay === "track") return <TrackOptions />;
  if (overlay === "assistant") return <Assistant />;
  return (
    <Sheet
      title="A little note for your ears."
      subtitle="Updates from your personal music space"
    >
      <View style={{ padding: 27, gap: 20 }}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              padding: 12,
              backgroundColor: t.accentBg,
              borderRadius: 12,
              alignSelf: "flex-start",
            }}
          >
            <Icon name="sparkles-outline" color={t.accent} size={23} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="semibold" size={15}>
              Welcome to your first moment.
            </Txt>
            <Txt muted size={12} style={{ marginTop: 8, lineHeight: 22 }}>
              Start with a mix, fall back in love with a favourite, or bring
              your local collection home. The more you listen, the more this
              space becomes yours.
            </Txt>
          </View>
        </View>
        <Button
          icon="play"
          onPress={() => {
            useStore.getState().play("1");
            useStore.getState().update({ overlay: null });
          }}
        >
          Let's start listening
        </Button>
        <Txt muted size={10} style={{ lineHeight: 18 }}>
          Included songs are catalog previews. Your imported audio plays at full
          length, without uploading your files.
        </Txt>
      </View>
    </Sheet>
  );
}
