"use client";
import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  CheckCircle2,
  X,
  Keyboard,
  PhoneCall,
  MapPin,
} from "lucide-react";
import { MdCallToAction } from "react-icons/md";
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
import Dialpad from "@/components/pages/dialer/tabs/DialPad";
import { useUser } from "@clerk/nextjs";
import CallDisplay from "../CallDisplay";
import { BiDialpad } from "react-icons/bi";
import CallTranscription from "../CallTranscription";

export default function DialerTab({
  selectedLead,
  orgId,
  phoneNumbers,
}) {
  const [leadPhoneNumber, setLeadPhoneNumber] = useState("");
  const [showDialpad, setShowDialpad] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (selectedLead?.phoneNumber) {
      setLeadPhoneNumber(selectedLead.phoneNumber);
    } else {
      setLeadPhoneNumber("");
    }
  }, [selectedLead]);

  return (
    <>
      <CallDisplay
        selectedLead={selectedLead}
        orgPhoneNumbers={phoneNumbers}
        setLeadPhoneNumber={setLeadPhoneNumber}
        leadPhoneNumber={leadPhoneNumber}
        user={user}
      />

      {/* Dialpad Toggle */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowDialpad(!showDialpad)}
      >
        {showDialpad ? (
          <div className="flex gap-2 items-center">
            <MdCallToAction className="w-4 h-4 mr-2" /> Show Transcript
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <BiDialpad /> <p>Show Dialpad</p>
          </div>
        )}
      </Button>

      {/* Dialpad */}
      {showDialpad && (
        <Dialpad
          onDigitPress={(digit) => setLeadPhoneNumber((prev) => prev + digit)}
          onBackspace={() => setLeadPhoneNumber((prev) => prev.slice(0, -1))}
          disabled={!leadPhoneNumber}
        />
      )}
      {!showDialpad && <CallTranscription />}
    </>
  );
}
