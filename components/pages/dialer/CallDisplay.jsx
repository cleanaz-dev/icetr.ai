import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Pause,
  Play,
  Clock,
  PhoneCall,
  UserX,
  ArrowRight,
  Search,
  Target,
  Database,
  MapPin,
} from "lucide-react";
import React, { useState } from "react";
import {} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import US from "country-flag-icons/react/3x2/US";
import CA from "country-flag-icons/react/3x2/CA";
import { useCall, CALL_STATUS } from "@/context/CallProvider";
import { useEffect } from "react";

export default function CallDisplay({
  selectedLead,
  leadPhoneNumber,
  setLeadPhoneNumber,
  direction = "outbound",
  orgPhoneNumbers,
}) {
  const {
    callDuration: initialCallDuration,
    callSid,
    currentSession,
    handleCall,
    handleHangup,
    isCallActive,
    callStatus,
  } = useCall();
  const [fromNumber, setFromNumber] = useState(
    orgPhoneNumbers?.[0]?.phoneNumber || ""
  );
  const [callDuration, setCallDuration] = useState(initialCallDuration || 0);

  const clearNumber = () => {
    setLeadPhoneNumber("");
  };


  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getCountryCodeFlag = (countryCode) => {
    switch (countryCode) {
      case "US":
        return <US className="w-6 h-6" />;
      case "CA":
        return <CA className="w-6 h-6" />;
      default:
        return <div className="w-6 h-6 text-muted-foreground" />;
    }
  };

  useEffect(() => {
  if (callStatus === CALL_STATUS.ENDED) {
    setCallDuration(0); // reset display to 00:00
  }
}, [callStatus]);

  // No Lead Selected UI
  if (!selectedLead) {
    return (
      <div className="flex flex-col gap-6">
        {/* No Lead Selected Card */}
        <div className="bg-card rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <UserX className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                No Lead Selected
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Select a lead from the list to start making calls and view
                contact details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Existing UI when lead is selected
  return (
    <div className="flex flex-col gap-6">
      {/* Call Status Card */}
      <div className="bg-card rounded-xl shadow-sm p-2">
        <div className="flex items-start gap-4">
          {/* Contact Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 space-y-4">
              {/* Name and Status */}
              <div className="flex-col ">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedLead?.name ?? "Not Available"}
                  </h3>
                  <div className="bg-secondary px-2 py-1 text-xs text-primary-foreground rounded-md">
                    <p>{selectedLead?.status}</p>
                  </div>
                </div>
                <h1
                  className={
                    selectedLead?.company
                      ? "text-muted-foreground"
                      : "text-muted"
                  }
                >
                  {selectedLead?.company ?? "Not Available"}
                  {/* {callStatus} */}
                </h1>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">
                    {selectedLead?.phoneNumber}
                  </span>
                </div>

                {/* Campaign */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5">
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">
                    {selectedLead?.campaign?.name ?? "Not Available"}
                  </span>
                </div>

                {/* Source */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5">
                    <Database className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">
                    {selectedLead?.source ?? "Not Available"}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span
                    className={`font-medium ${
                      selectedLead?.region
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {selectedLead?.region ?? "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Status and Duration */}
        <div className="bg-card border-t border-muted mt-2">
          <div className="flex items-center justify-between">
            {/* Left Side - Direction and Status */}
            <div className="flex items-center gap-4">
              {/* Direction */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {direction.charAt(0).toUpperCase() + direction.slice(1)}
                </span>
              </div>
            </div>

            {/* Right Side - Duration */}
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatDuration(callDuration)}
              </div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* From Number Selection */}
      <div className="space-y-2">
        <Label>From Number</Label>
        <Select value={fromNumber} onValueChange={setFromNumber}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orgPhoneNumbers.map((phoneNumberObj) => (
              <SelectItem
                key={phoneNumberObj.id}
                value={phoneNumberObj.phoneNumber}
              >
                <div className="flex items-center gap-2">
                  {getCountryCodeFlag(phoneNumberObj.countryCode)}{" "}
                  {phoneNumberObj.phoneNumber}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Call Controls */}
      <div className="grid grid-cols-2 gap-3 space-y-1">
        <Button
          onClick={() =>
            handleCall(leadPhoneNumber, fromNumber, selectedLead?.id)
          }
          disabled={
            !leadPhoneNumber || (callSid && callStatus !== CALL_STATUS.ENDED) || !currentSession }
          className="w-full"
        >
          {callSid && callStatus !== CALL_STATUS.ENDED ? (
            <>
              <PhoneCall className="w-4 h-4 mr-2" />
              Calling…
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 mr-2" />
              Call
            </>
          )}
        </Button>

        <Button
          onClick={handleHangup}
          disabled={!callSid || callStatus === CALL_STATUS.ENDED}
          variant="destructive"
          className="w-full"
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Hang Up
        </Button>
      </div>
    </div>
  );
}
