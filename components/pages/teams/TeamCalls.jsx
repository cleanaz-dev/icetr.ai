import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";

export default function TeamCalls({ team, callsData = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMember, setFilterMember] = useState("all");

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterMember("all");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b bg-card/50">
        {/* Title Section */}
        <div className="p-4 pb-3">
          <div className="flex items-center">
            <Phone className="size-5 mr-2 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Team Calls
            </h2>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {callsData?.length || 0} calls
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Today
              </span>
              <Badge variant="outline" className="font-semibold">
                0
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search calls..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-10 bg-background/50"
                />
              </div>

              <Select value={filterMember} onValueChange={setFilterMember}>
                <SelectTrigger className="w-auto bg-background/50 cursor-pointer">
                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {/* Add team members here */}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-auto bg-background/50 cursor-pointer">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="bg-background/50 hover:bg-background/80"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1">
        <Table className="table-fixed">
          <TableHeader className="bg-background/50 rounded-t-md">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-40">Member</TableHead>
              <TableHead className="w-32">Contact</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24">Duration</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-24">Time</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Empty state */}
            <TableRow>
              <TableCell colSpan="8" className="text-center py-8">
                <div className="text-muted-foreground">
                  <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No calls found</p>
                  <p className="text-sm">Call data will appear here</p>
                </div>
              </TableCell>
            </TableRow>
            
            {/* Example of how data rows would look */}
            {/* 
            {filteredCalls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>
                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img src={call.member.avatar} alt="" className="w-6 h-6 rounded-full" />
                    {call.member.name}
                  </div>
                </TableCell>
                
                <TableCell>{call.contact}</TableCell>
                
                <TableCell>
                  <Badge variant={getStatusVariant(call.status)}>
                    {call.status}
                  </Badge>
                </TableCell>
                
                <TableCell>{call.duration}</TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {call.date}
                  </div>
                </TableCell>
                
                <TableCell>{call.time}</TableCell>
                
                <TableCell className="max-w-xs truncate">
                  {call.notes}
                </TableCell>
              </TableRow>
            ))}
            */}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}