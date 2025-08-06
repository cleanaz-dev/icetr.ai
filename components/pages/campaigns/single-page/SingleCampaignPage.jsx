"use client";
import { useState } from "react";
import {
  Target,
  Users,
  Calendar,
  Phone,
  BarChart3,
  Settings,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Mail,
  UserPlus,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ManageCallScriptsDialog from "../../training/dialog/ManageCallScriptsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LeadsWithActivities from "./LeadsWithActivities";
import { ManageCallScripts } from "./ManageCallScripts";
import SingleCampaignStats from "./SingleCampaignStats";
import TeamPerformance from "./TeamPerfomance";
import { useCoreContext } from "@/context/CoreProvider";

export default function SingleCampaignPage({ campaign }) {
  const { saveScript } = useCoreContext();
  console.log("campaign", campaign);
  const [selectedTab, setSelectedTab] = useState("overview");

  const unassignedLeads = campaign.leads.filter((lead) => !lead.assignedUserId);
  const leadsWithActivities = campaign.leads.filter(
    (lead) => lead.activities.length > 0
  );

  // Mock upcoming bookings
  const upcomingBookings = [
    {
      id: 1,
      company: "TechCorp Solutions",
      contact: "John Smith",
      date: "2025-07-29",
      time: "10:00 AM",
      type: "Demo Call",
      assignedTo: "Sarah Johnson",
    },
    {
      id: 2,
      company: "InnovateLab",
      contact: "Lisa Wang",
      date: "2025-07-29",
      time: "2:30 PM",
      type: "Follow-up",
      assignedTo: "Mike Chen",
    },
    {
      id: 3,
      company: "DataFlow Inc",
      contact: "Robert Davis",
      date: "2025-07-30",
      time: "11:15 AM",
      type: "Discovery Call",
      assignedTo: "Emily Rodriguez",
    },
  ];

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Campaign not found</h3>
          <p className="text-muted-foreground">
            The campaign you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold">{campaign.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
              <p className="text-muted-foreground max-w-2xl text-lg">
                {campaign.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {campaign.team?.members?.length || 0} team members
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {campaign.organization?.name} • Created{" "}
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <SingleCampaignStats campaign={campaign} />

        {/* Team Performance and Call Scripts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance */}
          <TeamPerformance
            campaign={campaign}
            unassignedLeads={unassignedLeads}
          />

          {/* Call Scripts */}
          <ManageCallScripts
            campaign={campaign}
            onScriptsUpdate={() => {
              console.log("Console log: Scripts updated");
            }}
            onSaveScript={saveScript}
          />
        </div>

        {/* Recent Activity and Upcoming Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="flex">
            <div className="bg-card rounded-lg border shadow-sm flex-1 flex flex-col">
              <div className="p-6 border-b mb-4">
                <div className="flex-col">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Latest updates and actions on this campaign
                  </p>
                </div>
              </div>
              <LeadsWithActivities leadsWithActivities={leadsWithActivities} />
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="flex">
            <div className="bg-card rounded-lg border shadow-sm flex-1 flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Scheduled calls and meetings
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {booking.company}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {booking.contact}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 ml-2">
                          {booking.type}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Assigned to{" "}
                            <span className="font-medium">
                              {booking.assignedTo}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
