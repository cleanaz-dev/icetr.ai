"use client";
import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  CheckCircle2,
  X,
  Keyboard,
  PhoneCall,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, FROM_NUMBERS } from "@/lib/constants/frontend";
import Dialpad from "@/components/pages/dialer/tabs/DialPad";
import { useUser } from "@clerk/nextjs";

export default function DialerTab({
  selectedLead,
  calledLeadIds,
  status,
  call,
  onCall,
  onHangup,
  currentSession,
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fromNumber, setFromNumber] = useState(FROM_NUMBERS[0].value);
  const [showDialpad, setShowDialpad] = useState(true);
  const { user } = useUser();

  const clearNumber = () => {
    setPhoneNumber("");
  };

  useEffect(() => {
    if (selectedLead?.phoneNumber) {
      setPhoneNumber(selectedLead.phoneNumber);
    } else {
      setPhoneNumber("");
    }
  }, [selectedLead]);

  return (
    <>
      {/* Selected Lead Info */}
      {selectedLead && (
        <div className="bg-card p-2 rounded-md">
          <div className="flex justify-between">
            <div className="text-lg font-semibold">
              {selectedLead.name || "Unknown"}
            </div>
            <Badge variant={LEAD_STATUSES[selectedLead.status]?.variant}>
              {LEAD_STATUSES[selectedLead.status]?.label}
            </Badge>
          </div>
          <div className="space-y-2">
            {selectedLead.company && (
              <div>
                <div className="text-sm text-muted-foreground">Company</div>
                <div className="flex gap-2 text-sm ">
                  {selectedLead.company}
                  <span className="flex items-center gap-0.5 text-accent text-xs">
                    <MapPin className="size-3 -mt-0.5" />
                    {selectedLead.region}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <div className="space-y-3">
        <Label>Phone Number</Label>
        <div className="flex gap-2">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="font-mono"
            disabled
          />
          {phoneNumber && (
            <Button variant="ghost" size="icon" onClick={clearNumber}>
              <X className="w-4 h-4" />
            </Button>
          )}
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
            {FROM_NUMBERS.map((number) => (
              <SelectItem key={number.value} value={number.value}>
                <div className="flex items-center gap-2">
                  <span className="">{number.country}</span>
                  {number.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Call Controls */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() =>
            onCall(
              phoneNumber,
              selectedLead,
              fromNumber,
              currentSession.id,
              user.id
            )
          }
          disabled={!phoneNumber || call}
          className="w-full"
        >
          {call ? (
            <div className="flex items-center">
              <PhoneCall className="w-4 h-4 mr-2" />
              Calling...
            </div>
          ) : (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </div>
          )}
        </Button>
        <Button
          onClick={onHangup}
          disabled={!call}
          variant="destructive"
          className="w-full"
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Hang Up
        </Button>
      </div>

      {/* Dialpad Toggle */}
      {/* <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowDialpad(!showDialpad)}
      >
        <Keyboard className="w-4 h-4 mr-2" />
        {showDialpad ? "Hide" : "Show"} Dialpad
      </Button> */}

      {/* Dialpad */}
      {showDialpad && (
        <Dialpad
          onDigitPress={(digit) => setPhoneNumber((prev) => prev + digit)}
          onBackspace={() => setPhoneNumber((prev) => prev.slice(0, -1))}
          disabled={!phoneNumber}
        />
      )}
    </>
  );
}
