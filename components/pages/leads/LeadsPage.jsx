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
import { EnhancedLeadsTable } from "./EnhancedLeadsTable";
import { EnhancedLeadsTableTanStack } from "./EnhancedLeadsTableTanStack";

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

export default function LeadsPage({ data, members = [], team }) {
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
          <div className="border-2 p-2 border-primary rounded-full">
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
      {/* <EnhancedLeadsTable
        leads={leads}
        members={members}
        team={team}
        UserDisplay={UserDisplay}
        statusOptions={statusOptions}
        sourceOptions={sourceOptions}
        onAssignComplete={() => console.log("test")}
        onUnassignComplete={() => console.log("test")}
        refreshLeads={refreshLeads}
        getStatusBadge={getStatusBadge}
      /> */}

      <EnhancedLeadsTableTanStack
        leads={leads}
        team={team}
        members={members}
        statusOptions={statusOptions}
        sourceOptions={sourceOptions}
        onAssignComplete={() => console.log("test")}
        onUnassignComplete={() => console.log("test")}
        refreshLeads={refreshLeads}
        getStatusBadge={getStatusBadge}
        UserDisplay={UserDisplay}
      />

      <LeadDetailsModal />
    </div>
  );
}
