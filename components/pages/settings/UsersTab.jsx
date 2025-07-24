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
 Users,
 Trash2,
 CircleUser,
 Search,
 X,
 Mail,
 Calendar,
 MoreHorizontal,
 Shield,
 Crown,
 UserIcon,
} from "lucide-react";
import DeletePendingUserDialog from "./DeletePendingUserDialog";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChangeRoleDialog from "./ChangeRoleDialog";
import { RefreshCw } from "lucide-react";

export default function UsersTab({ settings }) {
 const [users, setUsers] = useState(null);
 const [searchTerm, setSearchTerm] = useState("");
 const [roleFilter, setRoleFilter] = useState("all");
 const [teamFilter, setTeamFilter] = useState("all");
 const [roleOpen, setRoleOpen] = useState(false);

 const [invitees, setInvitees] = useState([]);
 const [loading, setLoading] = useState(false);
 const [hasFetched, setHasFetched] = useState(false);

 const handleRemoveUser = (userId) => {
  const updatedUsers = users.filter((user) => user.id !== userId);
  setUsers(updatedUsers);

  toast.success("The user has been removed from your organization.");
 };

 const getRoleIcon = (role) => {
  switch (role.toLowerCase()) {
   case "admin":
    return <Crown className="w-3 h-3 text-yellow-500" />;
   case "manager":
    return <Shield className="w-3 h-3 text-blue-500" />;
   default:
    return <UserIcon className="w-3 h-3 text-gray-500" />;
  }
 };

 const getRoleBadgeVariant = (role) => {
  switch (role.toLowerCase()) {
   case "admin":
    return "default";
   case "manager":
    return "secondary";
   default:
    return "outline";
  }
 };

 const uniqueRoles = [
  ...new Set(settings.organization.users.map((user) => user.role)),
 ];
 const uniqueTeams = [
  ...new Set(
   settings.organization.users.map((user) => user.team?.name).filter(Boolean)
  ),
 ];

 const filteredUsers = settings.organization.users.filter((user) => {
  const matchesSearch =
   `${user.firstname} ${user.lastname}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase()) ||
   user.email.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesRole =
   roleFilter === "all" || user.role.toLowerCase() === roleFilter;
  const matchesTeam = teamFilter === "all" || user.team?.name === teamFilter;

  return matchesSearch && matchesRole && matchesTeam;
 });

 const clearFilters = () => {
  setSearchTerm("");
  setRoleFilter("all");
  setTeamFilter("all");
 };

 const handleFetchInvitees = async () => {
  setLoading(true);
  try {
   const response = await fetch("/api/invite/pending");
   if (!response.ok) {
    throw new Error("Failed to fetch invitees");
   }
   const data = await response.json();
   setInvitees(data.invitees);
   setHasFetched(true);
  } catch (error) {
   console.error("Failed to fetch invitees:", error);
   // Optional: show error toast
  } finally {
   setLoading(false);
  }
 };

 return (
  <>
   <TabsContent value="users">
    <div className="grid gap-6">
     <Card>
      <CardHeader>
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
         <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Organization Users
          <Badge variant="secondary" className="ml-2">
           {settings.organization.users.length}
          </Badge>
         </CardTitle>
         <CardDescription>Manage users in your organization</CardDescription>
        </div>
       </div>
      </CardHeader>
      <CardContent>
       {/* Search and Filters */}
       <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
         <Input
          placeholder="Search users..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
         />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
         <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by role" />
         </SelectTrigger>
         <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {uniqueRoles.map((role) => (
           <SelectItem key={role} value={role.toLowerCase()}>
            {role}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
         <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by team" />
         </SelectTrigger>
         <SelectContent>
          <SelectItem value="all">All Teams</SelectItem>
          {uniqueTeams.map((team) => (
           <SelectItem key={team} value={team}>
            {team}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
        {(searchTerm || roleFilter !== "all" || teamFilter !== "all") && (
         <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2"
         >
          <X className="w-4 h-4" />
          Clear
         </Button>
        )}
       </div>

       <ScrollArea className="h-[500px]">
        <div className="space-y-4">
         {filteredUsers.map((user) => (
          <div
           key={user.id}
           className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50transition-colors"
          >
           <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
             <AvatarImage src={user.imageUrl} />
             <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user.firstname[0]}
              {user.lastname[0]}
             </AvatarFallback>
            </Avatar>
            <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">
               {user.firstname} {user.lastname}
              </p>
              {user.id === settings.id && (
               <Badge variant="default" className="text-xs">
                You
               </Badge>
              )}
             </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="w-3 h-3" />
              {user.email}
             </div>
             <div className="flex items-center gap-3">
              <Badge
               variant={getRoleBadgeVariant(user.role)}
               className="flex items-center gap-1"
              >
               {getRoleIcon(user.role)}
               {user.role}
              </Badge>
              <Badge variant="outline">{user.team?.name || "Unassigned"}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
               <Calendar className="w-3 h-3" />
               Joined {user.createdAt.toLocaleDateString()}
              </div>
             </div>
            </div>
           </div>

           <div className="flex items-center gap-2">
            {user.id !== settings.id && (
             <>
              <DropdownMenu>
               <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                 <MoreHorizontal className="w-4 h-4" />
                </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                 <Users className="w-4 h-4 mr-2" />
                 Change Team
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRoleOpen(true)}>
                 <Shield className="w-4 h-4 mr-2" />
                 Change Role
                </DropdownMenuItem>
               </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog>
               <AlertDialogTrigger asChild>
                <Button
                 variant="ghost"
                 size="icon"
                 className="text-red-500 hover:text-red-700"
                >
                 <Trash2 className="w-4 h-4" />
                </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                <AlertDialogHeader>
                 <AlertDialogTitle>Remove User</AlertDialogTitle>
                 <AlertDialogDescription>
                  Are you sure you want to remove {user.firstname}{" "}
                  {user.lastname} from your organization? This action cannot be
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
              <ChangeRoleDialog
               open={roleOpen}
               onOpenChange={setRoleOpen}
               user={user}
               currentRole={user.role}
              />
             </>
            )}
           </div>
          </div>
         ))}
        </div>
       </ScrollArea>
      </CardContent>
     </Card>

     {/* Pending Invitations */}
     <Card>
      <CardHeader>
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Pending Invitations
          {invitees.length > 0 && (
           <Badge variant="secondary" className="ml-2">
            {invitees.length}
           </Badge>
          )}
         </CardTitle>
        </div>
        <Button
         onClick={handleFetchInvitees}
         disabled={loading}
         size="sm"
         variant="outline"
        >
         {loading ? (
          <>
           <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
           Loading...
          </>
         ) : (
          <>
           <RefreshCw className="w-4 h-4 mr-2" />
           {hasFetched ? "Refresh" : "Load Invitations"}
          </>
         )}
        </Button>
       </div>
       <CardDescription>
        Users who have been invited but haven't joined yet
       </CardDescription>
      </CardHeader>
      <CardContent>
       {!hasFetched ? (
        <div className="flex flex-col items-center justify-center h-32 border rounded-lg bg-background">
         <Mail className="w-8 h-8 text-muted-foreground mb-2" />
         <p className="text-muted-foreground mb-3">
          Click "Load Invitations" to view pending invites
         </p>
        </div>
       ) : invitees.length > 0 ? (
        <div className="space-y-3">
         {invitees.map((invitee) => (
          <div
           key={invitee.id}
           className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50 border-yellow-200"
          >
           <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
             <CircleUser className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
             <p className="font-medium text-gray-900">{invitee.email}</p>
             <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              Invited {new Date(invitee.createdAt).toLocaleDateString()}
             </div>
            </div>
           </div>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
             Resend Invite
            </Button>
            <DeletePendingUserDialog invitee={invitee} />
           </div>
          </div>
         ))}
        </div>
       ) : (
        <div className="flex flex-col items-center justify-center h-32 border rounded-lg bg-background">
         <Mail className="w-8 h-8 text-muted-foreground mb-2" />
         <p className="text-muted-foreground">No pending invitations</p>
        </div>
       )}
      </CardContent>
     </Card>
    </div>
   </TabsContent>
  </>
 );
}
