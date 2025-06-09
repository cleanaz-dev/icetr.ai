"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  Users,
  Settings,
  UserPlus,
  Trash2,
  Clock,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { Cog } from "lucide-react";
import { CircleUser } from "lucide-react";


// Mock data based on the schema
const mockOrganization = {
  id: "org123",
  name: "Acme Corporation",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-06-20"),
};

const mockUsers = [
  {
    id: "user1",
    email: "john@acme.com",
    name: "John Smith",
    orgId: "org123",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-20"),
    userSettings: {
      id: "settings1",
      userId: "user1",
      language: "en-US",
      timezone: "America/New_York",
    },
  },
  {
    id: "user2",
    email: "sarah@acme.com",
    name: "Sarah Johnson",
    orgId: "org123",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-05-15"),
    userSettings: {
      id: "settings2",
      userId: "user2",
      language: "en-GB",
      timezone: "Europe/London",
    },
  },
  {
    id: "user3",
    email: "mike@acme.com",
    name: "Mike Wilson",
    orgId: "org123",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-06-01"),
    userSettings: {
      id: "settings3",
      userId: "user3",
      language: "es-ES",
      timezone: "Europe/Madrid",
    },
  },
];

// Language options
const languageOptions = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
];

// Timezone options (abbreviated list)
const timezoneOptions = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

export default function SettingsPage({ settings, invitees }) {
  // Organization state
  const [organization, setOrganization] = useState(settings.organization);
  const [orgName, setOrgName] = useState(settings.organization.name);
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Invite user state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // User settings state

  const [language, setLanguage] = useState(settings?.language || "en-US");
  const [timezone, setTimezone] = useState(
    settings?.timezone || "America/New_York"
  );


  // Save organization settings
  const handleSaveOrgSettings = () => {
    setOrganization((prev) => ({
      ...prev,
      name: orgName,
      updatedAt: new Date(),
    }));

    toast.success("Your organization settings have been updated successfully.");
  };
  // Save user settings
  const handleSaveUserSettings = () => {
    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          userSettings: {
            ...user.userSettings,
            language,
            timezone,
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
        };
      }
      return user;
    });

    setUsers(updatedUsers);

    toast.success("Your personal settings have been updated successfully.");
  };
  // Invite user
  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    setLoading(true);

    try {
      const response = await fetch("/api/invite/send-email", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          orgId: organization.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "What???");
        return;
      }

      // In a real app, this would send an API request to invite the user
      toast.success(`An invitation has been sent to ${inviteEmail}`);

      setInviteEmail("");
      setInviteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  // Remove user
  const handleRemoveUser = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);

    toast.success("The user has been removed from your organization.");
  };

  const handleRemoveInvitee = async (id) => {
      console.log("Delete Invitee", id)
  }

  return (
    <div className=" max-w-7xl px-4 py-6">
      <header className="flex justify-between items-center px-4 mb-6">
        <div className="flex items-center space-x-3">
          <Cog className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Organization</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>My Account</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Manage your organization information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    name="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoComplete="on"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Organization ID</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                    <code className="text-sm text-muted-foreground">
                      {organization.id.slice(0, 13)}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {organization.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {organization.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveOrgSettings}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Destructive actions for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Organization</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your organization and remove all associated data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Account Settings */}
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={settings.imageUrl} />
                    <AvatarFallback className="text-lg">U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">
                      {settings.firstname} {settings.lastname}
                    </h3>
                    <p className="text-muted-foreground">{settings.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="language">Language</Label>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <Label htmlFor="timezone">Timezone</Label>
                    </div>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveUserSettings}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Actions that will remove you from the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Leave Organization</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Organization</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this organization? You
                        will lose access to all organization resources and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Leave Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Organization Users</CardTitle>
                  <CardDescription>
                    Manage users in your organization
                  </CardDescription>
                </div>
                <Dialog
                  open={inviteDialogOpen}
                  onOpenChange={setInviteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Invite User</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite a New User</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization.
                      </DialogDescription>
                      {error && <p className="text-red-500">{error.message}</p>}
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="user@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleInviteUser} disabled={loading}>
                        {loading ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {settings.organization.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="size-16">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {user.id === settings.id ? "You" : "Member"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Joined {user.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {user.id !== settings.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {user.name}{" "}
                                  from your organization? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleRemoveUser(user.id)}
                                >
                                  Remove User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Users who have been invited but haven't joined yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 border rounded-lg bg-card">
                  {invitees.length > 0 ? (
                    <div className="w-full p-4 space-y-2">
                      {invitees.map((invitee) => (
                        <div
                          className="flex items-center justify-between p-2 "
                          key={invitee.id}
                        >
                          <div className="flex gap-2">
                            <CircleUser className="text-primary"/>
                            <div className="flex flex-col">
                              <p className="font-medium">{invitee.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Invited:{" "}
                                {new Date(
                                  invitee.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive"
                            onClick={() => handleRemoveInvitee(invitee.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No pending invitations
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
