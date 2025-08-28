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
  Microscope,
  Loader2,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import useSWR, { mutate } from "swr";
import { useUser } from "@clerk/nextjs";
import { Atom } from "lucide-react";
import AICallModal from "./AiCallModal";

export default function LeadsTable({
  selectedLead,
  onSelectLead,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSort,
  onShowDialer,
  onUpdateLead,
  orgId,
  showResearcher,
  setShowResearcher,
}) {
  const { user } = useUser();
  // swr fetcher
  const fetcher = async (url) => fetch(url).then((res) => res.json());
  const cacheKey =
    orgId && user?.id ? `/api/org/${orgId}/leads/user/${user.id}` : null;
  const { data: leads, error, isLoading } = useSWR(cacheKey, fetcher);
  const liveLead =
    leads?.find((l) => l.id === selectedLead?.id) ?? selectedLead;

  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showAiCallModal, setShowAiCallModal] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  const handleSaveLead = async (leadId, updatedData, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update lead");
      const updatedLead = await response.json();

      // 1. Optimistic update: patch the list in the cache
      mutate(
        cacheKey,
        (prevLeads) =>
          prevLeads?.map((l) => (l.id === leadId ? updatedLead : l)) ?? [],
        false // do NOT re-fetch yet
      );

      // 2. Background revalidation to guarantee the server copy is correct
      mutate(cacheKey);

      setEditDialogOpen(false);
      toast.success("Lead updated successfully");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
      throw error;
    }
  };

  const toggleActivityExpansion = (leadId) => {
    setExpandedLeadId(expandedLeadId === leadId ? null : leadId);
  };

  const onEmailLead = () => {
    setShowEmailDialog(true);
  };

  const handleEmailLead = async (leadId) => {
    console.log("email sent to lead");
  };

  const onEditLead = () => {
    setEditDialogOpen(true);
  };

  const onViewLead = (lead) => {
    onSelectLead(lead);
  };

  // Checkbox handlers
  const handleSelectLead = (leadId, checked) => {
    const newSelectedLeadIds = new Set(selectedLeadIds);
    if (checked) {
      newSelectedLeadIds.add(leadId);
    } else {
      newSelectedLeadIds.delete(leadId);
    }
    setSelectedLeadIds(newSelectedLeadIds);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeadIds(new Set(leads?.map((lead) => lead.id) || []));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const getSelectedLeads = () => {
    return leads?.filter((lead) => selectedLeadIds.has(lead.id)) || [];
  };

  const handleBatchAICall = () => {
    const selectedLeads = getSelectedLeads();
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }
    setShowAiCallModal(true);
  };

  const isAllSelected =
    leads && selectedLeadIds.size === leads.length && leads.length > 0;
  const isIndeterminate =
    selectedLeadIds.size > 0 && selectedLeadIds.size < (leads?.length || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching leads: {error.message}</div>;
  }

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

          {/* Batch AI Call Button */}
         <div className="flex  space-x-6 ">
            <Button
              onClick={handleBatchAICall}
              disabled={selectedLeadIds.size === 0}
             
            >
              <Users className="w-4 h-4" />
              Batch AI Call
              <Badge variant="secondary" >
                {selectedLeadIds.size}
              </Badge>
            </Button>

            {/* Selection Summary */}
            {selectedLeadIds.size > 0 && (
              <Button
                variant="outline"
                onClick={() => setSelectedLeadIds(new Set())}
              >
                Clear selection
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all leads"
                  className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                  {...(isIndeterminate && { "data-state": "indeterminate" })}
                />
              </TableHead>
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
              <TableHead className="hidden md:table-cell">Campaign</TableHead>
              <TableHead className="hidden md:table-cell">Website</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <React.Fragment key={lead.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-primary/50",
                    selectedLead?.id === lead.id
                      ? "bg-primary/25"
                      : selectedLeadIds.has(lead.id)
                      ? "bg-blue-50/50"
                      : "even:bg-muted/40"
                  )}
                  onClick={() => onSelectLead(lead)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLeadIds.has(lead.id)}
                      onCheckedChange={(checked) =>
                        handleSelectLead(lead.id, checked)
                      }
                      aria-label={`Select ${lead.name || "lead"}`}
                      className="ml-1"
                    />
                  </TableCell>
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
                  <TableCell onClick={() => onSelectLead(lead)}>
                    {lead.campaign?.name || "N/A"}
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
                              onSelectLead(lead); // set selected lead with full lead object
                              setShowResearcher(true); // open researcher panel
                            }}
                          >
                            <Microscope className="w-4 h-4 mr-2" />
                            Research Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                              setShowAiCallModal(true);
                            }}
                          >
                            <Atom className="w-4 h-4 mr-2" />
                            AI Call Lead
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
            {leads?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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
          lead={liveLead}
          onSave={handleSaveLead}
          orgId={orgId}
        />

        {/* AI Call Modal - Updated to handle both single lead and batch */}
        <AICallModal
          leads={
            showAiCallModal
              ? selectedLeadIds.size > 0
                ? getSelectedLeads()
                : [liveLead]
              : []
          }
          isOpen={showAiCallModal}
          onClose={() => {
            setShowAiCallModal(false);
            // Clear selection after batch call
            if (selectedLeadIds.size > 0) {
              setSelectedLeadIds(new Set());
            }
            mutate(cacheKey)
          }}
        />

        {/*  Email Dialog */}
        <EmailDialog
          lead={liveLead}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          onEmailSent={(template, email) => {
            toast.success(`Sent ${template.name} to ${email}`);
            console.log(`Sent ${template.name} to ${email}`);
          }}
        />
      </div>
    </>
  );
}
