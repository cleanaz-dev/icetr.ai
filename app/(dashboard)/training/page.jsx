import TrainingPage from "@/components/pages/training/main-page/TrainingPage";
import StatusBar from "@/components/pages/training/status-bar/StatusBar";
import { auth } from "@clerk/nextjs/server";
import {
  getTrainingData,
  getTrainingAvgAndCount,
} from "@/lib/db/training";
import { getUserProfile, isAdmin } from "@/lib/db/user";
import { getOrgId } from "@/lib/db/org";
import { getBlandAiSettings } from "@/lib/db/integrations";
import UnifiedStatusBar from "@/components/pages/dialer/UnifiedStatusBar";

export default async function TrainingRoute() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId);
  const userProfile = await getUserProfile(userId);
  const trainingAvgAndCount = await getTrainingAvgAndCount(userId, orgId);
  const trainingData = await getTrainingData(userId, orgId);
  const blandAiSettings = await getBlandAiSettings(userId, orgId);

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative">
        <TrainingPage
          trainingData={trainingData}
          userProfile={userProfile}
          orgId={orgId}
          blandAiSettings={blandAiSettings}
          trainingAvgAndCount={trainingAvgAndCount}
        />
      </div>
      {/* Fixed bottom bar */}
      <div className="w-full">
        <UnifiedStatusBar
          mode="training"
          trainingStats={trainingAvgAndCount}
          
        />
      </div>
    </div>
  );
}
