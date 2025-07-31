"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  BookOpen,
  Target,
  AlertCircle,
  ClipboardPen,
} from "lucide-react";
import { PiStudent } from "react-icons/pi";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-og";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTwilioDevice } from "@/lib/hooks/useTwilioDevice";
import { useCallManagement, CALL_STATUS } from "@/lib/hooks/useCallManagement";
import { useUser } from "@clerk/nextjs";
import ReviewTab from "./ReviewTab";
import { scenarios } from "@/lib/constants/training";
import TrainingInterfaceCard from "./TrainingInterfaceCard";
import TrainingCallScripts from "./TrainingCallScripts";
import { usePermissionContext } from "@/context/PermissionProvider";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import PermissionGate from "@/components/auth/PermissionGate";

export default function TrainingPage({
  trainingData = [],
  userProfile,
  orgId,
  blandAiSettings,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");

  const [score, setScore] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState("idle");
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const timerRef = useRef(null);
  const { user } = useUser();
  const { device, status, error } = useTwilioDevice(orgId);
  const {
    callDuration,
    sessionCalls,
    callStatus,
    isCallActive,
    handleHangup,
    setCallStatus,
    setIsCallActive,
    setCallDuration,
  } = useCallManagement(device);
  const { permissions } = usePermissionContext();

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

  // Request audio permissions when device is ready
  useEffect(() => {
    const requestAudioPermissions = async () => {
      if (device && status === "Ready" && !audioPermissionGranted) {
        try {
          // Request microphone permissions
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Stop the stream immediately, we just needed permissions
          stream.getTracks().forEach((track) => track.stop());

          setAudioPermissionGranted(true);
          console.log("Audio permissions granted");
        } catch (err) {
          console.error("Audio permission denied:", err);
          setTrainingStatus("idle");
        }
      }
    };

    requestAudioPermissions();
  }, [device, status, audioPermissionGranted]);

  useEffect(() => {
    const callEndedStates = [
      CALL_STATUS.ENDED,
      CALL_STATUS.CANCELLED,
      CALL_STATUS.FAILED,
    ];

    if (callEndedStates.includes(callStatus)) {
      console.log("Call ended");
      setIncomingCall(null); // Clear incoming call state
    }
  }, [callStatus]);

  // UPDATED: Don't auto-accept, just show the incoming call UI
  useEffect(() => {
    if (!device) return;

    const handleIncomingCall = (incomingCall) => {
      console.log("Training call incoming!", incomingCall);

      // Always set the incoming call, but only change status if we're waiting
      setIncomingCall(incomingCall);

      if (trainingStatus === "waiting") {
        setTrainingStatus("incoming");
        console.log("Training call ready to answer");
      }
    };

    device.on("incoming", handleIncomingCall);

    return () => {
      device.removeListener("incoming", handleIncomingCall);
    };
  }, [device, trainingStatus]);

  // Handle answering the training call
  const handleAnswerTrainingCall = () => {
    if (incomingCall) {
      try {
        incomingCall.accept();
        setTrainingStatus("connected");
        setIsCallActive(true);
        setCallStatus(CALL_STATUS.ACTIVE); // Use the constant
        setIncomingCall(null);
        // setCallStartTime(Date.now()); // Set call start time
      } catch (error) {
        console.error("Error accepting call:", error);
        setTrainingStatus("idle");
        setIncomingCall(null);
      }
    } else {
      console.error("No incoming call to answer");
    }
  };
  // Handle rejecting the training call
  const handleRejectTrainingCall = () => {
    if (incomingCall) {
      try {
        incomingCall.reject();
        setTrainingStatus("idle");
        setIncomingCall(null);
      } catch (error) {
        console.error("Error rejecting call:", error);
        setTrainingStatus("idle");
        setIncomingCall(null);
      }
    }
  };
  // Update the start call function
  const handleStartCall = async () => {
    try {
      // First check if we have audio permissions
      if (!audioPermissionGranted) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop());
          setAudioPermissionGranted(true);
        } catch (err) {
          console.error("Audio permission required for training calls");
          alert(
            "Microphone access is required for training calls. Please allow microphone access and try again."
          );
          return;
        }
      }

      setTrainingStatus("initiating");
      setCallStatus("connecting");

      // // Set up to receive the call
      // await handlePracticeCall("+14372920555");

      // Then initiate the Bland AI call
      const response = await fetch(`/api/org/${orgId}/training/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: currentScenario,
          phoneNumber: "+17789102129", // Your Twilio number that will receive the call
          userId: user?.id,
          blandAiSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate training call");
      }

      const data = await response.json();
      console.log("Training call initiated:", data);

      setTrainingStatus("waiting");
    } catch (err) {
      console.error("Error starting training call:", err);
      setCallStatus("ready");
      setTrainingStatus("idle");
    }
  };

  const handleEndCall = async () => {
    try {
      await handleHangup();
      setIsCallActive(false);
      setIsRecording(false);
      setCallStatus("ended");
      setTrainingStatus("completed");
      setIncomingCall(null);
      clearInterval(timerRef.current);

      // Generate a realistic score based on call duration and scenario
      const baseScore = Math.floor(Math.random() * 20) + 70; // 70-90 base
      const durationBonus = Math.min((callDuration / 60) * 5, 10); // Up to 10 bonus points for longer calls
      const newScore = Math.min(Math.floor(baseScore + durationBonus), 100);
      setScore(newScore);

      setTimeout(() => {
        setCallStatus("ready");
        setTrainingStatus("idle");
        setCallDuration(0);
      }, 5000);
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  // Update training status based on call status
  useEffect(() => {
    if (isCallActive && trainingStatus === "waiting") {
      setTrainingStatus("connected");
    }
  }, [isCallActive, trainingStatus]);

  // UPDATED: Audio permission check in the UI
  const getStatusDisplay = () => {
    if (!audioPermissionGranted && trainingStatus !== "idle") {
      return {
        title: "Audio Permission Required",
        subtitle: "Please allow microphone access to continue",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    }

    switch (trainingStatus) {
      case "idle":
        return {
          title: "Ready to Practice",
          subtitle: `Selected: ${
            scenarios.find((s) => s.id === selectedScenario)?.name
          }`,
          color: "text-muted-foreground",
        };
      case "initiating":
        return {
          title: "Setting up Training Session...",
          subtitle: "Connecting to Bland AI",
          color: "text-yellow-600",
        };
      case "waiting":
        return {
          title: "Connecting...",
          subtitle: "Your phone will ring shortly",
          color: "text-orange-600",
        };
      case "incoming":
        return {
          title: "Training Call Intialized!",
          subtitle: "Click Answer to start your practice session",
          color: "text-green-600",
        };
      case "connected":
        return {
          title: "Training in Progress",
          subtitle: "Practice your pitch now!",
          color: "text-green-600",
        };
      case "completed":
        return {
          title: "Training Completed",
          subtitle: "Great job! Review your performance below",
          color: "text-purple-600",
        };
      default:
        return {
          title: "Ready to Practice",
          subtitle: "Select a scenario and start training",
          color: "text-gray-600",
        };
    }
  };

  // Update the start button disabled condition
  // const isStartDisabled = () => {
  //   return (
  //     trainingStatus === "initiating" ||
  //     status !== "Ready" ||
  //     (!audioPermissionGranted && trainingStatus !== "idle")
  //   );
  // };

  const isStartDisabled = () => {
    return (
      !audioPermissionGranted ||
      !currentScenario ||
      trainingStatus === "initiating" ||
      !selectedCampaign ||
      !selectedScenario
    );
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="">
      {/* Container Div */}
      <div className="p-1 md:p-6">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="flex gap-2 text-4xl font-bold items-center">
              <PiStudent className="text-primary" /> Training
            </h1>
            <p className="text-lg text-muted-foreground">
              Practice your pitch with AI-powered feedback
            </p>
          </div>
          <PermissionGate permission="training.create">
            <Button asChild>
              <Link href="/training/create-training">
              Create Training
              </Link>
              </Button>
          </PermissionGate>
        </div>

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
                trainingStatus={trainingStatus}
                score={score}
                isCallActive={isCallActive}
                isStartDisabled={isStartDisabled}
                handleStartCall={handleStartCall}
                handleEndCall={handleEndCall}
                handleAnswerTrainingCall={handleAnswerTrainingCall}
                handleRejectTrainingCall={handleRejectTrainingCall}
                setTrainingStatus={setTrainingStatus}
                setScore={setScore}
                setCallStatus={setCallStatus}
                audioPermissionGranted={audioPermissionGranted}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                callDuration={callDuration}
                statusDisplay={statusDisplay}
                // Updated props for new structure
                selectedCampaign={selectedCampaign}
                setSelectedCampaign={setSelectedCampaign}
                selectedTraining={selectedTraining}
                setSelectedTraining={setSelectedTraining}
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                trainingData={trainingData}
                currentScenario={currentScenario}
                // Pass the current scenario object
              />
              {/* Alerts */}
              <div className="space-y-4">
                {!audioPermissionGranted && trainingStatus !== "idle" && (
                  <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Microphone access is required for training calls. Please
                      click "Allow" when prompted by your browser.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>System Error: {error}</AlertDescription>
                  </Alert>
                )}

                {status !== "Ready" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Twilio Status: {status}. Please wait for the system to be
                      ready.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Right Column: Scripts */}
            <div className="space-y-6">
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
