"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DashboardContext = createContext(null);

export function DashboardProvider({ data = {}, children }) {
  const value = useMemo(
    () => ({
      ...data,
    }),
    [data]
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
