"use client";
import {
  Trophy,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Play,
  Pause,
  Trash2,
  Calendar,
  Users,
  Target,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
  Award
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateCampaignDialog from "./CreateCampaignDialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CampaignStatsCard from "./CampaignStatsCard";


export default function CampaignsPage({ campaigns = [] }) {
  const { refresh } = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Status options for filtering (matching your data structure)
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

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
      Active: { variant: "default", className: "bg-green-100 text-green-800" },
      Paused: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800",
      },
      Completed: { variant: "outline", className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status] || statusConfig["Draft"];

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

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
  const updateCampaignStatus = (campaignId, newStatus) => {
    // Implement your status update logic here
    console.log(`Updating campaign ${campaignId} to ${newStatus}`);
    // You might want to call an API here and then refresh
  };

  // Delete campaign
  const deleteCampaign = (campaignId) => {
    // Implement your delete logic here
    console.log(`Deleting campaign ${campaignId}`);
    // You might want to call an API here and then refresh
  };

  return (
    <div className=" px-4 py-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="border-2 border-primary p-2 rounded-full">
          <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          {/* <Badge>
            {campaigns.length} active
          </Badge> */}
        </div>
      </header>

      {/* Stats Cards */}
     <CampaignStatsCard campaigns={campaigns} />

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
                      
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {campaign.id.slice(-8)}
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
                    <TableCell>
                     {campaign.status}
                    </TableCell>
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
                        <span>{campaign.users?.length || 0}</span>
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
                            <Link href={`/campaigns/${campaign.id}`} className="flex gap-2 items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                         
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Campaign
                         
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {campaign.status === "Active" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateCampaignStatus(campaign.id, "Paused")
                              }
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Campaign
                            </DropdownMenuItem>
                          ) : campaign.status === "Draft" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateCampaignStatus(campaign.id, "Active")
                              }
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Campaign
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                updateCampaignStatus(campaign.id, "Active")
                              }
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume Campaign
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Campaign
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteCampaign(campaign.id)}
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
