import { Phone, Mic } from "lucide-react";
import React from "react";

export default function SystemStatus({ status, audioPermissionGranted }) {
  return (
    <div className="flex items-center gap-8 text-sm">
      {/* Twilio Dialer */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full ${
          audioPermissionGranted
            ? "bg-green-500/10"
            : "bg-gray-400/10 animate-pulse"
        }`}
      >
        <div className="text-xs flex items-center gap-2">
          <Phone
            className={`size-4 ${
              audioPermissionGranted ? "text-green-600" : "text-slate-700"
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              status === "Ready"
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-yellow-500 shadow-sm shadow-yellow-500/50"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              status === "Ready" ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Microphone Status */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full ${
          audioPermissionGranted
            ? "bg-green-500/10"
            : "bg-gray-400/10 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-2">
          <Mic className={`size-4 ${
              audioPermissionGranted ? "text-green-600" : "text-slate-700"
            }`}/>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              audioPermissionGranted
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-gray-400"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              audioPermissionGranted ? "text-green-600" : "text-gray-500"
            }`}
          >
            {audioPermissionGranted ? "Ready" : "Requesting"}
          </span>
        </div>
      </div>
    </div>
  );
}
