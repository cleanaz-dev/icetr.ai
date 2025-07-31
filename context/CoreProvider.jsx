"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Device, Logger } from "@twilio/voice-sdk";

const CoreContext = createContext({
  phoneConfiguration: null,
  setPhoneConfiguration: () => {},
  savePhoneConfiguration: async () => {},
  twilioDevice: null,
  twilioStatus: "Disconnected",
  twilioError: "",
  initializeTwilioDevice: async (orgId) => {},
  cleanupTwilioDevice: () => {},
});

export function CoreProvider({ initialData = {}, children }) {
  const { phoneConfiguration: initialPhoneConfiguration = null } = initialData;
  
  const [phoneConfiguration, setPhoneConfiguration] = useState(initialPhoneConfiguration);
  
  // Twilio Device state
  const [twilioDevice, setTwilioDevice] = useState(null);
  const [twilioStatus, setTwilioStatus] = useState("Disconnected");
  const [twilioError, setTwilioError] = useState("");

  // Initialize Twilio Device
  async function initializeTwilioDevice(orgId) {
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || 'Failed to fetch token';
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
  }

  // Cleanup device
  function cleanupTwilioDevice() {
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
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTwilioDevice();
    };
  }, []);

  const savePhoneConfiguration = async (config, orgId) => {
    // Your existing logic here
    try {
      // Implementation depends on your API
      setPhoneConfiguration(config);
    } catch (err) {
      console.error("Failed to save phone configuration:", err);
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      phoneConfiguration,
      setPhoneConfiguration,
      savePhoneConfiguration,
      twilioDevice,
      twilioStatus,
      twilioError,
      initializeTwilioDevice,
      cleanupTwilioDevice,
    }),
    [phoneConfiguration, twilioDevice, twilioStatus, twilioError]
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