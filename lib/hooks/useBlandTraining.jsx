import { useState, useEffect, useCallback } from "react";

export function useBlandTraining(orgId, twilioNumber) {
  const [callStatus, setCallStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [callSid, setCallSid] = useState(null);

  // 1. Mic permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(() => setError("Microphone permission denied"));
  }, []);

  // 2. Ask backend to place call TO the same Twilio number
  const startCall = useCallback(
    async ({ scenarioId, userId }) => {
      if (!scenarioId || !twilioNumber) {
        setError("Missing scenario or Twilio number");
        return;
      }
      setError(null);
      setCallStatus("connecting");

      try {
        const res = await fetch(`/api/org/${orgId}/calls/training-start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: twilioNumber, scenario: scenarioId, userId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Server error");

        setCallSid(data.callSid);
        setCallStatus("waiting");
      } catch (e) {
        setError(e.message);
        setCallStatus("idle");
      }
    },
    [orgId, twilioNumber]
  );

  // 3. Hang-up
  const hangUp = () => {
    setCallStatus("completed");
    setCallSid(null);
  };

  return { callStatus, callSid, startCall, hangUp, error };
}