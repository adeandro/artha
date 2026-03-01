import { useDashboards } from "@/hooks/storage/useStorage";
import { Dashboard } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const ACTIVE_DASHBOARD_KEY = "artha_active_dashboard_id";

type DashboardContextType = {
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  dashboards: Dashboard[];
  addDashboard: (name: string) => Promise<Dashboard>;
  deleteDashboard: (id: string) => Promise<boolean>;
  updateDashboard: (id: string, newName: string) => Promise<boolean>;
  loading: boolean;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { dashboards, loading: dashboardsLoading, addDashboard, deleteDashboard, updateDashboard } = useDashboards();
  const [activeDashboardId, setActiveDashboardState] = useState<string>("default");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadActiveDashboard = async () => {
      try {
        const stored = await AsyncStorage.getItem(ACTIVE_DASHBOARD_KEY);
        if (stored) {
          // Verify that this ID still exists in dashboards 
          // (will be resolved when dashboards array itself loads, but safe to set it early)
          setActiveDashboardState(stored);
        } else {
          setActiveDashboardState("default");
        }
      } catch (e) {
        console.error("Failed to load active dashboard id", e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadActiveDashboard();
  }, []);

  const setActiveDashboardId = async (id: string) => {
    setActiveDashboardState(id);
    try {
      await AsyncStorage.setItem(ACTIVE_DASHBOARD_KEY, id);
    } catch (e) {
      console.error("Failed to save active dashboard id", e);
    }
  };

  const handleAddDashboard = async (name: string) => {
    const newDash = await addDashboard(name);
    // Auto switch to new dashboard
    await setActiveDashboardId(newDash.id);
    return newDash;
  };

  const handleDeleteDashboard = async (id: string) => {
    const success = await deleteDashboard(id);
    if (success && activeDashboardId === id) {
      // Revert to previous first dashboard if active is deleted
      const remaining = dashboards.filter((d) => d.id !== id);
      if (remaining.length > 0) {
        await setActiveDashboardId(remaining[0].id);
      } else {
        await setActiveDashboardId("default");
      }
    }
    return success;
  };

  const loading = dashboardsLoading || isInitializing;

  return (
    <DashboardContext.Provider
      value={{
        activeDashboardId,
        setActiveDashboardId,
        dashboards,
        addDashboard: handleAddDashboard,
        deleteDashboard: handleDeleteDashboard,
        updateDashboard,
        loading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
};
