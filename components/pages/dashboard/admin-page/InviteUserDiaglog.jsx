import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Crown, Shield, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useCoreContext } from "@/context/CoreProvider";
import { TierLimitBanner } from "@/components/tier/TierLimitBanner";
import { UserRoundPlus } from "lucide-react";

export default function InviteUserDialog({ teams, orgId, trigger }) {
  const { tier } = useCoreContext();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState({
    email: "",
    role: "Agent",
    teamId: teams?.[0]?.id || "",
  });
  const { user } = useUser();

  const resetForm = () => {
    setMemberData({
      email: "",
      role: "Agent",
      teamId: teams?.[0]?.id || "",
    });
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const roles = [
    {
      value: "Admin",
      label: "Admin",
      icon: Crown,
      color: "bg-purple-100 text-purple-800",
      border: "border-l-purple-800",
    },
    {
      value: "Manager",
      label: "Manager",
      icon: Shield,
      color: "bg-blue-100 text-blue-800",
      border: "border-l-blue-800",
    },
    {
      value: "Agent",
      label: "Agent",
      icon: Users,
      color: "bg-green-100 text-green-800",
      border: "border-l-green-800",
    },
  ];

  const handleSubmit = async () => {
    if (!memberData.email) {
      toast.error("Email is required");
      return;
    }

    if (!memberData.teamId) {
      toast.error("Please select a team");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/org/${orgId}/invite/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: memberData.email,
          userRole: memberData.role,
          teamId: memberData.teamId,
          senderUserId: user.id,
        }),
      });

      const { message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      toast.success(message || "Invite sent successfully");
      handleClose();
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setMemberData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedRole = roles.find((role) => role.value === memberData.role);
  const selectedTeam = teams?.find((team) => team.id === memberData.teamId);
  const isAtUserLimit = tier?.isAtLimit("maxUsers");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button>
            <UserRoundPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserRoundPlus className="w-5 h-5 text-primary" />
            Invite Team Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            Send an invitation to join {selectedTeam?.name || "a team"}. They
            will receive an email with instructions to join.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team" className="text-sm font-medium">
              Team
            </Label>
            <Select
              value={memberData.teamId}
              onValueChange={(value) => handleInputChange("teamId", value)}
              disabled={isAtUserLimit || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team">
                  {selectedTeam && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedTeam.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{team.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter member's email"
              value={memberData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isAtUserLimit || isLoading}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2">
            {/* <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                System Role
              </Label>
              <Select
                value={memberData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isAtUserLimit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role">
                    {selectedRole && (
                      <div className="flex items-center gap-2">
                        <selectedRole.icon className="w-4 h-4" />
                        <span>{selectedRole.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Team Role
            </Label>
            <Select
              value={memberData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={isAtUserLimit || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role">
                  {selectedRole && (
                    <div className="flex items-center gap-2">
                      <selectedRole.icon className="w-4 h-4" />
                      <span>{selectedRole.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="w-4 h-4" />
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          

          {/* Role Description */}
          {selectedRole && (
            <div
              className={`border-l-4 ${selectedRole.border} bg-muted/50 rounded-r`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={selectedRole.color}>
                    <selectedRole.icon className="w-3 h-3 mr-1" />
                    {selectedRole.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {memberData.role === "Admin" &&
                    "Full access to all team settings, billing, and can manage all members."}
                  {memberData.role === "Manager" &&
                    "Can manage team members, campaigns, and most settings except billing."}
                  {memberData.role === "Agent" &&
                    "Can view and participate in campaigns but cannot manage team settings."}
                </p>
              </CardContent>
            </div>
          )}

          {/* Tier Limit Banner */}
          <TierLimitBanner check="users" />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !memberData.email ||
              !memberData.teamId ||
              isAtUserLimit
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invite
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
