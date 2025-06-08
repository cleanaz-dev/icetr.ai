// lib/service/redis.js
import { createClient } from 'redis';


const redis = createClient({url: process.env.REDIS_URL});

redis.on('error', (err) => console.log('Redis Client Error:', err));

await redis.connect()

export async function getAllInvitees() {
  try {
    // Get all invitee keys
    const inviteeKeys = await redis.keys("invitee:*");
    
    if (inviteeKeys.length === 0) {
      return [];
    }

    // Fetch all invitee data
    const invitees = [];
    
    for (const key of inviteeKeys) {
      try {
        const inviteeData = await redis.json.get(key, "$");
        console.log("inviteeData", inviteeData);
        
        // Handle both cases where data might be an array or direct object
        const data = Array.isArray(inviteeData) ? inviteeData[0] : inviteeData;
        
        if (data) {
          invitees.push(data);
        }
      } catch (error) {
        console.error(`Error fetching data for key ${key}:`, error);
        // Continue with other keys even if one fails
      }
    }

    return invitees;
  } catch (error) {
    console.error("Error retrieving invitees:", error);
    throw new Error("Failed to retrieve invitees");
  }
}
export default redis;