"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AssignLeadsDialog({ 
  leads, 
  users, // Array of users to assign to
  onAssignComplete 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Reset selections when dialog closes
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setSelectedLeadIds([]);
      setSelectedUserId("");
    }
  };

  // Handle individual lead selection
  const handleLeadToggle = (leadId, checked) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, leadId]);
    } else {
      setSelectedLeadIds(prev => prev.filter(id => id !== leadId));
    }
  };

  // Handle select all/none
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeadIds(leads.map(lead => lead.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to assign leads to");
      return;
    }

    if (selectedLeadIds.length === 0) {
      toast.error("Please select at least one lead to assign");
      return;
    }

    setIsAssigning(true);
    
    try {
      const response = await fetch("/api/leads/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          assignedUserId: selectedUserId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Successfully assigned ${selectedLeadIds.length} leads`);
        setIsOpen(false);
        onAssignComplete?.(result);
      } else {
        toast.error(result.error || "Failed to assign leads");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign leads");
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedUser = users?.find(user => user.id === selectedUserId);
  const selectedLeads = leads.filter(lead => selectedLeadIds.includes(lead.id));
  const allSelected = selectedLeadIds.length === leads.length && leads.length > 0;
  const someSelected = selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>
            Select leads to assign to a team member
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 min-h-0">
          {/* Lead Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Select Leads:</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm text-muted-foreground">
                  Select All ({leads.length})
                </label>
              </div>
            </div>
            
            <ScrollArea className="h-96 border rounded-md p-2">
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-sm">
                    <Checkbox
                      id={`lead-${lead.id}`}
                      checked={selectedLeadIds.includes(lead.id)}
                      onCheckedChange={(checked) => handleLeadToggle(lead.id, checked)}
                    />
                    <div className="flex-1 min-w-0 max-w-96">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {lead.phoneNumber}
                          </p>
                          {lead.company && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lead.company}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant="secondary" className="text-xs">
                            {lead.status}
                          </Badge>
                          {lead.assignedUser && (
                            <Badge variant="outline" className="text-xs">
                              {lead.assignedUser.firstname}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* User Selection */}
          {selectedLeadIds.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assign to:
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        {user.imageUrl && (
                          <img 
                            src={user.imageUrl} 
                            alt={`${user.firstname} ${user.lastname}`}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>{user.firstname} {user.lastname}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignment Summary */}
          {selectedUser && selectedLeadIds.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm">
                <span className="font-medium">Assigning to:</span> {selectedUser.firstname} {selectedUser.lastname}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''} will be assigned
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedLeadIds.length} of {leads.length} leads selected
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedUserId || selectedLeadIds.length === 0 || isAssigning}
            >
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign {selectedLeadIds.length} Lead{selectedLeadIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}