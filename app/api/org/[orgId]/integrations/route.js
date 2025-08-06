// ==========================================
// APP ROUTE: app/api/org/[orgId]/integrations/route.js
// ==========================================
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  encryptIntegrationData,
  decryptIntegrationData,
} from "@/lib/encryption";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "User not associated with organization" },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    if (user.organization.id !== orgId) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    const integrations = await prisma.orgIntegration.findMany({
      where: { orgId: orgId },
      select: {
        id: true,
        service: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        twilioAccountSid: true,
        twilioPhoneNumbers: true,
        twilioVoiceUrl: true,
        twilioSmsUrl: true,
        calendlyWebhookUrl: true,
        calendlyOrgUri: true,
        makeWebhookUrl: true,
        zoomWebhookUrl: true,
      },
    });

    const integrationsWithStatus = integrations.map((integration) => ({
      ...integration,
      hasCredentials: hasRequiredCredentials(integration),
      configuredFields: getConfiguredFields(integration),
    }));

    return NextResponse.json({
      success: true,
      integrations: integrationsWithStatus,
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { orgId } = await params;
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // await validateHasPermission(clerkId, ["integration.create"]);
    await validateOrgAccess(clerkId, orgId);

    const data = await req.json();
    console.log("data", data);

    // Validate we have at least one service data
    if (
      !data.twilioEnabled &&
      !data.calendlyEnabled &&
      !data.zoomEnabled &&
      !data.makeEnabled
    ) {
      return NextResponse.json(
        { error: "At least one integration must be enabled" },
        { status: 400 }
      );
    }

    const updates = {};
    const errors = [];

    // Process Twilio if enabled
    if (data.twilioEnabled) {
      const validation = validateTwilioData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors.map((e) => `Twilio: ${e}`));
      } else {
        updates.twilioEnabled = true;
        updates.twilioAccountSid = data.twilioAccountSid;
        updates.twilioAuthToken = encryptIntegrationData(
          { authToken: data.twilioAuthToken },
          orgId
        );
        updates.twilioPhoneNumbers = data.twilioPhoneNumbers || [];
        updates.twilioVoiceUrl = data.twilioVoiceUrl || null;
        updates.twilioSmsUrl = data.twilioSmsUrl || null;
      }
    } else {
      updates.twilioEnabled = false;
    }

    // Process Calendly if enabled
    if (data.calendlyEnabled) {
      const validation = validateCalendlyData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors.map((e) => `Calendly: ${e}`));
      } else {
        updates.calendlyEnabled = true;
        updates.calendlyApiKey = encryptIntegrationData(
          { apiKey: data.calendlyApiKey },
          orgId
        );
        updates.calendlyOrgUri = data.calendlyOrgUri || null;
      }
    } else {
      updates.calendlyEnabled = false;
    }

    // Process Zoom if enabled
    if (data.zoomEnabled) {
      const validation = validateZoomData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors.map((e) => `Zoom: ${e}`));
      } else {
        updates.zoomEnabled = true;
        updates.zoomApiKey = encryptIntegrationData(
          {
            apiKey: data.zoomApiKey,
            apiSecret: data.zoomApiSecret,
          },
          orgId
        );
      }
    } else {
      updates.zoomEnabled = false;
    }

    // Process Make if enabled
    if (data.makeEnabled) {
      const validation = validateMakeData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors.map((e) => `Make: ${e}`));
      } else {
        updates.makeEnabled = true;
        updates.makeWebhookUrl = data.makeWebhookUrl || null;
      }
    } else {
      updates.makeEnabled = false;
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Update the integration record
    const result = await prisma.orgIntegration.upsert({
      where: {
        orgId: orgId,
      },
      update: updates,
      create: {
        orgId: orgId,
        ...updates,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Integrations updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to save integrations", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "User not associated with organization" },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    if (user.organization.id !== orgId) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    const { service, updates } = await req.json();

    const integration = await prisma.orgIntegration.findUnique({
      where: {
        orgId: orgId,
        service,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const integrationData = await prepareIntegrationData(
      service,
      updates,
      orgId
    );

    if (!integrationData.valid) {
      return NextResponse.json(
        { error: integrationData.error },
        { status: 400 }
      );
    }

    const updatedIntegration = await prisma.orgIntegration.update({
      where: { id: integration.id },
      data: {
        ...integrationData.fields,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      integrationId: updatedIntegration.id,
      message: `${service} integration updated successfully`,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "User not associated with organization" },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    if (user.organization.id !== orgId) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    const { service } = await req.json();

    await prisma.orgIntegration.delete({
      where: {
        orgId: orgId,
        service,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${service} integration deleted successfully`,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}

// Helper functions
function hasRequiredCredentials(integration) {
  switch (integration.service) {
    case "twilio":
      return !!(integration.twilioAccountSid && integration.twilioAuthToken);
    case "calendly":
      return !!integration.calendlyApiKey;
    case "makeZoom":
      return !!(integration.makeWebhookUrl || integration.zoomApiKey);
    default:
      return false;
  }
}

function getConfiguredFields(integration) {
  const fields = [];
  Object.keys(integration).forEach((key) => {
    if (
      integration[key] &&
      !["id", "orgId", "service", "enabled", "createdAt", "updatedAt"].includes(
        key
      )
    ) {
      fields.push(key);
    }
  });
  return fields;
}

async function prepareIntegrationData(service, credentials, orgId) {
  try {
    const fields = {};

    switch (service) {
      case "twilio":
        if (!credentials.accountSid || !credentials.authToken) {
          return {
            valid: false,
            error: "Account SID and Auth Token are required for Twilio",
          };
        }
        const encryptedAuthToken = encryptIntegrationData(
          { authToken: credentials.authToken },
          orgId
        );
        fields.twilioAccountSid = credentials.accountSid;
        fields.twilioAuthToken = encryptedAuthToken;
        fields.twilioPhoneNumbers = credentials.phoneNumbers || [];
        fields.twilioVoiceUrl = credentials.voiceUrl || null;
        fields.twilioSmsUrl = credentials.smsUrl || null;
        fields.twilioAppSid = credentials.appSid || null;
        break;

      case "calendly":
        if (!credentials.apiKey) {
          return { valid: false, error: "API Key is required for Calendly" };
        }
        const encryptedCalendlyKey = encryptIntegrationData(
          { apiKey: credentials.apiKey },
          orgId
        );
        fields.calendlyApiKey = encryptedCalendlyKey;
        fields.calendlyWebhookUrl = credentials.webhookUrl || null;
        fields.calendlyOrgUri = credentials.orgUri || null;
        break;

      case "makeZoom":
        if (!credentials.makeWebhookUrl && !credentials.zoomApiKey) {
          return {
            valid: false,
            error: "At least Make webhook URL or Zoom API key is required",
          };
        }
        fields.makeWebhookUrl = credentials.makeWebhookUrl || null;
        fields.zoomWebhookUrl = credentials.zoomWebhookUrl || null;

        if (credentials.zoomApiKey || credentials.zoomApiSecret) {
          const encryptedZoomCreds = encryptIntegrationData(
            {
              apiKey: credentials.zoomApiKey,
              apiSecret: credentials.zoomApiSecret,
            },
            orgId
          );
          fields.zoomApiKey = encryptedZoomCreds;
        }
        break;

      default:
        return { valid: false, error: "Unknown service type" };
    }

    return { valid: true, fields };
  } catch (error) {
    console.error("Prepare data error:", error);
    return { valid: false, error: "Failed to prepare integration data" };
  }
}

// Validation helpers that match your schema
function validateTwilioData(data) {
  const errors = [];
  if (!data.twilioAccountSid) errors.push("Account SID is required");
  if (!data.twilioAuthToken) errors.push("Auth Token is required");
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateCalendlyData(data) {
  const errors = [];
  if (!data.calendlyApiKey) errors.push("API Key is required");
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateZoomData(data) {
  const errors = [];
  if (!data.zoomApiKey) errors.push("API Key is required");
  if (!data.zoomApiSecret) errors.push("API Secret is required");
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateMakeData(data) {
  const errors = [];
  if (!data.makeWebhookUrl) errors.push("Webhook URL is required");
  return {
    isValid: errors.length === 0,
    errors,
  };
}
