import { useState, useEffect, useCallback, useRef } from "react";
import { Room } from "livekit-client";
import {
  X,
  Phone,
  PhoneOff,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Pause,
  Play,
  SkipForward,
  Loader2,
  MessageSquare,
  User,
  Bot,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTeamContext } from "@/context/TeamProvider";

const AICallModal = ({ leads = [], isOpen, onClose }) => {
  const [queueStatus, setQueueStatus] = useState("idle");
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [callStatus, setCallStatus] = useState("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [callResults, setCallResults] = useState({});
  const [livekitRoom, setLivekitRoom] = useState(null);
  const [agentCache, setAgentCache] = useState(null);
  const [isInitializingAgent, setIsInitializingAgent] = useState(false);

  const [toolCalls, setToolCalls] = useState([]);
  const [showToolCalls, setShowToolCalls] = useState(false);

  // NEW: Transcript state
  const [transcripts, setTranscripts] = useState([]);
  const [showTranscripts, setShowTranscripts] = useState(false);

  // Use refs to prevent race conditions
  const callCompletionHandled = useRef(false);
  const cooldownIntervalRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const isProcessingCallCompletion = useRef(false);
  const transcriptEndRef = useRef(null);

  const { orgId } = useTeamContext();

  const currentLead = leads[currentLeadIndex];
  const totalLeads = leads.length;
  const completedCalls = Object.keys(callResults).length;

  // Auto-scroll transcripts to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts]);

  // Clear transcripts when starting a new call
  useEffect(() => {
    if (callStatus === "connecting") {
      setTranscripts([]);
    }
  }, [callStatus]);

  // Separate timer for call duration (only when actively calling)
  useEffect(() => {
    let interval;
    if (callStatus === "calling") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Separate cooldown timer with strict controls
  useEffect(() => {
    if (cooldownTimer > 0 && queueStatus === "running") {
      console.log("Starting cooldown:", cooldownTimer);

      cooldownIntervalRef.current = setInterval(() => {
        setCooldownTimer((prev) => {
          const newValue = prev - 1;
          console.log("Cooldown tick:", newValue);

          if (newValue <= 0) {
            console.log("Cooldown finished, ready for next call");
            return 0;
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [cooldownTimer, queueStatus]);

  // Trigger next call only when cooldown is done AND conditions are right
  useEffect(() => {
    if (
      cooldownTimer === 0 &&
      queueStatus === "running" &&
      callStatus === "idle" &&
      currentLeadIndex < totalLeads &&
      currentLead &&
      !isProcessingCallCompletion.current
    ) {
      console.log(
        "Conditions met, starting next call for lead:",
        currentLeadIndex
      );
      startSingleCall();
    }
  }, [cooldownTimer, queueStatus, callStatus, currentLeadIndex, totalLeads]);

  useEffect(() => {
    if (callStatus === "connecting") {
      setToolCalls([]);
    }
  }, [callStatus]);

  const addTranscript = (speaker, text, isFinal = true) => {
    setTranscripts((prev) => {
      const timestamp = new Date().toLocaleTimeString();
      const newEntry = {
        id: Date.now() + Math.random(),
        speaker,
        text,
        timestamp,
        isFinal,
      };

      // If this is an update to the last entry (same speaker, not final), replace it
      if (
        !isFinal &&
        prev.length > 0 &&
        prev[prev.length - 1].speaker === speaker &&
        !prev[prev.length - 1].isFinal
      ) {
        return [...prev.slice(0, -1), newEntry];
      }

      return [...prev, newEntry];
    });
  };

  const addToolCall = (
    toolName,
    args,
    result,
    status = "completed",
    duration = 0
  ) => {
    setToolCalls((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        toolName,
        args,
        result,
        status, // 'started', 'completed', 'failed'
        duration,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const startSingleCall = async () => {
    if (
      !currentLead ||
      callStatus !== "idle" ||
      isProcessingCallCompletion.current
    ) {
      console.log("Cannot start call - conditions not met");
      return;
    }

    console.log("Starting call for lead:", currentLead.id);
    callCompletionHandled.current = false;
    setCallStatus("connecting");

    try {
      const response = await fetch(
        `/api/org/${orgId}/calls/livekit/create-lead-call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: currentLead.id,
            leadData: {
              name: currentLead.name || "there",
              phoneNumber: currentLead.phoneNumber,
              company: currentLead.company,
              research: currentLead.research,
              email: currentLead.email,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create call");

      const { roomName, token } = await response.json();
      const room = new Room();

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token);
      setLivekitRoom(room);
      setCallStatus("calling");

      // In your startSingleCall function, after room.connect()
      room.registerTextStreamHandler(
        "lk.transcription",
        async (reader, participantInfo) => {
          const message = await reader.readAll();

          // Ensure participantInfo and identity exist
          if (!participantInfo || !participantInfo.identity) {
            console.warn(
              "Missing participantInfo or identity in text stream handler"
            );
            addTranscript("Unknown", message, true); // Fallback to "Unknown" speaker
            return;
          }

          if (reader.info.attributes["lk.transcribed_track_id"]) {
            console.log(
              `New transcription from ${participantInfo.identity}: ${message}`
            );
            const speaker = participantInfo.identity.includes("voice-agent")
              ? "Agent"
              : "User";
            addTranscript(speaker, message, true); // true = final transcript
          } else {
            console.log(
              `New message from ${participantInfo.identity}: ${message}`
            );
            // Handle regular text messages if needed
          }
        }
      );

      // Function to add transcripts (same as before)
      const addTranscript = (speaker, text, isFinal = true) => {
        setTranscripts((prev) => {
          const timestamp = new Date().toLocaleTimeString();
          const newEntry = {
            id: Date.now() + Math.random(),
            speaker,
            text,
            timestamp,
            isFinal,
          };

          // If this is an update to the last entry (same speaker, not final), replace it
          if (
            !isFinal &&
            prev.length > 0 &&
            prev[prev.length - 1].speaker === speaker &&
            !prev[prev.length - 1].isFinal
          ) {
            return [...prev.slice(0, -1), newEntry];
          }

          return [...prev, newEntry];
        });
      };

      console.log("Connected to room:", roomName);

      // Set up event listeners
      room.on("participantDisconnected", (participant) => {
        console.log("Participant disconnected:", participant.identity);
        if (
          participant.identity.includes("agent") &&
          !callCompletionHandled.current
        ) {
          handleCallComplete(
            "completed",
            "Agent disconnected - call completed"
          );
        }
      });

      room.on("disconnected", (reason) => {
        console.log("Room disconnected:", reason);
        if (callStatus === "calling" && !callCompletionHandled.current) {
          handleCallComplete("completed", "Room disconnected - call ended");
        }
      });

      // Keep your existing dataReceived handler but ONLY for call control
      room.on("dataReceived", (payload, participant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          console.log("Data received from agent:", data);

          // ONLY handle call control - no transcript handling here
          switch (data.type) {
            case "call_ended":
            case "hangup":
              if (!callCompletionHandled.current) {
                handleCallComplete(
                  "completed",
                  data.reason || "Call ended by agent"
                );
              }
              break;
          }
        } catch (e) {
          console.error("Failed to parse agent data:", e);
        }
      });


    } catch (error) {
      console.error("Failed to start AI call:", error);
      handleCallComplete("failed", error.message);
    }
  };

  const handleCallComplete = useCallback(
    (status, notes) => {
      // Prevent multiple executions
      if (callCompletionHandled.current || isProcessingCallCompletion.current) {
        console.log("Call completion already handled, ignoring");
        return;
      }

      isProcessingCallCompletion.current = true;
      callCompletionHandled.current = true;

      console.log(
        "Call completed:",
        status,
        notes,
        "for lead:",
        currentLead?.id
      );

      // Clear timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      // Disconnect room
      if (livekitRoom) {
        livekitRoom.disconnect();
        setLivekitRoom(null);
      }

      // Record result with transcript
      setCallResults((prev) => ({
        ...prev,
        [currentLead.id]: {
          leadId: currentLead.id,
          leadName: currentLead.name || currentLead.company,
          status,
          notes,
          duration: callDuration,
          timestamp: new Date().toISOString(),
          transcript: transcripts.filter((t) => t.isFinal), // Only save final transcripts
        },
      }));

      setCallStatus("completed");

      // Check if we should continue
      setTimeout(() => {
        setCurrentLeadIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          console.log("Moving from lead", prevIndex, "to", nextIndex);

          if (nextIndex >= totalLeads) {
            console.log("All leads completed");
            setQueueStatus("completed");
            isProcessingCallCompletion.current = false;
            return prevIndex;
          } else {
            // Start cooldown for next call
            console.log("Starting 5 second cooldown before next call");
            setCooldownTimer(10);
            setCallStatus("idle");
            isProcessingCallCompletion.current = false;
            return nextIndex;
          }
        });
      }, 1000); // Small delay to ensure state is clean
    },
    [currentLead, callDuration, livekitRoom, totalLeads, transcripts]
  );

  const startQueue = async () => {
    console.log("Starting queue with", leads.length, "leads");

    if (!agentCache) {
      setQueueStatus("initializing");
      const agentReady = await initializeAgent();
      if (!agentReady) {
        setQueueStatus("idle");
        return;
      }
    }

    setQueueStatus("running");
    setCurrentLeadIndex(0);
    setCallResults({});
    setCallStatus("idle");
    setCooldownTimer(0);
    setTranscripts([]);
    callCompletionHandled.current = false;
    isProcessingCallCompletion.current = false;
  };

  const pauseQueue = () => {
    console.log("Pausing queue");
    setQueueStatus("paused");

    // Clear cooldown
    setCooldownTimer(0);
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    // Disconnect current call
    if (callStatus === "calling" && livekitRoom) {
      livekitRoom.disconnect();
      setLivekitRoom(null);
      setCallStatus("idle");
    }
  };

  const resumeQueue = () => {
    console.log("Resuming queue");
    setQueueStatus("running");
    if (callStatus === "idle" && currentLeadIndex < totalLeads) {
      setCooldownTimer(0); // Start immediately
    }
  };

  const skipCurrentCall = () => {
    console.log("Skipping current call");
    if (livekitRoom && !callCompletionHandled.current) {
      handleCallComplete("skipped", "Call skipped by user");
    }
  };

  const resetQueue = () => {
    console.log("Resetting queue");
    setQueueStatus("idle");
    setCurrentLeadIndex(0);
    setCallStatus("idle");
    setCallDuration(0);
    setCooldownTimer(0);
    setCallResults({});
    setTranscripts([]);
    callCompletionHandled.current = false;
    isProcessingCallCompletion.current = false;

    // Clear all timers
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    if (livekitRoom) {
      livekitRoom.disconnect();
      setLivekitRoom(null);
    }
  };

  // Initialize agent if needed
  const initializeAgent = async () => {
    setIsInitializingAgent(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsInitializingAgent(false);
      return true;
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      setIsInitializingAgent(false);
      return false;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQueueStatusText = () => {
    switch (queueStatus) {
      case "initializing":
        return "Initializing AI Agent...";
      case "running":
        return `Calling leads (${completedCalls + 1}/${totalLeads})`;
      case "paused":
        return "Queue paused";
      case "completed":
        return "All calls completed";
      default:
        return "Ready to start calling";
    }
  };

  const getCallStatusIcon = () => {
    switch (callStatus) {
      case "connecting":
        return <Phone className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case "calling":
        return <Phone className="w-5 h-5 text-green-500 animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Phone className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getProgressPercentage = () => {
    return totalLeads > 0 ? (completedCalls / totalLeads) * 100 : 0;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="min-w-7xl max-h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            AI Call Queue - {totalLeads} Lead{totalLeads !== 1 ? "s" : ""}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscripts(!showTranscripts)}
              className="ml-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showTranscripts ? "Hide" : "Show"} Transcripts
            </Button>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Left Panel - Current Call */}
          <div className={`${showTranscripts ? "flex-1" : "flex-2"} space-y-4`}>
            {/* Queue Status */}
            <div className="p-4 border bg-card rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{getQueueStatusText()}</h3>
                {(queueStatus === "initializing" || isInitializingAgent) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>

              <Progress value={getProgressPercentage()} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Completed: {completedCalls}/{totalLeads}
              </p>
            </div>

            {/* Current Lead Info */}
            {currentLead && (
              <div className="p-4 border bg-card rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium">
                    {currentLead.name || "Unknown Lead"}
                  </h3>
                  {getCallStatusIcon()}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Company:</p>
                    <p>{currentLead.company || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone:</p>
                    <p>{currentLead.phoneNumber || "N/A"}</p>
                  </div>
                </div>

                {/* Call Status Details */}
                {callStatus === "calling" && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatDuration(callDuration)}
                    </div>
                    {transcripts.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {transcripts.length} exchanges
                      </Badge>
                    )}
                  </div>
                )}

                {cooldownTimer > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    <Pause className="w-4 h-4" />
                    Next call starting in {cooldownTimer}s...
                  </div>
                )}

                {currentLead.research?.research?.companyOverview && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Company Overview:
                    </h4>
                    <div className="text-xs">
                      {currentLead.research.research.companyOverview}
                    </div>
                  </div>
                )}

                {/* Research/Talking Points */}
                {currentLead.research?.research?.talkingPoints && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Key Talking Points:
                    </h4>
                    <div className="space-y-2 overflow-y-auto">
                      {currentLead.research.research.talkingPoints.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="text-xs flex items-start gap-2"
                          >
                            <Badge
                              variant={
                                point.priority === "high"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs shrink-0 uppercase"
                            >
                              {point.priority}
                            </Badge>
                            <span className="text-muted-foreground">
                              {point.text}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2 items-center">
              {queueStatus === "idle" && (
                <Button onClick={startQueue} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Start Queue
                </Button>
              )}

              {queueStatus === "running" && cooldownTimer === 0 && (
                <>
                  <Button
                    onClick={pauseQueue}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Queue
                  </Button>

                  {callStatus === "calling" && (
                    <Button onClick={skipCurrentCall} variant="outline">
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                  )}
                </>
              )}

              {queueStatus === "paused" && (
                <Button onClick={resumeQueue} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}

              {(queueStatus === "completed" || queueStatus === "paused") && (
                <Button
                  onClick={resetQueue}
                  variant="outline"
                  className="flex-1"
                >
                  Reset Queue
                </Button>
              )}
            </div>
          </div>

          {/* Middle Panel - Live Transcript (NEW) */}
          {showTranscripts && (
            <div className="w-96 border-l pl-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />
                <h3 className="font-medium">Live Transcript</h3>
                {transcripts.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {transcripts.length}
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[500px] border rounded-lg p-3 bg-muted/20">
                <div className="space-y-3">
                  {transcripts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {callStatus === "calling"
                        ? "Listening for conversation..."
                        : "No transcript available"}
                    </p>
                  ) : (
                    transcripts.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex gap-2 text-sm ${
                          entry.speaker === "Agent"
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-2 ${
                            entry.speaker === "Agent"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-green-100 text-green-900"
                          } ${!entry.isFinal ? "opacity-60 italic" : ""}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {entry.speaker === "Agent" ? (
                              <Bot className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span className="text-xs font-medium">
                              {entry.speaker}
                            </span>
                            <span className="text-xs opacity-60">
                              {entry.timestamp}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${
                              !entry.isFinal ? "italic" : ""
                            }`}
                          >
                            {entry.text}
                            {!entry.isFinal && (
                              <span className="animate-pulse">...</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Right Panel - Results */}
          <div className="w-80 border-l pl-4">
            <h3 className="font-medium mb-3">Call Results</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {Object.values(callResults).map((result) => (
                  <div
                    key={result.leadId}
                    className="p-3 border bg-card rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{result.leadName}</span>
                      {result.status === "completed" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {result.status === "failed" && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {result.status === "skipped" && (
                        <SkipForward className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mb-1">
                      {result.notes}
                    </p>
                    <div className="flex items-center gap-2">
                      {result.duration > 0 && (
                        <p className="text-muted-foreground text-xs">
                          Duration: {formatDuration(result.duration)}
                        </p>
                      )}
                      {result.transcript && result.transcript.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {result.transcript.length} exchanges
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Upcoming leads */}
                {leads.slice(currentLeadIndex + 1).map((lead, index) => (
                  <div
                    key={lead.id}
                    className="p-3 border bg-card rounded-lg text-sm opacity-60"
                  >
                    <p className="font-medium">
                      {lead?.name || "Unknown"}{" "}
                      <span className="font-light truncate">
                        {lead?.company}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Waiting in queue...
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {queueStatus !== "idle" && (
              <span>
                Current: {currentLeadIndex + 1}/{totalLeads}
              </span>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AICallModal;
