// lib/service/twilio.js
import { Device } from '@twilio/voice-sdk';

class TwilioVoiceClient {
  constructor() {
    this.device = null;
    this.currentCall = null;
    this.isInitialized = false;
    this.eventHandlers = {
      onReady: null,
      onError: null,
      onIncoming: null,
      onConnect: null,
      onDisconnect: null,
      onCancel: null,
      onReject: null,
    };
  }

  // Initialize the Twilio Device
  async initialize(accessToken) {
    try {
      if (this.device) {
        this.device.destroy();
      }

      this.device = new Device(accessToken, {
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
        codecPreferences: ['opus', 'pcmu'],
        fakeLocalDTMF: true,
        enableRingingState: true,
      });

      this.setupEventListeners();
      await this.device.register();
      this.isInitialized = true;
      
      // console.log('Twilio Device initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Twilio Device:', error);
      this.handleError(error);
      return false;
    }
  }

  // Setup event listeners for the device
  setupEventListeners() {
    if (!this.device) return;

    // Device ready
    this.device.on('ready', () => {
      // console.log('Twilio Device is ready');
      if (this.eventHandlers.onReady) {
        this.eventHandlers.onReady();
      }
    });

    // Device error
    this.device.on('error', (error) => {
      // console.error('Twilio Device error:', error);
      this.handleError(error);
    });

    // Incoming call
    this.device.on('incoming', (call) => {
      // console.log('Incoming call from:', call.parameters.From);
      this.currentCall = call;
      this.setupCallEventListeners(call);
      
      if (this.eventHandlers.onIncoming) {
        this.eventHandlers.onIncoming(call);
      }
    });

    // Device disconnect
    this.device.on('disconnect', () => {
      // console.log('Twilio Device disconnected');
    });
  }

  // Setup event listeners for individual calls
  setupCallEventListeners(call) {
    call.on('accept', () => {
      // console.log('Call accepted');
      if (this.eventHandlers.onConnect) {
        this.eventHandlers.onConnect(call);
      }
    });

    call.on('connect', () => {
      // console.log('Call connected');
      if (this.eventHandlers.onConnect) {
        this.eventHandlers.onConnect(call);
      }
    });

    call.on('disconnect', () => {
      // console.log('Call disconnected');
      this.currentCall = null;
      if (this.eventHandlers.onDisconnect) {
        this.eventHandlers.onDisconnect(call);
      }
    });

    call.on('cancel', () => {
      // console.log('Call cancelled');
      this.currentCall = null;
      if (this.eventHandlers.onCancel) {
        this.eventHandlers.onCancel(call);
      }
    });

    call.on('reject', () => {
      // console.log('Call rejected');
      this.currentCall = null;
      if (this.eventHandlers.onReject) {
        this.eventHandlers.onReject(call);
      }
    });

    call.on('error', (error) => {
      console.error('Call error:', error);
      this.handleError(error);
    });
  }

  // Make an outbound call
async makeCall(phoneNumber, params = {}) {
  if (!this.device || !this.isInitialized) {
    throw new Error('Twilio Device not initialized');
  }

  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  try {
    // Format phone number to E.164 format
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add +1 for US numbers if not present
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.length === 10) {
        cleanNumber = '+1' + cleanNumber;
      } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
        cleanNumber = '+' + cleanNumber;
      } else {
        throw new Error('Invalid phone number format. Use 10-digit US number or international format with country code.');
      }
    }

    // console.log('Formatted number:', cleanNumber);

    const callParams = {
      To: cleanNumber,
      ...params,
    };

    const call = await this.device.connect(callParams);
    this.currentCall = call;
    this.setupCallEventListeners(call);

    // console.log('Outbound call initiated to:', cleanNumber);
    return call;
  } catch (error) {
    console.error('Failed to make call:', error);
    this.handleError(error);
    throw error;
  }
}

  // Accept incoming call
  acceptCall() {
    if (this.currentCall && this.currentCall.status() === 'pending') {
      this.currentCall.accept();
      return true;
    }
    return false;
  }

  // Reject incoming call
  rejectCall() {
    if (this.currentCall && this.currentCall.status() === 'pending') {
      this.currentCall.reject();
      return true;
    }
    return false;
  }

  // Disconnect current call
  disconnectCall() {
    if (this.currentCall) {
      this.currentCall.disconnect();
      return true;
    }
    return false;
  }

  // Mute/unmute current call
  toggleMute() {
    if (this.currentCall && this.currentCall.status() === 'open') {
      const isMuted = this.currentCall.isMuted();
      this.currentCall.mute(!isMuted);
      return !isMuted;
    }
    return false;
  }

  // Send DTMF tones
  sendDTMF(tone) {
    if (this.currentCall && this.currentCall.status() === 'open') {
      this.currentCall.sendDigits(tone);
      return true;
    }
    return false;
  }

  // Get current call status
  getCallStatus() {
    if (!this.currentCall) return 'idle';
    return this.currentCall.status();
  }

  // Get current call information
  getCallInfo() {
    if (!this.currentCall) return null;
    
    return {
      status: this.currentCall.status(),
      direction: this.currentCall.direction,
      from: this.currentCall.parameters.From,
      to: this.currentCall.parameters.To,
      isMuted: this.currentCall.isMuted(),
      startTime: this.currentCall.connectTime,
    };
  }

  // Set event handlers
  setEventHandlers(handlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // Handle errors
  handleError(error) {
    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(error);
    }
  }

  // Update access token
  async updateToken(newAccessToken) {
    if (this.device) {
      try {
        this.device.updateToken(newAccessToken);
        // console.log('Access token updated successfully');
        return true;
      } catch (error) {
        console.error('Failed to update access token:', error);
        this.handleError(error);
        return false;
      }
    }
    return false;
  }

  // Destroy the device
  destroy() {
    if (this.device) {
      this.device.destroy();
      this.device = null;
      this.currentCall = null;
      this.isInitialized = false;
      // console.log('Twilio Device destroyed');
    }
  }

  // Get device state
  getDeviceState() {
    if (!this.device) return 'destroyed';
    return this.device.state;
  }

  // Check if device is ready
  isReady() {
    return this.device && this.device.state === 'ready';
  }
}

// Create and export a singleton instance
const twilioClient = new TwilioVoiceClient();

// Utility functions
export const initializeTwilio = async (accessToken) => {
  return await twilioClient.initialize(accessToken);
};

export const makeCall = async (phoneNumber, params) => {
  return await twilioClient.makeCall(phoneNumber, params);
};

export const acceptCall = () => twilioClient.acceptCall();
export const rejectCall = () => twilioClient.rejectCall();
export const disconnectCall = () => twilioClient.disconnectCall();
export const toggleMute = () => twilioClient.toggleMute();
export const sendDTMF = (tone) => twilioClient.sendDTMF(tone);
export const getCallStatus = () => twilioClient.getCallStatus();
export const getCallInfo = () => twilioClient.getCallInfo();
export const setEventHandlers = (handlers) => twilioClient.setEventHandlers(handlers);
export const updateToken = (token) => twilioClient.updateToken(token);
export const destroyTwilio = () => twilioClient.destroy();
export const isReady = () => twilioClient.isReady();

export default twilioClient;