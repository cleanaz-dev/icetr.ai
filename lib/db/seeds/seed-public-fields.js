//lib/services/db/seeds/seed-public-fields

const { PrismaClient } = require("../../generated/prisma");

const prisma = new PrismaClient();

/**
 * Returns the default public field names for each integration type.
 */
const getPublicFieldsMap = () => ({
  calendlyIntegration: ["enabled", "orgUri", "webhookUrl"],
  blandAiIntegration: ["phoneNumbers", "voiceId"],
  twilioIntegration: ["enabled", "phoneNumbers"],
});

async function main() {
  console.log("🌱 Seeding public integration fields...");

  const fieldMap = getPublicFieldsMap();
  const data = [];

  // 1. Calendly
  const calendlyList = await prisma.calendlyIntegration.findMany();
  for (const integration of calendlyList) {
    for (const field of fieldMap.calendlyIntegration) {
      data.push({
        fieldName: field,
        calendlyIntegrationId: integration.id,
      });
    }
  }

  // 2. Bland AI
  const blandAiList = await prisma.blandAiIntegration.findMany();
  for (const integration of blandAiList) {
    for (const field of fieldMap.blandAiIntegration) {
      data.push({
        fieldName: field,
        blandAiIntegrationId: integration.id,
      });
    }
  }

  // 3. Twilio
  const twilioList = await prisma.twilioIntegration.findMany();
  for (const integration of twilioList) {
    for (const field of fieldMap.twilioIntegration) {
      data.push({
        fieldName: field,
        twilioIntegrationId: integration.id,
      });
    }
  }

  // Optionally delete existing before reseeding
  await prisma.publicField.deleteMany();
  await prisma.publicField.createMany({ data });

  console.log(`✅ Seeded ${data.length} public fields.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
