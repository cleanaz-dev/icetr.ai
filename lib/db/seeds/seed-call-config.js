const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

async function seedCallConfig() {
  const orgs = await prisma.organization.findMany()

  for (const org of orgs) {
    await prisma.callFlowConfiguration.create({
      
      data: {
        organization: { connect: { id: org.id } },
        minCallDurationForRecording: 30,
        autoCreateFollowUps: true,
        recordInboundCalls: true,
        recordingEnabled: true,
        recordOutboundCalls: true,
        transcriptionProvider: "assemblyai",
        voicemailMessage: "Thank you for calling. Please leave a message.",
        transcribeInbound: true,
        transcribeOutbound: true,
        autoCreateLeads: true,
        forwardToNumber: "",

      },
    });
  }

  console.log("Call configuration seeded successfully");

  // Close the database connection
  await prisma.$disconnect();
}

seedCallConfig();