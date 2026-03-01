/**
 * Authentication context for PIN verification and biometric authentication
 */

import { usePinStorage } from "@/hooks/storage/useStorage";
import { authenticateWithBiometric } from "@/lib/biometric";
import { getDefaultPinHash, verifyPin } from "@/lib/crypto";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isPinSetup: boolean;
  login: (pin: string) => Promise<boolean>;
  loginWithBiometric: (reason?: string) => Promise<boolean>;
  setPin: (newPin: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinSetup, setIsPinSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pinHash, setPinHashState] = useState<string | null>(null);

  const { getPinHash, setPinHash, isPinSet } = usePinStorage();

  // Initialize on mount - only run once
  useEffect(() => {
    const init = async () => {
      if (__DEV__) console.log("[AuthContext] Initializing...");
      try {
        const isSet = await isPinSet();
        setIsPinSetup(isSet);

        const hash = await getPinHash();

        if (!hash) {
          if (__DEV__)
            console.log("[AuthContext] First launch - setting default PIN");
          const defaultHash = getDefaultPinHash();
          await setPinHash(defaultHash);
          setPinHashState(defaultHash);
        } else {
          setPinHashState(hash);
        }
      } catch (e) {
        console.error("[AuthContext] Initialization failed:", e);
      } finally {
        if (__DEV__) console.log("[AuthContext] Init complete");
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!pinHash) {
        if (__DEV__) console.log("[AuthContext] Login failed: no PIN hash");
        return false;
      }

      try {
        const isValid = verifyPin(pin, pinHash);
        if (isValid) {
          if (__DEV__)
            console.log(
              "[AuthContext] PIN verified - setting authenticated state",
            );
          setIsAuthenticated(true);

          // Wait for state to propagate through React's render cycle
          // This prevents black screen in production builds by ensuring
          // the layout has time to switch from PIN screen to tabs
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (__DEV__)
            console.log(
              "[AuthContext] State stabilized - ready for navigation",
            );
        } else {
          if (__DEV__) console.log("[AuthContext] Invalid PIN");
        }
        return isValid;
      } catch (e) {
        console.error("[AuthContext] Login error:", e);
        return false;
      }
    },
    [pinHash],
  );

  const loginWithBiometric = useCallback(
    async (reason?: string): Promise<boolean> => {
      try {
        if (__DEV__) console.log("[AuthContext] Attempting biometric login...");
        const displayReason = reason || "Autentikasi untuk mengakses Artha";
        const isValid = await authenticateWithBiometric(displayReason);

        if (isValid) {
          if (__DEV__)
            console.log(
              "[AuthContext] Biometric verified - setting authenticated state",
            );
          setIsAuthenticated(true);

          // Wait for state to propagate through React's render cycle
          // This prevents black screen in production builds by ensuring
          // the layout has time to switch from PIN screen to tabs
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (__DEV__)
            console.log(
              "[AuthContext] State stabilized - ready for navigation",
            );
        } else {
          if (__DEV__)
            console.log(
              "[AuthContext] Biometric authentication failed or cancelled",
            );
        }
        return isValid;
      } catch (e) {
        console.error("[AuthContext] Biometric login error:", e);
        return false;
      }
    },
    [],
  );

  const setPin = useCallback(
    async (newPin: string): Promise<boolean> => {
      try {
        const { hashPin } = require("@/lib/crypto");
        const newHash = hashPin(newPin);
        await setPinHash(newHash);
        setPinHashState(newHash);

        // Add small delay to ensure state is stable
        await new Promise((resolve) => setTimeout(resolve, 50));

        setIsPinSetup(true);
        setIsAuthenticated(true);
        if (__DEV__)
          console.log("[AuthContext] PIN set successfully - state updated");
        return true;
      } catch (e) {
        console.error("[AuthContext] Failed to set PIN:", e);
        return false;
      }
    },
    [setPinHash],
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPinSetup,
        login,
        loginWithBiometric,
        setPin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
