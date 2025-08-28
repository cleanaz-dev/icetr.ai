"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Device, Logger } from "@twilio/voice-sdk";
import { TierService } from "@/lib/services/tier-service";

const CoreContext = createContext({
  callFlowConfiguration: null,
  setCallFlowConfiguration: () => {},
  savePhoneConfiguration: async () => {},
  twilioDevice: null,
  twilioStatus: "Disconnected",
  twilioError: "",
  newKey: null,
  initializeTwilioDevice: async (orgId) => {},
  cleanupTwilioDevice: () => {},
  organization: null,
  generateApiKey: async () => {},
  // Enhanced tier methods
  tier: {
    current: "BASIC",
    checkLimit: async () => ({}),
    checkFeature: async () => ({}),
    checkUserLimit: async () => ({}),
    checkCampaignLimit: async () => ({}),
    canPerformAction: async () => ({}),
    suggestUpgrade: async () => null,
    isAtLimit: () => false,
  },
  tierSettings: null,
  saveScript: () => {},
  phoneNumbers: [],
});

export function CoreProvider({ initialData = {}, children }) {
  const {
    callFlowConfiguration: initialCallFlowConfiguration = null,
    organization: initialOrganization = null,
    phoneNumbers = [],
  } = initialData;

  const [callFlowConfiguration, setCallFlowConfiguration] = useState(
    initialCallFlowConfiguration
  );
  const [organization, setOrganization] = useState(initialOrganization);
  const [newKey, setNewKey] = useState("");
  const [tierSettings, setTierSettings] = useState(
    initialOrganization.tierSettings
  );

  // Twilio Device state
  const [twilioDevice, setTwilioDevice] = useState(null);
  const [twilioStatus, setTwilioStatus] = useState("Disconnected");
  const [twilioError, setTwilioError] = useState("");

  // Enhanced tier utilities using TierService
  const tier = useMemo(() => {
    const currentTier = TierService.getCurrentTier(organization);

    return {
      current: currentTier,

      // Simple synchronous checks (for quick UI decisions)
      isAtLeast: (requiredTier) =>
        TierService.isAtLeast(currentTier, requiredTier),
      limit: (key) => TierService.getTierConfig(currentTier)[key] ?? 0,
      feature: (key) => TierService.getTierConfig(currentTier)[key] ?? false,

      // Advanced async checks with logging
      checkLimit: (limitKey, currentValue, context) =>
        TierService.checkLimit(tierSettings, limitKey, currentValue, context),

      checkFeature: (featureKey, context) =>
        TierService.checkFeature(tierSettings, featureKey, context),

      checkUserLimit: (currentUserCount, context) =>
        TierService.checkUserLimit(tierSettings, currentUserCount, context),

      checkCampaignLimit: (currentCampaignCount, context) =>
        TierService.checkCampaignLimit(
          tierSettings,
          currentCampaignCount,
          context
        ),

      canPerformAction: (action, currentCounts) =>
        TierService.canPerformAction(tierSettings, action, currentCounts),

      suggestUpgrade: (blockedFeature, context) =>
        TierService.suggestUpgrade(
          tierSettings,
          organization,
          blockedFeature,
          context
        ),

      getUsageAnalytics: () => TierService.getUsageAnalytics(tierSettings),

      isAtLimit: (limitKey) => {
        const limitStatus = TierService.getLimit(tierSettings, limitKey);
        return limitStatus.isAtLimit;
      },

      // Convenience properties
      isBasic: currentTier === "BASIC",
      isProfessional: currentTier === "PROFESSIONAL",
      isEnterprise: currentTier === "ENTERPRISE",
      canAccessAdvancedFeatures: currentTier !== "BASIC",
      hasUnlimitedAccess: currentTier === "ENTERPRISE",
    };
  }, [organization]);

  const generateApiKey = async ({
    name,
    expiresAt = null,
    campaignIds = [],
  } = {}) => {
    if (!organization?.id) throw new Error("No organization");

    const res = await fetch(`/api/org/${organization.id}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, expiresAt, campaignIds }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Key creation failed");

    // copy to clipboard
    await navigator.clipboard.writeText(data.key);
    setNewKey(data.key);
    return data.key;
  };

  const savePhoneConfiguration = async (config) => {
    if (!organization?.id) throw new Error("No organization");

    try {
      const res = await fetch(
        `/api/org/${organization.id}/phone-configuration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to save phone configuration");

      setPhoneConfiguration(config);
      return data;
    } catch (err) {
      console.error("Failed to save phone configuration:", err);
      throw err;
    }
  };

  const initializeTwilioDevice = async (orgId) => {
    if (twilioDevice) {
      console.log("Device already exists, skipping initialization");
      return;
    }

    if (!orgId) {
      setTwilioError("Organization ID is required");
      setTwilioStatus("Error");
      return;
    }

    try {
      setTwilioStatus("Connecting");
      setTwilioError("");

      // Fetch token with better error handling
      const response = await fetch(`/api/org/${orgId}/twilio/token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.error || errorData.message || "Failed to fetch token";
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Set logger level
      Logger.setLevel("silent");

      // Create device with better error handling
      const device = new Device(data.token, {
        codecPreferences: ["opus", "pcmu"],
        enableIceRestart: false,
        warnings: false,
        // Add more options for better compatibility
        allowIncomingWhileBusy: false,
        closeProtection: false,
      });

      // Set up event listeners before registering
      device.on("registered", () => {
        console.log("Twilio device registered successfully");
        setTwilioStatus("Ready");
        setTwilioError("");
      });

      device.on("error", (err) => {
        console.error("Twilio device error:", err);
        setTwilioError(`Device error: ${err.message}`);
        setTwilioStatus("Error");
      });

      device.on("disconnect", () => {
        console.log("Twilio device disconnected");
        setTwilioStatus("Disconnected");
      });

      device.on("unregistered", () => {
        console.log("Twilio device unregistered");
        setTwilioStatus("Disconnected");
      });

      // Add token about to expire handler
      device.on("tokenWillExpire", () => {
        console.log("Twilio token will expire, refreshing...");
        // You might want to refresh the token here
      });

      // Register the device
      try {
        await device.register();
        setTwilioDevice(device);
        console.log("Device registration initiated");
      } catch (registerError) {
        console.error("Registration error:", registerError);
        throw new Error(`Registration failed: ${registerError.message}`);
      }
    } catch (err) {
      console.error("Failed to initialize Twilio device:", err);
      setTwilioError(err.message);
      setTwilioStatus("Error");
    }
  };

  const cleanupTwilioDevice = () => {
    if (twilioDevice) {
      try {
        console.log("Cleaning up Twilio device");
        twilioDevice.unregister();
        twilioDevice.removeAllListeners();
        setTwilioDevice(null);
        setTwilioStatus("Disconnected");
        setTwilioError("");
      } catch (err) {
        console.error("Error during cleanup:", err);
      }
    }
  };

  const saveScript = async (script, orgId, campaignId) => {
    const response = await fetch(
      `/api/org/${orgId}/campaigns/${campaignId}/call-scripts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script }),
      }
    );

    const result = await response.json();

    return result;
  };

  // Cleanup on unmount - moved after function definitions
  useEffect(() => {
    return () => {
      cleanupTwilioDevice();
    };
  }, []);

  const value = useMemo(
    () => ({
      organization,
      setOrganization,
      callFlowConfiguration,
      setCallFlowConfiguration,
      savePhoneConfiguration,
      tierSettings,
      phoneNumbers,
      twilioDevice,
      twilioStatus,
      twilioError,
      initializeTwilioDevice,
      cleanupTwilioDevice,
      generateApiKey,
      newKey,
      tier, 
      saveScript// Enhanced tier utilities
    }),
    [
      callFlowConfiguration,
      twilioDevice,
      twilioStatus,
      twilioError,
      organization,
      newKey,
      tier,
      saveScript,
      phoneNumbers,
    ]
  );

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
}

export function useCoreContext() {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error("useCoreContext must be used within a CoreProvider");
  }
  return context;
}
