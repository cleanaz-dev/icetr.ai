"use client";

import { useCoreContext } from "@/context/CoreProvider";
import { useTeamContext } from "@/context/TeamProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  CALL_STATUS,
  CALL_TYPES,
  getStatusText,
} from "../config/phoneConfiguration";
import { toast } from "sonner";

// Call status constants

export function useCallManagement(device) {
  const { orgId } = useTeamContext();
  const { phoneConfiguration: initialPhoneConfiguration } = useCoreContext();

  // Core call state
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [sessionCalls, setSessionCalls] = useState([]);
  const [currentCallData, setCurrentCallData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSid, setCallSid] = useState(null);
  const [error, setError] = useState(null);

  // Phone configuration state
  const [phoneConfig, setPhoneConfig] = useState(initialPhoneConfiguration);
  const [configLoading, setConfigLoading] = useState(true);

  // Call metrics for analytics
  const [callMetrics, setCallMetrics] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageDuration: 0,
  });

  // Refs for cleanup
  const durationIntervalRef = useRef(null);
  const callEventCleanupRef = useRef(null);

  // Load phone configuration
  // useEffect(() => {
  //   if (!orgId) return;

  //   const loadPhoneConfig = async () => {
  //     try {
  //       setConfigLoading(true);
  //       const response = await fetch(`/api/org/${orgId}/phone-configuration`);

  //       if (response.ok) {
  //         const config = await response.json();
  //         setPhoneConfig(config);
  //       } else {
  //         console.error("Failed to load phone configuration");
  //         // Use defaults if config fails to load
  //         setPhoneConfig({
  //           recordingEnabled: true,
  //           recordOutboundCalls: true,
  //           recordInboundCalls: true,
  //           minOutboundDuration: 120,
  //           transcriptionProvider: "assemblyai",
  //           inboundFlow: "voicemail",
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error loading phone config:", error);
  //       setError("Failed to load phone configuration");
  //     } finally {
  //       setConfigLoading(false);
  //     }
  //   };

  //   loadPhoneConfig();
  // }, [orgId]);

  // Timer for call duration
  useEffect(() => {
    if (isCallActive && callStartTime) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isCallActive, callStartTime]);

  // Setup device event listeners
  useEffect(() => {
    if (!device) return;

    const handleIncomingCall = (incomingCall) => {
      console.log("Incoming call received");
      setCall(incomingCall);
      setCallSid(incomingCall.parameters?.CallSid || null);
      setCallStatus(CALL_STATUS.RINGING);

      // Show incoming call notification
      toast.info("Incoming call received", {
        duration: 10000,
        action: {
          label: "Answer",
          onClick: () => handleAcceptCall(),
        },
      });

      setupCallEventListeners(incomingCall);
    };

    const handleDeviceReady = () => {
      console.log("Device ready for calls");
      setError(null);
    };

    const handleDeviceError = (error) => {
      console.error("Device error:", error);
      setError(`Device error: ${error.message}`);
      setCallStatus(CALL_STATUS.FAILED);
    };

    // Register device events
    device.on("incoming", handleIncomingCall);
    device.on("ready", handleDeviceReady);
    device.on("error", handleDeviceError);

    return () => {
      device.removeListener("incoming", handleIncomingCall);
      device.removeListener("ready", handleDeviceReady);
      device.removeListener("error", handleDeviceError);
    };
  }, [device]);

  // Enhanced call event listeners with better error handling
  const setupCallEventListeners = useCallback((activeCall) => {
    // Clean up previous listeners
    if (callEventCleanupRef.current) {
      callEventCleanupRef.current();
    }

    const handleAccept = () => {
      console.log("Call accepted");
      setIsCallActive(true);
      setCallStatus(CALL_STATUS.ACTIVE);
      setCallStartTime(Date.now());
      setError(null);

      // Extract CallSid from the call
      setCallSid(activeCall.parameters?.CallSid || activeCall.sid || null);

      toast.success("Call connected");
    };

    const handleDisconnect = (connection) => {
      console.log("Call disconnected", connection);
      const disconnectReason =
        connection?.error?.message || "Call ended normally";
      setCallStatus(CALL_STATUS.ENDING);

      // Update call data with disconnect reason
      setCurrentCallData((prev) =>
        prev
          ? {
              ...prev,
              disconnectReason,
              endReason: "disconnect",
            }
          : null
      );

      handleCallEnd();
    };

    const handleCancel = () => {
      console.log("Call cancelled");
      setCallStatus(CALL_STATUS.CANCELLED);
      setCurrentCallData((prev) =>
        prev
          ? {
              ...prev,
              endReason: "cancelled",
            }
          : null
      );
      handleCallEnd();
    };

    const handleReject = () => {
      console.log("Call rejected");
      setCallStatus(CALL_STATUS.ENDED);
      setCurrentCallData((prev) =>
        prev
          ? {
              ...prev,
              endReason: "rejected",
            }
          : null
      );
      handleCallEnd();
    };

    const handleError = (error) => {
      console.error("Call error:", error);
      setCallStatus(CALL_STATUS.FAILED);
      setError(error.message || "Call failed");
      setCurrentCallData((prev) =>
        prev
          ? {
              ...prev,
              error: error.message,
              endReason: "error",
            }
          : null
      );

      toast.error(`Call failed: ${error.message}`);
      handleCallEnd();
    };

    const handleRinging = () => {
      console.log("Call ringing");
      setCallStatus(CALL_STATUS.RINGING);
    };

    const handleMute = (isMuted) => {
      console.log("Call muted:", isMuted);
      setCurrentCallData((prev) =>
        prev
          ? {
              ...prev,
              isMuted,
            }
          : null
      );
    };

    // Register call events
    activeCall.on("accept", handleAccept);
    activeCall.on("disconnect", handleDisconnect);
    activeCall.on("cancel", handleCancel);
    activeCall.on("reject", handleReject);
    activeCall.on("error", handleError);
    activeCall.on("ringing", handleRinging);
    activeCall.on("mute", handleMute);

    // Store cleanup function
    callEventCleanupRef.current = () => {
      activeCall.removeListener("accept", handleAccept);
      activeCall.removeListener("disconnect", handleDisconnect);
      activeCall.removeListener("cancel", handleCancel);
      activeCall.removeListener("reject", handleReject);
      activeCall.removeListener("error", handleError);
      activeCall.removeListener("ringing", handleRinging);
      activeCall.removeListener("mute", handleMute);
    };
  }, []);

  // Enhanced call function with phone config integration
  const handleCall = useCallback(
    async (phoneNumber, leadData, fromNumber, currentSession, userId) => {
      if (configLoading) {
        setError("Please wait for configuration to load");
        return;
      }

      if (!device || !phoneNumber) {
        console.error("Device not ready or no phone number provided");
        setError("Device not ready or no phone number provided");
        setCallStatus(CALL_STATUS.FAILED);
        return;
      }

      if (!phoneConfig) {
        setError("Phone configuration not available");
        return;
      }

      try {
        setCallStatus(CALL_STATUS.CONNECTING);
        setError(null);

        // Build call parameters with phone config
        const callParams = {
          To: phoneNumber,
          fromNumber: fromNumber,
          leadId: leadData?.id,
          callSessionId: currentSession,
          userId: userId,
          orgId: orgId,
        };

        // Add recording parameters based on config
        if (phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls) {
          callParams.recordingEnabled = "true";
          callParams.recordingStatusCallback = `/api/org/${orgId}/twiml`;
        }

        const outgoingCall = await device.connect({
          params: callParams,
        });

        setCall(outgoingCall);
        setCallSid(
          outgoingCall.parameters?.CallSid || outgoingCall.sid || null
        );

        const newCallData = {
          phoneNumber,
          leadData,
          startTime: new Date(),
          type: CALL_TYPES.OUTBOUND,
          callSid: outgoingCall.parameters?.CallSid || outgoingCall.sid,
          fromNumber,
          currentSession,
          userId,
          recordingEnabled:
            phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls,
        };
        setCurrentCallData(newCallData);

        setupCallEventListeners(outgoingCall);

        toast.success("Call initiated");
        console.log("Outgoing call initiated with config:", {
          recording:
            phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls,
          transcription: phoneConfig.transcriptionProvider,
        });

        // Update metrics
        setCallMetrics((prev) => ({
          ...prev,
          totalCalls: prev.totalCalls + 1,
        }));
      } catch (error) {
        console.error("Failed to make call:", error);
        setError(error.message || "Failed to make call");
        setCallStatus(CALL_STATUS.FAILED);
        toast.error(`Call failed: ${error.message}`);

        // Update failed call metrics
        setCallMetrics((prev) => ({
          ...prev,
          totalCalls: prev.totalCalls + 1,
          failedCalls: prev.failedCalls + 1,
        }));
      }
    },
    [device, orgId, phoneConfig, configLoading, setupCallEventListeners]
  );

  // Enhanced practice call with better setup
  const handlePracticeCall = useCallback(
    async (
      phoneNumber,
      fromNumber = null,
      currentSession = null,
      userId = null
    ) => {
      if (configLoading) {
        setError("Please wait for configuration to load");
        return;
      }

      if (!device || !phoneNumber) {
        console.error("Device not ready or no phone number provided");
        setError("Device not ready or no phone number provided");
        setCallStatus(CALL_STATUS.FAILED);
        return;
      }

      try {
        setCallStatus(CALL_STATUS.CONNECTING);
        setError(null);

        const newCallData = {
          phoneNumber,
          startTime: new Date(),
          type: CALL_TYPES.PRACTICE,
          fromNumber,
          currentSession,
          userId,
          recordingEnabled: true, // Always record practice calls
        };
        setCurrentCallData(newCallData);

        toast.info(
          "Practice call setup complete. Waiting for Bland AI to call..."
        );
        console.log(
          "Practice call setup complete, waiting for Bland AI to call"
        );
      } catch (error) {
        console.error("Failed to setup practice call:", error);
        setError(error.message || "Failed to setup practice call");
        setCallStatus(CALL_STATUS.FAILED);
        toast.error(`Practice call setup failed: ${error.message}`);
      }
    },
    [device, configLoading]
  );

  // Enhanced call end handling with metrics and persistence
  const handleCallEnd = useCallback(async () => {
    const endTime = Date.now();
    const duration = callStartTime
      ? Math.floor((endTime - callStartTime) / 1000)
      : 0;

    let callRecord = null;

    // Add call to session history
    if (currentCallData) {
      callRecord = {
        ...currentCallData,
        endTime: new Date(endTime),
        duration,
        status: callStatus,
        id: callSid || Date.now().toString(),
        success: ![CALL_STATUS.FAILED, CALL_STATUS.CANCELLED].includes(
          callStatus
        ),
      };

      setSessionCalls((prev) => [...prev, callRecord]);

      // Update metrics
      const wasSuccessful = callRecord.success;
      setCallMetrics((prev) => ({
        ...prev,
        successfulCalls: wasSuccessful
          ? prev.successfulCalls + 1
          : prev.successfulCalls,
        failedCalls: !wasSuccessful ? prev.failedCalls + 1 : prev.failedCalls,
        averageDuration:
          prev.totalCalls > 0
            ? Math.round(
                (prev.averageDuration * (prev.totalCalls - 1) + duration) /
                  prev.totalCalls
              )
            : duration,
      }));

      // Persist call data if it meets minimum duration requirements
      if (
        phoneConfig &&
        callRecord.type === CALL_TYPES.OUTBOUND &&
        duration >= phoneConfig.minOutboundDuration
      ) {
        try {
          await fetch(`/api/org/${orgId}/calls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(callRecord),
          });
        } catch (error) {
          console.error("Failed to persist call record:", error);
        }
      }
    }

    // Clean up call event listeners
    if (callEventCleanupRef.current) {
      callEventCleanupRef.current();
      callEventCleanupRef.current = null;
    }

    // Reset call state
    setCall(null);
    setIsCallActive(false);
    setCallStartTime(null);
    setCallDuration(0);
    setCurrentCallData(null);
    setCallSid(null);

    // Set final status
    if (
      callStatus !== CALL_STATUS.CANCELLED &&
      callStatus !== CALL_STATUS.FAILED
    ) {
      setCallStatus(CALL_STATUS.ENDED);
      toast.success(
        `Call ended. Duration: ${Math.floor(duration / 60)}:${(duration % 60)
          .toString()
          .padStart(2, "0")}`
      );
    }

    // Reset to idle after delay
    setTimeout(() => {
      setCallStatus(CALL_STATUS.IDLE);
      setError(null);
    }, 2000);

    return { duration, callData: callRecord, status: callStatus };
  }, [callStartTime, currentCallData, callStatus, callSid, phoneConfig, orgId]);

  // Other call control functions with improved error handling
  const handleAcceptCall = useCallback(() => {
    if (call && callStatus === CALL_STATUS.RINGING) {
      try {
        call.accept();
      } catch (error) {
        console.error("Failed to accept call:", error);
        setError("Failed to accept call");
        toast.error("Failed to accept call");
      }
    }
  }, [call, callStatus]);

  const handleRejectCall = useCallback(() => {
    if (call && callStatus === CALL_STATUS.RINGING) {
      try {
        call.reject();
      } catch (error) {
        console.error("Failed to reject call:", error);
        setError("Failed to reject call");
      }
    }
  }, [call, callStatus]);

  const handleHangup = useCallback(() => {
    if (call) {
      try {
        setCallStatus(CALL_STATUS.ENDING);
        call.disconnect();
      } catch (error) {
        console.error("Failed to hangup call:", error);
        setError("Failed to hangup call");
        // Force call end even if disconnect fails
        handleCallEnd();
      }
    }
  }, [call, handleCallEnd]);

  const redialNumber = useCallback(
    (phoneNumber, leadData, fromNumber, currentSession, userId) => {
      handleCall(phoneNumber, leadData, fromNumber, currentSession, userId);
    },
    [handleCall]
  );

  // Mute/unmute functionality
  const toggleMute = useCallback(() => {
    if (call && isCallActive) {
      try {
        const isMuted = call.isMuted();
        call.mute(!isMuted);

        setCurrentCallData((prev) =>
          prev
            ? {
                ...prev,
                isMuted: !isMuted,
              }
            : null
        );

        toast.success(isMuted ? "Call unmuted" : "Call muted");
      } catch (error) {
        console.error("Failed to toggle mute:", error);
        setError("Failed to toggle mute");
      }
    }
  }, [call, isCallActive]);

  // Utility functions

 const statusText = getStatusText(callStatus, configLoading);
  // Enhanced status checks
  const canMakeCall = callStatus === CALL_STATUS.IDLE && !configLoading && phoneConfig;
  const isInCall = [
    CALL_STATUS.CONNECTING,
    CALL_STATUS.RINGING,
    CALL_STATUS.ACTIVE,
  ].includes(callStatus);
  const isRinging = callStatus === CALL_STATUS.RINGING;
  const isMuted = currentCallData?.isMuted || false;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (callEventCleanupRef.current) {
        callEventCleanupRef.current();
      }
    };
  }, []);

  return {
    // Call state
    call,
    callStatus,
    callStartTime,
    callDuration,
    sessionCalls,
    currentCallData,
    isCallActive,
    callSid,
    error,
    statusText,

    // Configuration state
    phoneConfig,
    configLoading,

    // Metrics
    callMetrics,

    // Status utilities
    getStatusText,
    canMakeCall,
    isInCall,
    isRinging,
    isMuted,

    // Actions
    handleCall,
    handleCallEnd,
    handleHangup,
    handleAcceptCall,
    handleRejectCall,
    redialNumber,
    handlePracticeCall,
    toggleMute,

    // Manual setters (use sparingly)
    setCallStatus,
    setError,
    setIsCallActive,
    setCallDuration,
  };
}
