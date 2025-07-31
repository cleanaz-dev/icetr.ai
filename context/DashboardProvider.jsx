"use client";

import { createContext, useContext, useMemo } from "react";

const DashboardContext = createContext({
  activities: [],
  leadCounts: {},
  dashboardStats: {},
});

export function DashboardProvider({ initialData = {}, children }) {
  const {
    activities = [],
    leadCounts = {},
    dashboardStats = {},
  } = initialData;

  const value = useMemo(
    () => ({
      activities,
      leadCounts,
      dashboardStats,
    }),
    [activities, leadCounts, dashboardStats]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}