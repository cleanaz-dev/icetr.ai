const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

async function createMinOrg() {
  try {
    console.log("Creating org in transaction...");

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullname: "CX-2",
          email: "cassiusxclay@proton.me"
        }
      });

      console.log("User created:", user.id);

      const org = await tx.organization.create({
        data: {
          name: "My Org",
          ownerId: user.id,
        }
      });

      console.log("Org created:", org.id);
      return { user, org };
    });
    
    console.log("Transaction success:", result);
    
  } catch (error) {
    console.log("Transaction error:", error.message);
  }
}

createMinOrg();