const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

async function migrateSubscriptions() {
  const customers = await prisma.customer.findMany({
    include: { subscription: true }, // If still in old schema
  });

  for (const customer of customers) {
    const sub = customer.subscription?.[0];
    if (sub) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          subscription: {
            connect: { id: sub.id },
          },
        },
      });
    }
  }
}

migrateSubscriptions()
  .then(() => console.log("Migration complete"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
