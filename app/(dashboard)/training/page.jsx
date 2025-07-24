import TrainingPage from "@/components/pages/training/TrainingPage";
import StatusBar from "@/components/pages/training/StatusBar";
import { auth } from "@clerk/nextjs/server";
import { getUserTrainingData } from "@/lib/service/prismaQueries";

export default async function TrainingRoute() {
  const { userId } = await auth();
  const { user: trainingUser, training } = await getUserTrainingData(userId);

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative">
        <TrainingPage trainingData={training} trainingUser={trainingUser} />
      </div>

      {/* Fixed bottom bar */}
      <div className="w-full">
        <StatusBar 
          trainingData={training} 
          audioPermissionGranted={true} 
          status="idle" 
        />
      </div>
    </div>
  );
}