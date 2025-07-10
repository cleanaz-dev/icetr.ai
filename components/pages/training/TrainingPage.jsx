"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Play,
  BookOpen,
  Mic,
  MicOff,
  Clock,
  Target,
  PhoneCall,
  AlertCircle,
  CheckCircle,
  PhoneIncoming,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PiStudent } from "react-icons/pi";
import { useTwilioDevice } from "@/lib/hooks/useTwilioDevice";
import { useCallManagement, CALL_STATUS } from "@/lib/hooks/useCallManagement";
import { useUser } from "@clerk/nextjs";
import { OctagonX } from "lucide-react";
import ReviewTab from "./ReviewTab";
import { scenarios, callScripts } from "@/lib/constants/training";
import ScenarioSelectionCard from "./ScenarioSelectionCard";
import SystemStatus from "./SystemStatus";
import TrainingStatsCard from "./TrainingStatsCard";
import TrainingInterfaceCard from "./TrainingInterfaceCard";
import TrainingCallScripts from "./TrainingCallScripts";

export default function TrainingPage({
  role,
  data = [],
  trainingData = [],
  trainingUser,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("introduction");
  const [score, setScore] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState("idle"); // idle, initiating, waiting, incoming, connected, completed

  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // ADD THIS
  const timerRef = useRef(null);
  const { user } = useUser();
  const { device, status, error } = useTwilioDevice();
  const {
    call,
    callStartTime,
    callDuration,
    sessionCalls,
    callStatus,
    currentCallData,
    isCallActive,
    handlePracticeCall,
    handleCallEnd,
    handleHangup,
    handleAcceptCall,
    handleRejectCall,
    redialNumber,
    setCallStatus,
    setIsCallActive,
    setCallDuration,
  } = useCallManagement(device);

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
    console.log("Attempting to answer call", incomingCall);
    if (incomingCall) {
      try {
        incomingCall.accept();
        setTrainingStatus("connected");
        setIsCallActive(true);
        setCallStatus(CALL_STATUS.ACTIVE); // Use the constant
        setIncomingCall(null);
        // setCallStartTime(Date.now()); // Set call start time
        console.log("Call answered successfully");
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
    console.log("Rejecting training call", incomingCall);
    if (incomingCall) {
      try {
        incomingCall.reject();
        setTrainingStatus("idle");
        setIncomingCall(null);
        console.log("Call rejected successfully");
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
      const response = await fetch("/api/training/cold-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          phoneNumber: "+17789102129", // Your Twilio number that will receive the call
          userId: user?.id,
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

  const trainingStats = [
    {
      label: "Practice Calls",
      value: sessionCalls.length.toString(),
      icon: Phone,
    },
    { label: "Avg Score", value: "78%", icon: Target },
  ];

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
  const isStartDisabled = () => {
    return (
      trainingStatus === "initiating" ||
      status !== "Ready" ||
      (!audioPermissionGranted && trainingStatus !== "idle")
    );
  };

  const statusDisplay = getStatusDisplay();
  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario);

  return (
    <div className="min-h-screen relative">
      {/* Container Div */}
      <div className="p-1 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex gap-2 text-4xl font-bold items-center">
            <PiStudent className="text-primary" /> Training
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice your pitch with AI-powered feedback
          </p>
        </div>

        <Tabs defaultValue="practice" className="space-y-4">
          {/* Tab Switcher */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="practice"
              className="flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Practice Calls</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Review</span>
            </TabsTrigger>
          </TabsList>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-0">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Interface + Scenario */}
              <div className="space-y-6">
                <TrainingInterfaceCard
                  audioPermissionGranted={audioPermissionGranted}
                  handleAnswerTrainingCall={handleAnswerTrainingCall}
                  handleEndCall={handleEndCall}
                  handleRejectTrainingCall={handleRejectTrainingCall}
                  handleStartCall={handleStartCall}
                  isCallActive={isCallActive}
                  isRecording={isRecording}
                  score={score}
                  setScore={setScore}
                  isStartDisabled={isStartDisabled}
                  setCallStatus={setCallStatus}
                  trainingStatus={trainingStatus}
                  setIsRecording={setIsRecording}
                  setTrainingStatus={setTrainingStatus}
                  callDuration={callDuration}
                  statusDisplay={statusDisplay}
                  selectedScenarioData={selectedScenarioData}
                  selectedScenario={selectedScenario}
                  setSelectedScenario={setSelectedScenario}
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
                        Twilio Status: {status}. Please wait for the system to
                        be ready.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
         
              {/* Right Column: Scripts */}
              <div className="space-y-6">
                <TrainingCallScripts />
              </div>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <ReviewTab trainingData={trainingData} trainingUser={trainingUser} />
        </Tabs>
      </div>
      {/* Bottom Bar*/}
      <div className="sticky bottom-0 inset-x-0 z-50 border-t py-2.5 bg-card shadow-md">
        <div className="max-w-xl md:max-w-3xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <TrainingStatsCard trainingStats={trainingData} />
          <SystemStatus
            audioPermissionGranted={audioPermissionGranted}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
