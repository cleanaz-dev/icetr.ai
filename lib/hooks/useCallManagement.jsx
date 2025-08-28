"use client";

import { useTeamContext } from "@/context/TeamProvider";
import { useState, useEffect, useCallback } from "react";

// Status constants (unchanged)
export const CALL_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  RINGING: "ringing",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  ENDING: "ending",
  ENDED: "ended",
  FAILED: "failed",
  CANCELLED: "cancelled",
  BUSY: "busy",
  NO_ANSWER: "no_answer",
};

// ------------------------------------------------------------------
// MAIN HOOK
// ------------------------------------------------------------------
export function useCallManagement() {
  const { orgId } = useTeamContext();

  /* ---- state ---- */
  const [callSid, setCallSid] = useState(null);
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [currentCallData, setCurrentCallData] = useState(null);
  const [sessionCalls, setSessionCalls] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [error, setError] = useState(null);

  /* ---- duration timer ---- */
  useEffect(() => {
    let interval = null;
    if (callStatus === CALL_STATUS.ACTIVE && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [callStatus, callStartTime]);

  /* ---- poll status (lightweight) ---- */
  useEffect(() => {
    if (!callSid) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/org/${orgId}/calls/${callSid}/status`);
        const { status, duration } = await res.json();
        if (status === "in-progress") setCallStatus(CALL_STATUS.ACTIVE);
        else if (status === "completed") setCallStatus(CALL_STATUS.ENDED);
        else if (status === "failed") setCallStatus(CALL_STATUS.FAILED);
        else if (status === "busy") setCallStatus(CALL_STATUS.BUSY);
        else if (status === "no-answer") setCallStatus(CALL_STATUS.NO_ANSWER);
        else if (status === "queued" || status === "ringing")
          setCallStatus(CALL_STATUS.RINGING);

        if (duration) setCallDuration(duration);
      } catch {
        /* ignore */
      }
    };

    poll(); // immediate
    const iv = setInterval(poll, 1000);
    return () => clearInterval(iv);
  }, [callSid, orgId]);

  /* ---- actions ---- */
  const handleCall = useCallback(
    async (phoneNumber, leadData, fromNumber) => {
      setError(null);
      setCallStatus(CALL_STATUS.CONNECTING);
      try {
        const res = await fetch(`/api/org/${orgId}/calls/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: phoneNumber, from: fromNumber }),
        });
        if (!res.ok) throw new Error("Failed to start");

        const { callSid: sid } = await res.json();
        setCallSid(sid);
        setCallStartTime(Date.now());
        setCurrentCallData({
          phoneNumber,
          leadData,
          startTime: new Date(),
          type: "outbound",
        });
      } catch (e) {
        setError(e.message || "Could not start call");
        setCallStatus(CALL_STATUS.FAILED);
      }
    },
    [orgId]
  );

  const handleHangup = useCallback(async () => {
    if (!callSid) return;
    await fetch(`/api/org/${orgId}/calls/${callSid}/hangup`, {
      method: "POST",
    });
    setCallStatus(CALL_STATUS.ENDED);
  }, [callSid, orgId]);

  const handleMute = useCallback(async () => {
    if (!callSid) return;
    await fetch(`/api/org/${orgId}/calls/${callSid}/mute`, {
      method: "POST",
      body: JSON.stringify({ muted: !isMuted }),
    });
    setIsMuted((m) => !m);
  }, [callSid, isMuted, orgId]);

  const handleHold = useCallback(async () => {
    if (!callSid) return;
    await fetch(`/api/org/${orgId}/calls/${callSid}/hold`, {
      method: "POST",
      body: JSON.stringify({ hold: !isOnHold }),
    });
    setIsOnHold((h) => !h)
     setCallStatus(isOnHold ? CALL_STATUS.ACTIVE : CALL_STATUS.ON_HOLD);
  }, [callSid, isOnHold, orgId]);

  /* ---- helpers ---- */
  const isInCall = [
    CALL_STATUS.CONNECTING,
    CALL_STATUS.RINGING,
    CALL_STATUS.ACTIVE,
    CALL_STATUS.ON_HOLD,
  ].includes(callStatus);

  const canMakeCall = callStatus === CALL_STATUS.IDLE || callStatus === CALL_STATUS.ENDED;

  /* ---- return ---- */
  return {
    call: null, // SDK call object removed
    callSid,
    callStatus,
    callStartTime,
    callDuration,
    sessionCalls,
    currentCallData,
    isCallActive: callStatus === CALL_STATUS.ACTIVE,
    isMuted,
    isOnHold,
    isInCall,
    canMakeCall,
    error,

    // actions
    handleCall,
    handleHangup,
    handleMute,
    handleHold,
    redialNumber: handleCall, // same signature

    // legacy no-ops
    handleCallEnd: () => {}, // no longer needed
    handleAcceptCall: () => {},
    handleRejectCall: () => {},
    handlePracticeCall: () => {},
  };
}