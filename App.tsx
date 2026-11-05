import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AppShell } from './components/AppShell';
import { AudioProvider } from './lib/audio';
import { useStore } from './lib/store';
import { initializeDatabase } from './lib/database';
import { ThemeProvider, useTheme } from './lib/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

function Application() {
  const t = useTheme();
  useEffect(() => {
    initializeDatabase().then(() => useStore.getState().hydrate()).catch(() => {
      useStore.getState().hydrate();
      useStore.getState().notify('Storage is unavailable. Your session will still work.');
    });
  }, []);
  return (
    <NavigationContainer theme={{ ...DarkTheme, dark: t.dark, colors: { ...DarkTheme.colors, background: t.bg, card: t.surface, text: t.text, primary: t.accent, border: t.line } }}>
      <AudioProvider>
        <BottomSheetModalProvider><AppShell /></BottomSheetModalProvider>
      </AudioProvider>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded, error] = useFonts({ ...Ionicons.font, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold });
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Audio Mastery — Your music. Your mood. Your moment.';
      const css = document.createElement('style');
      css.textContent = 'body{background:#101112}*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:3px}::-webkit-scrollbar-thumb{background:#353536;border-radius:5px}input{outline:none}::selection{background:#ec9d5b55}:focus-visible{outline:2px solid #eeab73;outline-offset:4px}';
      document.head.appendChild(css);
      return () => css.remove();
    }
  }, []);
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#101112', justifyContent: 'center' }}><ActivityIndicator color="#edaa75" /></View>;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><QueryClientProvider client={queryClient}><ThemeProvider><Application /></ThemeProvider></QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>;
}
