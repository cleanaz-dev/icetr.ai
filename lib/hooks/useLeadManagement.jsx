"use client"
import { useState, useEffect } from "react";

export function useLeadManagement(data) {
  const [leads, setLeads] = useState(data || []);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [calledLeadIds, setCalledLeadIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    setLeads(data || []);
  }, [data]);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...leads];

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phoneNumber.includes(searchTerm) ||
          lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (sortField === "createdAt") {
        return (new Date(aValue) - new Date(bValue)) * modifier;
      }

      return (aValue > bValue ? 1 : -1) * modifier;
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, sortField, sortDirection]);

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setCalledLeadIds((prev) => new Set([...prev, lead.id]));
  };

  const updateLeadStatus = (leadId, status) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    );
  };

  // Add this new function to update any lead data
  const updateLead = (leadId, updatedData) => {
    setLeads((prev) =>
      prev.map((lead) => 
        lead.id === leadId ? { ...lead, ...updatedData } : lead
      )
    );
    
    // Also update selectedLead if it's the same lead
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => ({ ...prev, ...updatedData }));
    }
  };

  // Add this function to handle API calls and state updates
  const saveLead = async (leadId, updatedData) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }
      
      const updatedLead = await response.json();
      
      // Update local state with server response
      updateLead(leadId, updatedLead);
      
      return updatedLead;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  };

  return {
    leads,
    filteredLeads,
    selectedLead,
    calledLeadIds,
    selectLead,
    updateLeadStatus,
    updateLead,        // Add this
    saveLead,          // Add this
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
  };
}