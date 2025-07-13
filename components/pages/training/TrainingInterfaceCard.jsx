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

// Add formatTime function
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
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

const getDifficultyDecoration = (difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "underline font-semibold decoration-green-500";
    case "Intermediate":
      return "underline font-semibold decoration-yellow-500";
    case "Advanced":
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
  selectedScenario,
  setSelectedScenario,
  selectedScenarioData,
}) {
  const current = scenarios.find((s) => s.id === selectedScenario);
  return (
    <>
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent>
          <div className="text-center">
            <div className="">
              <div className="size-16 mx-auto rounded-full flex items-center justify-center mb-2  ">
                {trainingStatus === "connected" ? (
                  <PhoneCall
                    className={`size-8 sm:size-16 ${statusDisplay.color} animate-pulse`}
                  />
                ) : trainingStatus === "waiting" ? (
                  <Phone
                    className={`size-8 sm:size-12 ${statusDisplay.color} animate-bounce`}
                  />
                ) : trainingStatus === "incoming" ? (
                  <PhoneIncoming
                    className={`size-8 sm:size-12 ${statusDisplay.color} animate-bounce`}
                  />
                ) : trainingStatus === "completed" ? (
                  <CheckCircle
                    className={`size-8 sm:size-12 ${statusDisplay.color}`}
                  />
                ) : (
                  <Phone
                    className={`size-8 sm:size-12 fill-primary stroke-none`}
                  />
                )}
              </div>

 
                <h3
                  className={`text-sm md:text-lg font-light  ${statusDisplay.color}`}
                >
                  {statusDisplay.title}: <span className={`text-base font-bold uppercase text-foreground ${getDifficultyDecoration(current.difficulty)}`}>{current.difficulty}</span>
              
                </h3>   
           

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-2">
                {!isCallActive &&
                trainingStatus !== "waiting" &&
                trainingStatus !== "completed" &&
                trainingStatus !== "incoming" ? (
                  <Button
                    onClick={handleStartCall}
                    disabled={isStartDisabled()}
                    className="text-lg"
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
              {/* Select Scenario */}
              <Card className="border-0 bg-transparent text-left shadow-none">
                <CardHeader className="-mb-2">
                  <CardTitle>Select Scenario</CardTitle>
                  <CardDescription className="-mb-2">
                    Choose the type of customer interaction you want to practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedScenario}
                    onValueChange={(value) =>
                      trainingStatus === "idle" && setSelectedScenario(value)
                    }
                    disabled={trainingStatus !== "idle"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a scenario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {current && (
                    <div className="p-4 border rounded-md space-y-2 bg-muted/50 mt-2">
                      <div className="flex justify-between">
                        <Image
                          src={current.imageUrl}
                          width={100}
                          height={100}
                          alt="practice-avatar"
                          className="rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-[100px] lg:h-[100px]"
                        />
                        <Badge
                          className={`${getDifficultyColor(
                            current.difficulty
                          )} self-start`}
                        >
                          {current.difficulty}
                        </Badge>
                      </div>

                      <p
                        className={getDifficultyDecoration(current.difficulty)}
                      >
                        {current.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {current.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* <p className="text-muted-foreground mb-2">
                {statusDisplay.subtitle}
              </p> */}

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
    </>
  );
}
