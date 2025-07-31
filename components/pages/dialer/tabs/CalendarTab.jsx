"use client";
import React from "react";
import { InlineWidget } from "react-calendly";
import { Calendar } from "lucide-react";
import { usePermissionContext } from "@/context/PermissionProvider";

export default function CalendarTab({ lead }) {
  const { publicIntegrations, getPublicIntegrationData } = usePermissionContext();

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 ">
        <Calendar className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Selected</h3>
        <p className="text-gray-500 text-center">
          Choose a lead from the list to schedule a meeting
        </p>
      </div>
    );
  }

  // Get the first enabled calendly integration with a valid URL
  const calendlyIntegration = getPublicIntegrationData(publicIntegrations, "calendlyIntegrations");

  if (!calendlyIntegration) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 p-4 rounded">
        <p className="text-red-600 font-semibold">
          No Calendly integration configured for your organization.
        </p>
        <p className="text-gray-600 mt-2">
          Please contact your administrator to set up the Calendly integration.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minWidth: "320px", height: "700px" }}>
      <InlineWidget
        url={calendlyIntegration.orgUri}
        styles={{
          height: "80%",
          width: "100%",
        }}
        prefill={{
          name: lead.name || "name",
          email: lead.email || "email",
        }}
      />
    </div>
  );
}
