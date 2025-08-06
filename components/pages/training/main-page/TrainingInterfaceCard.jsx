import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { scenarios } from "@/lib/constants/training";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  Phone,
  PhoneIncoming,
  CheckCircle,
  Play,
  Clock,
  OctagonX,
  MicOff,
  Mic,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { BookOpen } from "lucide-react";
import { GraduationCap } from "lucide-react";
import PermissionGate from "@/components/auth/PermissionGate";
import Link from "next/link";

// Add formatTime function
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
const getLevelColor = (level) => {
  switch (level) {
    case "beginner":
      return "bg-green-600/50 text-foreground tracking-wide";
    case "intermediate":
      return "bg-yellow-600/50 text-foreground tracking-wide";
    case "advanced":
      return "bg-red-600/50 text-foreground tracking-wide";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getLevelDecoration = (level) => {
  switch (level) {
    case "beginner":
      return "underline font-semibold decoration-green-500";
    case "intermediate":
      return "underline font-semibold decoration-yellow-500";
    case "advanced":
      return "underline font-semibold decoration-red-500";
    default:
      return "underline font-semibold decoration-gray-500";
  }
};
export default function TrainingInterfaceCard({
  trainingStatus,
  score,
  isCallActive,
  isStartDisabled,
  handleStartCall,
  handleEndCall,
  handleAnswerTrainingCall,
  handleRejectTrainingCall,
  setTrainingStatus,
  setScore,
  setCallStatus,
  audioPermissionGranted,
  isRecording,
  setIsRecording,
  callDuration,
  statusDisplay,

  // Updated props structure
  selectedCampaign,
  setSelectedCampaign,
  selectedTraining,
  setSelectedTraining,
  selectedScenario,
  setSelectedScenario,
  trainingData,
  currentScenario,
}) {
  // Get current selections (can also be derived here if not passed from parent)
  const currentCampaign = trainingData.find(
    (t) => t.campaignId === selectedCampaign
  );
  const currentTraining = currentCampaign?.trainings.find(
    (t) => t.trainingId === selectedTraining
  );

  // Use the passed currentScenario or derive it
  const scenario =
    currentScenario ||
    currentTraining?.scenarios.find((s) => s.id === selectedScenario);

  return (
    <>
      <div className="flex gap-2">
        <Card className="bg-card shadow-none flex-1 flex items-center justify-center min-h-[400px]">
          <CardContent>
            <div className="text-center">
              <div className="">
                <div className="size-16 mx-auto rounded-full flex items-center justify-center mb-2 bg-muted p-3 border ">
                  {trainingStatus === "connected" ? (
                    <PhoneCall
                      className={`size-6 sm:size-16 ${statusDisplay.color} animate-pulse`}
                    />
                  ) : trainingStatus === "waiting" ? (
                    <Phone
                      className={`size-6 sm:size-16 ${statusDisplay.color} `}
                    />
                  ) : trainingStatus === "incoming" ? (
                    <PhoneIncoming
                      className={`size-8 sm:size-16 ${statusDisplay.color} `}
                    />
                  ) : trainingStatus === "completed" ? (
                    <CheckCircle
                      className={`size-8 sm:size-16 ${statusDisplay.color}`}
                    />
                  ) : (
                    <Phone
                      className={`size-6 sm:size-12 fill-primary stroke-none`}
                    />
                  )}
                </div>

                <h3
                  className={`text-sm trtacking-wide mb-1  ${statusDisplay.color}`}
                >
                  {statusDisplay.title}
                </h3>

                {scenario && (
                  <div className="mb-6">
                    <Badge
                      className={`uppercase ${getLevelColor(
                        scenario.level
                      )} self-start`}
                    >
                      {scenario.level}
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-2">
                  {!isCallActive &&
                  trainingStatus !== "waiting" &&
                  trainingStatus !== "completed" &&
                  trainingStatus !== "incoming" ? (
                    <Button
                      onClick={handleStartCall}
                      disabled={isStartDisabled() || !scenario}
                      className="text-lg"
                      size="huge"
                    >
                      <Play className="w-6 h-6 mr-2 fill-white" />
                      {trainingStatus === "initiating"
                        ? "Starting..."
                        : !audioPermissionGranted && trainingStatus !== "idle"
                        ? "Allow Microphone Access"
                        : "Start Training Call"}
                    </Button>
                  ) : trainingStatus === "waiting" ? (
                    <Button
                      variant="outline"
                      size="lg"
                      disabled
                      className="px-8 py-4 text-lg"
                    >
                      <Clock className="w-6 h-6 mr-2 animate-spin" />
                      Waiting for Call...
                    </Button>
                  ) : trainingStatus === "incoming" ? (
                    // INCOMING CALL BUTTONS
                    <>
                      <Button
                        onClick={handleAnswerTrainingCall}
                        size="lg"
                        className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="w-6 h-6 mr-2" />
                        Answer Training Call
                      </Button>
                      <Button
                        onClick={handleRejectTrainingCall}
                        variant="destructive"
                        size="lg"
                        className="px-8 py-4 text-lg"
                      >
                        <OctagonX className="w-6 h-6 mr-2" />
                        Decline
                      </Button>
                    </>
                  ) : isCallActive ? (
                    <>
                      <Button
                        onClick={() => setIsRecording(!isRecording)}
                        variant={isRecording ? "destructive" : "outline"}
                        size="lg"
                      >
                        {isRecording ? (
                          <MicOff className="w-5 h-5 mr-2" />
                        ) : (
                          <Mic className="w-5 h-5 mr-2" />
                        )}
                        {isRecording ? "Stop Notes" : "Take Notes"}
                      </Button>
                      <Button
                        onClick={handleEndCall}
                        variant="destructive"
                        size="lg"
                        className="px-8"
                      >
                        <OctagonX className="w-6 h-6 mr-2" />
                        End Training
                      </Button>
                    </>
                  ) : trainingStatus === "completed" ? (
                    <Button
                      onClick={() => {
                        setTrainingStatus("idle");
                        setScore(0);
                        setCallStatus("ready");
                      }}
                      size="lg"
                      className="px-8 py-4 text-lg"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Start New Training
                    </Button>
                  ) : null}
                </div>

                {/* Call Duration Display */}
                {isCallActive && (
                  <div className="text-4xl font-mono text-blue-600 font-bold mb-4">
                    {formatTime(callDuration)}
                  </div>
                )}

                {/* Progress Bar for Waiting State */}
                {trainingStatus === "waiting" && (
                  <div className="w-full max-w-md mx-auto mb-4">
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      AI will call you within 5 seconds...
                    </p>
                  </div>
                )}

                {/* Score Display */}
                {trainingStatus === "completed" && score > 0 && (
                  <Card className="bg-background border-green-200 mt-4 max-w-md mx-auto">
                    <CardContent className="p-6">
                      <div className="text-center text-3xl font-bold text-green-600 mb-2">
                        <h1>Your call is being processed for review</h1>
                        <p>Good Job!</p>
                        <p>Keep Going!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Selection Panel */}
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
                          setSelectedScenario(""); // Reset scenario when training changes
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
                      <Image
                        src={scenario.imageUrl}
                        width={100}
                        height={100}
                        alt="practice-avatar"
                        className="rounded-full size-14"
                      />
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
      </div>
    </>
  );
}
