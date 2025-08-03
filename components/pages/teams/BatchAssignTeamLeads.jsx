"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-og";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTeamContext } from "@/context/TeamProvider";
import Image from "next/image";
import { useLeads } from "@/context/LeadsProvider";

export function BatchAssignTeamLeads({
  leads = [],
  onAssignLeads,
  teamId,
  orgId,
  onSuccess,
}) {
  const { getTeamMembersByTeamId } = useTeamContext();

  const members = getTeamMembersByTeamId(teamId);

  const [quantity, setQuantity] = useState(50);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignTo, setAssignTo] = useState(null);
  const [activeTab, setActiveTab] = useState("batch");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [specificAssignTo, setSpecificAssignTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useUser();

  // Batch assign filters
  const [filters, setFilters] = useState({
    region: null,
    industry: null,
    country: null,
    source: null,
  });



  const filterOptions = {
    region: [
      "all",
      ...Array.from(new Set(leads.map((l) => l.region).filter(Boolean))),
    ],
    industry: [
      "all",
      ...Array.from(new Set(leads.map((l) => l.industry).filter(Boolean))),
    ],
    country: [
      "all",
      ...Array.from(new Set(leads.map((l) => l.country).filter(Boolean))),
    ],
    source: [
      "all",
      ...Array.from(new Set(leads.map((l) => l.source).filter(Boolean))),
    ],
  };

  // Compute filtered leads based on current filters (for batch assign)
  const batchFilteredLeads = leads.filter((lead) => {
    return (
      (filters.region === null || lead.region === filters.region) &&
      (filters.industry === null || lead.industry === filters.industry) &&
      (filters.country === null || lead.country === filters.country) &&
      (filters.source === null || lead.source === filters.source)
    );
  });

  // Filter and paginate leads for specific assign tab
  const specificFilteredLeads = useMemo(() => {
    return leads.filter(
      (lead) =>
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const totalPages = Math.ceil(specificFilteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = specificFilteredLeads.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleLeadSelection = (leadId, checked) => {
    if (checked) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  // Updated select all handler to work with filtered leads
  const handleSelectAll = (checked) => {
    if (checked) {
      const allFilteredIds = specificFilteredLeads.map((lead) => lead.id);
      setSelectedLeads((prev) => [...new Set([...prev, ...allFilteredIds])]);
    } else {
      const filteredIds = new Set(specificFilteredLeads.map((lead) => lead.id));
      setSelectedLeads((prev) => prev.filter((id) => !filteredIds.has(id)));
    }
  };

  // Check if all filtered leads are selected
  const allFilteredSelected =
    specificFilteredLeads.length > 0 &&
    specificFilteredLeads.every((lead) => selectedLeads.includes(lead.id));

  const handleSpecificAssign = async () => {
    if (!specificAssignTo || selectedLeads.length === 0) return;
    const action = "specific";
    setLoading(true);

    try {
      const result = await onAssignLeads({
        leadIds: selectedLeads,
        assignToId: specificAssignTo,
        orgId: orgId,
        teamId: teamId,
        action: action,
      });

      if (typeof onSuccess !== "function") {
        throw new Error("onSuccess is not a function");
      }
      onSuccess(orgId);
      toast.success(result.message || " Leads Assigned!");
      setOpen(false);
      resetDialogState();
    } catch (error) {
      console.error("Failed to assign leads:", error);
      toast.error("Failed to assign leads");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async () => {
    const chosen = [...batchFilteredLeads]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantity)
      .map((l) => l.id);
    const action = "batch";
    setLoading(true);
    try {
      const result = await onAssignLeads(
        chosen,
        assignTo.id,
        user.id,
        orgId,
        teamId,
        action
      );
      toast.success(result.message || "Leads assigned successfully!");
      setOpen(false);
      resetDialogState();
    } catch (error) {
      toast.error("Failed to assign leads");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpenChange = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      resetDialogState();
    }
  };

  const resetDialogState = () => {
    setFilters({
      region: null,
      industry: null,
      country: null,
      source: null,
    });
    setQuantity(50);
    setAssignTo(null);
    setSelectedLeads([]);
    setSpecificAssignTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghostMuted">Assign Leads</Button>
      </DialogTrigger>

      <DialogContent className="min-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>Assign your team leads</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch">Batch Assign</TabsTrigger>
            <TabsTrigger value="specific">Individual Leads</TabsTrigger>
          </TabsList>

          {/* Batch Assign Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-4">
              {/* Quantity Input */}
              <div className="space-y-2">
                <Label>Number of Leads</Label>
                <Input
                  type="number"
                  min={1}
                  max={batchFilteredLeads.length}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(+e.target.value, batchFilteredLeads.length)
                    )
                  }
                />
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(filterOptions).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <Select
                      value={filters[key] ?? "all"}
                      onValueChange={(val) =>
                        setFilters((prev) => ({
                          ...prev,
                          [key]: val === "all" ? null : val,
                        }))
                      }
                      className="capitalize"
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder={`All ${key}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {filterOptions[key].map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="capitalize"
                            >
                              {opt === "all" ? `All ${key}` : opt}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Live count */}
              <p className="text-sm text-muted-foreground">
                Showing {batchFilteredLeads.length} of {leads.length} total
                leads
              </p>
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map(({ user }) => {
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={user.imageUrl}
                              alt={user.fullname}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                            <span>{user.fullname}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                onClick={handleBatchAssign}
                disabled={
                  !assignTo || batchFilteredLeads.length === 0 || loading
                }
                className="w-full"
              >
                {loading ? "Submitting..." : `Assign ${quantity} Leads`}
              </Button>
            </div>
          </TabsContent>

          {/* Specific Leads Tab */}
          <TabsContent value="specific" className="space-y-4">
            <div className="space-y-4">
              {/* Lead Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Leads ({selectedLeads.length} selected)</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={allFilteredSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      Select All{" "}
                      {searchQuery &&
                        `(${specificFilteredLeads.length} filtered)`}
                    </Label>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search leads by company or source..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Results Info */}
                {searchQuery && (
                  <div className="text-sm text-muted-foreground">
                    {specificFilteredLeads.length} of {leads.length} leads found
                  </div>
                )}

                <ScrollArea className=" border rounded-md p-2">
                  <div className="space-y-2">
                    {paginatedLeads.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        {searchQuery
                          ? "No leads found matching your search."
                          : "No leads available."}
                      </div>
                    ) : (
                      paginatedLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center space-x-3 px-2 py-1 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox
                            id={lead.id}
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) =>
                              handleLeadSelection(lead.id, checked)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-xs">{lead.company}</div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {lead.source}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Pagination */}
                {specificFilteredLeads.length > itemsPerPage && (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      {Math.min(startIndex + 1, specificFilteredLeads.length)}{" "}
                      to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        specificFilteredLeads.length
                      )}{" "}
                      of {specificFilteredLeads.length} leads
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        {/* Page 1 button (show if not current page) */}
                        {currentPage !== 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="min-w-8"
                          >
                            1
                          </Button>
                        )}

                        {/* Current page button */}
                        <Button variant="default" size="sm" className="min-w-8">
                          {currentPage}
                        </Button>

                        {/* Ellipsis if there are pages between current and last */}
                        {currentPage < totalPages - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}

                        {/* Last page button (show if not current page) */}
                        {currentPage !== totalPages && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="min-w-8"
                          >
                            {totalPages}
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assign To Selection */}
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select
                value={specificAssignTo}
                onValueChange={setSpecificAssignTo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((member) => {
                      return (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={member.user?.imageUrl}
                              alt={member.user?.fullname}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                            <span>{member.user?.fullname}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSpecificAssign}
                disabled={
                  !specificAssignTo || selectedLeads.length === 0 || loading
                }
                className="w-full"
              >
                {loading
                  ? "Submitting..."
                  : `Assign ${selectedLeads.length} Selected Leads`}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
