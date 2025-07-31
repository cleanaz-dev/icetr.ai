"use client";

import { createContext, useContext, useMemo } from "react";
import { getPublicIntegrationData } from "../lib/utils";

// 1. Default context shape
const PermissionContext = createContext({
  permissions: [],
  role: null,
  loading: false,
  publicIntegrations: null,
  getPublicIntegrationData,
});

// 2. Provider
export const PermissionProvider = ({ children, initialData }) => {
  const permissions = initialData?.permissions || [];
  const role = initialData?.role || null;
  const publicIntegrations = initialData?.publicIntegrations || null;
  const loading = false; // Static for now

  const value = useMemo(
    () => ({
      permissions,
      role,
      loading,
      publicIntegrations,
      getPublicIntegrationData,
    }),
    [permissions, role, publicIntegrations]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// 3. Hook
export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
};
