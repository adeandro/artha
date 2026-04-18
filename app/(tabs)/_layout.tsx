import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ArthaColors.primaryAccent,
        tabBarInactiveTintColor: ArthaColors.gray400,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: ArthaColors.white,
          borderTopColor: ArthaColors.gray200,
        },
      }}
      initialRouteName="dashboard"
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: Strings.dashboard,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.pie.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: Strings.transactions,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="arrow.left.arrow.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: Strings.settings,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="slider.horizontal.3" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
