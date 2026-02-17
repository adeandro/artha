/**
 * Theme Context
 * Manages app theme preference (light/dark mode)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArthaColors, ArthaColorsDark } from "@/constants/colors";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isDarkMode: boolean;
  isLoading: boolean;
  colors: typeof ArthaColors | typeof ArthaColorsDark;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem(
          "artha_theme",
        )) as ThemeMode | null;
        if (savedTheme) {
          setThemeState(savedTheme);
        } else {
          setThemeState("light");
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Update isDarkMode based on user setting
  useEffect(() => {
    const dark = theme === "dark";
    setIsDarkMode(dark);
  }, [theme]);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem("artha_theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = isDarkMode ? ArthaColorsDark : ArthaColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        isLoading,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
