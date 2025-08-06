// lib/service/redis.js
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });

redis.on("error", (err) => console.log("Redis Client Error:", err));

await redis.connect();

export async function getAllInvitees(orgId) {
  try {
    // Get all invitee keys
    const inviteeKeys = await redis.keys(`invitee:${orgId}:*`);

    if (inviteeKeys.length === 0) {
      return [];
    }

    // Fetch all invitee data
    const allInvitees = [];

    for (const key of inviteeKeys) {
      try {
        const inviteeData = await redis.json.get(key, "$");

        // Handle both cases where data might be an array or direct object
        const data = Array.isArray(inviteeData) ? inviteeData[0] : inviteeData;

        if (data) {
          allInvitees.push({
            ...data,
            id: key.replace("invitee:", ""), // Extract the ID from the key
          });
        }
      } catch (error) {
        console.error(`Error fetching data for key ${key}:`, error);
        // Continue with other keys even if one fails
      }
    }

    // Filter to only include pending invitees
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
  // Set data with 1 hour expiration
  const cache = await redis.json.set(`onboarding:${data.sessionId}`, ".", {
    sessionId: data.sessionId,
    fullname: data.fullname,
    email: data.email,
    tierSettingsId: data.tierSettingsId,
    customerId: data.customerId,
  });

  // Set expiration (1 hour = 3600 seconds)
  await redis.expire(`onboarding:${data.sessionId}`, 3600);

  return cache
}

export async function getOnboardingData(sessionId) {
  return await redis.json.get(`onboarding:${sessionId}`);
}

export async function clearOnboardingData(sessionId) {
  await redis.del(`onboarding:${sessionId}`);
}

// Only close when your app shuts down
export async function closeRedis() {
  await redis.close();
}

export default redis;
