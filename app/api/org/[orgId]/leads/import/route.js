import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import csv from "csv-parser";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import {
  validateHasPermission,
  validateOrgAccess,
  
} from "@/lib/services/db/validations";
import {
  roleBasedLeadsMulti,
  roundRobinLeads,
} from "@/lib/services/db/helpers";

export async function POST(request, { params }) {
  const { orgId } = await params;

  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["lead.create"]);

    const formData = await request.formData();
    const file = formData.get("file");
    const campaignId = formData.get("campaignId");
    const source = formData.get("source");
    const industry = formData.get("industry");
    const region = formData.get("region");
    const country = formData.get("country");
    const teamId = formData.get("teamId");
    const assignmentStrategy = formData.get("assignmentStrategy");

    if (!file || !campaignId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);
    const results = [];

    return new Promise((resolve) => {
      stream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            const leads = [];

            for (const row of results) {
              if (!row.phoneNumber) continue;

              const leadData = {
                campaignId,
                phoneNumber: row.phoneNumber.trim(),
                company: row.company?.trim() || null,
                website: row.website?.trim() || null,
                industry: industry || null,
                source: source || null,
                status: "New",
                country: country || null,
                region: region || null,
                orgId,
              };

              if (row.metadata) {
                try {
                  leadData.metadata = JSON.parse(row.metadata);
                } catch {
                  leadData.metadata = { raw: row.metadata };
                }
              }

              leads.push(leadData);
            }

            const created = await prisma.lead.createMany({ data: leads });

            // Fetch the newly created leads to return them
            const newLeads = await prisma.lead.findMany({
              where: {
                campaignId,
                orgId,
                phoneNumber: {
                  in: leads.map(lead => lead.phoneNumber)
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: created.count
            });

            // ROLE BASED Assignment
            if (assignmentStrategy === "ROLE_BASED" && teamId) {
              try {
                const assignmentResult = await roleBasedLeadsMulti(
                  orgId,
                  campaignId,
                  teamId
                );
                console.log("Role-based assignment:", assignmentResult.message);
              } catch (error) {
                console.error("Role-based assignment failed:", error);
              }
            }

            // ROUND ROBIN Assignment
            if (assignmentStrategy === "ROUND_ROBIN" && teamId) {
              try {
                const assigned = await roundRobinLeads(
                  campaignId,
                  teamId,
                  orgId
                );
                console.log("Round robin assignment:", assigned.message);
              } catch (error) {
                console.error("Round robin assignment failed:", error);
              }
            }

            return resolve(
              NextResponse.json({
                success: true,
                count: created.count,
                message: `Successfully imported ${created.count} leads.`,
                newLeads: newLeads
              })
            );
          } catch (err) {
            return resolve(
              NextResponse.json(
                { error: "Failed to save leads to database" },
                { status: 500 }
              )
            );
          }
        })
        .on("error", () => {
          return resolve(
            NextResponse.json(
              { error: "Failed to parse CSV file" },
              { status: 400 }
            )
          );
        });
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}