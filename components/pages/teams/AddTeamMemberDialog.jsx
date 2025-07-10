"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, User, Shield, Crown, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs"
import AddTeamMemberTable from "./table/AddTeamMemberTable";
import { toast } from "sonner";

export default function AddTeamMemberDialog({ team, onAddMember, members }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("invite");
  const [memberData, setMemberData] = useState({
    email: "",
    role: "Agent",
  });
  const { user } = useUser()

  const resetForm = () => {
    setMemberData({
      email: "",
      role: "Agent",
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
      border: "border-l-purple-800"
    },
    {
      value: "Manager",
      label: "Manager",
      icon: Shield,
      color: "bg-blue-100 text-blue-800",
      border: "border-l-blue-800"
    },
    {
      value: "Agent",
      label: "Agent",
      icon: Users,
      color: "bg-green-100 text-green-800",
      border: "border-l-green-800"
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/invite/send-email",{
        method: "POST",
        body: JSON.stringify({
          email: memberData.email,
          userRole: memberData.role,
          teamId: team.id,
          senderUserId: user.id
        })
      })

      if (!response.ok) {
        toast.error("Error sending email")
      }
      const { message } = await response.json()
      toast.success(message || "Invite send successfuly")
      resetForm()
    } catch (error) {
      console.error("Error adding member:", error);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon">
          <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            Add Team Member ({team.name})
          </DialogTitle>
          <DialogDescription>
            Invite a new member or select from existing users to join your team.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Invite
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Select Org Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-6 mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
             
              

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
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role
                  </Label>
                  <Select
                    value={memberData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
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

              {/* Role Description Card */}
              {selectedRole && (
                <div className={`border-l-4 ${selectedRole.border} bg-muted/50`}>
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

              <div className="flex gap-2 items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !memberData.email}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Invite...
                    </>
                  ) : (
                    <>Send Invite</>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="existing" className="space-y-6 mt-6">
            <AddTeamMemberTable
              teamId={team.id}
              members={members}
              onAddMember={onAddMember}
              onClose={handleClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
