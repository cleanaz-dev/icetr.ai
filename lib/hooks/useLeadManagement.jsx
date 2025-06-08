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

  return {
    leads,
    filteredLeads,
    selectedLead,
    calledLeadIds,
    selectLead,
    updateLeadStatus,
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