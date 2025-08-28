// lib/integrations/services/redis.js
import { createClient } from "redis";

function connectOnceToRedis() {
  if (!globalThis.redisClient) {
    globalThis.redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    globalThis.redisClient.on("error", (err) =>
      console.log("Redis Client Error:", err)
    );
  }
  return globalThis.redisClient;
}

export async function getRedisClient() {
  const client = connectOnceToRedis();

  if (!client.isReady) {
    await client.connect();
  }

  return client;
}
// const redis =  createClient({
//   url: process.env.REDIS_URL,
// });
// redis.lRem

const keys = {
  onboarding: (sessionId) => `onboarding:${sessionId}`,
  addOn: (sessionId) => `addOn:${sessionId}`,
  callFlowConfig: (orgId) => `callFlowConfig:${orgId}`,
  callEvents: (callSid) => `call:${callSid}`,
  trainingQueue: (orgId, phone) => `queue:${orgId}:${phone}`,
  upNextTraining: (orgId) => `upNext:${orgId}`,
  hapioConfig: (orgId) => `hapioConfig:${orgId}`,
  aiAgentConfig: (orgId) => `aiAgentConfig:${orgId}`,
  availableSlots: (orgId) => `availableSlots:${orgId}`,
};

export async function publishCallEvent(callSid, payload) {
  const client = await getRedisClient();
  await client.publish(keys.callEvents(callSid), JSON.stringify(payload));
}

export async function getAllInvitees(orgId) {
  const client = await getRedisClient();
  try {
    const inviteeKeys = await client.keys(`invitee:${orgId}:*`);
    if (inviteeKeys.length === 0) {
      return [];
    }

    const allInvitees = [];
    for (const key of inviteeKeys) {
      try {
        const inviteeData = await client.json.get(key, "$");
        const data = Array.isArray(inviteeData) ? inviteeData[0] : inviteeData;
        if (data) {
          allInvitees.push({
            ...data,
            id: key.replace("invitee:", ""),
          });
        }
      } catch (error) {
        console.error(`Error fetching data for key ${key}:`, error);
      }
    }

    const pendingInvitees = allInvitees.filter(
      (invitee) => invitee.status === "pending"
    );
    return pendingInvitees;
  } catch (error) {
    console.error("Error retrieving invitees:", error);
    throw new Error("Failed to retrieve invitees");
  }
}

export async function onboardingCache(data) {
  console.log("redis cache data:", data);
  const client = await getRedisClient();
  await client.json.set(`onboarding:${data.sessionId}`, ".", data);
  await client.expire(`onboarding:${data.sessionId}`, daysToSeconds(7));
  return true;
}

export async function getOnboardingData(sessionId) {
  const client = await getRedisClient();
  return await client.json.get(keys.onboarding(sessionId));
}

export async function addOnCache(data) {
  console.log("redis cache data:", data);
  const client = await getRedisClient();
  await client.json.set(`addOn:${data.sessionId}`, ".", data);
  await client.expire(`addOn:${data.sessionId}`, 600);
  return true;
}
export async function getAddOnCache(sessionId) {
  const client = await getRedisClient();
  return await client.json.get(keys.addOn(sessionId));
}

export async function callFlowConfigCache(orgId, config) {
  const client = await getRedisClient();
  await client.json.set(`callFlowConfig:${orgId}`, ".", config);
  await client.expire(`callFlowConfig:${orgId}`, 3600);
  return true;
}

export async function getCachedCallFlowConfig(orgId) {
  const client = await getRedisClient();
  return await client.json.get(keys.callFlowConfig(orgId));
}

export async function clearOnboardingData(sessionId) {
  const client = await getRedisClient();
  await client.del(`onboarding:${sessionId}`);
}

export async function closeRedis() {
  if (globalThis.redisClient) {
    await globalThis.redisClient.quit();
    globalThis.redisClient = null;
  }
}
export function daysToSeconds(days) {
  return days * 24 * 60 * 60;
}

export async function setCallStatus(callSid, status, duration = 0) {
  const client = await getRedisClient();
  await client.setEx(
    `status:${callSid}`,      // key
    10,                       // TTL in seconds
    JSON.stringify({ status, duration })
  );
}

export async function getCallStatus(callSid) {
  const client = await getRedisClient();
  const raw = await client.get(`status:${callSid}`);
  return raw ? JSON.parse(raw) : { status: 'unknown', duration: 0 };
}


export async function enqueueTraining(orgId, phone, clerkId, scenarioId) {
  console.log(`🕶️ enqueueTraining | org:${orgId} phone:${phone} clerk:${clerkId} scenario:${scenarioId}`);
  const client = await getRedisClient();
  const payload = JSON.stringify({ clerkId, scenarioId, ts: Date.now() });
  const listKey = keys.trainingQueue(orgId, phone);
  await client.rPush(listKey, payload);
  const len = await client.lLen(listKey);
  console.log(`🕶️ enqueueTraining | new length:${len} (returning 0-based position:${len - 1})`);
  return len - 1;
}

export async function dequeueTraining(orgId, phone) {
  console.log(`⛔ dequeueTraining | org:${orgId} phone:${phone}`);
  const client = await getRedisClient();
  const listKey = keys.trainingQueue(orgId, phone);
  const raw = await client.lPop(listKey);
  console.log(`⛔ dequeueTraining | popped:${raw}`);
  return raw ? JSON.parse(raw) : null;
}

export async function peekTrainingQueue(orgId, phone) {
  console.log(`👀 peekTrainingQueue | org:${orgId} phone:${phone}`);
  const client = await getRedisClient();
  const listKey = keys.trainingQueue(orgId, phone);
  const raw = await client.lIndex(listKey, 0);
  console.log(`👀 peekTrainingQueue | front:${raw}`);
  return raw ? JSON.parse(raw) : null;
}

export async function getQueuePosition(orgId, phone, clerkId) {
  console.log(`🔍 getQueuePosition | org:${orgId} phone:${phone} clerk:${clerkId}`);
  const client = await getRedisClient();
  const listKey = keys.trainingQueue(orgId, phone);
  const list = await client.lRange(listKey, 0, -1);
  for (let i = 0; i < list.length; i++) {
    try {
      const { clerkId: id } = JSON.parse(list[i]);
      if (id === clerkId) {
        console.log(`🔍 getQueuePosition | position:${i}`);
        return i;
      }
    } catch {}
  }
  console.log(`🔍 getQueuePosition | NOT FOUND`);
  return -1;
}

// --- up-next cache helpers with quick logs -------------------------
export async function setUpNextTrainingCache(orgId, data) {
  console.log(`💾 setUpNextTrainingCache | org:${orgId}`, data);
  const client = await getRedisClient();
  await client.setEx(keys.upNextTraining(orgId), 60, JSON.stringify(data));
}

export async function getUpNextTrainingCache(orgId) {
  console.log(`📥 getUpNextTrainingCache | org:${orgId}`);
  const client = await getRedisClient();
  const raw = await client.get(keys.upNextTraining(orgId));
  console.log(`📥 getUpNextTrainingCache | raw:${raw}`);
  return raw ? JSON.parse(raw) : null;
}

export async function deleteUpNextTrainingCache(orgId) {
  console.log(`🗑️ deleteUpNextTrainingCache | org:${orgId}`);
  const client = await getRedisClient();
  await client.del(keys.upNextTraining(orgId));
}

export async function hapioConfigCache(orgId, config) {
  // console.log(`💾 hapioConfigCache | org:${orgId}`, config);
  const client = await getRedisClient();
  await client.json.set(`hapioConfig:${orgId}`, ".", config);
  await client.expire(`hapioConfig:${orgId}`, 3600);
  return true;
}

export async function getHapioConfigCache(orgId) {
  // console.log(`🦾 getHapioConfigCache | org:${orgId}`);
  const client = await getRedisClient();
  return await client.json.get(keys.hapioConfig(orgId));
}

export async function setAiAgentConfigCache(orgId, config) {
  // console.log(`💾 hapioConfigCache | org:${orgId}`, config);
  const client = await getRedisClient();
  await client.json.set(`aiAgentConfig:${orgId}`, ".", config);
  await client.expire(`aiAgentConfig:${orgId}`, 3600);
  return true;
}

export async function getAiAgentConfigCache(orgId) {
  // console.log(`🦾 getHapioConfigCache | org:${orgId}`);
  const client = await getRedisClient();
  return await client.json.get(keys.aiAgentConfig(orgId));
}

export async function setAvailableSlots(orgId, slots) {
  // console.log(`💾 setAvailableSlots | org:${orgId}`, slots);
  const client = await getRedisClient();
  await client.json.set(`availableSlots:${orgId}`, ".", slots);
  await client.expire(`availableSlots:${orgId}`, 6400);
  return true;
}

export async function getAvailableSlots(orgId) {
  // console.log(`��� getAvailableSlots | org:${orgId}`);
  const client = await getRedisClient();
  return await client.json.get(keys.availableSlots(orgId));
}

export { keys };
