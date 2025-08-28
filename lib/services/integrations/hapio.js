// lib/hapio.js

import OpenAI from "openai";
import { format, addDays, startOfDay } from "date-fns";
import { getAvailableSlots, setAvailableSlots } from "./redis";

const moonshot = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

const hapioUrl = "https://eu-central-1.hapio.net/v1";

function formatHapioDate(date) {
  // Example output: 2025-08-23T00:00:00+00:00
  return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");
}

/**
 * Fetch availability from Hapio and return 6 formatted slots
 * @param {Object} hapioIds - { serviceId, locationId, resourceId }
 * @returns {Promise<{starts_at: string, ends_at: string, label: string}[]>}
 */
export async function getAvailability(hapioIds, orgId) {
  const { serviceId, locationId } = hapioIds;

  // Hapio usually wants whole-day ranges, not "now"
  const from = formatHapioDate(startOfDay(new Date())); // today at 00:00
  const to = formatHapioDate(startOfDay(addDays(new Date(), 7))); // +2 days at 00:00
  console.log("from:", from);
  console.log("to:", to);

  const url = new URL(
    `https://eu-central-1.hapio.net/v1/services/${serviceId}/bookable-slots`
  );
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("location", locationId);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.HAPIO_API_KEY}` },
  });

  if (!res.ok) throw new Error(`Hapio ${res.status}: ${await res.text()}`);

  const rawSlots = (await res.json()).data;

  let availableSlots = await getAvailableSlots(orgId);
  if (availableSlots) {
    console.log("cache hit");
    return availableSlots;
  } else {
    console.log("cache miss");
    return await convertedSlots(rawSlots, hapioIds, orgId);
  }
}
/**
 * Ask Groq to pick exactly six slots and format them
 * @param {Array} rawSlots - Hapio slot objects
 * @returns {Promise<{starts_at: string, ends_at: string, label: string}[]>}
 */
async function convertedSlots(rawSlots, hapioIds, orgId) {
  const simplified = rawSlots.map((s) => ({
    starts_at: s.starts_at,
    ends_at: s.ends_at,
  }));

  const prompt = `
You are a precise scheduling assistant.
Input:
${JSON.stringify(simplified)}
${JSON.stringify(hapioIds)}

Rules:
1. Return ONLY a valid JSON object with first_six_slots and all_slots arrays.
2. for the first_six_slots, Pick 6 for normal busness hours. 
3. Each object must contain:
  starts_at, ends_at
4. Do NOT include any explanation or text outside the JSON.

Example output format:
{
"first_six_slots": [
  {"starts_at":"2025-08-23T08:00:00-04:00","ends_at":"2025-08-23T09:00:00-04:00"}
],
}`;

  const res = await moonshot.chat.completions.create({
    model: "kimi-k2-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10000,
    temperature: 0.2,
  });

  const text = res.choices[0].message.content.trim();
  console.log("text from AI:", text);

  try {
    const parsedData = JSON.parse(text);
    console.log("parsedData:", parsedData);

    // Store both arrays separately
    await setAvailableSlots(orgId, parsedData);

    // Return separated arrays
    return {
      first_six_slots: parsedData.first_six_slots || [],
      all_slots: simplified,
    };
  } catch {
    // fallback with dummy data
    const fallbackSlot = {
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      human_text: "Tomorrow 9:00 AM",
      resource_id: "default",
      service_id: "default",
      location_id: "default",
    };

    return {
      first_six_slots: [fallbackSlot],
      all_slots: [fallbackSlot],
    };
  }
}

export async function createHapioBookingRequest({ slotData, leadInfo, hapioIds }) {
  console.log("Creating Hapio booking with slotData:", slotData);
  console.log("Lead info:", leadInfo);

  const payload = {
    resource_id: hapioIds.resourceId,
    service_id: hapioIds.serviceId,
    location_id: hapioIds.locationId,
    starts_at: slotData.starts_at?.replace(/\s/g, ''), // Remove all spaces
    ends_at: slotData.ends_at?.replace(/\s/g, ''),     // Remove all spaces
    metadata: leadInfo,
  };

  const res = await fetch(`${hapioUrl}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HAPIO_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("data:", data);

  return data;
}


export async function getHapioCurrentBookingsAndSetCache(hapioIds, orgId) {
    const { serviceId, locationId } = hapioIds;
    console.log("serviceId:", serviceId);
    console.log("locationId:", locationId);

  // Hapio usually wants whole-day ranges, not "now"
  const from = formatHapioDate(startOfDay(new Date())); // today at 00:00
  const to = formatHapioDate(startOfDay(addDays(new Date(), 7))); // +7 days at 00:00
  console.log("from:", from);
  console.log("to:", to);

  try {
     const url = new URL(
    `https://eu-central-1.hapio.net/v1/services/${serviceId}/bookable-slots`
  );
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("location", locationId);

    const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.HAPIO_API_KEY}` },
  });

  if (!res.ok) throw new Error(`Hapio ${res.status}: ${await res.text()}`);

  const rawSlots = (await res.json()).data;
  const processedSlots = await convertedSlots(rawSlots, hapioIds, orgId); // Changed variable name

  if(!processedSlots) {
    throw new Error("Failed to convert slots");
  }
  await setAvailableSlots(orgId, processedSlots);
  return true; // Missing semicolon

  } catch (error) {
    console.error("Error fetching  Hapio bookings & Setting cache:", error.message);
  }
}