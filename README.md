# AUDIO MASTERY

**Your music. Your mood. Your moment.**

A Tamil-first, local-first music experience. This delivery is Phase 1: a working cross-platform foundation and original cinematic design system, not a claim that every native production requirement is certified.

## Run and verify

- `npx tsc --noEmit`
- `npx expo export --platform all`
- `node tests/smoke.cjs` — a self-contained, terminating browser smoke test against the export
- Native device builds use the existing Expo / EAS configuration. MMKV, Skia, background services and device codec support require native-build verification.

## Included

- React Navigation Home, Search, Library, Profile tabs; adaptive desktop rail.
- Charcoal / amber visual language, Manrope and DM Sans, centralized design tokens, dark / light / system appearance.
- Persistent miniature player with gesture expansion, animated immersive full player, seeking, volume, play/pause, repeat, previous/next, queue editing, favourites and radio.
- Real Expo Audio playback. Seed music is explicitly labeled as short catalog previews, not full licensed streaming tracks.
- Device-file import via DocumentPicker, duplicate prevention by name + size fingerprint, persistent copies on native. Browser files are session-only.
- Tamil / Latin title, artist, album and mood search. Library filtering, artist/title filename inference, saved mixes.
- SQLite schema for native songs, listening events and playlists; WAL enabled. MMKV preferences on compatible native builds with AsyncStorage fallback. Browser data uses local storage.
- Zustand state, TanStack Query recommendations, Reanimated transitions, Gesture Handler player gestures, native Gorhom modal sheets, native Skia ambient playback visualization.
- Explainable recommendation scoring: explicit context match, liked-track affinity, artist affinity, play counts and recency penalty. Smart shuffle reduces adjacent artist repetition. Song radio ranks mood and energy proximity.
- A private, deterministic bilingual intent assistant. It matches moods / named artists / local-source requests. It is intentionally not presented as an LLM or semantic embedding model.
- Listening time accrues in ten-second intervals while actual audio plays; profile statistics start at zero rather than fabricated listening history.

## Audio choice and licensing

The September 2026 compatibility check established that React Native Track Player v5 changed to commercial licensing, while older MIT versions involve New Architecture maintenance. Phase 1 therefore uses Expo Audio with background playback configuration and native lock-screen metadata. See the research references:

- https://newreleases.io/project/github/doublesymmetry/react-native-track-player/release/v5.0.0
- https://docs.expo.dev/versions/latest/sdk/audio/

This avoids introducing an unapproved commercial SDK. Production music rights, catalog distribution terms, interruptions, automotive/Bluetooth behavior, long-running background playback and store compliance still require a release audit. Artwork and preview provenance is captured in `assets/catalog-source.json`; mood photography is from Unsplash. Do not assume preview access licenses a commercial catalog service.

## Deliberate phase boundaries

1. **Delivered: foundation & interaction model.** Design system, adaptive navigation, real previews/local playback, queue, import, persisted preferences, SQLite/native adapters and explainable recommendations.
2. **Native media hardening.** MediaStore / media-library incremental scanning, content-hash deduplication, embedded ID3/Vorbis metadata & artwork, removal detection, codec validation, interruptions, gapless/crossfade/loudness normalization, signed-device performance and accessibility testing.
3. **Listening intelligence.** Completion / skip / replay-weighted events, editable multi-attribute taxonomy, richer context preferences, privacy controls and recommendation evaluation.
4. **Semantic assistant.** Opt-in local embeddings or an explicitly configured and consented AI provider; no hidden service credentials or simulated remote AI.
5. **Release assurance.** Native device matrix, 60 FPS profiling, reduced-motion audit, VoiceOver/TalkBack, privacy and catalog licensing review, CI and dependency audit remediation.

The scaffold's Expo build-tool dependency tree currently reports moderate transitive advisories in uuid/xcode. The npm suggested automatic fix is a major Expo downgrade; it was intentionally not applied. No high or critical advisories were reported in the verification run.
