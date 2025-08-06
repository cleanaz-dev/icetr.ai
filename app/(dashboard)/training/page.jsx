import TrainingPage from "@/components/pages/training/main-page/TrainingPage";
import StatusBar from "@/components/pages/training/status-bar/StatusBar";
import { auth } from "@clerk/nextjs/server";
import { getTrainingData, getTrainingAvgAndCount } from "@/lib/db/training";
import { getUserProfile, isAdmin } from "@/lib/db/user";
import { getOrgId } from "@/lib/db/org";
import { getBlandAiSettings } from "@/lib/db/integrations";
import UnifiedStatusBar from "@/components/pages/dialer/UnifiedStatusBar";

import TrainingClientPage from "@/components/pages/training/main-page/TrainingClientPage";

export default async function TrainingRoute() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId);
  const userProfile = await getUserProfile(userId);
  const trainingAvgAndCount = await getTrainingAvgAndCount(userId, orgId);
  const trainingData = await getTrainingData(userId, orgId);
  const blandAiSettings = await getBlandAiSettings(userId, orgId);

  return (
    <>
      <TrainingClientPage
        orgId={orgId}
        userProfile={userProfile}
        blandAiSettings={blandAiSettings}
        trainingAvgAndCount={trainingAvgAndCount}
        trainingData={trainingData}
      />
     
    </>
  );
}
