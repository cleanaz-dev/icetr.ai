"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTeamContext } from "@/context/TeamProvider";
import { useUser } from "@clerk/nextjs";

// ---------- STATUS CONSTANTS ----------
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

// ---------- CONTEXT ----------
const CallContext = createContext({
  callSid: null,
  callStatus: CALL_STATUS.IDLE,
  isCallActive: false,
  callDuration: 0,
  currentSession: null,
  isMuted: false,
  isOnHold: false,
  error: null,

  handleCall: () => {},
  handleHangup: () => {},
  handleMute: () => {},
  handleHold: () => {},
});

// ---------- PROVIDER ----------
export function CallProvider({ children }) {
  const { orgId } = useTeamContext();
  const { user } = useUser();

  /* ---- state ---- */
  const [callSid, setCallSid] = useState(null);
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [error, setError] = useState(null);

  /* ---- session creation ---- */
  useEffect(() => {
    if (!orgId || currentSession) return;

    fetch(`/api/org/${orgId}/calls/call-sessions/`, { method: "POST" })
      .then((r) => r.json())
      .then((sessionData) => {
        console.log("Created session:", sessionData);
        setCurrentSession(sessionData);
      })
      .catch((e) => console.error("session error", e));
  }, [orgId]);

  /* ---- duration timer ---- */
  useEffect(() => {
    if (callStatus !== CALL_STATUS.ACTIVE || !callStartTime) return;
    const iv = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [callStatus, callStartTime]);

  /* ---- live status via cheap polling ---- */
  useEffect(() => {
  if (!callSid || !orgId) return;

  let timeout;
  let attempt = 0;

  function schedule() {
    const delay = Math.min(1000 * 2 ** attempt, 8000);
    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/org/${orgId}/calls/${callSid}/status`);
        const { status, duration } = await res.json();

        const map = {
          initiated: CALL_STATUS.CONNECTING,
          ringing: CALL_STATUS.RINGING,
          "in-progress": CALL_STATUS.ACTIVE,
          completed: CALL_STATUS.ENDED,
          failed: CALL_STATUS.FAILED,
          busy: CALL_STATUS.BUSY,
          "no-answer": CALL_STATUS.NO_ANSWER,
          canceled: CALL_STATUS.CANCELLED,
        };
        setCallStatus(map[status] ?? CALL_STATUS.IDLE);
        if (typeof duration === "number") setCallDuration(duration);

        const final = ["completed", "failed", "busy", "no-answer", "canceled"];
        if (final.includes(status)) {
          setCallStartTime(null);
          setCallSid(null); // let this be the only place that clears callSid
          return;
        }

        attempt++;
        schedule();
      } catch {
        schedule();
      }
    }, delay);
  }

  schedule();
  return () => clearTimeout(timeout);
}, [callSid, orgId]);

  /* ---- actions ---- */
  const handleCall = useCallback(
    async (to, fromNumber, leadId) => {
      setError(null);
      setCallStatus(CALL_STATUS.CONNECTING);
      try {
        const res = await fetch(`/api/org/${orgId}/calls/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to,
            from: fromNumber,
            leadId: leadId,
            callSessionId: currentSession.id,
            clerkId: user.id,
          }),
        });
        if (!res.ok) throw new Error("Failed to start");
        const { callSid: sid } = await res.json();
        setCallSid(sid);
        setCallStartTime(Date.now());
      } catch (e) {
        setError(e.message || "Could not start call");
        setCallStatus(CALL_STATUS.FAILED);
      }
    },
    [orgId]
  );

const handleHangup = useCallback(async () => {
  if (!callSid) return;

  // 1. Ask Twilio to terminate
  await fetch(`/api/org/${orgId}/calls/${callSid}/hangup`, {
    method: "POST",
  });

  // 2. Immediately set local state so UI flips
  setCallStatus(CALL_STATUS.ENDED);
  setCallStartTime(null);
  setCallDuration(0);
  setCallSid(null);
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
    setIsOnHold((h) => !h);
    setCallStatus(isOnHold ? CALL_STATUS.ACTIVE : CALL_STATUS.ON_HOLD);
  }, [callSid, isOnHold, orgId]);

  /* ---- context value ---- */
  const value = useMemo(
    () => ({
      callSid,
      callStatus,
      isCallActive: callStatus === CALL_STATUS.ACTIVE,
      callDuration,
      currentSession,
      isMuted,
      isOnHold,
      error,
      handleCall,
      handleHangup,
      handleMute,
      handleHold,
    }),
    [
      callSid,
      callStatus,
      callDuration,
      currentSession,
      isMuted,
      isOnHold,
      error,
      handleCall,
      handleHangup,
      handleMute,
      handleHold,
    ]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

/* ---------- consumer hook ---------- */
export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
}
