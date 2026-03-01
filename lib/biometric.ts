/**
 * Biometric utilities for fingerprint/FaceID authentication
 */

import * as LocalAuthentication from "expo-local-authentication";

export interface BiometricAvailability {
  available: boolean;
  enrolled: boolean;
  types: string[];
  error?: string;
}

/**
 * Check if device supports biometric authentication
 */
export const checkBiometricAvailability =
  async (): Promise<BiometricAvailability> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return {
          available: false,
          enrolled: false,
          types: [],
          error:
            "Perangkat tidak mendukung autentikasi biometrik (Face ID / Fingerprint)",
        };
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return {
          available: true,
          enrolled: false,
          types: [],
          error: "Tidak ada sidik jari atau wajah yang terdaftar di perangkat",
        };
      }

      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      const typeNames = supportedTypes
        .map((type) => {
          switch (type) {
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
              return "Face ID";
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
              return "Fingerprint";
            default:
              return "Biometric";
          }
        })
        .filter(Boolean);

      return {
        available: true,
        enrolled: true,
        types: typeNames,
      };
    } catch (error) {
      console.error("[Biometric] Availability check failed:", error);
      return {
        available: false,
        enrolled: false,
        types: [],
        error: "Gagal memeriksa ketersediaan biometrik",
      };
    }
  };

/**
 * Attempt biometric authentication
 */
export const authenticateWithBiometric = async (
  reason: string,
): Promise<boolean> => {
  try {
    if (__DEV__)
      console.log("[Biometric] Attempting biometric authentication...");

    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false, // Allow fallback to PIN/password
      reason: reason,
      fallbackLabel: "Gunakan PIN",
      disableAutoFocus: false,
    });

    if (__DEV__)
      console.log("[Biometric] Authentication result:", result.success);

    return result.success;
  } catch (error) {
    console.error("[Biometric] Authentication error:", error);
    return false;
  }
};

/**
 * Get biometric type names for display
 */
export const getBiometricTypeNames = (types: string[]): string => {
  if (types.length === 0) return "Biometric";
  if (types.length === 1) return types[0];
  return types.join(" / ");
};

/**
 * Get appropriate icon name for biometric type
 */
export const getBiometricIconName = (types: string[]): string => {
  // Prefer Face ID if available, otherwise Fingerprint
  if (types.includes("Face ID")) return "faceid";
  if (types.includes("Fingerprint")) return "fingerprint";
  return "lock.fill";
};
