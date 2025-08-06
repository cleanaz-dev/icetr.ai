"use client";
import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  Phone,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Edit,
  Mail,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants/frontend";
import LeadActivities from "./LeadActivities";
import EditLeadDialog from "./EditLeadDialog";
import EmailDialog from "./EmailDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LeadsTable({
  leads,
  selectedLead,
  calledLeadIds,
  onSelectLead,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  sortDirection,
  onSort,
  onShowDialer,
  onUpdateLead,  // New prop
  onSaveLead, 
  orgId   // New prop
}) {
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { refresh } = useRouter()

  const onEditLead = () => {
    setEditDialogOpen(true);
  };
  const onEmailLead = () => {
    setShowEmailDialog(true);
  };

  const handleEmailLead = async (leadId) => {
    console.log("email sent to lead")
  }

const handleSaveLead = async (leadId, updatedData, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }
      
      const updatedLead = await response.json();
      
      // Use the prop function to update state instead of refresh()
      onUpdateLead(leadId, updatedLead);
      
      // Close the edit dialog
      setEditDialogOpen(false);
      
      // Show success toast
      toast.success("Lead updated successfully");
      
      return updatedLead;
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
      throw error;
    }
  };

  const toggleActivityExpansion = (leadId) => {
    setExpandedLeadId(expandedLeadId === leadId ? null : leadId);
  };

  return (
    <>
      {/* Filters */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(LEAD_STATUSES).map((status) => (
                <SelectItem key={status} value={status}>
                  {LEAD_STATUSES[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-background ">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden md:table-cell">Website</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              {/* <TableHead
                className="hidden lg:table-cell cursor-pointer hover:bg-muted"
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <React.Fragment key={lead.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-primary/50 even:bg-muted/40",
                    selectedLead?.id === lead.id && "bg-primary/25"
                  )}
                >
                  <TableCell
                    className="font-medium"
                    onClick={() => onSelectLead(lead)}
                  >
                    <div className="flex items-center gap-2">
                      {lead.name || "Unknown"}
                      {/* {calledLeadIds.has(lead.id) && (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )} */}
                    </div>
                  </TableCell>
                  <TableCell
                    className="font-mono text-sm"
                    onClick={() => onSelectLead(lead)}
                  >
                    {lead.phoneNumber}
                  </TableCell>
                  <TableCell
                    className="hidden md:table-cell max-w-[200px] truncate"
                    onClick={() => onSelectLead(lead)}
                  >
                    {lead.company || "-"}
                  </TableCell>
                  <TableCell
                    className="hidden md:table-cell max-w-[150px] truncate"
                    onClick={() => onSelectLead(lead)}
                  >
                    {lead.website || "N/A"}
                  </TableCell>
                  <TableCell onClick={() => onSelectLead(lead)}>
                    <Badge
                      variant={
                        LEAD_STATUSES[lead.status]?.variant || "secondary"
                      }
                    >
                      {LEAD_STATUSES[lead.status]?.label || lead.status}
                    </Badge>
                  </TableCell>
                  {/* <TableCell
                    className="hidden lg:table-cell text-sm text-muted-foreground"
                    onClick={() => onSelectLead(lead)}
                  >
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="md:hidden block"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                          onShowDialer();
                        }}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={selectedLead?.id !== lead.id}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewLead(lead);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLead();
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmailLead(lead);
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActivityExpansion(lead.id);
                        }}
                      >
                        {expandedLeadId === lead.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedLeadId === lead.id && (
                  <LeadActivities leadId={lead.id} />
                )}
              </React.Fragment>
            ))}
            {leads.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Lead Dialog */}
        <EditLeadDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          lead={selectedLead}
          onSave={handleSaveLead}
          orgId={orgId}
        />

          {/*  Email Dialog */}
        <EmailDialog
          lead={selectedLead}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          onEmailSent={(template, email) => {
           toast.success(`Sent ${template.name} to ${email}`)
            console.log(`Sent ${template.name} to ${email}`);
          }}
        />
      </div>
    </>
  );
}
