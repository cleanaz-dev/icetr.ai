import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddTeamMemberTable({ teamId, members, onClose }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

const unassignedFilteredMembers = members
  .filter(member => member.assigned === null)
  .filter((member) =>
    `${member.firstname} ${member.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Fixed handleSelect function - now works with member objects consistently
  const handleSelect = (member) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some(selectedMember => selectedMember.id === member.id);
      return isSelected
        ? prev.filter(selectedMember => selectedMember.id !== member.id)
        : [...prev, member];
    });
  };

  // Helper function to check if a member is selected
  const isSelected = (member) => {
    return selectedMembers.some(selectedMember => selectedMember.id === member.id);
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member to add");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: selectedMembers
        })
      });

      if (!response.ok) {
        const { message } = await response.json();
        toast.error(message || 'Failed to add members');
        return;
      }

      const data = await response.json();
      
      toast.success(`Successfully added ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} to the team`);
      
      // Reset form state
      setSelectedMembers([]);
      setSearchTerm("");
      
      // Call onClose to close the dialog
      onClose();
      
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error(error.message || 'Failed to add members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedMembers([]);
    setSearchTerm("");
  };


  return (
    <div className="space-y-4">
      <Input
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ScrollArea className="h-72 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unassignedFilteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {searchTerm ? 'No members found matching your search' : 'No members available'}
                </TableCell>
              </TableRow>
            ) : (
              unassignedFilteredMembers.map((member) => (
                <TableRow 
                  key={member.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected(member) 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelect(member)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected(member)}
                      onCheckedChange={() => handleSelect(member)}
                      className="cursor-pointer"
                      onClick={(e) => e.stopPropagation()} // Prevent double-firing from row click
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback>
                          {member.firstname?.[0]}
                          {member.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {member.firstname} {member.lastname}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleAddMembers}
          disabled={selectedMembers.length === 0 || loading}
        >
          {loading ? 'Adding...' : `Add ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""} Members`}
        </Button>
      </div>
    </div>
  );
}