import { useTeamContext } from "@/context/TeamProvider";
import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPen } from "lucide-react";
import { toast } from "sonner";
import { TEAM_ROLES } from "@/lib/config/team-config";

export default function EditMemberRoleDialog({
  member,
  teamId,
  onEditMemberRole,
  memberId,
}) {
  const { orgId, getTeamRole} = useTeamContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("")
  // console.log("member", member);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await onEditMemberRole(orgId, teamId, memberId, selectedRole);
      toast.success(result.message || "Role Updated Successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(error.message || "Failed to update member role");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset selected role when dialog opens
  const handleOpenChange = (open) => {
    if (open) {
      setSelectedRole(member?.teamRole || "MEMBER");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="menu" size="sm" className="h-8 w-8 group">
          <UserPen className="h-4 w-4 group-hover:scale-125 duration-300 text-primary" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPen className="h-5 w-5" />
            Edit Member Role
          </DialogTitle>
          <DialogDescription>
            Update the team role for{" "}
            <span className="font-medium">{member.fullname}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">Team Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {member?.role && (
            <div className="text-sm text-muted-foreground">
              CURRENT TEAM ROLE:{" "}
              <span className="font-medium">
                  {(getTeamRole(member, teamId) || "").toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedRole === member?.teamRole}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
