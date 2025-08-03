//lib/db/seeds
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const DEFAULT_PHONE_CONFIG = {
  recordingEnabled: true,
  minOutboundDuration: 120,
  recordInboundCalls: true,
  recordOutboundCalls: true,
  transcriptionProvider: 'assemblyai',
  transcribeInbound: true,
  transcribeOutbound: true,
  inboundFlow: 'voicemail',
  voicemailMessage: 'Thank you for calling. Please leave a message.',
  autoCreateLeads: true,
  autoCreateFollowUps: true,
};

async function seedPhoneConfigurations() {
  const orgs = await prisma.organization.findMany({
    where: { phoneConfiguration: null },
  });

  for (const org of orgs) {
    await prisma.phoneConfiguration.create({
      data: {
        orgId: org.id,
        ...DEFAULT_PHONE_CONFIG,
      },
    });
    console.log(`✅ Created default phone config for org ${org.id}`);
  }
}

async function main() {
  await seedPhoneConfigurations();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });