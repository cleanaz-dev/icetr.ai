"use client";
import React from "react";
import { Users, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import MyStats from "./agent-portal/MyStats";
import MyTeam from "./agent-portal/MyTeam";
import TeamUpdates from "./agent-portal/TeamUpdates";
import PortalRecentActivities from "./agent-portal/PortalRecentActivities";

export default function AgentPortal({ agentData = {}, announcements = [] }) {
  const getInitials = (firstname, lastname) =>
    `${firstname?.charAt(0) || ""}${lastname?.charAt(0) || ""}`;

  const getRoleIcon = (role) => {
    switch (role) {
      case "MANAGER":
        return <Crown className="w-4 h-4" />;
      case "LEAD":
        return <Medal className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Common animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <motion.div
        className="text-center space-y-2"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {agentData?.firstname || "Agent"}! 👋
        </h1>
        <p className="text-muted-foreground">
          You're part of the{" "}
          <span className="font-semibold text-primary">
            {agentData?.teamMemberships?.[0]?.team?.name || "Elite Sales"}
          </span>{" "}
          team
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      >
        <MyStats stats={agentData._count} teamMembers={agentData.teamMembers} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      >
        <div className="lg:col-span-4">
          <MyTeam
            teamMembers={agentData.teamMembers}
            getInitials={getInitials}
            getRoleIcon={getRoleIcon}
          />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <TeamUpdates announcements={announcements} />
          <PortalRecentActivities recentActivities={agentData.teamActivities} />
        </div>
      </motion.div>
    </div>
  );
}
