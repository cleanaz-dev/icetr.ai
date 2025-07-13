"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Building,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ITEMS_PER_PAGE = 10;

const getStatusVariant = (status) => {
  const variants = {
    New: "default",
    Contacted: "secondary",
    Qualified: "success",
    Unqualified: "destructive",
    Converted: "outline",
  };
  return variants[status] || "default";
};

export default function TeamLeadsTable({ leads = [], team }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignment, setFilterAssignment] = useState("all");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = [
        lead.name,
        lead.company,
        lead.email,
        lead.phoneNumber,
      ].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus =
        filterStatus === "all" || lead.status === filterStatus;

      const matchesAssignment =
        filterAssignment === "all" ||
        (filterAssignment === "assigned" && lead.assignedUser) ||
        (filterAssignment === "unassigned" && !lead.assignedUser);

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [leads, searchTerm, filterStatus, filterAssignment]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const uniqueStatuses = [...new Set(leads.map((lead) => lead.status))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Leads</CardTitle>
            <p className="text-sm text-muted-foreground">
              {team?.name || "All Teams"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAssignment} onValueChange={setFilterAssignment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex flex-col ">               
                      <div className="font-medium">
                        {lead.name || "Unknown"}
                      </div>
                      {lead.source && (
                        <div className="text-sm text-muted-foreground">
                          Source: {lead.source}
                        </div>
                      )}

                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {lead.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phoneNumber && (
                      <div className="flex items-center text-sm">
                        <Phone className="size-3 text-muted-foreground mr-2" />
                        {lead.phoneNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="">
                    {lead.company && (
                      <div className="flex items-center text-sm">
                        <Building className="size-3 text-muted-foreground mr-2" />
                        {lead.company}
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="size-3 text-muted-foreground mr-2" />
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    {lead.industry && (
                      <div className="text-sm text-muted-foreground capitalize">
                        {lead.industry}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.assignedUser ? (
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <Avatar>
                            <AvatarImage src={lead.assignedUser.imageUrl}/>
                            <AvatarFallback>{lead.assignedUser.firstname.slice(0,1)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="text-xs font-medium">
                          {lead.assignedUser.firstname}{" "}
                          {lead.assignedUser.lastname}
                        </div>
                        {/* <div className="text-xs text-muted-foreground">
                          {lead.assignedUser.email}
                        </div> */}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghostMuted">
                    <EllipsisVertical />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredLeads.length)} of{" "}
              {filteredLeads.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              No leads found matching your criteria.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
