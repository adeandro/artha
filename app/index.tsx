/**
 * Root Index Route
 * This file is NOT used because anchor is set to (tabs)
 * but we keep it for safety
 */

import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import React from "react";

export default function RootIndex() {
  const { isAuthenticated, isPinSetup } = useAuth();

  // If not authenticated or PIN not setup, auth gate handles it
  // If authenticated, render nothing - parent layout handles navigation
  if (isAuthenticated && isPinSetup) {
    return null;
  }

  // Fallback redirect to tabs
  return <Redirect href="/(tabs)/dashboard" />;
}

