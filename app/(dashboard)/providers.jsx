"use client";

import { PermissionProvider } from "@/context/PermissionProvider";
import { TeamProvider } from "@/context/TeamProvider";
import { DashboardProvider } from "@/context/DashboardProvider";
import { LeadsProvider } from "@/context/LeadsProvider";
import { CoreProvider } from "@/context/CoreProvider";

/**
 * Wraps all app-level providers to simplify layout logic and manage global shared state.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} [props.permissionValues]
 * @param {Array} [props.permissionValues.permissions]
 * @param {string|null} [props.permissionValues.role]
 * @param {any} [props.permissionValues.publicIntegrations]
 * @param {Object} [props.teamValues]
 * @param {Array} [props.teamValues.teams]
 * @param {Array} [props.teamValues.teamMembers]
 * @param {Array} [props.teamValues.teamLeads]
 * @param {Array} [props.teamValues.orgCampaigns]
 * @param {string} [props.teamValues.orgId]
 * @param {Array} [props.teamValues.orgMembers]
 * @param {Object} [props.dashboardValues]
 * @param {Object} [props.leadsValues]
 * @param {Array} [props.leadsValues.leads]
 * @param {Object} [props.coreValues]
 * @param {Object} [props.coreValues.phoneConfiguration]
 * @param {String} [props.coreValues.orgId]
 */

export default function Providers({
  children,
  permissionValues = {},
  teamValues = {},
  dashboardValues = {},
  leadsValues = {},
  coreValues = {},
}) {
  const {
    permissions = [],
    role = null,
    publicIntegrations = null,
  } = permissionValues;

  const {
    teams = [],
    teamMembers = [],
    orgId = null,
    orgMembers = [],
    orgCampaigns = [],
    teamLeads = [],
  } = teamValues;

  const { leads = [] } = leadsValues;

  const { phoneConfiguration = null } = coreValues;

  return (
    <DashboardProvider initialData={dashboardValues}>
      <PermissionProvider
        initialData={{ permissions, role, publicIntegrations }}
      >
        <TeamProvider
          initialData={{
            initialTeams: teams,
            initialTeamMembers: teamMembers, // Added this
            orgId,
            orgMembers,
            orgCampaigns,
            teamLeads,
          }}
        >
          <LeadsProvider initialData={{ leads }}>
            <CoreProvider initialData={{ phoneConfiguration }}>
              {children}
            </CoreProvider>
          </LeadsProvider>
        </TeamProvider>
      </PermissionProvider>
    </DashboardProvider>
  );
}
