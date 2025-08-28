"use client";

import { createContext, useContext, useMemo } from "react";

const DashboardContext = createContext({
  activities: [],
  leadCounts: {},
  dashboardStats: {},
  adminDashboardStats: {},
});

export function DashboardProvider({ initialData = {}, children }) {
  const {
    activities = [],
    leadCounts = {},
    dashboardStats = {},
    adminDashboardStats = {},
  } = initialData;

  const value = useMemo(
    () => ({
      activities,
      leadCounts,
      dashboardStats,
      adminDashboardStats,
    }),
    [activities, leadCounts, dashboardStats, adminDashboardStats]
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