// lib/services/integrations/livekit.js
import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'https://icetrain-im1ybrlx.livekit.cloud';

// Create user token
export function createUserToken(identity, roomName, name = null) {
  const token = new AccessToken(
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET,
    { 
      identity,
      name: name || identity
    }
  );

  token.addGrant({ 
    roomJoin: true, 
    room: roomName,
    canSubscribe: true,
    canPublish: true,
  });

  return token;
}

// Create server token with admin permissions  
export function createServerToken(roomName) {
  const token = new AccessToken(
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET,
    { identity: `server-dispatch-${Date.now()}` }
  );

  token.addGrant({
    canPublish: true,
    roomCreate: true,
    roomJoin: true,
    roomList: true,
    roomRecord: true,
    roomAdmin: true,
    ingressAdmin: true,
    room: roomName
  });

  return token;
}

// Get HTTP API URL
export function getApiUrl(endpoint = '') {
  let host = LIVEKIT_URL;
  
  if (host.startsWith('wss://')) {
    host = host.replace('wss://', 'https://');
  } else if (host.startsWith('ws://')) {
    host = host.replace('ws://', 'http://');
  } else if (!host.startsWith('http://') && !host.startsWith('https://')) {
    host = `https://${host}`;
  }

  return `${host}${endpoint}`;
}

// Get dispatch client
export function getDispatchClient() {
  return new AgentDispatchClient(
    LIVEKIT_URL,
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET
  );
}

// Dispatch agent via SDK
export async function dispatchAgent(agentName, roomName, metadata = {}) {
  try {
    const dispatchClient = getDispatchClient();
    
    const dispatch = await dispatchClient.createDispatch({
      agentName,
      room: roomName,
      metadata: JSON.stringify(metadata)
    });
    
    console.log('Agent dispatched successfully with SDK:', dispatch);
    return dispatch;
    
  } catch (error) {
    console.error('SDK dispatch failed:', error.message);
    
    if (error.message?.includes('401') || error.message?.includes('unauthenticated')) {
      throw new Error('Authentication failed. Check your LIVEKIT_API_KEY and LIVEKIT_API_SECRET');
    }
    
    throw error;
  }
}

// Dispatch agent via direct HTTP (fallback)
export async function dispatchAgentHttp(agentName, roomName, metadata = {}) {
  const serverToken = createServerToken(roomName);
  const apiUrl = getApiUrl('/twirp/livekit.AgentDispatchService/CreateDispatch');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await serverToken.toJwt()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_name: agentName,
        room: roomName,
        metadata: JSON.stringify(metadata)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    // console.log('HTTP Dispatch successful:', result);
    return result;
    
  } catch (error) {
    console.error('HTTP Dispatch failed:', error);
    throw error;
  }
}