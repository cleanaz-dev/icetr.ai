import TrainingPage from "@/components/pages/training/TrainingPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getUserAvatar,
  getUserTrainingData,
} from "@/lib/service/prismaQueries";

export default async function page() {
  const { userId } = await auth();
  const { user: trainingUser, training } = await getUserTrainingData(userId);


  return (
    <div>
      <TrainingPage trainingData={training} trainingUser={trainingUser} />
    </div>
  );
}
