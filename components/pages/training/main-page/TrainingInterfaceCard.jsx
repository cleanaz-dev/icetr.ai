import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
} from "lucide-react";
import { useTwilioDevice } from "@/context/TwilioDeviceProvider";
import { useTeamContext } from "@/context/TeamProvider";
import { useUser } from "@clerk/nextjs";
import TrainingSelectionPanel from "./TrainingSelectionPanel";
import useSWR from "swr";

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

const statusDisplay = {
  idle: {
    title: "Ready to start",
    color: "text-primary",
  },
  initiating: {
    title: "Starting call...",
    color: "text-yellow-600",
  },
  queued: {
    title: "In queue",
    color: "text-yellow-600",
  },
  incoming: {
    title: "Incoming call",
    color: "text-blue-600",
  },
  connected: {
    title: "Training in progress",
    color: "text-green-600",
  },
  completed: {
    title: "Training completed",
    color: "text-green-600",
  },
};

export default function TrainingInterfaceCard({
  score,
  setScore,
  selectedCampaign,
  setSelectedCampaign,
  selectedTraining,
  setSelectedTraining,
  selectedScenario,
  setSelectedScenario,
  trainingData,
  currentScenario,
}) {
  const {
    status,
    incomingCall,
    currentCall,
    answerCall,
    hangUp,
    handleTrainingCall,
  } = useTwilioDevice();
  const { orgId } = useTeamContext();
  const { user } = useUser();

  // Simplified state - just one status instead of multiple booleans
  const [callStatus, setCallStatus] = useState("idle");

  const fetcher = (url) => fetch(url).then((r) => r.json());

  // Only poll when we're actually queued
  const { data: queueData } = useSWR(
    callStatus === "queued" && user?.id
      ? `/api/org/${orgId}/calls/queue-position?userId=${user.id}`
      : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const currentCampaign = trainingData.find(
    (t) => t.campaignId === selectedCampaign
  );
  const currentTraining = currentCampaign?.trainings.find(
    (t) => t.trainingId === selectedTraining
  );

  const scenario =
    currentScenario ||
    currentTraining?.scenarios.find((s) => s.id === selectedScenario);

  // Simplified status determination
const getTrainingStatus = () => {
  if (currentCall) return "connected";
  if (incomingCall) return "incoming";
  if (callStatus === "queued") return "queued";
  if (callStatus === "initiating") return "initiating";
  // treat any finished call (no matter score) as completed
  if (!currentCall && !incomingCall && callStatus !== "idle") return "completed";
  return "idle";
};

  const trainingStatus = getTrainingStatus();

  const handleStartCall = async () => {
    if (!currentScenario || !user?.id) return;

    setCallStatus("initiating");

    try {
      // Join the queue
      const queueResponse = await fetch(
        `/api/org/${orgId}/calls/training-queue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: currentScenario.id,
            clerkId: user.id,
            phoneNumberToCall: "+14374475892",
          }),
        }
      );

      if (!queueResponse.ok) {
        throw new Error("Failed to join queue");
      }

      const { position } = await queueResponse.json();

      if (position === 0) {
        // We're first in line, trigger the call immediately
        await handleTrainingCall({ scenarioId: currentScenario.id });
        setCallStatus("idle"); // Will become 'incoming' when call comes
      } else {
        // We're in queue, wait for our turn
        setCallStatus("queued");
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus("idle");
    }
  };
  
  const leaveQueue = useCallback(async () => {
    if (!user?.id || callStatus !== "queued") return;

    try {
      await fetch(`/api/org/${orgId}/calls/leave-queue?userId=${user.id}`, {
        method: "DELETE",
      });
      setCallStatus("idle");
    } catch (error) {
      console.error("Failed to leave queue:", error);
    }
  }, [orgId, user?.id, callStatus]);

  // Handle queue position changes
  useEffect(() => {
    if (callStatus === "queued" && queueData?.position === 0) {
      // We're now at front of queue, trigger call
      setCallStatus("initiating");

      handleTrainingCall({
        scenarioId: currentScenario.id,
        phoneNumber: "+14374475892",
      })
        .then(() => {
          setCallStatus("idle"); // Will become 'incoming' when call arrives
        })
        .catch((error) => {
          console.error("Failed to initiate call from queue:", error);
          setCallStatus("idle");
        });
    }
  }, [
    queueData?.position,
    callStatus,
    currentScenario?.id,
    handleTrainingCall,
  ]);

  // Reset status when call ends
  useEffect(() => {
    if (!incomingCall && !currentCall && trainingStatus === "connected") {
      // Call just ended
      if (score === 0) {
        setCallStatus("idle");
      }
      // If score > 0, it will show as 'completed' status
    }
  }, [incomingCall, currentCall, trainingStatus, score]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callStatus === "queued") {
        leaveQueue();
      }
    };
  }, []);

  const resetToStart = () => {
    setScore(0);
    setCallStatus("idle");
  };

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
                      className={`size-6 sm:size-16 ${statusDisplay[trainingStatus]?.color} animate-pulse`}
                    />
                  ) : trainingStatus === "initiating" ||
                    trainingStatus === "queued" ? (
                    <Phone
                      className={`size-6 sm:size-16 ${statusDisplay[trainingStatus]?.color} animate-pulse`}
                    />
                  ) : trainingStatus === "incoming" ? (
                    <PhoneIncoming
                      className={`size-8 sm:size-16 ${statusDisplay[trainingStatus]?.color}`}
                    />
                  ) : trainingStatus === "completed" ? (
                    <CheckCircle
                      className={`size-8 sm:size-16 ${statusDisplay[trainingStatus]?.color}`}
                    />
                  ) : (
                    <Phone
                      className={`size-6 sm:size-12 fill-primary stroke-none`}
                    />
                  )}
                </div>

                {/* Queue position display */}
                {trainingStatus === "queued" && queueData?.position > 0 && (
                  <>
                    <Badge className="mt-2">Queue #{queueData.position}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={leaveQueue}
                      className="mt-2 block mx-auto"
                    >
                      Leave queue
                    </Button>
                  </>
                )}

                <h3
                  className={`text-sm tracking-wide mb-1 ${
                    statusDisplay[trainingStatus]?.color || "text-primary"
                  }`}
                >
                  {statusDisplay[trainingStatus]?.title || "Ready to start"}
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
                  {trainingStatus === "idle" && (
                    <Button
                      onClick={handleStartCall}
                      disabled={!scenario}
                      size="huge"
                    >
                      <Play className="w-6 h-6 mr-2 fill-white" />
                      Start Training
                    </Button>
                  )}

                  {trainingStatus === "initiating" && (
                    <Button variant="outline" size="lg" disabled>
                      <Clock className="w-6 h-6 mr-2 animate-spin" />
                      Starting call...
                    </Button>
                  )}

                  {trainingStatus === "queued" && (
                    <Button variant="outline" size="lg" disabled>
                      <Clock className="w-6 h-6 mr-2 animate-spin" />
                      In queue...
                    </Button>
                  )}

                  {trainingStatus === "incoming" && (
                    <>
                      <Button onClick={answerCall} size="lg">
                        <PhoneIncoming className="w-6 h-6 mr-2" />
                        Answer
                      </Button>
                      <Button onClick={hangUp} variant="destructive" size="lg">
                        <OctagonX className="w-6 h-6 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}

                  {trainingStatus === "connected" && (
                    <Button onClick={hangUp} variant="destructive" size="lg">
                      <OctagonX className="w-6 h-6 mr-2" />
                      End Training
                    </Button>
                  )}

                  {trainingStatus === "completed" && (
                    <Button onClick={resetToStart} size="lg">
                      <Play className="w-6 h-6 mr-2" />
                      Start New Training
                    </Button>
                  )}
                </div>

                {/* Progress Bar for Waiting States */}
                {(trainingStatus === "initiating" ||
                  trainingStatus === "queued") && (
                  <div className="w-full max-w-md mx-auto mb-4 mt-4">
                    <Progress
                      value={trainingStatus === "initiating" ? 75 : 50}
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {trainingStatus === "initiating"
                        ? "AI will call you within 30 seconds..."
                        : `Position ${queueData?.position || "?"} in queue`}
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
        <TrainingSelectionPanel
          trainingData={trainingData}
          getLevelColor={getLevelColor}
          getLevelDecoration={getLevelDecoration}
          selectedCampaign={selectedCampaign}
          selectedScenario={selectedScenario}
          selectedTraining={selectedTraining}
          setSelectedCampaign={setSelectedCampaign}
          setSelectedScenario={setSelectedScenario}
          setSelectedTraining={setSelectedTraining}
          trainingStatus={trainingStatus}
        />
      </div>
    </>
  );
}
