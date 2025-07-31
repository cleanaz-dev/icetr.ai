"use server"
import prisma from "@/lib/services/prisma"


/**
 * Returns a breakdown of lead statuses for a given organization.
 *
 * Counts the number of leads in each status category: New, Contacted,
 * Qualified, Won, and Lost. Also returns the total number of leads.
 *
 * @param {string} orgId - Organization ID.
 * @returns {Promise<{
 *   newCount: number,
 *   contactedCount: number,
 *   qualifiedCount: number,
 *   wonCount: number,
 *   lostCount: number,
 *   totalCount: number
 * }>} An object containing counts of leads by status.
 */
export async function getAllOrgLeadsAndStatus(orgId) {
  // Fallback approach if groupBy isn't working
  const leads = await prisma.lead.findMany({
    where: {
      orgId: orgId // or whatever your field is called
    },
    select: {
      status: true
    }
  });

  const counts = {
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    wonCount: 0,
    lostCount: 0,
    totalCount: leads.length,
  };

  leads.forEach(lead => {
    switch (lead.status) {
      case "New":
        counts.newCount++;
        break;
      case "Contacted":
        counts.contactedCount++;
        break;
      case "Qualified":
        counts.qualifiedCount++;
        break;
      case "Won":
        counts.wonCount++;
        break;
      case "Lost":
        counts.lostCount++;
        break;
    }
  });

  return counts;
}

