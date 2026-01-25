/**
 * Root Index Route
 * Redirects to (tabs) which is the main app
 */

import { Redirect } from "expo-router";

export default function RootIndex() {
  // Redirect to tabs (main app)
  return <Redirect href="/(tabs)" />;
}
