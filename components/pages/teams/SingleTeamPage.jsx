"use client";
import React, { useState } from "react";
import { Users, TrendingUp, PhoneCall, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TeamLeadsTable from "./table/TeamLeadsTable";
import TeamReviewTab from "./TeamReviewTab";
import { format } from "date-fns";
import TeamCalls from "./TeamCalls";
import { useTeamContext } from "@/context/TeamProvider";
import TeamCampaignsTab from "./TeamCampaignsTab";
import { TableSseAlgorithm } from "@aws-sdk/client-s3";
import TeamMembersTab from "./TeamMembersTab";

export default function SingleTeamPage({ teamId, trainingData }) {
  const {
    teamLeads: leads,
    getTeamByTeamId,
    getTeamMembersByTeamId,
    orgCampaigns,
    filterLeadsByTeamId,
    filterCampaignsByTeamId,
  } = useTeamContext();
  const team = getTeamByTeamId(teamId);
  const members = getTeamMembersByTeamId(teamId);
  const teamCampaigns = filterCampaignsByTeamId(teamId);
  const [activeTab, setActiveTab] = useState("overview");
  console.log("team", team);

  // Calculate team stats
  const teamStats = {
    totalMembers: members.length,
    totalLeads: leads?.length || 0,
    activeCampaigns: orgCampaigns.filter((c) => c.status === "active").length,
    completedCalls: 47, // Mock data
    avgCallDuration: 285, // Mock data in seconds
    conversionRate: 23.5, // Mock data
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "primary",
  }) => (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-1 text-sm ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full`}>
          <Icon
            className={`h-6 w-6 ${
              color === "primary"
                ? "text-accent"
                : color === "secondary"
                ? "text-accent"
                : "text-accent"
            }`}
          />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
        isActive
          ? "border-primary text-primary bg-muted"
          : "border-transparent text-gray-500 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );

  const MemberCard = ({ member, isManager = false }) => (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={member.imageUrl}
              alt={`${member.firstname} ${member.lastname}`}
            />
            <AvatarFallback>👤</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="font-medium truncate">
              {member.firstname} {member.lastname}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className=" border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <p className="text-gray-500">
                Created on {team.createdAt.toLocaleDateString()} •{" "}
                {teamStats.totalMembers} members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0">
            <TabButton
              id="overview"
              label="Overview"
              isActive={activeTab === "overview"}
              onClick={setActiveTab}
            />
            <TabButton
              id="members"
              label="Team Members"
              isActive={activeTab === "members"}
              onClick={setActiveTab}
            />
            <TabButton
              id="leads"
              label="Leads"
              isActive={activeTab === "leads"}
              onClick={setActiveTab}
            />
            <TabButton
              id="campaigns"
              label="Campaigns"
              isActive={activeTab === "campaigns"}
              onClick={setActiveTab}
            />
            {/* <TabButton
              id="analytics"
              label="Analytics"
              isActive={activeTab === "analytics"}
              onClick={setActiveTab}
            /> */}
            <TabButton
              id="reviews"
              label="Training Reviews"
              isActive={activeTab === "reviews"}
              onClick={setActiveTab}
            />
            <TabButton
              id="calls"
              label="Calls"
              isActive={activeTab === "calls"}
              onClick={setActiveTab}
            />
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Members"
                value={teamStats.totalMembers}
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Active Leads"
                value={teamStats.totalLeads}
                icon={Target}
                trend="up"
                trendValue="+12%"
                color="accent"
              />
              <StatCard
                title="Calls Completed"
                value={teamStats.completedCalls}
                icon={PhoneCall}
                trend="up"
                trendValue="+8%"
                color="secondary"
              />
              <StatCard
                title="Conversion Rate"
                value={`${teamStats.conversionRate}%`}
                icon={Award}
                trend="up"
                trendValue="+2.1%"
                color="accent"
              />
            </div>

            {/* Team Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Team Manager</h3>
                {team.manager && (
                  <MemberCard member={team.manager} isManager={true} />
                )}
              </div>
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        Sarah Johnson completed a call with Alice Wilson
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        Mike Chen was assigned 5 new leads
                      </p>
                      <p className="text-xs text-muted-foreground">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm ">Q4 Outreach campaign updated</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <TeamMembersTab team={team} members={members} />
        )}

        {activeTab === "leads" && (
          <TeamLeadsTable
            leads={filterLeadsByTeamId(leads, teamId)}
            team={team}
          />
        )}

        {activeTab === "campaigns" && (
          <TeamCampaignsTab team={team} campaigns={teamCampaigns} />
        )}

        {activeTab === "reviews" && (
          <TeamReviewTab
            team={team}
            members={members}
            trainingData={trainingData}
          />
        )}

        {activeTab === "calls" && <TeamCalls team={team} />}
      </div>
    </div>
  );
}
