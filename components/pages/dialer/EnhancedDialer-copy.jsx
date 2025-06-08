"use client";

import React, { useState, useEffect } from "react";
import { Device } from "@twilio/voice-sdk";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Search,
  X,
  Building2,
  ArrowUpDown,
  Eye,
  MessageSquare,
  Backspace,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

const LEAD_STATUSES = {
  New: { label: "New", variant: "secondary" },
  Contacted: { label: "Contacted", variant: "outline" },
  Qualified: { label: "Qualified", variant: "default" },
  Proposal: { label: "Proposal", variant: "secondary" },
  Lost: { label: "Lost", variant: "destructive" },
  Won: { label: "Won", variant: "default" },
};

const CALL_OUTCOMES = [
  {
    value: "answered",
    label: "Answered",
    status: "Contacted",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  {
    value: "no_answer",
    label: "No Answer",
    status: "Contacted",
    icon: XCircle,
    color: "text-yellow-500",
  },
  {
    value: "busy",
    label: "Busy",
    status: "Contacted",
    icon: AlertCircle,
    color: "text-orange-500",
  },
  {
    value: "voicemail",
    label: "Voicemail",
    status: "Contacted",
    icon: MessageSquare,
    color: "text-blue-500",
  },
  {
    value: "wrong_number",
    label: "Wrong Number",
    status: "Lost",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    value: "interested",
    label: "Interested",
    status: "Qualified",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    value: "not_interested",
    label: "Not Interested",
    status: "Lost",
    icon: XCircle,
    color: "text-red-600",
  },
  {
    value: "callback",
    label: "Callback Scheduled",
    status: "Contacted",
    icon: Clock,
    color: "text-blue-600",
  },
];

// Mock phone numbers
const FROM_NUMBERS = [
  { value: "+14165551234", label: "+1 (416) 555-1234", country: "CA" },
  { value: "+12125559876", label: "+1 (212) 555-9876", country: "US" },
];

export default function EnhancedDialer({ data }) {
  // Call state
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [fromNumber, setFromNumber] = useState(FROM_NUMBERS[0].value);

  // Dialer state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDialpad, setShowDialpad] = useState(true);

  // Lead state
  const [leads, setLeads] = useState(data || []);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [leadActivities, setLeadActivities] = useState({});
  const [expandedLeadId, setExpandedLeadId] = useState(null);

  // Call tracking state
  const [sessionCalls, setSessionCalls] = useState([]);
  const [calledLeadIds, setCalledLeadIds] = useState(new Set());

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showDialer, setShowDialer] = useState(false); // For mobile

  // Post-call state
  const [postCallDialogOpen, setPostCallDialogOpen] = useState(false);
  const [callOutcome, setCallOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [currentCallData, setCurrentCallData] = useState(null);

  // Initialize Twilio Device
  useEffect(() => {
    const setupDevice = async () => {
      try {
        const response = await fetch("/api/twilio-token");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch token");
        }

        const twilioDevice = new Device(data.token, {
          logLevel: "info",
          codecPreferences: ["opus", "pcmu"],
        });

        twilioDevice.register();
        twilioDevice.on("registered", () => setStatus("Ready"));
        twilioDevice.on("error", (err) => {
          setError(`Device error: ${err.message}`);
          setStatus("Error");
        });

        setDevice(twilioDevice);
      } catch (err) {
        setError(err.message);
        setStatus("Error");
      }
    };

    setupDevice();
  }, []);

  // Update leads when prop changes
  useEffect(() => {
    setLeads(data || []);
  }, [data]);

  // Fetch lead activities
  const fetchLeadActivities = async (leadId) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`);
      const data = await response.json();
      setLeadActivities((prev) => ({ ...prev, [leadId]: data }));
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  // Filter and sort leads
  useEffect(() => {
    let filtered = [...leads];

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phoneNumber.includes(searchTerm) ||
          lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (sortField === "createdAt") {
        return (new Date(aValue) - new Date(bValue)) * modifier;
      }

      return (aValue > bValue ? 1 : -1) * modifier;
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, sortField, sortDirection]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callStartTime && status === "Connected") {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime, status]);

  // Toggle activity expansion
  const toggleActivityExpansion = (leadId) => {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null);
    } else {
      setExpandedLeadId(leadId);
      if (!leadActivities[leadId]) {
        fetchLeadActivities(leadId);
      }
    }
  };

  // Call handling
  const selectLead = (lead) => {
    setSelectedLead(lead);
    setPhoneNumber(lead.phoneNumber);
    setShowDialer(true); // Show dialer on mobile when lead is selected
  };

  const handleCall = async () => {
    if (!device || !phoneNumber) return;

    setStatus("Connecting...");
    setError("");

    try {
      // Using the mock API call with fromNumber
      const response = await fetch("/api/twilio-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: phoneNumber,
          fromNumber: fromNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }

      const { sid } = await response.json();

      // For demo purposes, simulate call connection
      setStatus("Connected");
      setCallStartTime(Date.now());
      setCall({ sid }); // Mock call object

      // Add to session calls
      const callRecord = {
        id: Date.now(),
        leadId: selectedLead?.id,
        leadName: selectedLead?.name || "Unknown",
        phoneNumber: phoneNumber,
        startTime: Date.now(),
        status: "ongoing",
      };

      setCurrentCallData(callRecord);
      setSessionCalls((prev) => [callRecord, ...prev]);

      if (selectedLead) {
        setCalledLeadIds((prev) => new Set([...prev, selectedLead.id]));
      }

      // Simulate call end after some time (remove in production)
      setTimeout(() => {
        handleCallEnd();
      }, 30000); // 30 seconds for demo
    } catch (err) {
      setError(err.message);
      setStatus("Error");
    }
  };

  const handleCallEnd = () => {
    const endTime = Date.now();
    const duration = callStartTime
      ? Math.floor((endTime - callStartTime) / 1000)
      : 0;

    // Update session call record
    setSessionCalls((prev) =>
      prev.map((call) =>
        call.id === currentCallData?.id
          ? { ...call, endTime, duration, status: "ended" }
          : call
      )
    );

    setCurrentCallData((prev) => ({
      ...prev,
      endTime,
      duration,
    }));

    setPostCallDialogOpen(true);
    setStatus("Ready");
    setCall(null);
    setCallStartTime(null);
    setCallDuration(0);
  };

  const handleHangup = () => {
    if (call) {
      handleCallEnd();
    }
  };

  // Post-call processing
  const saveCallActivity = async () => {
    if (!currentCallData) return;

    try {
      // Update session call with outcome
      const outcomeConfig = CALL_OUTCOMES.find((o) => o.value === callOutcome);
      setSessionCalls((prev) =>
        prev.map((call) =>
          call.id === currentCallData.id
            ? { ...call, outcome: callOutcome, notes: callNotes, outcomeConfig }
            : call
        )
      );

      // Only save activity if we have a selected lead
      if (selectedLead) {
        const activityResponse = await fetch(
          `/api/leads/${selectedLead.id}/activities`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "call",
              content: `Call ${callOutcome} - Duration: ${formatDuration(
                currentCallData.duration
              )}${callNotes ? ` - Notes: ${callNotes}` : ""}`,
            }),
          }
        );

        if (!activityResponse.ok) throw new Error("Failed to save activity");

        // Update lead status if needed
        if (outcomeConfig && outcomeConfig.status !== selectedLead.status) {
          const updateResponse = await fetch(`/api/leads/${selectedLead.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: outcomeConfig.status }),
          });

          if (!updateResponse.ok) throw new Error("Failed to update lead");

          // Update local state
          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === selectedLead.id
                ? { ...lead, status: outcomeConfig.status }
                : lead
            )
          );
          setSelectedLead((prev) => ({
            ...prev,
            status: outcomeConfig.status,
          }));
        }

        // Refresh activities if expanded
        if (expandedLeadId === selectedLead.id) {
          fetchLeadActivities(selectedLead.id);
        }
      }
    } catch (err) {
      setError("Failed to save call data");
    } finally {
      setPostCallDialogOpen(false);
      setCallNotes("");
      setCallOutcome("");
      setCurrentCallData(null);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Dialer functions
  const addDigit = (digit) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const removeDigit = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const clearNumber = () => {
    setPhoneNumber("");
    setSelectedLead(null);
  };

  // Quick redial function
  const redialNumber = (number, lead = null) => {
    setPhoneNumber(number);
    if (lead) {
      setSelectedLead(lead);
    }
    setShowDialer(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Left Side - Leads Table */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showDialer ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="border border-2 p-2 border-primary rounded-full">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Lead Dialer</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Session Call Summary */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Badge variant="outline" className="gap-1">
                  <Phone className="w-3 h-3" />
                  {sessionCalls.length} calls
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {sessionCalls.filter((c) => c.outcome).length} completed
                </Badge>
              </div>

              <Badge variant={status === "Ready" ? "default" : "secondary"}>
                {status}
                {status === "Connected" && ` (${formatDuration(callDuration)})`}
              </Badge>

              {error && <Badge variant="destructive">{error}</Badge>}

              {/* Mobile dialer toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDialer(!showDialer)}
                className="lg:hidden"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b p-4 bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(LEAD_STATUSES).map((status) => (
                  <SelectItem key={status} value={status}>
                    {LEAD_STATUSES[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="hidden lg:table-cell cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Created <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <TableRow
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedLead?.id === lead.id && "bg-muted",
                      calledLeadIds.has(lead.id) &&
                        "border-l-4 border-l-green-500"
                    )}
                  >
                    <TableCell
                      className="font-medium"
                      onClick={() => selectLead(lead)}
                    >
                      <div className="flex items-center gap-2">
                        {lead.name || "Unknown"}
                        {calledLeadIds.has(lead.id) && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-mono text-sm"
                      onClick={() => selectLead(lead)}
                    >
                      {lead.phoneNumber}
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell"
                      onClick={() => selectLead(lead)}
                    >
                      {lead.company || "-"}
                    </TableCell>
                    <TableCell onClick={() => selectLead(lead)}>
                      <Badge
                        variant={
                          LEAD_STATUSES[lead.status]?.variant || "secondary"
                        }
                      >
                        {LEAD_STATUSES[lead.status]?.label || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell text-sm text-muted-foreground"
                      onClick={() => selectLead(lead)}
                    >
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectLead(lead);
                          }}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActivityExpansion(lead.id);
                          }}
                        >
                          {expandedLeadId === lead.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Activity Row */}
                  {expandedLeadId === lead.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="bg-muted/30 p-4 border-y">
                          <h4 className="font-semibold mb-3 text-sm">
                            Lead Activities
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {leadActivities[lead.id] &&
                            leadActivities[lead.id].length > 0 ? (
                              leadActivities[lead.id].map((activity) => (
                                <div
                                  key={activity.id}
                                  className="bg-background rounded-lg p-3 text-sm"
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {activity.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        activity.timestamp || activity.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">
                                    {activity.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                No activities yet
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No leads found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Right Side - Dialer */}
      <div
        className={cn(
          "w-full lg:w-96 border-l bg-muted/20 flex flex-col",
          "lg:relative fixed inset-0 lg:inset-auto z-40 lg:z-auto bg-background lg:bg-muted/20",
          showDialer ? "block" : "hidden lg:block"
        )}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Dialer</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDialer(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="dialer" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="dialer" className="flex-1">
              Dialer
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex-1">
              Call History ({sessionCalls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dialer"
            className="flex-1 p-4 space-y-4 overflow-y-auto"
          >
            {/* Selected Lead Info */}
            {selectedLead && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedLead.name || "Unknown"}
                    {calledLeadIds.has(selectedLead.id) && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={LEAD_STATUSES[selectedLead.status]?.variant}
                    >
                      {LEAD_STATUSES[selectedLead.status]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedLead.company && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Company
                      </div>
                      <div className="text-sm">{selectedLead.company}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                        <span className="text-xs font-semibold bg-muted px-1 rounded">
                          {number.country}
                        </span>
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
                onClick={handleCall}
                disabled={
                  !phoneNumber ||
                  status === "Connected" ||
                  status === "Connecting..."
                }
                className="w-full"
                size="lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button
                onClick={handleHangup}
                disabled={!call}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                Hang Up
              </Button>
            </div>

            {/* Dialpad Toggle */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDialpad(!showDialpad)}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              {showDialpad ? "Hide" : "Show"} Dialpad
            </Button>

            {/* Dialpad */}
            {showDialpad && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "*",
                      "0",
                      "#",
                    ].map((digit) => (
                      <Button
                        key={digit}
                        onClick={() => addDigit(digit)}
                        variant="outline"
                        className="h-12 text-lg font-semibold hover:scale-105 transition-transform"
                      >
                        {digit}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center">
                    <Button
                      onClick={removeDigit}
                      variant="ghost"
                      size="icon"
                      disabled={!phoneNumber}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calls" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {sessionCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No calls in this session yet</p>
                </div>
              ) : (
                sessionCalls.map((callRecord) => {
                  const OutcomeIcon = callRecord.outcomeConfig?.icon || Phone;
                  const outcomeColor =
                    callRecord.outcomeConfig?.color || "text-gray-500";

                  return (
                    <Card key={callRecord.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium">
                            {callRecord.leadName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {callRecord.phoneNumber}
                          </div>
                        </div>
                        {callRecord.status === "ongoing" ? (
                          <Badge variant="default">Ongoing</Badge>
                        ) : callRecord.outcome ? (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              outcomeColor
                            )}
                          >
                            <OutcomeIcon className="w-4 h-4" />
                            <span className="text-sm">
                              {callRecord.outcomeConfig?.label}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary">No outcome</Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          {new Date(callRecord.startTime).toLocaleTimeString()}
                        </span>
                        {callRecord.duration !== undefined && (
                          <span>
                            Duration: {formatDuration(callRecord.duration)}
                          </span>
                        )}
                      </div>

                      {callRecord.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          {callRecord.notes}
                        </div>
                      )}

                      {callRecord.status !== "ongoing" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => redialNumber(callRecord.phoneNumber)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Redial
                        </Button>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post-Call Dialog */}
      <Dialog open={postCallDialogOpen} onOpenChange={setPostCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Call Duration</span>
                <span className="text-sm">
                  {currentCallData && formatDuration(currentCallData.duration)}
                </span>
              </div>
            </div>

            <div>
              <Label>Call Outcome *</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="How did the call go?" />
                </SelectTrigger>
                <SelectContent>
                  {CALL_OUTCOMES.map((outcome) => {
                    const Icon = outcome.icon;
                    return (
                      <SelectItem key={outcome.value} value={outcome.value}>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            outcome.color
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{outcome.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Call Notes</Label>
              <Textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Any notes about this call..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPostCallDialogOpen(false);
                  setCallOutcome("");
                  setCallNotes("");
                }}
              >
                Skip
              </Button>
              <Button onClick={saveCallActivity} disabled={!callOutcome}>
                Save & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
