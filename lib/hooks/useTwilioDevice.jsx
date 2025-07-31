"use client"

import { useState, useEffect } from "react";
import { Device, Logger  } from "@twilio/voice-sdk";

export function useTwilioDevice(orgId) {
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  useEffect(() => {
    const setupDevice = async () => {
      try {
        const response = await fetch(`/api/org/${orgId}/twilio/token`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch token");
        }

        // Suppress all logs
        Logger.setLevel("off");

        const twilioDevice = new Device(data.token, {
          codecPreferences: ["opus", "pcmu"],
          enableIceRestart: false,
          warnings: false,
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
