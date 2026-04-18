import { PinEntryScreen } from "@/components/pin-entry-screen";
import { ArthaColors } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Keyboard, View } from "react-native";
import "react-native-reanimated";

// Unmatched route guard
export const unstable_settings = {
  anchor: "(tabs)",
  initialRouteName: "index",
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isPinSetup, isLoading } = useAuth();
  const navigationRef = useRef<boolean>(false);

  // Prevent double navigation and handle auth state changes
  useEffect(() => {
    if (__DEV__) {
      console.log("[AUTH-LAYOUT] State changed:", {
        isLoading,
        isPinSetup,
        isAuthenticated,
      });
    }

    // When authenticated, replace route to clean navigation stack
    if (isAuthenticated && !navigationRef.current) {
      navigationRef.current = true;
      if (__DEV__) console.log("[AUTH-LAYOUT] Authenticated - replacing route");

      // Dismiss keyboard before navigation
      Keyboard.dismiss();

      // Use replace to remove PIN screen from stack
      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 0);
    }
  }, [isAuthenticated, isLoading, isPinSetup]);

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
        <ActivityIndicator
          size="large"
          color={ArthaColors.primaryAccent}
          testID="auth-loading-indicator"
        />
      </View>
    );
  }

  // If PIN is not set up, show PIN setup screen
  if (!isPinSetup) {
    if (__DEV__) console.log("[AUTH-LAYOUT] Showing PIN setup screen");
    // Reset navigation flag when returning to setup
    navigationRef.current = false;
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PinEntryScreen
          key="pin-setup"
          mode="setup"
          onSuccess={() => {
            if (__DEV__) console.log("[AUTH-LAYOUT] PIN setup successful");
          }}
        />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  // If PIN is set up but not authenticated, show PIN login screen
  if (!isAuthenticated) {
    if (__DEV__) console.log("[AUTH-LAYOUT] Showing PIN login screen");
    // Reset navigation flag when returning to login (e.g., after logout)
    navigationRef.current = false;
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PinEntryScreen
          key="pin-login"
          mode="login"
          onSuccess={() => {
            if (__DEV__)
              console.log(
                "[AUTH-LAYOUT] PIN login successful - authenticating and navigating",
              );
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
