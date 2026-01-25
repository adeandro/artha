import { PinEntryScreen } from "@/components/pin-entry-screen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isPinSetup, isLoading } = useAuth();
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Force re-render when auth state changes
    setRenderKey((prev) => prev + 1);
  }, [isAuthenticated, isPinSetup, isLoading]);

  // If auth is still loading, show loading screen
  if (isLoading) {
    return (
      <View
        key={`loading-${renderKey}`}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#D1801E" />
      </View>
    );
  }

  // If PIN is not set up, show PIN setup screen
  if (!isPinSetup) {
    return (
      <ThemeProvider
        key={`setup-${renderKey}`}
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <PinEntryScreen mode="setup" onSuccess={() => setRenderKey((p) => p + 1)} />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  // If PIN is set up but not authenticated, show PIN login screen
  if (!isAuthenticated) {
    return (
      <ThemeProvider
        key={`login-${renderKey}`}
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <PinEntryScreen mode="login" onSuccess={() => setRenderKey((p) => p + 1)} />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  // If authenticated, show main app with tabs
  return (
    <ThemeProvider
      key={`app-${renderKey}`}
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transaction"
          options={{ presentation: "modal", title: "Tambah Transaksi" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
