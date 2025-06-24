"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Filter,
  Download,
  Upload,
  TrendingUp,
  Users,
  DollarSign,
  Target,
} from "lucide-react";
import { mockLeads } from "@/lib/constants/backend";
import { Users2 } from "lucide-react";
import AssignLeadsDialog from "./AssignLeadsDialog";
import UnassignLeadsDialog from "./UnassignLeadsDialog";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "New", label: "New", color: "bg-blue-500" },
  { value: "Contacted", label: "Contacted", color: "bg-yellow-500" },
  { value: "Qualified", label: "Qualified", color: "bg-purple-500" },
  { value: "Proposal", label: "Proposal", color: "bg-orange-500" },
  { value: "Won", label: "Closed Won", color: "bg-green-500" },
  { value: "Lost", label: "Closed Lost", color: "bg-red-500" },
];

const sourceOptions = [
  "All Sources",
  "Website",
  "LinkedIn",
  "Referral",
  "Google Ads",
  "Cold Email",
];

export default function LeadsPage({ data, users = [] }) {
  const [leads, setLeads] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { refresh } = useRouter();

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      // lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesSource =
      sourceFilter === "All Sources" || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <Badge
        variant="secondary"
        className={`${statusConfig?.color} text-white`}
      >
        {statusConfig?.label}
      </Badge>
    );
  };

  const updateLeadStatus = (leadId, newStatus) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const deleteLead = (leadId) => {
    setLeads(leads.filter((lead) => lead.id !== leadId));
  };

  const LeadDetailsModal = () => (
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>
            View and manage lead information
          </DialogDescription>
        </DialogHeader>
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{selectedLead.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Company</Label>
                <p className="text-sm">{selectedLead.company}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{selectedLead.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm">{selectedLead.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <p className="text-sm">{selectedLead.source}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Value</Label>
                <p className="text-sm">
                  ${selectedLead.value.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedLead.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Assigned To</Label>
                <p className="text-sm">{selectedLead.assignedTo}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <p className="text-sm mt-1 p-3 bg-muted rounded">
                {selectedLead.notes}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const UserDisplay = ({ user }) => {
    if (!user) return "Unassigned";

    // Create initials from first and last name
    const initials = `${user.firstname?.[0] || ""}${
      user.lastname?.[0] || ""
    }`.toUpperCase();

    return (
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage
            src={user.imageUrl}
            alt={`${user.firstname} ${user.lastname}`}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span>
          {user.firstname} {user.lastname}
        </span>
      </div>
    );
  };

  const refreshLeads = async () => {
  const res = await fetch("/api/leads");
  const updatedLeads = await res.json();
  setLeads(updatedLeads);
};

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <header className="">
        <div className="flex items-center gap-2">
          <div className="border border-2 p-2 border-primary rounded-full">
            <Users2 className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and track your sales leads
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualified}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Management</CardTitle>
          <CardDescription>Filter and manage your sales leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            {/* Search bar and Assign button */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <AssignLeadsDialog
                leads={leads}
                users={users}
                onAssignComplete={(result) => {
                  refresh();
                  console.log("Assignment complete:", result);
                }}
              />
              <UnassignLeadsDialog
                leads={leads}
                users={users}
                onComplete={refreshLeads}
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
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
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="rounded-md border h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>

                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {/* <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar> */}
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lead.company}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{lead.industry}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>

                    <TableCell>
                      <UserDisplay user={lead.assignedUser} />
                    </TableCell>
                    <TableCell>{lead.lastContact}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                          // onClick={() => {
                          //   setSelectedLead(lead);
                          //   setIsDetailsOpen(true);
                          // }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Meeting
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                          // onClick={() => deleteLead(lead.id)}
                          // className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailsModal />
    </div>
  );
}
