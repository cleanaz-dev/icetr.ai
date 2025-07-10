"use client";
import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";

export function EnhancedLeadsTable({
  leads,
  team,
  members,
  statusOptions,
  sourceOptions,
  onAssignComplete,
  onUnassignComplete,
  refreshLeads,
  getStatusBadge,
  UserDisplay,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter leads based on all criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchTerm ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      const matchesSource =
        sourceFilter === "all" || lead.source === sourceFilter;
      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "unassigned" && !lead.assignedUser) ||
        (assignmentFilter === "assigned" && lead.assignedUser);

      return (
        matchesSearch && matchesStatus && matchesSource && matchesAssignment
      );
    });
  }, [leads, searchTerm, statusFilter, sourceFilter, assignmentFilter]);

  // Selection logic
  const allSelected =
    selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0;
  const someSelected =
    selectedLeadIds.length > 0 && selectedLeadIds.length < filteredLeads.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeadIds(filteredLeads.map((lead) => lead.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleLeadToggle = (leadId, checked) => {
    if (checked) {
      setSelectedLeadIds((prev) => [...prev, leadId]);
    } else {
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  // Assignment logic
  const handleBulkAssign = async () => {
    if (!selectedAssigneeId || selectedLeadIds.length === 0) return;

    setIsAssigning(true);
    try {
      // Your assignment API call here
      await onAssignComplete({
        leadIds: selectedLeadIds,
        assigneeId: selectedAssigneeId,
      });

      // Clear selection after successful assignment
      setSelectedLeadIds([]);
      setSelectedAssigneeId("");
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedLeadIds.length === 0) return;

    setIsAssigning(true);
    try {
      await onUnassignComplete({
        leadIds: selectedLeadIds,
      });

      setSelectedLeadIds([]);
    } catch (error) {
      console.error("Unassignment failed:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Management</CardTitle>
        <CardDescription>Filter and manage your sales leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-6">
          {/* Search bar and bulk actions */}
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

            {/* Selection Summary */}
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

            <Select
              value={assignmentFilter}
              onValueChange={setAssignmentFilter}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
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
          {/* Bulk Assignment Section */}
          <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50 justify-evenly">
            <span className="text-sm font-medium">
              {selectedLeadIds.length} selected
            </span>
            <Select
              value={selectedAssigneeId}
              onValueChange={setSelectedAssigneeId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center space-x-2">
                      {member.imageUrl && (
                        <img
                          src={member.imageUrl}
                          alt={`${member.firstname} ${member.lastname}`}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>
                        {member.firstname} {member.lastname}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleBulkAssign}
              disabled={!selectedAssigneeId || isAssigning}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Assign
            </Button>
            <Button
              onClick={handleBulkUnassign}
              disabled={isAssigning}
              variant="outline"
              size="sm"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Unassign
            </Button>
           
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(!allSelected)}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
             <Button
              onClick={() => setSelectedLeadIds([])}
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="flex text-xs text-muted-foreground">
          <span>
            Showing {filteredLeads.length} of {leads.length} leads
          </span>
        </div>
        {/* Leads Table */}
        <div className="rounded-md border h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20px]">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="w-[150px]">Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeadIds.includes(lead.id)}
                        onCheckedChange={(checked) =>
                          handleLeadToggle(lead.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">
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
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {searchTerm || filtersApplied
                          ? "No matching leads found"
                          : "No leads available"}
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        {searchTerm || filtersApplied
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by adding your first lead"}
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Lead
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
