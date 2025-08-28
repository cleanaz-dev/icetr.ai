//lib/services/call-flow-service.js
import prisma from "@/lib/prisma";
import { createOrUpdateCall } from "./twilioCallService";

export class FlowEngine {
  constructor(orgId) {
    this.orgId = orgId;
    this.flowConfig = null;
  }

  // Load flow configuration from database
  async loadFlowConfig() {
    this.flowConfig = await prisma.callFlowConfiguration.findUnique({
      where: { orgId: this.orgId }
    });
    
    // Default config if none exists
    if (!this.flowConfig) {
      this.flowConfig = {
        minCallDuration: 30,
        recordingEnabled: true,
        transcriptionEnabled: true,
        autoCreateLeads: true,
        autoCreateFollowUps: true,
        steps: [
          { id: 'call-start', enabled: true },
          { id: 'call-active', enabled: true },
          { id: 'call-complete', enabled: true },
          { id: 'recording-check', enabled: true },
          { id: 'lead-update', enabled: true }
        ]
      };
    }
    
    return this.flowConfig;
  }

  // Execute the configured flow
  async executeFlow(webhookData, phoneConfig) {
    await this.loadFlowConfig();
    const executionLog = [];
    
    try {
      // Step 1: Call Start
      if (this.isStepEnabled('call-start')) {
        const result = await this.executeStep('call-start', webhookData, phoneConfig);
        executionLog.push({ step: 'call-start', result, timestamp: new Date() });
      }

      // Step 2: Call Active (during call)
      if (this.isStepEnabled('call-active') && !webhookData.isCompleted()) {
        const result = await this.executeStep('call-active', webhookData, phoneConfig);
        executionLog.push({ step: 'call-active', result, timestamp: new Date() });
      }

      // Step 3: Call Complete
      if (this.isStepEnabled('call-complete') && webhookData.isCompleted()) {
        const result = await this.executeStep('call-complete', webhookData, phoneConfig);
        executionLog.push({ step: 'call-complete', result, timestamp: new Date() });

        const callDuration = parseInt(webhookData.callDuration) || 0;
        
        // Step 4: Recording Check (conditional)
        if (this.isStepEnabled('recording-check') && 
            this.flowConfig.recordingEnabled && 
            callDuration > this.flowConfig.minCallDuration) {
          
          const result = await this.executeStep('recording-check', webhookData, phoneConfig);
          executionLog.push({ step: 'recording-check', result, timestamp: new Date() });
        }

        // Step 5: Lead Update
        if (this.isStepEnabled('lead-update') && this.flowConfig.autoCreateLeads) {
          const result = await this.executeStep('lead-update', webhookData, phoneConfig);
          executionLog.push({ step: 'lead-update', result, timestamp: new Date() });
        }
      }

      return { success: true, executionLog };
      
    } catch (error) {
      console.error('Flow execution failed:', error);
      return { success: false, error: error.message, executionLog };
    }
  }

  // Execute individual flow steps
  async executeStep(stepId, webhookData, phoneConfig) {
    switch (stepId) {
      case 'call-start':
        return await createOrUpdateCall({
          callSid: webhookData.callSid,
          leadId: webhookData.leadId,
          callSessionId: webhookData.callSessionId,
          fromNumber: webhookData.from,
          to: webhookData.to,
          direction: webhookData.direction,
          callStatus: webhookData.callStatus,
          userId: webhookData.userId,
          orgId: this.orgId,
          updates: {},
        });

      case 'call-active':
        // Handle active call logic
        return { status: 'call-active', recording: this.flowConfig.recordingEnabled };

      case 'call-complete':
        // Handle call completion
        return await this.updateCallStatus(webhookData, 'completed');

      case 'recording-check':
        // Handle recording and transcription
        return await this.processRecording(webhookData, phoneConfig);

      case 'lead-update':
        // Update lead and create activities
        return await this.updateLeadAndActivity(webhookData);

      default:
        throw new Error(`Unknown step: ${stepId}`);
    }
  }

  isStepEnabled(stepId) {
    const step = this.flowConfig.steps?.find(s => s.id === stepId);
    return step?.enabled !== false; // Default to enabled
  }

  // Helper methods for each step
  async updateCallStatus(webhookData, status) {
    return await prisma.call.update({
      where: { callSid: webhookData.callSid },
      data: { 
        status,
        endedAt: new Date(),
        duration: parseInt(webhookData.callDuration) || 0
      }
    });
  }

  async processRecording(webhookData, phoneConfig) {
    // Your existing recording logic
    if (webhookData.recordingUrl && this.flowConfig.transcriptionEnabled) {
      // Trigger transcription
      return { recording: true, transcription: 'pending' };
    }
    return { recording: true, transcription: 'disabled' };
  }

  async updateLeadAndActivity(webhookData) {
    const updates = [];
    
    if (webhookData.leadId) {
      // Update lead
      const leadUpdate = await prisma.lead.update({
        where: { id: webhookData.leadId },
        data: { lastContactedAt: new Date() }
      });
      updates.push({ type: 'lead', result: leadUpdate });

      // Create activity
      if (this.flowConfig.autoCreateFollowUps) {
        const activity = await prisma.leadActivity.create({
          data: {
            leadId: webhookData.leadId,
            type: 'CALL',
            description: `Call ${webhookData.callStatus}`,
            duration: parseInt(webhookData.callDuration) || 0,
            callSid: webhookData.callSid
          }
        });
        updates.push({ type: 'activity', result: activity });
      }
    }
    
    return { updates };
  }
}

// /api/org/[orgId]/twiml/route.js (Updated)
import { FlowEngine } from "@/lib/flows/flow-engine";

export async function POST(request, { params }) {
  const { orgId } = await params;

  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse webhook data
    const formData = await request.formData();
    const webhookData = parseTwilioWebhook(formData);
    
    // Get phone configuration
    const phoneConfig = await getPhoneConfiguration(orgId);
    
    // Initialize and execute flow
    const flowEngine = new FlowEngine(orgId);
    const flowResult = await flowEngine.executeFlow(webhookData, phoneConfig);
    
    console.log("Flow execution result:", flowResult);

    // Handle recording callbacks first
    if (webhookData.hasRecording()) {
      return await handleRecordingCallback(webhookData, phoneConfig, orgId);
    }

    // Route to appropriate handler based on call type
    const callType = determineCallType(webhookData);
    
    switch (callType) {
      case 'client_outbound':
        return handleClientCall(twiml, webhookData, phoneConfig, orgId);
        
      case 'inbound':
        return handleInboundCall(twiml, webhookData, phoneConfig, orgId);
        
      case 'outbound_api':
        return handleOutboundCall(twiml, webhookData, phoneConfig, orgId);
        
      default:
        return handleFallback(twiml, orgId);
    }

  } catch (error) {
    console.error("Error in TwiML route:", error);
    twiml.say("An error occurred while processing the call. Please try again later.");
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}


export async function updateCallFlow(orgId, updates) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { callFlow: true },
  });
  const tierConfig = TIER_CONFIGS[org.tier];

  // Validate updates against tier features
  if (updates.recordingEnabled && !tierConfig.features.recordingEnabled) {
    throw new Error('Recording is not available in your tier');
  }
  if (updates.inboundFlow && !tierConfig.features.inboundCallHandling) {
    throw new Error('Inbound call handling is not available in your tier');
  }
  if (updates.customFlowRules && !tierConfig.features.apiAccessEnabled) {
    throw new Error('Custom flow rules are not available in your tier');
  }

  // Apply updates
  await prisma.callFlowConfiguration.update({
    where: { orgId },
    data: updates,
  });
}