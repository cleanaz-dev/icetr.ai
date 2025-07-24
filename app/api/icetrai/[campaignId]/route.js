import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";

export async function POST(req, { params }) {
  const { campaignId } = await params;
  
  try {
    /* ---------- API-KEY CHECK ---------- */
    const apiKeyHeader = req.headers.get("x-api-key");
    
    // Input validation
    if (!apiKeyHeader) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }
    
    if (typeof apiKeyHeader !== 'string' || apiKeyHeader.length < 32) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 401 });
    }
    
    // Look up the key
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        plainKey: apiKeyHeader,
        isActive: true,
        ...(apiKeyRecord.expiresAt && { expiresAt: { gte: new Date() } }), // Only check expiry if set
      },
      select: {
        id: true,
        campaignIds: true,
        orgId: true,
        scopes: true,
        lastUsedAt: true,
      }
    });
    
    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 });
    }
    
    // Campaign authorization check
    if (!apiKeyRecord.campaignIds.includes(campaignId)) {
      return NextResponse.json({ error: "Insufficient permissions for this campaign" }, { status: 403 });
    }
    
    // Scope authorization check - ensure API key has lead creation permissions
    if (!apiKeyRecord.scopes.includes("lead:create")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    // Update last used timestamp (fire and forget)
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsedAt: new Date(),
      }
    }).catch(err => {
      console.error('Failed to update API key usage:', err);
    });
    
    /* ---------- END API-KEY CHECK ---------- */
    
    // Parse the request body
    const body = await req.json();
    
    // Extract and validate required fields
    const { firstName, lastName, email, phoneNumber, ...additionalData } = body;
    
    // Basic validation
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, and phoneNumber are required" },
        { status: 400 }
      );
    }
    
    // Validate phone number format (basic check)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }
    
    // Verify campaign exists and belongs to the same organization as the API key
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { organization: true }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // Additional security: ensure API key's organization matches campaign's organization
    if (apiKeyRecord.orgId !== campaign.orgId) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Check for existing lead with same phone number in this campaign
    const existingLead = await prisma.lead.findFirst({
      where: {
        campaignId: campaignId,
        phoneNumber: phoneNumber
      }
    });
    
    if (existingLead) {
      return NextResponse.json(
        { 
          error: "Lead with this phone number already exists in this campaign",
          leadId: existingLead.id
        },
        { status: 409 }
      );
    }
    
    // Prepare lead data
    const leadData = {
      campaignId: campaignId,
      firstname: firstName,
      lastname: lastName,
      phoneNumber: phoneNumber,
      email: email || null,
      status: "New",
      source: additionalData.source || "API", // Default to API source
      organizationId: campaign.orgId,
      metadata: {
        firstName,
        lastName,
        submittedAt: new Date().toISOString(),
        apiKeyId: apiKeyRecord.id, // Track which API key created this lead
        ...additionalData
      }
    };
    
    // Add optional fields if provided
    if (additionalData.company) leadData.company = additionalData.company;
    if (additionalData.industry) leadData.industry = additionalData.industry;
    if (additionalData.website) leadData.website = additionalData.website;
    if (additionalData.country) leadData.country = additionalData.country;
    if (additionalData.region) leadData.region = additionalData.region;
    
    // Create the lead
    const newLead = await prisma.lead.create({
      data: leadData,
      include: {
        campaign: {
          select: {
            name: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    // Create initial lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        type: "NOTE",
        content: `Lead created via API. Source: ${additionalData.source || 'API'}`,
        // createdBy: apiKeyRecord.userId, // Remove this since userId doesn't exist
      }
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      lead: {
        id: newLead.id,
        name: newLead.name,
        phoneNumber: newLead.phoneNumber,
        email: newLead.email,
        status: newLead.status,
        campaign: newLead.campaign.name,
        organization: newLead.campaign.organization.name,
        createdAt: newLead.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating lead:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A lead with this information already exists" },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint - also protected with API key
export async function GET(req, { params }) {
  const { campaignId } = await params;
  
  try {
    /* ---------- API-KEY CHECK ---------- */
    const apiKeyHeader = req.headers.get("x-api-key");
    
    if (!apiKeyHeader) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }
    
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        plainKey: apiKeyHeader,
        isActive: true,
        ...(expiresAt && { expiresAt: { gte: new Date() } }), // Only check expiry if set
      },
      select: {
        campaignIds: true,
        orgId: true,
        scopes: true,
      }
    });
    
    if (!apiKeyRecord) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 401 });
    }
    
    if (!apiKeyRecord.campaignIds.includes(campaignId)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    // Check scope permissions for reading campaigns
    if (!apiKeyRecord.scopes.includes("campaign:read")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    /* ---------- END API-KEY CHECK ---------- */
    
    const campaign = await prisma.campaign.findUnique({
      where: { 
        id: campaignId,
        organizationId: apiKeyRecord.orgId // Additional security
      },
      select: {
        id: true,
        name: true,
        status: true,
        organization: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      campaign
    });
    
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}