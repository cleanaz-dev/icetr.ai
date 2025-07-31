"use client";

import { useState } from "react";

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
import {
 languageOptions,
 timezoneOptions,
} from "@/lib/constants/settings/config";
import ProfileImageUpload from "./ProfileImageUpload";
import { Clock, Globe, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export default function AccountTab({ settings }) {
 const [loading, setLoading] = useState(false);
 const [language, setLanguage] = useState(settings?.language || "en-US");
 const [timezone, setTimezone] = useState(
  settings?.timezone || "America/New_York"
 );

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
  <>
   <TabsContent value="account">
    <div className="grid gap-6">
     <Card>
      <CardHeader>
       <CardTitle>My Profile</CardTitle>
       <CardDescription>Manage your personal information</CardDescription>
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
        onUploadSuccess={() => toast.success("Profile picture updated!")}
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
           Are you sure you want to leave this organization? You will lose
           access to all organization resources and data.
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
  </>
 );
}
