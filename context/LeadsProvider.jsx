"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

const LeadsContext = createContext({
  leads: [],
  setLeads: () => {},
  addLead: () => {},
  updateLead: () => {},
  deleteLead: () => {},
  assignLeads: () => {},
  unassignLeads: () => {},
  importLeads: () => {},
  deleteLead: () => {},
});

export function LeadsProvider({ initialData = {}, children }) {
  const { leads: initialLeads = [] } = initialData;

  const [leads, setLeads] = useState(initialLeads);

  const addLead = (newLead) => {
    setLeads((prev) => [...prev, newLead]);
  };

  const updateLead = (updatedLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
  };

  const deleteLead = async (leadId, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/${leadId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete lead");
      }

      // Only update state if API call was successful
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));

      return result;
    } catch (error) {
      console.error("Delete lead error:", error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const assignLeads = async ({ leadIds, assignToId, orgId }) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds, assignedToId: assignToId }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();

      // Update local state with the assigned user data from API
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          leadIds.includes(lead.id)
            ? {
                ...lead,
                assignedUserId: assignToId,
                assignedUser: data.assignedUser,
              }
            : lead
        )
      );

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unassignLeads = async ({ leadIds, orgId }) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/unassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();

      // Update local state to remove assignments
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          leadIds.includes(lead.id)
            ? { ...lead, assignedUserId: null, assignedUser: null }
            : lead
        )
      );

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const importLeads = async (formData, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/leads/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { ok: false, error: result.error || "Failed to import leads" };
      }

      // Only update state if setLeads is accessible here
      setLeads((prev) => [...prev, ...result.newLeads]);

      return { ok: true, message: result.message };
    } catch (err) {
      console.error("API error:", err);
      return { ok: false, error: "Network or server error" };
    }
  };

  const value = useMemo(
    () => ({
      leads,
      setLeads,
      addLead,
      updateLead,
      deleteLead,
      assignLeads,
      unassignLeads,
      importLeads,
      deleteLead,
    }),
    [leads]
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
}
