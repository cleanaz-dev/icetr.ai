"use client"

import { useState, useEffect, useCallback } from 'react';

// Call status constants
export const CALL_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  RINGING: 'ringing',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  ENDING: 'ending',
  ENDED: 'ended',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  BUSY: 'busy',
  NO_ANSWER: 'no_answer'
};

export function useCallManagement(device) {
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [sessionCalls, setSessionCalls] = useState([]);
  const [currentCallData, setCurrentCallData] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState(null);

  // Timer for call duration
  useEffect(() => {
    let interval = null;
    if (isCallActive && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCallActive, callStartTime]);

  // Setup device event listeners
  useEffect(() => {
    if (!device) return;

    const handleIncomingCall = (incomingCall) => {
      console.log('Incoming call received');
      setCall(incomingCall);
      setCallStatus(CALL_STATUS.RINGING);
      setupCallEventListeners(incomingCall);
    };

    device.on('incoming', handleIncomingCall);

    return () => {
      device.removeListener('incoming', handleIncomingCall);
    };
  }, [device]);

  const setupCallEventListeners = (activeCall) => {
    activeCall.on('accept', () => {
      console.log('Call accepted');
      setIsCallActive(true);
      setCallStatus(CALL_STATUS.ACTIVE);
      setCallStartTime(Date.now());
      setError(null);
    });

    activeCall.on('disconnect', () => {
      console.log('Call disconnected');
      setCallStatus(CALL_STATUS.ENDING);
      handleCallEnd();
    });

    activeCall.on('cancel', () => {
      console.log('Call cancelled');
      setCallStatus(CALL_STATUS.CANCELLED);
      handleCallEnd();
    });

    activeCall.on('reject', () => {
      console.log('Call rejected');
      setCallStatus(CALL_STATUS.ENDED);
      handleCallEnd();
    });

    activeCall.on('error', (error) => {
      console.error('Call error:', error);
      setCallStatus(CALL_STATUS.FAILED);
      setError(error.message || 'Call failed');
      handleCallEnd();
    });

    // Additional Twilio-specific events
    activeCall.on('ringing', () => {
      console.log('Call ringing');
      setCallStatus(CALL_STATUS.RINGING);
    });

    activeCall.on('mute', (isMuted) => {
      console.log('Call muted:', isMuted);
      // You can add mute state management here if needed
    });
  };

  const handleCall = useCallback(async (phoneNumber, leadData, fromNumber) => {
    if (!device || !phoneNumber) {
      console.error('Device not ready or no phone number provided');
      setError('Device not ready or no phone number provided');
      setCallStatus(CALL_STATUS.FAILED);
      return;
    }

    try {
      setCallStatus(CALL_STATUS.CONNECTING);
      setError(null);

      const outgoingCall = await device.connect({
        params: { To: phoneNumber, fromNumber: fromNumber }
      });

      setCall(outgoingCall);
      setCurrentCallData({
        phoneNumber,
        leadData,
        startTime: new Date(),
        type: 'outbound'
      });

      setupCallEventListeners(outgoingCall);
      
      console.log('Outgoing call initiated');
    } catch (error) {
      console.error('Failed to make call:', error);
      setError(error.message || 'Failed to make call');
      setCallStatus(CALL_STATUS.FAILED);
    }
  }, [device]);

  const handleAcceptCall = useCallback(() => {
    if (call && callStatus === CALL_STATUS.RINGING) {
      call.accept();
    }
  }, [call, callStatus]);

  const handleRejectCall = useCallback(() => {
    if (call && callStatus === CALL_STATUS.RINGING) {
      call.reject();
    }
  }, [call, callStatus]);

  const handleHangup = useCallback(() => {
    if (call) {
      setCallStatus(CALL_STATUS.ENDING);
      call.disconnect();
    }
  }, [call]);

  const handleCallEnd = useCallback(() => {
    const endTime = Date.now();
    const duration = callStartTime ? Math.floor((endTime - callStartTime) / 1000) : 0;

    // Add call to session history
    if (currentCallData) {
      const callRecord = {
        ...currentCallData,
        endTime: new Date(endTime),
        duration,
        status: callStatus,
        id: Date.now().toString(),
      };
      
      setSessionCalls(prev => [...prev, callRecord]);
    }

    // Reset call state
    setCall(null);
    setIsCallActive(false);
    setCallStartTime(null);
    setCallDuration(0);
    setCurrentCallData(null);
    
    // Set final status
    if (callStatus !== CALL_STATUS.CANCELLED && callStatus !== CALL_STATUS.FAILED) {
      setCallStatus(CALL_STATUS.ENDED);
    }
    
    // After a delay, reset to idle
    setTimeout(() => {
      setCallStatus(CALL_STATUS.IDLE);
      setError(null);
    }, 2000);
    
    // Return call data for post-call dialog
    return { duration, callData: currentCallData, status: callStatus };
  }, [call, callStartTime, currentCallData, callStatus]);

  const redialNumber = useCallback((phoneNumber, leadData) => {
    handleCall(phoneNumber, leadData);
  }, [handleCall]);

  // Utility function to get human-readable status
  const getStatusText = useCallback(() => {
    switch (callStatus) {
      case CALL_STATUS.IDLE:
        return 'Ready to call';
      case CALL_STATUS.CONNECTING:
        return 'Connecting...';
      case CALL_STATUS.RINGING:
        return 'Ringing...';
      case CALL_STATUS.ACTIVE:
        return 'Call in progress';
      case CALL_STATUS.ON_HOLD:
        return 'On hold';
      case CALL_STATUS.ENDING:
        return 'Ending call...';
      case CALL_STATUS.ENDED:
        return 'Call ended';
      case CALL_STATUS.FAILED:
        return 'Call failed';
      case CALL_STATUS.CANCELLED:
        return 'Call cancelled';
      case CALL_STATUS.BUSY:
        return 'Line busy';
      case CALL_STATUS.NO_ANSWER:
        return 'No answer';
      default:
        return 'Unknown status';
    }
  }, [callStatus]);

  // Check if call can be made
  const canMakeCall = callStatus === CALL_STATUS.IDLE;
  
  // Check if call is in progress
  const isInCall = [CALL_STATUS.CONNECTING, CALL_STATUS.RINGING, CALL_STATUS.ACTIVE].includes(callStatus);

  return {
    // Call state
    call,
    callStatus,
    callStartTime,
    callDuration,
    sessionCalls,
    currentCallData,
    isCallActive,
    error,
    
    // Status utilities
    getStatusText,
    canMakeCall,
    isInCall,
    
    // Actions
    handleCall,
    handleCallEnd,
    handleHangup,
    handleAcceptCall,
    handleRejectCall,
    redialNumber,
    
    // Manual status setters (for special cases)
    setCallStatus,
    setError,
  };
}