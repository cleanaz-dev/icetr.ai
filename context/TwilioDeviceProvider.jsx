"use client";

import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Device } from "@twilio/voice-sdk";
import { useTeamContext } from "./TeamProvider";
import { useUser } from "@clerk/nextjs";
import { scenarioPrompts } from "@/lib/constants/training";

const TwilioDeviceContext = createContext({
  device: null,
  status: "offline",
  currentCall: null,
  incomingCall: null,
  callMeta: {},
  makeCall: () => {},
  answerCall: () => {},
  rejectCall: () => {},
  hangUp: () => {},
  mute: () => {},
  unmute: () => {},
  handleTrainingCall: () => {},
});

export function TwilioDeviceProvider({ children }) {
  const deviceRef = useRef(null);
  const [status, setStatus] = useState("offline");
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callMeta, setCallMeta] = useState({});
  const { orgId } = useTeamContext();
   const { user } = useUser()

  useEffect(() => {
    if (!orgId) return;

    const initDevice = async () => {
      try {
        // 1. Fetch a fresh token scoped to the current tenant
        const res = await fetch(`/api/org/${orgId}/twilio/token?userId=${user.id}`, { 
          method: "GET" 
        });
        
        if (!res.ok) {
          throw new Error(`Token fetch failed: ${res.status}`);
        }
        
        const { token } = await res.json();

        // 2. Create device
        const device = new Device(token, {
          codecPreferences: ["opus", "pcmu"],
          logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn",
        });

        deviceRef.current = device;

        // 3. Event listeners
        device.on("registered", () => {
          console.log("Device registered");
          setStatus("ready");
        });

        device.on("unregistered", () => {
          console.log("Device unregistered");
          setStatus("offline");
        });

        device.on("error", (error) => {
          console.error("Device error:", error);
          setStatus("error");
        });

        device.on("incoming", (call) => {
          console.log("Incoming call:", call.parameters);
          setIncomingCall(call);
          setCallMeta(call.parameters);
        });

        device.on("connect", (call) => {
          console.log("Call connected");
          setCurrentCall(call);
          setIncomingCall(null);
        });

        device.on("disconnect", (call) => {
          console.log("Call disconnected");
          setCurrentCall(null);
          setIncomingCall(null);
          setCallMeta({});
        });

        // 4. Register the device
        await device.register();

      } catch (error) {
        console.error("Failed to initialize Twilio Device:", error);
        setStatus("error");
      }
    };

    initDevice();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, [orgId]);

  const makeCall = async (params) => {
    if (!deviceRef.current || status !== "ready") {
      throw new Error("Device not ready");
    }

    try {
      const call = await deviceRef.current.connect(params);
      return call;
    } catch (error) {
      console.error("Failed to make call:", error);
      throw error;
    }
  };

 const handleTrainingCall = useCallback(async (data) => {
    console.log("Testing handleTrainingCall with:", data);
    
    const call = await deviceRef.current.connect({
      params: {
        To:"+14374475892",    
        callType: "training",
        userId: user.id,
        orgId,
        scenarioId: data.scenarioId,
      }
    });
    
    console.log("Call initiated, check your webhook logs for form data");
    return call;
  }, [user.id, orgId]);

  const answerCall = () => {
    if (incomingCall) {
      incomingCall.accept();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
    }
  };

  const hangUp = () => {
    if (currentCall) {
      currentCall.disconnect();
    } else if (incomingCall) {
      incomingCall.reject();
    }
  };

  const mute = () => {
    if (currentCall) {
      currentCall.mute(true);
    }
  };

  const unmute = () => {
    if (currentCall) {
      currentCall.mute(false);
    }
  };

  const value = useMemo(
    () => ({
      device: deviceRef.current,
      status,
      currentCall,
      incomingCall,
      callMeta,
      makeCall,
      answerCall,
      rejectCall,
      hangUp,
      mute,
      unmute,
      handleTrainingCall,
    }),
    [status, currentCall, incomingCall, callMeta]
  );

  return (
    <TwilioDeviceContext.Provider value={value}>
      {children}
    </TwilioDeviceContext.Provider>
  );
}

export function useTwilioDevice() {
  const context = useContext(TwilioDeviceContext);
  if (!context) {
    throw new Error("useTwilioDevice must be used within a TwilioDeviceProvider");
  }
  return context;
}