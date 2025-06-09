import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function AddMemberDialog({ users, campaignId, onMembersAdded }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const filteredUsers = users.filter((user) =>
    `${user.firstname} ${user.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

const handleSelect = (user) => {
  setSelectedUsers((prev) => {
    const isSelected = prev.some(selectedUser => selectedUser.id === user.id);
    return isSelected
      ? prev.filter(selectedUser => selectedUser.id !== user.id)
      : [...prev, user];
  });
};

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one member to add");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: selectedUsers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add members');
      }

      const data = await response.json();
      
      toast.success(`Successfully added ${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} to the campaign`);
      
      // Reset form state
      setSelectedUsers([]);
      setSearchTerm("");
      setOpen(false);
      
      // Call callback if provided to refresh parent component
      if (onMembersAdded) {
        onMembersAdded(data);
      }
      
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error(error.message || 'Failed to add members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>

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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {searchTerm ? 'No members found matching your search' : 'No members available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelect(user)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user)}
                          onCheckedChange={() => handleSelect(user)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>
                              {user.firstname?.[0]}
                              {user.lastname?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {user.firstname} {user.lastname}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
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
              disabled={selectedUsers.length === 0 || loading}
            >
              {loading ? 'Adding...' : `Add ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""} Members`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}