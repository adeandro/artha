/**
 * Biometric authentication hook
 * Manages biometric availability and authentication
 */

import {
  authenticateWithBiometric,
  BiometricAvailability,
  checkBiometricAvailability,
  getBiometricIconName,
  getBiometricTypeNames,
} from "@/lib/biometric";
import { useCallback, useEffect, useState } from "react";

export const useBiometric = () => {
  const [availability, setAvailability] = useState<BiometricAvailability>({
    available: false,
    enrolled: false,
    types: [],
  });
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const result = await checkBiometricAvailability();
      setAvailability(result);
      setLoading(false);
    };

    checkAvailability();
  }, []);

  const authenticate = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (!availability.available || !availability.enrolled) {
        if (__DEV__)
          console.log("[useBiometric] Biometric not available or not enrolled");
        return false;
      }

      setAuthenticating(true);
      try {
        const displayReason = reason || "Autentikasi dengan biometrik";
        const success = await authenticateWithBiometric(displayReason);
        return success;
      } finally {
        setAuthenticating(false);
      }
    },
    [availability.available, availability.enrolled],
  );

  const isSupported = availability.available && availability.enrolled;
  const displayName = getBiometricTypeNames(availability.types);
  const iconName = getBiometricIconName(availability.types);

  return {
    isSupported,
    isAvailable: availability.available,
    isEnrolled: availability.enrolled,
    types: availability.types,
    displayName,
    iconName,
    error: availability.error,
    loading,
    authenticating,
    authenticate,
  };
};
