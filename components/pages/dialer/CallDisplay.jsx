import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Pause,
  Play,
  Volume2,
  VolumeX,
  MoreVertical,
  User,
  Clock,
  PhoneCall,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function CallDisplay() {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState("connected"); // connecting, connected, on-hold, ended

  // Simulate call duration timer
  useEffect(() => {
    let interval;
    if (callStatus === "connected" && !isOnHold) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, isOnHold]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "on-hold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connecting":
        return <Clock className="w-3 h-3" />;
      case "connected":
        return <PhoneCall className="w-3 h-3" />;
      case "on-hold":
        return <Pause className="w-3 h-3" />;
      case "ended":
        return <PhoneOff className="w-3 h-3" />;
      default:
        return <Phone className="w-3 h-3" />;
    }
  };

  return (
    <div className=" ">
      <div className="flex flex-col gap-6">
        {/* Call Status Card */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className=" flex items-start gap-4">
            {/* Avatar and Contact Info */}
            <div className=" flex items-center gap-4 flex-1">
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    John Doe
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    +1 (234) 567-8901
                  </p>
                </div>

                <div className="flex flex-col text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">Campaign</p>
                    <div className="font-medium text-foreground">
                      Trade Campaign
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">Direction</p>
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <ArrowRight className="w-3 h-3 text-green-600" />
                      Outbound
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Duration */}
            <div className="text-right space-y-3">
              <Badge
                className={`${getStatusColor(
                  isOnHold ? "on-hold" : callStatus
                )} font-medium`}
              >
                {getStatusIcon(isOnHold ? "on-hold" : callStatus)}
                <span className="ml-1 capitalize">
                  {isOnHold ? "On Hold" : callStatus}
                </span>
              </Badge>

              <div className="space-y-1">
                <div className="text-2xl font-mono font-bold text-foreground">
                  {formatDuration(callDuration)}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controls */}

        {/* Call Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            className=""
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            variant={isOnHold ? "default" : "outline"}
            size="sm"
            className=""
            onClick={() => setIsOnHold(!isOnHold)}
          >
            {isOnHold ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {isOnHold ? "Resume" : "Hold"}
          </Button>
        </div>

        {/* Call Notes Section */}
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Quick Notes
              </span>
              <Button variant="ghost" size="sm" className="text-xs">
                Add Note
              </Button>
            </div>
            <div className="text-sm text-muted-foreground italic">
              No notes added yet...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
