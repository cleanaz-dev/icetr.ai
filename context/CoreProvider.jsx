"use client";

import { createContext, useContext, useMemo, useState } from "react";

const CoreContext = createContext({
  phoneConfiguration: null,
  setPhoneConfiguration: () => {},
  savePhoneConfiguration: async () => {},
});

export function CoreProvider({ initialData = {}, children }) {
  // Extract initial phoneConfiguration or default to empty array
  const { phoneConfiguration: initialPhoneConfiguration = null } = initialData;

  // Use state with the initial value
  const [phoneConfiguration, setPhoneConfiguration] = useState(
    initialPhoneConfiguration
  );

  const savePhoneConfiguration = async (config, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/phone-configuration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        // If HTTP status not 2xx, parse error message from JSON
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to save configuration");
      }

      const result = await response.json();

      // Assuming API returns { configuration: {...} }
      setPhoneConfiguration(result.phoneConfig);
    } catch (error) {
      console.error("Failed to save phone configuration:", error);
      // Optionally rethrow or handle error UI here
    }
  };

  // Memoize context value including state and updater
  const value = useMemo(
    () => ({
      phoneConfiguration,
      setPhoneConfiguration,
      savePhoneConfiguration,
    }),
    [phoneConfiguration]
  );

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
}

export function useCoreContext() {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error("useDashboard must be used within a CoreProvider");
  }
  return context;
}
