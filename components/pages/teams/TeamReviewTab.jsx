// components/TeamReviewTab.jsx
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
  Award,
  CalendarDays,
  Target,
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  User,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function TeamReviewTab({ team, trainingData }) {
  const [search, setSearch] = useState("");
  const [filterScore, setFilterScore] = useState("all"); // "all" | "pass" | "fail"
  const [filterMember, setFilterMember] = useState("all"); // "all" | userId
  const [expandedRows, setExpandedRows] = useState(new Set());

  /* ---------- derived data ---------- */
  // Get unique members for the filter
  const uniqueMembers = useMemo(() => {
    const memberMap = new Map();
    (trainingData || []).forEach((t) => {
      if (!memberMap.has(t.userId)) {
        memberMap.set(t.userId, {
          id: t.userId,
          name: `${t.user.firstname} ${t.user.lastname}`,
          imageUrl: t.user.imageUrl,
        });
      }
    });
    return Array.from(memberMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [trainingData]);

  const filtered = useMemo(() => {
    let res = trainingData || [];

    // search by name
    if (search.trim()) {
      res = res.filter((t) =>
        `${t.user.firstname} ${t.user.lastname}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // member filter
    if (filterMember !== "all") {
      res = res.filter((t) => t.userId === filterMember);
    }

    // score filter
    if (filterScore === "pass")
      res = res.filter((t) => +t.numericalGrade >= 80);
    if (filterScore === "fail") res = res.filter((t) => +t.numericalGrade < 80);

    return res;
  }, [trainingData, search, filterMember, filterScore]);

  const avgScore = useMemo(
    () =>
      filtered.length
        ? (
            filtered.reduce((sum, t) => sum + (t.numericalGrade || 0), 0) /
            filtered.length
          ).toFixed(1)
        : 0,
    [filtered]
  );

  /* ---------- helpers ---------- */
  const scoreColor = (val) => {
    const v = +val || 0;
    if (v >= 80) return "default";
    if (v >= 60) return "secondary";
    return "destructive";
  };

  const toggleRowExpansion = (trainingId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(trainingId)) {
      newExpanded.delete(trainingId);
    } else {
      newExpanded.add(trainingId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterScore("all");
    setFilterMember("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <ClipboardList className="size-5 text-primary " /> Training Reviews
          </h2>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {filtered.length} training{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Average Score
              </span>
              <Badge variant="outline" className="font-semibold">
                {avgScore}%
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
                      placeholder="Search member…"
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

                  <Select value={filterScore} onValueChange={setFilterScore}>
                    <SelectTrigger className="w-36 bg-background/50">
                      <Award className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="pass">Pass (≥80)</SelectItem>
                      <SelectItem value="fail">Fail (&lt;80)</SelectItem>
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
              <TableHeader className="bg-background/50 ">
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-48 truncate">Member</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Intro</TableHead>
                  <TableHead>Discovery</TableHead>
                  <TableHead>Rapport</TableHead>
                  <TableHead>Objection</TableHead>
                  <TableHead>Closing</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <React.Fragment key={t.id}>
                    <TableRow className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(t.id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.has(t.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={t.user.imageUrl}
                            alt="profile-pic"
                            className="w-6 h-6 rounded-full"
                          />
                          {t.user.firstname} {t.user.lastname}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs truncate capitalize">
                        {t.scenario ?? "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={scoreColor(t.numericalGrade)}>
                          {t.numericalGrade}%
                        </Badge>
                      </TableCell>

                      {[
                        t.introQualityScore,
                        t.discoveryScore,
                        t.rapportScore,
                        t.objectionScore,
                        t.closingScore,
                      ].map((s, i) => (
                        <TableCell key={i}>
                          <Badge variant="outline">{s ?? "—"}</Badge>
                        </TableCell>
                      ))}

                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded row content */}
                    {expandedRows.has(t.id) && (
                      <TableRow>
                        <TableCell colSpan="10" className="p-0">
                          <div className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Recording Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Play className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Recording</h4>
                                </div>
                                {t.recordingUrl ? (
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                      className="w-full justify-start"
                                    >
                                      <a
                                        href={t.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Play Recording
                                      </a>
                                    </Button>
                                    {t.transcript && (
                                      <div className="text-sm text-muted-foreground">
                                        <p className="font-medium mb-1">
                                          Transcript Available
                                        </p>
                                        <p className="text-xs">
                                          {t.transcript.length > 100
                                            ? `${t.transcript.substring(
                                                0,
                                                100
                                              )}...`
                                            : t.transcript}
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

                              {/* Improvements Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Improvements</h4>
                                </div>
                                {t.improvements ? (
                                  <div className="bg-card p-3 rounded-lg border">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {t.improvements}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No improvement notes available
                                  </p>
                                )}
                              </div>

                              {/* Additional Details */}
                              <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">
                                    Training Details
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Rapport Built
                                    </p>
                                    <Badge
                                      variant={
                                        t.rapportBuilt ? "default" : "secondary"
                                      }
                                    >
                                      {t.rapportBuilt ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Objection Handled
                                    </p>
                                    <Badge
                                      variant={
                                        t.objectionHandled
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {t.objectionHandled ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Meeting Booked
                                    </p>
                                    <Badge
                                      variant={
                                        t.bookedMeeting
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {t.bookedMeeting ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="font-medium text-muted-foreground">
                                      Value Prop Delivered
                                    </p>
                                    <Badge
                                      variant={
                                        t.valuePropositionDelivered
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {t.valuePropositionDelivered
                                        ? "Yes"
                                        : "No"}
                                    </Badge>
                                  </div>
                                </div>

                                {t.transcriptSummary && (
                                  <div className="mt-4">
                                    <p className="font-medium text-muted-foreground mb-2">
                                      Summary
                                    </p>
                                    <div className="bg-card p-3 rounded-lg border">
                                      <p className="text-sm">
                                        {t.transcriptSummary}
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
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No training records found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
