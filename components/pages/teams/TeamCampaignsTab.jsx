// components/TeamCampaignsTab.jsx
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
  Megaphone,
  CalendarDays,
  Target,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  Activity,
  Eye,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export default function TeamCampaignsTab({ team, campaignData = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "active" | "paused" | "completed"
  const [filterType, setFilterType] = useState("all"); // "all" | "email" | "cold-call" | "social"
  const [expandedRows, setExpandedRows] = useState(new Set());

  /* ---------- derived data ---------- */
  const filtered = useMemo(() => {
    let res = campaignData || [];

    // search by campaign name
    if (search.trim()) {
      res = res.filter((campaign) =>
        campaign.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // status filter
    if (filterStatus !== "all") {
      res = res.filter((campaign) => campaign.status === filterStatus);
    }

    // type filter
    if (filterType !== "all") {
      res = res.filter((campaign) => campaign.type === filterType);
    }

    return res;
  }, [campaignData, search, filterStatus, filterType]);

  const avgConversionRate = useMemo(() => {
    return filtered.length
      ? (
          filtered.reduce((sum, campaign) => sum + (campaign.conversionRate || 0), 0) /
          filtered.length
        ).toFixed(1)
      : 0;
  }, [filtered]);

  const totalLeads = useMemo(() => {
    return filtered.reduce((sum, campaign) => sum + (campaign._count?.leads || 0), 0);
  }, [filtered]);

  const activeCampaigns = useMemo(() => {
    return filtered.filter(campaign => campaign.status === 'active').length;
  }, [filtered]);

  /* ---------- helpers ---------- */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      case 'draft': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="w-3 h-3" />;
      case 'paused': return <Calendar className="w-3 h-3" />;
      case 'completed': return <Target className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const toggleRowExpansion = (campaignId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterType("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Megaphone className="size-5 text-primary" /> Team Campaigns
          </h2>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Active</span>
              <Badge variant="outline" className="font-semibold">
                {activeCampaigns}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Total Leads
              </span>
              <Badge variant="outline" className="font-semibold">
                {totalLeads}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Avg Conversion
              </span>
              <Badge variant="outline" className="font-semibold">
                {avgConversionRate}%
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
                    placeholder="Search campaigns…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 md:w-60 pl-10 border-muted"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-auto bg-background/50">
                    <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 bg-background/50">
                    <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
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
                  <TableHead className="w-64 truncate">Campaign Name</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead className="w-24">Leads</TableHead>
                  <TableHead className="w-32">Conversion</TableHead>
                  <TableHead className="w-32">Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((campaign) => (
                  <React.Fragment key={campaign.id}>
                    <TableRow className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(campaign.id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.has(campaign.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-primary" />
                          <div>
                            <div className="font-medium truncate">
                              {campaign.name}
                            </div>
                            {campaign.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-48">
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusColor(campaign.status)} className="gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {campaign.type || 'Mixed'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {campaign._count?.leads || 0}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          {campaign.conversionRate || 0}%
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="w-3 h-3" />
                          {format(new Date(campaign.updatedAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded row content */}
                    {expandedRows.has(campaign.id) && (
                      <TableRow>
                        <TableCell colSpan="8" className="p-0">
                          <div className="p-4 bg-muted/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Campaign Overview */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Campaign Overview</h4>
                                </div>
                                <div className="bg-card p-3 rounded-lg border space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-muted-foreground">Start Date: </span>
                                      {campaign.startDate 
                                        ? format(new Date(campaign.startDate), "MMM d, yyyy")
                                        : '—'}
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">End Date: </span>
                                      {campaign.endDate 
                                        ? format(new Date(campaign.endDate), "MMM d, yyyy")
                                        : 'Ongoing'}
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Budget: </span>
                                      {campaign.budget ? `$${campaign.budget.toLocaleString()}` : '—'}
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Spent: </span>
                                      {campaign.spent ? `$${campaign.spent.toLocaleString()}` : '—'}
                                    </div>
                                  </div>
                                  {campaign.description && (
                                    <div className="pt-2 border-t border-border/50">
                                      <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Description: </span>
                                        {campaign.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Performance Metrics</h4>
                                </div>
                                <div className="bg-card p-3 rounded-lg border">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-primary">
                                        {campaign._count?.leads || 0}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Total Leads</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600">
                                        {campaign.conversions || 0}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Conversions</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {campaign.conversionRate || 0}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">Conversion Rate</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-orange-600">
                                        {campaign.costPerLead ? `$${campaign.costPerLead}` : '—'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Cost per Lead</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Team Members & Additional Details */}
                              <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  <h4 className="font-medium">Campaign Details</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Assigned Team Members */}
                                  {campaign.assignedMembers && campaign.assignedMembers.length > 0 && (
                                    <div className="bg-card p-3 rounded-lg border">
                                      <h5 className="font-medium mb-2">Assigned Members</h5>
                                      <div className="space-y-2">
                                        {campaign.assignedMembers.map((member, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <img
                                              src={member.imageUrl || '/default-avatar.png'}
                                              alt=""
                                              className="w-5 h-5 rounded-full"
                                            />
                                            {member.firstname} {member.lastname}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Campaign Goals */}
                                  {campaign.goals && (
                                    <div className="bg-card p-3 rounded-lg border">
                                      <h5 className="font-medium mb-2">Campaign Goals</h5>
                                      <div className="space-y-1 text-sm">
                                        {campaign.goals.map((goal, index) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <Target className="w-3 h-3 text-muted-foreground" />
                                            {goal}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Campaign Notes */}
                                {campaign.notes && (
                                  <div className="mt-4">
                                    <p className="font-medium text-muted-foreground mb-2">
                                      Campaign Notes
                                    </p>
                                    <div className="bg-card p-3 rounded-lg border">
                                      <p className="text-sm whitespace-pre-wrap">
                                        {campaign.notes}
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
                <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No campaigns found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}