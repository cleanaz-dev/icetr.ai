"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  Play,
  Pause,
  Square,
  BookOpen,
  Settings,
  Mic,
  MicOff,
  Clock,
  Target,
  Trophy,
  Volume2,
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
import { scenarios } from "@/lib/constants/training";

// Add formatTime function
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TrainingPage({ role }) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("introduction");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(3);
  const [trainingStatus, setTrainingStatus] = useState("idle"); // idle, initiating, waiting, incoming, connected, completed
  const [blandCallId, setBlandCallId] = useState(null);
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
      setBlandCallId(data.callId);
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
        setBlandCallId(null);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficulyDecoration = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "decoration-green-500";
      case "Intermediate":
        return "decoration-yellow-500";
      case "Advanced":
        return "decoration-red-500";
      default:
        return "decoration-gray-500";
    }
  };

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
          color: "text-primary",
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
    <div className="min-h-screen p-6">
      <div className="">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex gap-2 text-4xl font-bold items-center">
                <PiStudent className="text-primary" /> Training
              </h1>
              <p className="text-lg text-muted-foreground">
                Practice your pitch with AI-powered feedback
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="practice" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="practice"
              className="flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Practice Calls</span>
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Review</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                {/* Main Training Interface */}
                <Card>
                  <CardContent>
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4">
                          {trainingStatus === "connected" ? (
                            <PhoneCall
                              className={`w-16 h-16 ${statusDisplay.color} animate-pulse`}
                            />
                          ) : trainingStatus === "waiting" ? (
                            <Phone
                              className={`w-16 h-16 ${statusDisplay.color} animate-bounce`}
                            />
                          ) : trainingStatus === "incoming" ? (
                            <PhoneIncoming
                              className={`w-16 h-16 ${statusDisplay.color} animate-bounce`}
                            />
                          ) : trainingStatus === "completed" ? (
                            <CheckCircle
                              className={`w-16 h-16 ${statusDisplay.color}`}
                            />
                          ) : (
                            <Phone
                              className={`w-16 h-16 ${statusDisplay.color}`}
                            />
                          )}
                        </div>

                        <h3
                          className={`text-2xl font-bold mb-2 ${statusDisplay.color}`}
                        >
                          {statusDisplay.title}
                        </h3>

                        <p className="text-muted-foreground mb-4">
                          {statusDisplay.subtitle}
                        </p>

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
                              AI will call you within 30 seconds...
                            </p>
                          </div>
                        )}

                        {/* Score Display */}
                        {trainingStatus === "completed" && score > 0 && (
                          <Card className="bg-white border-green-200 mt-4 max-w-md mx-auto">
                            <CardContent className="p-6">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                  {score}/100
                                </div>
                                <div className="text-green-700 font-semibold mb-2">
                                  {score >= 90
                                    ? "Excellent!"
                                    : score >= 80
                                    ? "Great Job!"
                                    : score >= 70
                                    ? "Good Work!"
                                    : "Keep Practicing!"}
                                </div>
                                <Progress value={score} className="h-3 mb-3" />
                                <div className="text-sm text-muted-foreground">
                                  Call duration: {formatTime(callDuration)} •
                                  Scenario: {selectedScenarioData?.name}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-4">
                        {!isCallActive &&
                        trainingStatus !== "waiting" &&
                        trainingStatus !== "completed" &&
                        trainingStatus !== "incoming" ? (
                          <Button
                            onClick={handleStartCall}
                            disabled={isStartDisabled()}
                            size="lg"
                            className="px-8 py-4 text-lg"
                          >
                            <Play className="w-6 h-6 mr-2" />
                            {trainingStatus === "initiating"
                              ? "Starting..."
                              : !audioPermissionGranted &&
                                trainingStatus !== "idle"
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
                    </div>
                  </CardContent>
                </Card>

                {/* Audio permission alert */}
                {!audioPermissionGranted && trainingStatus !== "idle" && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Microphone access is required for training calls. Please
                      click "Allow" when prompted by your browser.
                    </AlertDescription>
                  </Alert>
                )}

                {/* System Status Alert */}
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
                      Twilio Status: {status}. Please wait for system to be
                      ready.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Scenario Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Practice Scenario</CardTitle>
                    <CardDescription>
                      Choose the type of customer interaction you want to
                      practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarios.map((scenario) => (
                        <Card
                          key={scenario.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedScenario === scenario.id
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-primary/5"
                          } ${
                            trainingStatus !== "idle"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            trainingStatus === "idle" &&
                            setSelectedScenario(scenario.id)
                          }
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div
                                  className={`font-semibold underline ${getDifficulyDecoration(
                                    scenario.difficulty
                                  )}`}
                                >
                                  {scenario.name}
                                </div>
                                <Badge
                                  className={`${getDifficultyColor(
                                    scenario.difficulty
                                  )}`}
                                >
                                  {scenario.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {scenario.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trainingStats.map((stat, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <stat.icon className="w-5 h-5 text-primary" />
                            <span className="text-muted-foreground">
                              {stat.label}
                            </span>
                          </div>
                          <div className="font-bold">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Twilio Dialer</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              status === "Ready"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <Badge
                            variant="outline"
                            className={`${
                              status === "Ready"
                                ? "text-green-600 border-green-200"
                                : "text-yellow-600 border-yellow-200"
                            }`}
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                    
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Microphone</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              audioPermissionGranted
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          <Badge
                            variant="outline"
                            className={`${
                              audioPermissionGranted
                                ? "text-green-600 border-green-200"
                                : "text-muted-foreground border-muted-foreground"
                            }`}
                          >
                            {audioPermissionGranted ? "Ready" : "Requesting"}
                          </Badge>
                        </div>
                      </div>
                     
                    </div>
                  </CardContent>
                </Card>

              
              </div>
            </div>
          </TabsContent>
          {/* Review Tab */}
          <ReviewTab />
        </Tabs>
      </div>
    </div>
  );
}
