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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-og";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
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
import ProfileImageUpload from "./ProfileImageUpload";

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

export default function AgentSettingsPage({ settings }) {
  // Organization state
  const [organization, setOrganization] = useState(settings.organization);
  const [orgName, setOrgName] = useState(settings.organization.name);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User settings state

  const [language, setLanguage] = useState(settings?.language || "en-US");
  const [timezone, setTimezone] = useState(
    settings?.timezone || "America/New_York"
  );

  // Save user settings
  const handleSaveUserSettings = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/org/${orgId}/users/${settings.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          timezone,
        }),
      });

      if (!res.ok) {
        toast.error("Unable to update user settings");
      }

      toast.success("Your personal settings have been updated successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-7xl px-4 py-6">
      <header className="flex justify-between items-center px-4 mb-6">
        <div className="flex items-center space-x-3">
          <Cog className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Organization</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>My Account</span>
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
                    disabled
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
            </Card>
          </div>
        </TabsContent>

        {/* User Account Settings */}
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Account</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileImageUpload
                  user={{
                    id: settings.id,
                    email: settings.email,
                    firstname: settings.firstname,
                    lastname: settings.lastname,
                    imageUrl: settings.imageUrl,
                  }}
                  onUploadSuccess={() =>
                    toast.success("Profile picture updated!")
                  }
                />

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
                <Button onClick={handleSaveUserSettings}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
