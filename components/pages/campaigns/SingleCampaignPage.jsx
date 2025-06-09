"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Mail,
  Phone,
  MessageSquare,
  Settings,
  Edit,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImportLeadsDialog from "../leads/ImportLeadsDialog";
import {
  MdOutlineAssignmentInd,
  MdEmail,
  MdMeetingRoom,
  MdLocalPhone,
  MdOutlineNoteAlt,
  MdOutlineSms,
  MdOutlineVoicemail,
  MdCallMissed
} from "react-icons/md";
import AddMemberDialog from "./AddMemberDialog";

export default function SingleCampaignPage({ campaign, orgUsers }) {

  const router = useRouter();

  const [leads, setLeads] = useState(campaign.leads);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: {
        variant: "default",
        icon: CheckCircle,
        color: "text-green-600",
      },
      Draft: { variant: "secondary", icon: Clock, color: "text-gray-600" },
      Paused: { variant: "outline", icon: Pause, color: "text-yellow-600" },
      Completed: {
        variant: "secondary",
        icon: CheckCircle,
        color: "text-blue-600",
      },
      Cancelled: {
        variant: "destructive",
        icon: XCircle,
        color: "text-red-600",
      },
    };

    const config = statusConfig[status] || statusConfig.Draft;
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <Badge variant={config.variant}>{status}</Badge>
      </div>
    );
  };


  const getLastActivityDisplay = (activities) => {
    if (!activities || activities.length === 0) {
      return "No activity";
    }

    const latest = activities[activities.length - 1];

    const statusConfig = {
      ASSIGNMENT: {
        icon: MdOutlineAssignmentInd,
        color: "text-primary",
      },
      EMAIL: {
        icon: MdEmail,
        color: "text-primary",
      },
      MEETING: {
        icon: MdMeetingRoom,
        color: "text-primary",
      },
      CALL: {
        icon: MdLocalPhone,
        color: "text-primary",
      },
      NOTE: {
        icon: MdOutlineNoteAlt,
        color: "text-primary",
      },
      SMS: {
        icon: MdOutlineSms,
        color: "text-primary",
      },
      VOICEMAIL: {
        icon: MdOutlineVoicemail,
        color: "text-primary",
      },
      MISSED_CALL: {
        icon: MdCallMissed,
        color: "text-primary"
      }
    };

    const config = statusConfig[latest.type];

    if (!config) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <span className="h-3 w-3 rounded-full bg-gray-300" />
          <Badge variant="secondary">{latest.type || "Unknown"}</Badge>
          <span className="text-sm">{formatDate(latest.createdAt)}</span>
        </div>
      );
    }

    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <Icon className={`size-5 ${config.color}`} />
        <Badge>{latest.type}</Badge>
        <span className="text-muted-foreground text-xs">
          {formatDate(latest.createdAt)}
        </span>
      </div>
    );
  };

  const getLeadStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: "secondary", color: "bg-blue-100 text-blue-800" },
      contacted: { variant: "outline", color: "bg-yellow-100 text-yellow-800" },
      qualified: { variant: "default", color: "bg-green-100 text-green-800" },
      converted: { variant: "default", color: "bg-purple-100 text-purple-800" },
      rejected: { variant: "destructive", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.new;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const updateCampaignStatus = (newStatus) => {
    setCampaign((prev) => ({ ...prev, status: newStatus }));
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      // lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Campaign not found</h3>
          <p className="text-muted-foreground">
            The campaign you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <p className="text-muted-foreground">
                {campaign.organization.name} • Created{" "}
                {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(campaign.status)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Campaign Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaign.status === "Active" ? (
                <DropdownMenuItem
                  onClick={() => updateCampaignStatus("Paused")}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => updateCampaignStatus("Active")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col h-full">
          {" "}
          {/* Add flex-col and h-full */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-auto">
            {" "}
            {/* Add mt-auto to push content down */}
            <div className="text-2xl font-bold">{campaign.leads.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-auto">
            {/* <div className="text-2xl font-bold">{campaign.metrics.conversionRate}%</div> */}
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="text-2xl font-bold">
              {formatCurrency(campaign.spent)}
            </div>
            <Progress
              value={(campaign.spent / campaign.budget) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(campaign.budget - campaign.spent)} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Pick Up Rate</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-auto">
            {/* <div className="text-2xl font-bold">{campaign.metrics.openRate}%</div> */}
            <p className="text-xs text-muted-foreground">Industry avg: 21.3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign Leads</CardTitle>
                  <CardDescription>
                    Manage and track leads for this campaign
                  </CardDescription>
                </div>
                <ImportLeadsDialog
                  campaignId={campaign.id}
                  onImportComplete={(data) => {
                    // Refresh your leads list or update state
                    console.log(`Imported ${data.count} leads`);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Proposal</SelectItem>
                    <SelectItem value="rejected">Won</SelectItem>
                    <SelectItem value="rejected">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leads Table */}
              <div className="rounded-md border ">
                <div className="h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        {/* <TableHead>Score</TableHead> */}
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {lead.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {lead.company}
                          </TableCell>
                          <TableCell>
                            {getLeadStatusBadge(lead.status)}
                          </TableCell>
                          {/* <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={lead.score}
                                className="w-16 h-2"
                              />
                              <span className="text-sm font-medium">
                                {lead.score}
                              </span>
                            </div>
                          </TableCell> */}

                          <TableCell>
                            {getLastActivityDisplay(lead.activities)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Call Lead
                              </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign Team</CardTitle>
                  <CardDescription>
                    Team members assigned to this campaign
                  </CardDescription>
                </div>
                <AddMemberDialog
                  users={orgUsers}
                  campaignId={campaign.id}
                  onMembersAdded={() => {
                    router.refresh(); 
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.users?.map(
                  (
                    { user } // Destructure the user object
                  ) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>
                            {user.firstname?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email || "No email"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {user._count.assignedLeads || 0} leads
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Assigned
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pick Up Rate</span>
                  {/* <span className="font-medium">{campaign.metrics.openRate}%</span> */}
                </div>
                {/* <Progress value={campaign.metrics.openRate} /> */}

                <div className="flex justify-between items-center">
                  <span>Click Rate</span>
                  {/* <span className="font-medium">{campaign.metrics.clickRate}%</span> */}
                </div>
                {/* <Progress value={campaign.metrics.clickRate} /> */}

                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  {/* <span className="font-medium">{campaign.metrics.conversionRate}%</span> */}
                </div>
                {/* <Progress value={campaign.metrics.conversionRate} /> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Start Date
                    </span>
                    {/* <span className="text-sm font-medium">{formatDate(campaign.startDate)}</span> */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      End Date
                    </span>
                    {/* <span className="text-sm font-medium">{formatDate(campaign.endDate)}</span> */}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>
                    <span className="text-sm font-medium">60 days</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Days Remaining
                    </span>
                    <span className="text-sm font-medium">25 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        {/* <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>
                Configure campaign parameters and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input value={campaign.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Type</label>
                  <Select value={campaign.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget</label>
                  <Input type="number" value={campaign.budget} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={campaign.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border border-input rounded-md"
                  value={campaign.description}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
