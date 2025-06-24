import { Badge } from "@/components/ui/badge";
import { Phone, Mic } from "lucide-react";
import React from "react";

export default function SystemStatus({ status, audioPermissionGranted }) {
  return (
    <div className="flex items-center gap-8 text-sm">
      {/* Twilio Dialer */}
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Dialer</span>
        <div
          className={`w-2 h-2 rounded-full ${
            status === "Ready" ? "bg-green-500" : "bg-yellow-500"
          }`}
        />
        <Badge
          variant="outline"
          className={`h-6 px-2 text-xs ${
            status === "Ready"
              ? "text-green-600 border-green-200"
              : "text-yellow-600 border-yellow-200"
          }`}
        >
          {status}
        </Badge>
      </div>

      {/* Microphone Status */}
      <div className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Mic</span>
        <div
          className={`w-2 h-2 rounded-full ${
            audioPermissionGranted ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <Badge
          variant="outline"
          className={`h-6 px-2 text-xs ${
            audioPermissionGranted
              ? "text-green-600 border-green-200"
              : "text-muted-foreground border-muted-foreground"
          }`}
        >
          {audioPermissionGranted ? "Ready" : "Requesting"}
        </Badge>
      </div>
    </div>
  );
}
