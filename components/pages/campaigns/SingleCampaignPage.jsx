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

export default function SingleCampaignPage({ campaign }) {
  const [selectedTab, setSelectedTab] = useState("overview");

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
                <h1 className="text-3xl font-bold">
                  {campaign.name}
                </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Leads */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-bold mt-2">247</p>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                +12% from last month
              </span>
            </div>
          </div>

          {/* Contacted */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contacted</p>
              <p className="text-3xl font-bold mt-2">89</p>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">36% contact rate</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold mt-2">42</p>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">47% of contacted</span>
            </div>
          </div>

          {/* Converted */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Converted</p>
              <p className="text-3xl font-bold mt-2">18</p>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                7.3% conversion rate
              </span>
            </div>
          </div>
        </div>

        {/* Team Performance and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Performance */}
          <div className="col-span-2">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Team Performance
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lead distribution and performance by team member
                    </p>
                  </div>
                
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {campaign.team?.members?.length > 0 ? (
                    campaign.team.members.map(({ user }) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {user.firstname?.charAt(0)}
                            {user.lastname?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.role?.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-lg font-semibold">
                              {user._count?.assignedLeads || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Assigned</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">
                              {user._count?.contactedLeads || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Contacted</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              {Math.round(
                                (user._count?.contactedLeads /
                                  user._count?.assignedLeads) *
                                  100
                              ) || 0}
                              %
                            </p>
                            <p className="text-xs text-muted-foreground">Rate</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No team members assigned to this campaign
                      </p>
                      <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                        Assign Team Members
                      </button>
                    </div>
                  )}

                  {/* Unassigned Leads */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          UA
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-orange-900 dark:text-orange-100">
                          Unassigned Leads
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Pending assignment
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        128
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Leads</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t mt-6">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Leads
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Latest updates and actions on this campaign
                    </p>
                  </div>
                
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah Johnson</span> converted
                        a lead from TechCorp Solutions
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Mike Chen</span> scheduled a
                        follow-up call with InnovateLab
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Emily Rodriguez</span> was
                        assigned 15 new leads
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        Automated email sequence sent to 45 leads
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">8 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings - Full Width at Bottom */}
        <div className="w-full">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Upcoming Bookings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled calls and meetings
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}