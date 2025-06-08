"use client"

import { useState, useEffect } from "react";
import { Device } from "@twilio/voice-sdk";

export function useTwilioDevice() {
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  useEffect(() => {
    const setupDevice = async () => {
      try {
        const response = await fetch("/api/twilio-token");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch token");
        }

        const twilioDevice = new Device(data.token, {
          logLevel: "info",
          codecPreferences: ["opus", "pcmu"],
        });

        twilioDevice.register();
        twilioDevice.on("registered", () => setStatus("Ready"));
        twilioDevice.on("error", (err) => {
          setError(`Device error: ${err.message}`);
          setStatus("Error");
        });

        setDevice(twilioDevice);
      } catch (err) {
        setError(err.message);
        setStatus("Error");
      }
    };

    setupDevice();
  }, []);

  return { device, status, error };
}