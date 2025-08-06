"use server";
import prisma from "@/lib/prisma";
import { filterPublicFields, filterPublicIntegrationQuery } from "@/lib/utils";

/**
 * Retrieves basic BlandAI integration settings for the specified organization,
 * excluding sensitive fields like the API key.
 *
 * Ensures the requesting user is a member of the organization before returning:
 * - model name
 * - phone numbers
 * - webhook URL
 * - temperature
 * - max call duration
 * - recordCalls setting
 *
 * @param {string} userId - The Clerk user ID to validate access to the organization.
 * @param {string} orgId - The ID of the organization whose BlandAI settings to retrieve.
 * @returns {Promise<{
 *   model: string,
 *   phoneNumbers: string[],
 *   recordCalls: boolean,
 *   webhookUrl: string | null,
 *   temperature: number | null,
 *   maxCallDuration: number | null
 * } | null>} A promise that resolves to the basic BlandAI integration data,
 * or null if the organization is not found or the user doesn't belong to it.
 */
export async function getBlandAiSettings(userId, orgId) {
  const basicData = await prisma.organization.findUnique({
    where: {
      id: orgId,
      users: {
        some: { clerkId: userId },
      },
    },
    select: {
      orgIntegrations: {
        select: {
          blandAi: {
            select: {
              id: true,
              model: true,
              phoneNumbers: true,
              recordCalls: true,
              webhookUrl: true,
              temperature: true,
              maxCallDuration: true,
            },
          },
        },
      },
    },
  });

  return basicData?.orgIntegrations?.blandAi ?? null;
}

/**
 * Retrieves the encrypted Bland AI API key for a specific user within an organization.
 *
 * This function ensures the user belongs to the organization that owns the integration
 * before returning the encrypted API key. If the integration is not found or access is invalid,
 * it returns null.
 *
 * @async
 * @function getBlandAiEncryptedKey
 * @param {string} userId - The Clerk ID of the user requesting access.
 * @param {string} orgId - The ID of the organization the integration belongs to.
 * @param {string} blandAiIntegrationId - The ID of the Bland AI integration to look up.
 * @returns {Promise<string|null>} The encrypted API key if accessible, or null otherwise.
 */
export async function getBlandAiEncryptedKey(
  userId,
  orgId,
  blandAiIntegrationId
) {
  const encryptedKey = await prisma.blandAiIntegration.findUnique({
    where: {
      id: blandAiIntegrationId,
      orgIntegration: {
        organization: {
          id: orgId,
          users: {
            some: {
              clerkId: userId,
            },
          },
        },
      },
    },
    select: {
      apiKey: true,
    },
  });

  return encryptedKey?.apiKey ?? null;
}

export async function getTwillioIntegrationData(orgId) {
  const query = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      orgIntegrations: {
        select: {
          twilio: {
            select: {
              id: true,
              accountSid: true,
              apiKey: true,
              apiSecret: true,
              appSid: true,
              authToken: true,
            },
          },
        },
      },
    },
  });
  return {
    accountSid: query.orgIntegrations.twilio.accountSid,
    apiKey: query.orgIntegrations.twilio.apiKey,
    apiSecret: query.orgIntegrations.twilio.apiSecret,
    appSid: query.orgIntegrations.twilio.appSid,
    authToken: query.orgIntegrations.twilio.authToken,
  };
}

/**
 * Fetches all public integrations for an org, filtered by their public fields.
 *
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object>} Object containing public integrations keyed by type
 */
export async function getPublicIntegrationsForOrg(orgId) {
  // Fetch all integrations linked to the org
  const calendly = await prisma.calendlyIntegration.findMany({
    where: {
      orgIntegration: {
        orgId: orgId,
      },
    },
    include: { publicFields: true },
  });

  const blandAi = await prisma.blandAiIntegration.findMany({
    where: {
      orgIntegration: {
        orgId: orgId,
      },
    },
    include: { publicFields: true },
  });

  const twilio = await prisma.twilioIntegration.findMany({
    where: {
      orgIntegration: {
        orgId: orgId,
      },
    },
    include: { publicFields: true },
  });

  // Filter each integration’s fields
  const filteredCalendly = calendly.map(filterPublicFields);
  const filteredBlandAi = blandAi.map(filterPublicFields);
  const filteredTwilio = twilio.map(filterPublicFields);

  return {
    calendlyIntegrations: filteredCalendly,
    blandAiIntegrations: filteredBlandAi,
    twilioIntegrations: filteredTwilio,
  };
}

export async function getPhoneConfiguration(orgId) {
  const query = await prisma.phoneConfiguration.findFirst({
    where: {
      orgId,
    },
  });
  return query;
}

export async function getServerPublicIntegrationData(
  orgId,
  provider,
  field = null
) {
  const modelName = `${provider}Integration`;
  if (!prisma[modelName]) throw new Error("Invalid provider");

  const result = await prisma[modelName].findFirst({
    where: {
      orgIntegration: {
        orgId: orgId,
      },
    },
    include: { publicFields: true },
  });

  const filtered = filterPublicIntegrationQuery(result);

  if (field) {
    return filtered?.[field];
  }
  return filtered;
}
