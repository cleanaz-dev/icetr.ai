// components/TeamCallsTab.jsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  CalendarDays,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  User,
  Users,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeamCallsTab({ team, callsData = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "completed" | "missed" | "scheduled"
  const [filterMember, setFilterMember] = useState("all"); // "all" | userId
  const [filterType, setFilterType] = useState("all"); // "all" | "inbound" | "outbound"
  const [expandedRows, setExpandedRows] = useState(new Set());

  /* ---------- derived data ---------- */
  // Get unique members for the filter
  const uniqueMembers = useMemo(() => {
    const memberMap = new Map();
    (callsData || []).forEach((call) => {
      if (call.userId && !memberMap.has(call.userId)) {
        memberMap.set(call.userId, {
          id: call.userId,
          name: `${call.user?.firstname || ''} ${call.user?.lastname || ''}`.trim(),
          imageUrl: call.user?.imageUrl || '/default-avatar.png',
        });
      }
    });
    return Array.from(memberMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [callsData]);

  const filtered = useMemo(() => {
    let res = callsData || [];

    // search by name or contact
    if (search.trim()) {
      res = res.filter((call) => {
        const memberName = `${call.user?.firstname || ''} ${call.user?.lastname || ''}`.toLowerCase();
        const contact = (call.contactName || call.phoneNumber || '').toLowerCase();
        return memberName.includes(search.toLowerCase()) || 
               contact.includes(search.toLowerCase());
      });
    }

    // member filter
    if (filterMember !== "all") {
      res = res.filter((call) => call.userId === filterMember);
    }

    // status filter
    if (filterStatus !== "all") {
      res = res.filter((call) => call.status === filterStatus);
    }

    // type filter
    if (filterType !== "all") {
      res = res.filter((call) => call.direction === filterType);
    }

    return res;
  }, [callsData, search, filterMember, filterStatus, filterType]);

  const avgDuration = useMemo(() => {
    const completedCalls = filtered.filter(call => call.status === 'completed' && call.duration);
    return completedCalls.length
      ? Math.round(
          completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0) /
          completedCalls.length
        )
      : 0;
  }, [filtered]);

  const todayCalls = useMemo(() => {
    const today = new Date().toDateString();
    return filtered.filter(call => 
      new Date(call.createdAt || call.scheduledAt).toDateString() === today
    ).length;
  }, [filtered]);

  /* ---------- helpers ---------- */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'missed': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'in-progress': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status, direction) => {
    if (status === 'missed') return <PhoneMissed className="w-3 h-3" />;
    if (direction === 'inbound') return <PhoneIncoming className="w-3 h-3" />;
    if (direction === 'outbound') return <PhoneOutgoing className="w-3 h-3" />;
    return <PhoneCall className="w-3 h-3" />;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRowExpansion = (callId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId);
    } else {
      newExpanded.add(callId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterMember("all");
    setFilterType("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Phone className="size-5 text-primary" /> Team Calls
          </h2>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {filtered.length} call{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Today</span>
              <Badge variant="outline" className="font-semibold">
                {todayCalls}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Avg Duration
              </span>
              <Badge variant="outline" className="font-semibold">
                {formatDuration(avgDuration)}
              </Badge>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-full">
          {/* Filters Section */}
          <div className="pb-4">
            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search calls…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 md:w-60 pl-10 border-muted"
                  />
                </div>

                <Select value={filterMember} onValueChange={setFilterMember}>
                  <SelectTrigger className="w-auto bg-background/50">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {uniqueMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={member.imageUrl}
                            alt=""
                            className="w-4 h-4 rounded-full"
                          />
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-auto bg-background/50">
                    <PhoneCall className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 bg-background/50">
                    <PhoneIncoming className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-background/50 hover:bg-background/80"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Scrollable table */}
          <ScrollArea className="flex-1 rounded-t-md">
            <Table className="table-fixed">
              <TableHeader className="bg-background/50">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-48 truncate">Member</TableHead>
                  <TableHead className="w-40">Contact</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-24">Duration</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((call) => (
                  <React.Fragment key={call.id}>
                    <TableRow className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(call.id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.has(call.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={call.user?.imageUrl || '/default-avatar.png'}
                            alt="profile-pic"
                            className="w-6 h-6 rounded-full"
                          />
                          {call.user?.firstname} {call.user?.lastname}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs truncate">
                        <div>
                          <div className="font-medium">
                            {call.contactName || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {call.phoneNumber || '—'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusColor(call.status)} className="gap-1">
                          {getStatusIcon(call.status, call.direction)}
                          {call.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {call.direction || '—'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {formatDuration(call.duration)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(call.createdAt || call.scheduledAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs truncate">
                        {call.notes || '—'}
                      </TableCell>
                    </TableRow>

                    {/* Expanded row content */}
                    {expandedRows.has(call.id) && (
                      <TableRow>
                        <TableCell colSpan="8" className="p-0">
                          <div className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Recording Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Play className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Recording</h4>
                                </div>
                                {call.recordingUrl ? (
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                      className="w-full justify-start"
                                    >
                                      <a
                                        href={call.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Play Recording
                                      </a>
                                    </Button>
                                    {call.transcript && (
                                      <div className="text-sm text-muted-foreground">
                                        <p className="font-medium mb-1">
                                          Transcript Available
                                        </p>
                                        <p className="text-xs">
                                          {call.transcript.length > 100
                                            ? `${call.transcript.substring(0, 100)}...`
                                            : call.transcript}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No recording available
                                  </p>
                                )}
                              </div>

                              {/* Call Notes Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Call Notes</h4>
                                </div>
                                {call.notes || call.summary ? (
                                  <div className="bg-card p-3 rounded-lg border">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {call.notes || call.summary}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No notes available
                                  </p>
                                )}
                              </div>

                              {/* Call Details */}
                              <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center gap-2">
                                  <PhoneCall className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Call Details</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Call Type
                                    </p>
                                    <Badge variant="outline" className="capitalize">
                                      {call.direction || 'Unknown'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Duration
                                    </p>
                                    <Badge variant="outline">
                                      {formatDuration(call.duration)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Started At
                                    </p>
                                    <Badge variant="outline">
                                      {call.startTime 
                                        ? new Date(call.startTime).toLocaleTimeString() 
                                        : '—'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Ended At
                                    </p>
                                    <Badge variant="outline">
                                      {call.endTime 
                                        ? new Date(call.endTime).toLocaleTimeString() 
                                        : '—'}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Contact Information */}
                                {call.contactInfo && (
                                  <div className="mt-4">
                                    <p className="font-medium text-muted-foreground mb-2">
                                      Contact Information
                                    </p>
                                    <div className="bg-card p-3 rounded-lg border">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Name: </span>
                                          {call.contactInfo.name || 'Unknown'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Phone: </span>
                                          {call.contactInfo.phone || call.phoneNumber}
                                        </div>
                                        <div>
                                          <span className="font-medium">Email: </span>
                                          {call.contactInfo.email || '—'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Company: </span>
                                          {call.contactInfo.company || '—'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Call Outcome */}
                                {call.outcome && (
                                  <div className="mt-4">
                                    <p className="font-medium text-muted-foreground mb-2">
                                      Call Outcome
                                    </p>
                                    <div className="bg-card p-3 rounded-lg border">
                                      <p className="text-sm">
                                        {call.outcome}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No calls found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}