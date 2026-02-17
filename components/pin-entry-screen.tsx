/**
 * PIN Entry Screen
 * Shown on first app launch to set PIN, then on subsequent launches to verify
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
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

  const { login, setPin: savePin } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (mode === "login") {
        const success = await login(pin);
        if (success) {
          onSuccess();
          // Redirect to dashboard after successful login
          // Use absolute path for production build compatibility
          router.replace("/(tabs)/dashboard");
        } else {
          Alert.alert(Strings.pinIncorrect, Strings.pinIncorrect);
          setPin("");
        }
      } else if (mode === "setup" || mode === "change") {
        if (step === "first") {
          if (pin.length !== 6) {
            Alert.alert("Error", Strings.pinMustBe6Digits);
            return;
          }
          setStep("confirm");
        } else {
          if (confirmPin.length !== 6) {
            Alert.alert("Error", Strings.pinMustBe6Digits);
            return;
          }
          if (pin !== confirmPin) {
            Alert.alert("Error", Strings.pinNotMatch);
            setPin("");
            setConfirmPin("");
            setStep("first");
            return;
          }
          const success = await savePin(pin);
          if (success) {
            Alert.alert("Success", Strings.pinSetSuccessfully);
            onSuccess();
            // Redirect to dashboard after successful PIN setup
            // Use absolute path for production build compatibility
            router.replace("/(tabs)/dashboard");
          }
        }
      }
    } finally {
      setIsLoading(false);
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isReady && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isReady || isLoading}
        >
          <ThemedText style={styles.submitText}>
            {step === "first" && mode !== "login"
              ? Strings.confirmPin
              : Strings.enterPin}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.primaryDark,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: ArthaColors.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: ArthaColors.neutralLight,
  },
  pinDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 60,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ArthaColors.neutralLight,
  },
  pinDotFilled: {
    backgroundColor: ArthaColors.primaryAccent,
    borderColor: ArthaColors.primaryAccent,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginBottom: 40,
  },
  key: {
    width: "28%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: ArthaColors.neutralLight,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteKey: {
    width: "28%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: ArthaColors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 24,
    color: ArthaColors.primaryDark,
  },
  deleteText: {
    fontSize: 24,
    color: ArthaColors.white,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: ArthaColors.primaryAccent,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.white,
  },
});
