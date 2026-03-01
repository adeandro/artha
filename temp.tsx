/**
 * PIN Entry Screen
 * Shown on first app launch to set PIN, then on subsequent launches to verify
 * Supports both PIN and biometric authentication
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { useBiometric } from "@/hooks/useBiometric";
import { useBiometricStorage } from "@/hooks/storage/useStorage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PinEntryScreenProps {
  mode: "login" | "setup" | "change";
  onSuccess: () => void;
}

export const PinEntryScreen: React.FC<PinEntryScreenProps> = ({
  mode,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"first" | "confirm">(
    mode === "login" ? "first" : "first",
  );
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithBiometric, setPin: savePinToAuth } = useAuth();
  const { isBiometricEnabled } = useBiometricStorage();
  const { isSupported, displayName, authenticate } = useBiometric();
  const loginAttemptRef = useRef(false);
  const biometricAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-trigger biometric on mount (only for login mode)
  useEffect(() => {
    const attemptBiometricLogin = async () => {
      if (
        mode !== "login" ||
        !isSupported ||
        !isBiometricEnabled ||
        biometricAttemptedRef.current
      ) {
        return;
      }

      biometricAttemptedRef.current = true;

      if (__DEV__)
        console.log("[PIN] Auto-triggering biometric authentication on mount");

      const bioSuccess = await authenticate(
        "Autentikasi untuk mengakses Artha",
      );

      if (!isMountedRef.current) return;

      if (bioSuccess) {
        if (__DEV__)
          console.log("[PIN] Biometric auto-login successful - triggering navigation");

        // Clear PIN and set loading state
        setPin("");
        setIsLoading(true);

        if (__DEV__)
          console.log("[PIN] Waiting for state stabilization before navigation...");

        // Wait for state to stabilize and system to close biometric modal/keyboard
        // This prevents black screen in production builds
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!isMountedRef.current) {
          setIsLoading(false);
          return;
        }

        if (__DEV__)
          console.log("[PIN] State stabilized - calling onSuccess for navigation");

        onSuccess();
      } else {
        if (__DEV__)
          console.log("[PIN] Biometric auto-login failed or cancelled");
      }
    };

    attemptBiometricLogin();
  }, [mode, isSupported, isBiometricEnabled, authenticate, onSuccess]);

  // Handle auto-submit login with proper async safety
  const handleAutoLoginSubmit = useCallback(async () => {
    if (__DEV__) console.log("[PIN] Starting validation...");

    // Extra safety check - don't proceed if not mounted
    if (!isMountedRef.current) {
      if (__DEV__) console.log("[PIN] Component unmounted, aborting login");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(pin);

      // Check if still mounted after async operation
      if (!isMountedRef.current) {
        if (__DEV__)
          console.log(
            "[PIN] Component unmounted after login, skipping state update",
          );
        return;
      }

      if (success) {
        if (__DEV__) console.log("[PIN] PIN login successful - preparing navigation");
        setPin("");

        // Wait for state stabilization and system to process keyboard dismissal
        // This prevents black screen in production builds
        if (__DEV__)
          console.log("[PIN] Waiting for state stabilization before navigation...");
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Double check mounted before callback
        if (isMountedRef.current) {
          if (__DEV__)
            console.log("[PIN] State stabilized - calling onSuccess for navigation");
          onSuccess();
        }
      } else {
        if (__DEV__) console.log("[PIN] Invalid PIN");
        if (isMountedRef.current) {
          Alert.alert(Strings.pinIncorrect, Strings.pinIncorrect);
          setPin("");
          loginAttemptRef.current = false;
        }
      }
    } catch (error) {
      console.error("[PIN] Error during login:", error);
      if (isMountedRef.current) {
        Alert.alert(
          "Error",
          "An error occurred during login. Please try again.",
        );
        setPin("");
        loginAttemptRef.current = false;
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [pin, login, onSuccess]);

  // AUTO-SUBMIT LOGIN: Trigger when PIN reaches 6 digits (LOGIN MODE ONLY)
  useEffect(() => {
    if (
      mode === "login" &&
      pin.length === 6 &&
      !loginAttemptRef.current &&
      !isLoading
    ) {
      loginAttemptRef.current = true;
      handleAutoLoginSubmit();
    }
  }, [pin.length, mode, isLoading, handleAutoLoginSubmit]);

  const handleDigitPress = (digit: string) => {
    if (step === "first" && pin.length < 6) {
      setPin(pin + digit);
    } else if (step === "confirm" && confirmPin.length < 6) {
      setConfirmPin(confirmPin + digit);
    }
  };

  const handleDelete = () => {
    if (step === "first" && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === "confirm" && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBiometricPress = async () => {
    if (!isSupported) {
      Alert.alert(Strings.biometricNotAvailable, Strings.biometricNotAvailable);
      return;
    }

    if (mode !== "login") {
      return;
    }

    if (__DEV__)
      console.log("[PIN] Manual biometric authentication triggered");

    setIsLoading(true);
    try {
      const success = await loginWithBiometric(
        "Autentikasi dengan biometrik untuk mengakses Artha",
      );

      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }

      if (success) {
        if (__DEV__)
          console.log("[PIN] Manual biometric login successful - preparing navigation");
        setPin("");

        // Wait for state stabilization and system to close biometric modal/keyboard
        // This prevents black screen in production builds
        if (__DEV__)
          console.log("[PIN] Waiting for state stabilization before navigation...");
        await new Promise((resolve) => setTimeout(resolve, 150));

        if (isMountedRef.current) {
          if (__DEV__)
            console.log("[PIN] State stabilized - calling onSuccess for navigation");
          onSuccess();
        }
      } else {
        if (__DEV__) console.log("[PIN] Manual biometric login failed or cancelled");
        if (isMountedRef.current) {
          Alert.alert(Strings.biometricAuthenticationFailed, Strings.biometricTryAgain);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("[PIN] Biometric error:", error);
      if (isMountedRef.current) {
        Alert.alert("Error", Strings.biometricError);
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    // Safety check
    if (!isMountedRef.current) {
      if (__DEV__) console.log("[PIN] Component unmounted, aborting submit");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        // Login mode - should not reach here (auto-submit)
        return;
      } else if (mode === "setup" || mode === "change") {
        if (step === "first") {
          if (pin.length !== 6) {
            if (isMountedRef.current) {
              Alert.alert("Error", Strings.pinMustBe6Digits);
            }
            return;
          }
          if (isMountedRef.current) {
            setStep("confirm");
          }
        } else {
          if (confirmPin.length !== 6) {
            if (isMountedRef.current) {
              Alert.alert("Error", Strings.pinMustBe6Digits);
            }
            return;
          }
          if (pin !== confirmPin) {
            if (isMountedRef.current) {
              Alert.alert("Error", Strings.pinNotMatch);
              setPin("");
              setConfirmPin("");
              setStep("first");
            }
            return;
          }

          try {
            const success = await savePinToAuth(pin);

            // Check if still mounted after async operation
            if (!isMountedRef.current) {
              if (__DEV__)
                console.log(
                  "[PIN] Component unmounted after setPin, skipping callback",
                );
              return;
            }

            if (success) {
              if (isMountedRef.current) {
                Alert.alert("Success", Strings.pinSetSuccessfully);
                setPin("");
                setConfirmPin("");
                // Give state time to settle before calling success
                await new Promise((resolve) => setTimeout(resolve, 100));

                if (isMountedRef.current) {
                  onSuccess();
                }
              }
            } else {
              if (isMountedRef.current) {
                Alert.alert("Error", "Failed to set PIN. Please try again.");
              }
            }
          } catch (error) {
            console.error("[PIN] Error setting PIN:", error);
            if (isMountedRef.current) {
              Alert.alert("Error", "An error occurred. Please try again.");
            }
          }
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const currentPin = step === "first" ? pin : confirmPin;
  const isReady =
    (mode === "login" && pin.length === 6) ||
    (mode !== "login" && step === "first" && pin.length === 6) ||
    (mode !== "login" && step === "confirm" && confirmPin.length === 6);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.wrapper}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {Strings.appName}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {mode === "login"
              ? Strings.enterPin
              : step === "first"
                ? Strings.setNewPin
                : Strings.confirmPin}
          </ThemedText>
        </View>

        {/* PIN Display */}
        <View style={styles.pinDisplay}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                i < currentPin.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.key}
              onPress={() => handleDigitPress(digit.toString())}
              disabled={isLoading}
            >
              <ThemedText type="defaultSemiBold" style={styles.keyText}>
                {digit}
              </ThemedText>
            </TouchableOpacity>
          ))}

          {/* 0 and Delete */}
          <TouchableOpacity
            style={styles.key}
            onPress={() => handleDigitPress("0")}
            disabled={isLoading}
          >
            <ThemedText type="defaultSemiBold" style={styles.keyText}>
              0
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteKey}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <ThemedText style={styles.deleteText}>⌫</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Biometric Button - Only for Login Mode */}
        {mode === "login" && isSupported && isBiometricEnabled && (
          <View style={styles.biometricSection}>
            <TouchableOpacity
              style={[styles.biometricButton, isLoading && styles.biometricButtonDisabled]}
              onPress={handleBiometricPress}
              disabled={isLoading}
            >
              <ThemedText style={styles.biometricButtonText}>
                {displayName === "Face ID" ? "😊" : "👆"} {displayName}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Message for Login Mode - Shows Loading Indicator */}
