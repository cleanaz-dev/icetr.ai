import CampaingsPage from "@/components/pages/campaigns/main-page/CampaingsPage";

import { auth } from "@clerk/nextjs/server";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";
import { getOrgId } from "@/lib/db/org";

export default async function page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const orgId = await getOrgId(userId);

  try {
    await validateHasPermission(userId, ["campaign.read"]);
    await validateOrgAccess(userId, orgId);
  } catch {
    notFound();
  }
  return (
    <div>
      <CampaingsPage />
    </div>
  );
}
