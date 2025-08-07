const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

async function seedCallConfig() {
  const orgs = await prisma.organization.findMany();

  for (const org of orgs) {
    await prisma.callFlowConfiguration.create({
      data: {
        organization: { connect: { id: org.id } },
        // Only setting non-default values that matter
        voicemailMessage: "Thank you for calling. Please leave a message."
      }
    });
  }

  console.log(`Created call configs for ${orgs.length} organizations`);
  await prisma.$disconnect();
}

seedCallConfig().catch(e => {
  console.error("Seed failed:", e);
  process.exit(1);
});