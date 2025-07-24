"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import React from "react";
import CreateCampaignDialog from "./CreateCampaignDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Eye,
  Phone,
  Mail,
  Users,
  Pause,
  Play,
  Calendar,
  Trash2,
  Trophy,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CampaignsTable({
  campaigns = [],
  onEdit,
  onStatus,
  onDelete,
}) {
  const { refresh } = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Active", label: "Active" },
    { value: "Paused", label: "Paused" },
    { value: "Completed", label: "Completed" },
  ];

  // Type options for filtering
  const typeOptions = [
    { value: "calls", label: "Calls" },
    { value: "emails", label: "Emails" },
    { value: "sms", label: "SMS" },
  ];

  // Filter campaigns based on search, status, and type
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.organization?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get type badge/icon
  const getTypeIcon = (type) => {
    const typeConfig = {
      calls: { icon: Phone, color: "text-blue-600" },
      emails: { icon: Mail, color: "text-green-600" },
      sms: { icon: Users, color: "text-purple-600" },
    };

    const config = typeConfig[type] || typeConfig.calls;
    const IconComponent = config.icon;

    return <IconComponent className={`h-4 w-4 ${config.color}`} />;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Update campaign status
  const updateCampaignStatus = async (campaignId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaignId,
          newStatus: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optional: parse response if needed
      const data = await response.json();

      toast.success(`Updated status to ${newStatus}`);

      // Refresh data or update local state here
      // For example: await fetchCampaigns() or setCampaigns(...)
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete campaign
  const deleteCampaign = (campaignId) => {
    // Implement your delete logic here
    console.log(`Deleting campaign ${campaignId}`);
    // You might want to call an API here and then refresh
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <span>Campaigns Management</span>
          </CardTitle>
          <CardDescription>
            Manage and monitor your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateCampaignDialog onSuccess={refresh} />
          </div>

          {/* Campaigns Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {campaign?.name?.charAt(0).toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {campaign.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(campaign.type)}
                        <Badge variant="outline" className="capitalize">
                          {campaign.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.status}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {campaign.organization?.name || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {campaign.organization?.country || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.team?.members.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                    <TableCell>{formatDate(campaign.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className="flex gap-2 items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(campaign)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {campaign.status === "Active" ? (
                            <DropdownMenuItem
                              onClick={() => onStatus(campaign, "Paused")}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Campaign
                            </DropdownMenuItem>
                          ) : campaign.status === "Draft" ? (
                            <DropdownMenuItem
                              onClick={() => onStatus(campaign, "Active")}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Campaign
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onStatus(campaign, "Active")}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume Campaign
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(campaign)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {campaigns.length === 0
                  ? "No campaigns yet"
                  : "No campaigns found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {campaigns.length === 0
                  ? "Get started by creating your first marketing campaign"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
