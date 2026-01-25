/**
 * Catch-all route for unmatched routes
 * Helps debug routing issues
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.wrapper}>
          <ThemedText style={styles.title}>404 - Route Not Found</ThemedText>
          <ThemedText style={styles.message}>
            Halaman yang Anda cari tidak ditemukan.
          </ThemedText>

          <Link href="/(tabs)" asChild>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>
                Go to Dashboard
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <ThemedText style={styles.debug}>
            Jika Anda terus melihat halaman ini, ada masalah dengan routing.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  wrapper: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#D1801E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  debug: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
