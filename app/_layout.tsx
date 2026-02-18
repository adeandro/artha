import { PinEntryScreen } from "@/components/pin-entry-screen";
import { ArthaColors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

// Unmatched route guard
export const unstable_settings = {
  anchor: "(tabs)",
  initialRouteName: "index",
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isPinSetup, isLoading } = useAuth();

  // Debug logging - only log state transitions in dev mode
  useEffect(() => {
    if (__DEV__) {
      console.log("[AUTH-LAYOUT] State changed:", {
        isLoading,
        isPinSetup,
        isAuthenticated,
      });
    }
  }, [isLoading, isPinSetup, isAuthenticated]);

  // If auth is still loading, show loading screen
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color={ArthaColors.primaryAccent} />
      </View>
    );
  }

  // If PIN is not set up, show PIN setup screen
  if (!isPinSetup) {
    if (__DEV__) console.log("[AUTH-LAYOUT] Showing PIN setup screen");
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PinEntryScreen key="pin-setup" mode="setup" onSuccess={() => {
          if (__DEV__) console.log("[AUTH-LAYOUT] PIN setup successful");
        }} />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  // If PIN is set up but not authenticated, show PIN login screen
  if (!isAuthenticated) {
    if (__DEV__) console.log("[AUTH-LAYOUT] Showing PIN login screen");
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PinEntryScreen 
          key="pin-login" 
          mode="login" 
          onSuccess={() => {
            if (__DEV__) console.log("[AUTH-LAYOUT] PIN login successful - should show tabs");
          }} 
        />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  // If authenticated, show main app with tabs
  if (__DEV__) console.log("[AUTH-LAYOUT] Authenticated - showing main app");
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: "modal",
            title: "Tambah Transaksi",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Memoize to prevent unnecessary re-renders of the entire layout
const MemoizedRootLayoutInner = React.memo(RootLayoutInner);

export default function RootLayout() {
  return (
    <AuthProvider>
      <MemoizedRootLayoutInner />
    </AuthProvider>
  );
}
