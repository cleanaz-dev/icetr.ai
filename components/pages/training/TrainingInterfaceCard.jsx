import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PhoneCall, Phone, PhoneIncoming, CheckCircle, Play, Clock, OctagonX, MicOff, Mic } from "lucide-react";
import React from "react";


// Add formatTime function
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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
  selectedScenarioData,

}) {
  return (
    <>
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
                  <CheckCircle className={`w-16 h-16 ${statusDisplay.color}`} />
                ) : (
                  <Phone className={`w-16 h-16 ${statusDisplay.color}`} />
                )}
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${statusDisplay.color}`}>
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
          </div>
        </CardContent>
      </Card>
    </>
  );
}
