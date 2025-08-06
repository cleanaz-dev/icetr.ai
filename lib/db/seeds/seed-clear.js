const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("🔥 Starting database cleanup...");

    // Delete in order to respect foreign key constraints
    // (even though MongoDB doesn't enforce them, it's good practice)
    
    console.log("Deleting TierSettings...");
    await prisma.tierSettings.deleteMany({});
    
    console.log("Deleting AuditLogs...");
    await prisma.auditLog.deleteMany({});
    
    console.log("Deleting TeamMembers...");
    await prisma.teamMember.deleteMany({});
    
    console.log("Deleting Teams...");
    await prisma.team.deleteMany({});
    
    console.log("Deleting TrainingSessions...");
    await prisma.trainingSession.deleteMany({});
    
    console.log("Deleting Training...");
    await prisma.training.deleteMany({});
    
    console.log("Deleting CallReviews...");
    await prisma.callReview.deleteMany({});
    
    console.log("Deleting CallSessions...");
    await prisma.callSession.deleteMany({});
    
    console.log("Deleting Calls...");
    await prisma.call.deleteMany({});
    
    console.log("Deleting Notifications...");
    await prisma.notification.deleteMany({});
    
    console.log("Deleting CampaignDocuments...");
    await prisma.campaignDocument.deleteMany({});
    
    console.log("Deleting LeadActivities...");
    await prisma.leadActivity.deleteMany({});
    
    console.log("Deleting Leads...");
    await prisma.lead.deleteMany({});
    
    console.log("Deleting Campaigns...");
    await prisma.campaign.deleteMany({});
    
    console.log("Deleting ApiKeys...");
    await prisma.apiKey.deleteMany({});
    
    console.log("Deleting PhoneConfigurations...");
    await prisma.phoneConfiguration.deleteMany({});
    
    console.log("Deleting OrgIntegrations...");
    await prisma.orgIntegration.deleteMany({});
    
    console.log("Deleting UserSettings...");
    await prisma.userSettings.deleteMany({});
    
    console.log("Deleting Invoices...");
    await prisma.invoice.deleteMany({});
    
    console.log("Deleting Subscriptions...");
    await prisma.subscription.deleteMany({});
    
    console.log("Deleting Customers...");
    await prisma.customer.deleteMany({});
    
    console.log("Deleting Organizations...");
    await prisma.organization.deleteMany({});
    
    console.log("Deleting Users...");
    await prisma.user.deleteMany({});
    
    console.log("Deleting Roles...");
    await prisma.role.deleteMany({});

    console.log("✅ Database cleared successfully!");
    
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDatabase();