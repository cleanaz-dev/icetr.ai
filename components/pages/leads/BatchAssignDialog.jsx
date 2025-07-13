"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function BatchAssignDialog({ leads, members, onAssign }) {
  const [quantity, setQuantity] = useState(50);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [assignTo, setAssignTo] = useState(null);
  const [filters, setFilters] = useState({
    region: null,
    industry: null,
    country: null,
    source: null,
  });

  // Reset assignTo so placeholder shows on member load
  useEffect(() => {
    setAssignTo(null);
  }, [members]);

  // Build dropdown choices to match filter keys
  const filterOptions = {
    region: [
      'all',
      ...Array.from(new Set(leads.map(l => l.region).filter(Boolean)))
    ],
    industry: [
      'all',
      ...Array.from(new Set(leads.map(l => l.industry).filter(Boolean)))
    ],
    country: [
      'all',
      ...Array.from(new Set(leads.map(l => l.country).filter(Boolean)))
    ],
    source: [
      'all',
      ...Array.from(new Set(leads.map(l => l.source).filter(Boolean)))
    ],
  };

  // Compute filtered leads based on current filters
  const filteredLeads = leads.filter(lead => {
    return (
      (filters.region === null || lead.region === filters.region) &&
      (filters.industry === null || lead.industry === filters.industry) &&
      (filters.country === null || lead.country === filters.country) &&
      (filters.source === null || lead.source === filters.source)
    );
  });





const handleAssign = async () => {
 
  
  const chosen = [...filteredLeads]
    .sort(() => Math.random() - 0.5)
    .slice(0, quantity)
    .map(l => l.id);

  setLoading(true)

  try {
    await onAssign(chosen, assignTo.id);
    toast.success(
      `Assigned ${chosen.length} leads to ${assignTo.firstname} ${assignTo.lastname}`
    );
    setOpen(false);
    resetDialogState();
  } catch (error) {
    toast.error('Failed to assign leads');
  } finally {
    setLoading(false)
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
  };


  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Batch Assign
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Assign Leads</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Quantity Input */}
          <div>
            <Label>Number of Leads</Label>
            <Input
              type="number"
              min={1}
              max={filteredLeads.length}
              value={quantity}
              onChange={e => setQuantity(Math.min(+e.target.value, filteredLeads.length))}
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(filterOptions).map(key => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key}</Label>
                <Select
                  value={filters[key] ?? 'all'}
                  onValueChange={val =>
                    setFilters(prev => ({
                      ...prev,
                      [key]: val === 'all' ? null : val,
                    }))
                  }
                  className="capitalize"
                  
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder={`All ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {filterOptions[key].map(opt => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt === 'all' ? `All ${key}` : opt}
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
            Showing {filteredLeads.length} of {leads.length} total leads
          </p>

          {/* Assign To */}
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select
              onValueChange={setAssignTo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {members.map(m => {
                    const name = `${m.firstname} ${m.lastname}`;
                    return (
                      <SelectItem key={m.id} value={m}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAssign}
            disabled={!assignTo || filteredLeads.length === 0 || loading}
            className="w-full"
          >
            {loading ? "Submitting..." : `Assign ${quantity} Leads`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
