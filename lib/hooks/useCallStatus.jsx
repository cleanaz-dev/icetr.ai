// hooks/useCallStatus.jsx
import { useEffect } from "react";
import { useCall } from "@/context/CallProvider";
import { CALL_STATUS } from "@/context/CallProvider";

export function useCallStatus() {
  const { callSid, setCallStatus, setCallDuration } = useCall();

  useEffect(() => {
    if (!callSid) return;

    const source = new EventSource(
      `/api/org/${orgId}/calls/${callSid}/stream`
    );

    source.onmessage = (e) => {
      const { status, duration } = JSON.parse(e.data);
      setCallStatus(
        {
          "in-progress": CALL_STATUS.ACTIVE,
          completed: CALL_STATUS.ENDED,
          failed: CALL_STATUS.FAILED,
          busy: CALL_STATUS.BUSY,
          "no-answer": CALL_STATUS.NO_ANSWER,
          ringing: CALL_STATUS.RINGING,
          queued: CALL_STATUS.RINGING,
        }[status] ?? CALL_STATUS.IDLE
      );
      if (typeof duration === "number") setCallDuration(duration);
    };

    source.onerror = () => source.close();

    return () => source.close();
  }, [callSid, orgId]);
}