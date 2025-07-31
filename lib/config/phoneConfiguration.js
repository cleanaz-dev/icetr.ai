// lib/config/phoneConfiguration.js 


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



// Call types
export const CALL_TYPES = {
  OUTBOUND: "outbound",
  INBOUND: "inbound",
  PRACTICE: "practice",
};


  export const getStatusText = (callStatus, configLoading) => {
    switch (callStatus) {
      case CALL_STATUS.IDLE:
        return configLoading ? "Loading configuration..." : "Ready to call";
      case CALL_STATUS.CONNECTING:
        return "Connecting...";
      case CALL_STATUS.RINGING:
        return "Ringing...";
      case CALL_STATUS.ACTIVE:
        return "Call in progress";
      case CALL_STATUS.ON_HOLD:
        return "On hold";
      case CALL_STATUS.ENDING:
        return "Ending call...";
      case CALL_STATUS.ENDED:
        return "Call ended";
      case CALL_STATUS.FAILED:
        return "Call failed";
      case CALL_STATUS.CANCELLED:
        return "Call cancelled";
      case CALL_STATUS.BUSY:
        return "Line busy";
      case CALL_STATUS.NO_ANSWER:
        return "No answer";
      default:
        return "Unknown status";
    }
  }