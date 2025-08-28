// components/TeamMembersTab.jsx
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
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Shield,
  Target,
  Calendar,
  Phone,
  MapPin,
  Award,
  Activity,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeamMembersTab({ team, members = [] }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // "all" | "MANAGER" | "MEMBER" | "LEAD"
  const [expandedRows, setExpandedRows] = useState(new Set());

  console.log("members", members);

  /* ---------- derived data ---------- */
  const filtered = useMemo(() => {
    let res = members || [];

    // search by name or email
    if (search.trim()) {
      res = res.filter((member) => {
        const user = member.user;
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        return (
          fullName.includes(search.toLowerCase()) ||
          email.includes(search.toLowerCase())
        );
      });
    }

    // role filter
    if (filterRole !== "all") {
      res = res.filter((member) => member.teamRole === filterRole);
    }

    return res;
  }, [members, search, filterRole]);

  const roleStats = useMemo(() => {
    const stats = {
      total: filtered.length,
      managers: 0,
      members: 0,
      leads: 0,
    };

    filtered.forEach((member) => {
      switch (member.teamRole) {
        case "MANAGER":
          stats.managers++;
          break;
        case "LEAD":
          stats.leads++;
          break;
        case "MEMBER":
        default:
          stats.members++;
          break;
      }
    });

    return stats;
  }, [filtered]);

  const totalAssignedLeads = useMemo(() => {
    return filtered.reduce(
      (sum, member) => sum + (member.user._count?.assignedLeads || 0),
      0
    );
  }, [filtered]);

  /* ---------- helpers ---------- */
  const getRoleColor = (teamRole) => {
    switch (teamRole) {
      case "MANAGER":
        return "default";
      case "LEAD":
        return "secondary";
      case "MEMBER":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (teamRole) => {
    switch (teamRole) {
      case "MANAGER":
        return <Shield className="w-3 h-3" />;
      case "LEAD":
        return <UserCheck className="w-3 h-3" />;
      case "MEMBER":
        return <Users className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const toggleRowExpansion = (memberId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterRole("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Users className="size-5 text-primary" /> Team Members
          </h2>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {roleStats.total} member{roleStats.total !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Managers
              </span>
              <Badge variant="outline" className="font-semibold">
                {roleStats.managers}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Leads</span>
              <Badge variant="outline" className="font-semibold">
                {roleStats.leads}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Assigned Leads
              </span>
              <Badge variant="outline" className="font-semibold">
                {totalAssignedLeads}
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
                    placeholder="Search members…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 md:w-60 pl-10 border-muted"
                  />
                </div>

                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-auto bg-background/50">
                    <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="MANAGER">Managers</SelectItem>
                    <SelectItem value="LEAD">Team Leads</SelectItem>
                    <SelectItem value="MEMBER">Members</SelectItem>
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
                  <TableHead className="w-64 truncate">Member</TableHead>
                  <TableHead className="w-32">Team Role</TableHead>
                  
                  <TableHead className="w-32">Assigned Leads</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <React.Fragment key={member.id}>
                    <TableRow className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(member.id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.has(member.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.user.imageUrl || "/default-avatar.png"}
                            alt="profile-pic"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium">
                              {member.user.firstname} {member.user.lastname}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={getRoleColor(member.teamRole)}
                          className="gap-1"
                        >
                          {getRoleIcon(member.teamRole)}
                          {member.teamRole}
                        </Badge>
                      </TableCell>

                     

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-muted-foreground" />
                          {member.user._count?.assignedLeads || 0}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Activity className="w-3 h-3" />
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Expanded row content */}
                    {expandedRows.has(member.id) && (
                      <TableRow>
                        <TableCell colSpan="5" className="p-0">
                          <div className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Member Information */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">
                                    Member Information
                                  </h4>
                                </div>
                                <div className="bg-card p-3 rounded-lg border space-y-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        member.user.imageUrl ||
                                        "/default-avatar.png"
                                      }
                                      alt="profile-pic"
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                      <h5 className="font-medium">
                                        {member.user.firstname}{" "}
                                        {member.user.lastname}
                                      </h5>
                                      <p className="text-sm text-muted-foreground">
                                        {member.user.email}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/50">
                                    <div>
                                      <span className="font-medium text-muted-foreground">
                                        Team Role:{" "}
                                      </span>
                                      <Badge
                                        variant={getRoleColor(member.teamRole)}
                                        className="gap-1 ml-1"
                                      >
                                        {getRoleIcon(member.teamRole)}
                                        {member.teamRole}
                                      </Badge>
                                    </div>
                                    <div>
                                      {/* <span className="font-medium text-muted-foreground">
                                        Member ID:{" "}
                                      </span>
                                      <span className="font-mono text-xs">
                                        {member.id}
                                      </span> */}
                                    </div>
                                  </div>

                                  {/* Contact Information */}
                                  {(member.user.phone ||
                                    member.user.location) && (
                                    <div className="pt-2 border-t border-border/50">
                                      <div className="space-y-2 text-sm">
                                        {member.user.phone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <span>{member.user.phone}</span>
                                          </div>
                                        )}
                                        {member.user.location && (
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                            <span>{member.user.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Performance & Activity */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">
                                    Performance Overview
                                  </h4>
                                </div>
                                <div className="bg-card p-3 rounded-lg border">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-primary">
                                        {member.user._count?.assignedLeads || 0}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Assigned Leads
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600">
                                        {member.user._count?.call ||
                                          0}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Total Calls
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {member.user._count?.activeCampaigns ||
                                          0}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Active Campaigns
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-orange-600">
                                        {member.user.performanceScore || "—"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Performance Score
                                      </div>
                                    </div>
                                  </div>
                                </div>
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
                <p>No team members found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
