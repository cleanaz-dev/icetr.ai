const { PrismaClient } = require("../../generated/prisma");s
const prisma = new PrismaClient();

async function applyFullname() {
  try {
    // Get all users with firstname and lastname
    const users = await prisma.user.findMany({
      select: {
        id: true,       // Need ID for updates
        firstname: true,
        lastname: true
      }
    });

    // Create update promises for each user
    const updatePromises = users.map(user => {
      // Proper string concatenation (fixed the + "" + issue)
      const fullname = `${user.firstname} ${user.lastname}`.trim();
      
      return prisma.user.update({
        where: { id: user.id },  // Need to specify which user to update
        data: { fullname }
      });
    });

    // Execute all updates in parallel
    await Promise.all(updatePromises);
    console.log(`Updated fullname for ${users.length} users`);
  } catch (error) {
    console.error("Error updating fullnames:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
applyFullname();