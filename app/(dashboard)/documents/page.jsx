import { auth } from "@clerk/nextjs/server";
import { getOrgId } from "@/lib/db/org";
import DocumentsPage from "@/components/pages/documents/DocumentsPage";
import { getOrgCampaignDocuments } from "@/lib/db/campaigns";
import { notFound, redirect } from "next/navigation";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export default async function page() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");

  const orgId = await getOrgId(clerkId);
  if (!orgId) redirect("/");

  try {
    await Promise.all([
      await validateOrgAccess(clerkId, orgId),
      await validateHasPermission(clerkId, ["document.create"]),
    ])
  } catch (error) {
    console.error("Error validating permissions:", error);
    notFound();
  }


  const campaigns = await getOrgCampaignDocuments(clerkId, orgId);

  return (
    <div>
      <DocumentsPage campaigns={campaigns} orgId={orgId} />
    </div>
  );
}
