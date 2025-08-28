"use client";

import React, { useState, useRef, useEffect } from "react";
import { Phone, BookOpen } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-og";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import ReviewTab from "./ReviewTab";
import TrainingInterfaceCard from "./TrainingInterfaceCard";
import TrainingCallScripts from "./TrainingCallScripts";
import { usePermissionContext } from "@/context/PermissionProvider";
import Link from "next/link";
import PermissionGate from "@/components/auth/PermissionGate";
import PageHeader from "@/components/ui/layout/PageHeader";

export default function TrainingPage({
  trainingData = [],
  userProfile,
  orgId,
  blandAiSettings,
}) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");

  const [score, setScore] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState("idle");
  const { user } = useUser();

  // Derived current selections
  const currentCampaign = trainingData.find(
    (t) => t.campaignId === selectedCampaign
  );
  const currentTraining = currentCampaign?.trainings.find(
    (t) => t.trainingId === selectedTraining
  );
  const currentScenario = currentTraining?.scenarios.find(
    (s) => s.id === selectedScenario
  );

  useEffect(() => {
    if (trainingData.length > 0 && !selectedCampaign) {
      const firstCampaign = trainingData[0];
      setSelectedCampaign(firstCampaign.campaignId);

      if (firstCampaign.trainings.length > 0) {
        const firstTraining = firstCampaign.trainings[0];
        setSelectedTraining(firstTraining.trainingId);

        if (firstTraining.scenarios.length > 0) {
          setSelectedScenario(firstTraining.scenarios[0].id);
        }
      }
    }
  }, [trainingData, selectedCampaign]);

  return (
    <div className="">
      {/* Container Div */}
      <div className="p-1 md:p-6">
        {/* Header */}
        <PageHeader
          title="Training"
          description="Practice your pitch with AI-powered feedback"
          icon="PiStudent"
        >
          <PermissionGate permission="training.create">
            <Button asChild>
              <Link href="/training/create-training">Create Training Page</Link>
            </Button>
          </PermissionGate>
        </PageHeader>

        <Tabs defaultValue="practice" className="space-y-4">
          {/* Tab Switcher */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="practice"
              className="flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span className="cursor-pointer">Practice Calls</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="cursor-pointer">Review</span>
            </TabsTrigger>
          </TabsList>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-0">
            {/* Left Column: Interface + Scenario */}

            <div className="space-y-6">
              <TrainingInterfaceCard
                score={score}
                setTrainingStatus={setTrainingStatus}
                setScore={setScore}
                // Updated props for new structure
                selectedCampaign={selectedCampaign}
                setSelectedCampaign={setSelectedCampaign}
                selectedTraining={selectedTraining}
                setSelectedTraining={setSelectedTraining}
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                trainingData={trainingData}
                currentScenario={currentScenario}
              />
            </div>

            {/* Right Column: Scripts */}
            <div className="space-y-6 mt-6">
              <TrainingCallScripts
                selectedScenario={currentScenario} // Pass the full scenario object instead of just ID
                currentCampaign={currentCampaign}
                currentTraining={currentTraining}
              />
            </div>
          </TabsContent>

          {/* Review Tab */}
          <ReviewTab trainingData={trainingData} userProfile={userProfile} />
        </Tabs>
      </div>
    </div>
  );
}
