"use client";

import { useState } from "react";
import {
  User,
  Settings,
  Globe,
  Clock,
  Mail,
  Shield,
  AlertTriangle,
  Save,
  Camera,
  Activity,
  Calendar,
  Key,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";
import { TabsContent } from "@/components/ui/tabs-og";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  languageOptions,
  timezoneOptions,
} from "@/lib/constants/settings/config";
import ProfileImageUpload from "./ProfileImageUpload";
import { UserRound } from "lucide-react";

export default function AccountTab({ settings }) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [language, setLanguage] = useState(settings?.language || "en-US");
  const [timezone, setTimezone] = useState(
    settings?.timezone || "America/New_York"
  );
  const [notifications, setNotifications] = useState({
    email: settings?.notifications?.email ?? true,
    push: settings?.notifications?.push ?? true,
    sms: settings?.notifications?.sms ?? false,
    marketing: settings?.notifications?.marketing ?? false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    settings?.twoFactorEnabled ?? false
  );

  const handleSaveUserSettings = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/org/${settings.orgId}/users/${settings.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language,
            timezone,
            notifications,
            twoFactorEnabled,
          }),
        }
      );

      if (!res.ok) {
        toast.error("Unable to update user settings");
        return;
      }

      toast.success("Your personal settings have been updated successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="account">
      <div className="space-y-6">
        {/* Save Section - Contains all settings except danger zone */}
        <Card>
          <CardContent>
            {/* Account Overview Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <UserRound className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Account Overview</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture - Left */}
                <div className="flex-shrink-0">
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
                </div>

                {/* Account Info - Right */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <div className="font-medium">
                      {settings?.firstname} {settings?.lastname}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      {settings?.email}
                      {settings?.emailVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joined</Label>
                    <div className="font-medium">
                      {new Date(
                        settings?.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">System Role</Label>
                    <div className="font-medium flex items-center gap-1">
                      {settings?.role?.type || "Agent"}
                    </div>
                  </div>
                  {/* Language Select */}
                  <div className="space-y-2 col-span-full md:col-span-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
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
                  {/* Timezone Select */}
                  <div className="space-y-2 col-span-full md:col-span-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
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
              </div>
            </div>
          </CardContent>

          {/* Save Button */}
          <CardFooter className="p-6">
            <Button
              onClick={handleSaveUserSettings}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TabsContent>
  );
}
