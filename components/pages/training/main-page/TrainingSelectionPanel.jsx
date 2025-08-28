import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  AlertCircle, 
  Plus 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PermissionGate from '@/components/auth/PermissionGate';


const TrainingSelectionPanel = ({
  trainingData,
  selectedCampaign,
  selectedTraining,
  selectedScenario,
  trainingStatus,
  setSelectedCampaign,
  setSelectedTraining,
  setSelectedScenario,
  getLevelDecoration,
  getLevelColor
}) => {
  const currentCampaign = trainingData?.find(campaign => campaign.campaignId === selectedCampaign);
  const currentTraining = currentCampaign?.trainings?.find(training => training.trainingId === selectedTraining);
  const scenario = currentTraining?.scenarios?.find(s => s.id === selectedScenario);

  return (
    <div className="text-left flex-1 h-full">
      <CardHeader>
        <CardTitle>Select Training</CardTitle>
        <CardDescription>
          Choose the campaign and scenario you would like to practice
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-2 space-y-4">
        {/* No Training Data State */}
        {!trainingData || trainingData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Training Available
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              There are currently no training campaigns set up. Contact your
              administrator to create training scenarios for your team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Contact Administrator
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Learn More
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Training scenarios help you
                practice real call situations in a safe environment before
                going live.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Campaign Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Campaign
              </label>
              <Select
                value={selectedCampaign}
                onValueChange={(value) => {
                  if (trainingStatus === "idle") {
                    setSelectedCampaign(value);
                    setSelectedTraining("");
                    setSelectedScenario("");
                  }
                }}
                disabled={trainingStatus !== "idle"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {trainingData.map((campaign) => (
                    <SelectItem
                      key={campaign.campaignId}
                      value={campaign.campaignId}
                    >
                      {campaign.campaignName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Training Selection */}
            {currentCampaign && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Training Type
                </label>
                <Select
                  value={selectedTraining}
                  onValueChange={(value) => {
                    if (trainingStatus === "idle") {
                      setSelectedTraining(value);
                      setSelectedScenario("");
                    }
                  }}
                  disabled={trainingStatus !== "idle"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a training type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCampaign.trainings.map((training) => (
                      <SelectItem
                        key={training.trainingId}
                        value={training.trainingId}
                      >
                        {training.trainingName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* No Trainings Available for Selected Campaign */}
            {currentCampaign &&
              (!currentCampaign.trainings ||
                currentCampaign.trainings.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-muted/30 rounded-lg border border-dashed">
                  <BookOpen className="w-8 h-8 text-muted-foreground mb-3" />
                  <h4 className="font-medium text-foreground mb-1">
                    No Training Available
                  </h4>
                  <PermissionGate permission="training.create">
                    <Button asChild>
                      <Link href="/training/create-training">
                        Create Training Page
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              )}

            {/* Scenario Selection */}
            {currentTraining && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Scenario
                </label>
                <Select
                  value={selectedScenario}
                  onValueChange={(value) => {
                    if (trainingStatus === "idle") {
                      setSelectedScenario(value);
                    }
                  }}
                  disabled={trainingStatus !== "idle"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a scenario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTraining.scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentTraining.scenarios.length} scenario
                  {currentTraining.scenarios.length > 1 ? "s" : ""}{" "}
                  available
                </p>
              </div>
            )}

            {/* No Scenarios Available for Selected Training */}
            {currentTraining &&
              (!currentTraining.scenarios ||
                currentTraining.scenarios.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-muted/30 rounded-lg border border-dashed">
                  <GraduationCap className="w-8 h-8 text-muted-foreground mb-3" />
                  <h4 className="font-medium text-foreground mb-1">
                    No Scenarios Available
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This training type doesn't have any scenarios configured
                    yet.
                  </p>
                </div>
              )}

            {/* Selected Scenario Display */}
            {scenario && (
              <div className="p-5 border rounded-md space-y-2 bg-card mt-6">
                <div className="flex gap-4">
                  {scenario.imageUrl && (
                    <Image
                      src={scenario.imageUrl}
                      width={100}
                      height={100}
                      alt="practice-avatar"
                      className="rounded-full size-14"
                    />
                  )}
                  <div>
                    <p className={getLevelDecoration(scenario.level)}>
                      {scenario.title}
                    </p>
                    <Badge
                      className={` uppercase ${getLevelColor(
                        scenario.level
                      )} self-start`}
                    >
                      {scenario.level}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {scenario.description}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </div>
  );
};

export default TrainingSelectionPanel;