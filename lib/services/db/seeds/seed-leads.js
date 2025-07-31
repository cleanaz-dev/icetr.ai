const { PrismaClient } = require("../../../generated/prisma");
const prisma = new PrismaClient();

async function assignOrgIdToLeads() {
  try {
    console.log("🌱 Starting orgId assigning...");
    
    const newOrgId = "683fe01a2beeb835461ecb39";
    
    // Single update operation instead of looping
    const { count } = await prisma.lead.updateMany({
      data: {
        orgId: newOrgId
      }
    });

    console.log(`🎉 Updated ${count} leads with orgId`);
  } catch (error) {
    console.error("❌ Error assigning orgId:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
assignOrgIdToLeads();