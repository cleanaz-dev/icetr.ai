"use client";
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Users,
  MoreHorizontal,
  Eye,
  Trash2,
  UserPlus,
  UserMinus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { BatchAssignDialog } from "./BatchAssignDialog";
import { toast } from "sonner";
import ImportLeadsDialog from "./ImportLeadsDialog";
import PermissionGate, {
  AdminOrAboveGate,
} from "@/components/auth/PermissionGate";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { statusOptions, sourceOptions } from "@/lib/constants/leads";
import { Loader2 } from "lucide-react";
import { getStatusBadge, UserDisplay } from "@/components/ui/helpers";
import DeleteLeadsDialog from "./DeleteLeadsDialog";

const columnHelper = createColumnHelper();

export function EnhancedLeadsTableTanStack({
  leads,
  teams,
  members,
  teamCampaigns,
  orgId,
  assignLeads,
  unassignLeads,
  importLeads,
  deleteLead,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [currentLead, setCurrentLead] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { hasPermission } = usePermissions();
  const handleOpenDelete = (lead) => {
    setCurrentLead(lead);
    setOpenDeleteDialog(true);
  };

  const handleCloseDelete = () => {
    setOpenDeleteDialog(false);
    setCurrentLead(null);
  };

  // Column definitions
  const columns = useMemo(
    () => [
      // 1️⃣  Checkbox column
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="ml-1"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="ml-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),

      // Lead info column
      columnHelper.accessor("name", {
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Lead
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      }),
      // Company column
      columnHelper.accessor("company", {
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Company
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => (
          <div className="truncate max-w-[200px]">{getValue()}</div>
        ),
      }),
      // Source column
      columnHelper.accessor("source", {
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Source
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
      }),
      // Industry column
      columnHelper.accessor("industry", {
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Industry
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue()}</span>
        ),
      }),
      // Status column
      columnHelper.accessor("status", {
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ getValue }) => getStatusBadge(getValue()),
      }),
      // Assigned user column
      columnHelper.accessor("assignedUser", {
        header: "Assigned To",
        cell: ({ getValue }) => <UserDisplay user={getValue()} />,
        enableSorting: false,
      }),
      // Actions column
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  {hasPermission("lead.delete") ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(lead);
                      }}
                    >
                      <Trash2 className="mr-1 size-4 hover:text-accent-foreground" />
                      Delete
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled className="opacity-50">
                      No actions available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    [getStatusBadge, UserDisplay]
  );

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchTerm ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      const matchesSource =
        sourceFilter === "all" || lead.source === sourceFilter;
      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "unassigned" && !lead.assignedUser) ||
        (assignmentFilter === "assigned" && lead.assignedUserId);
      const matchesCampaign =
        campaignFilter === "all" || lead.campaign?.id === campaignFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesAssignment &&
        matchesCampaign
      );
    });
  }, [
    leads,
    searchTerm,
    statusFilter,
    sourceFilter,
    assignmentFilter,
    campaignFilter,
  ]);

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
  });

  // Get selected rows
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedLeadIds = selectedRows.map((row) => row.original.id);
  // const leadCampaigns = leads.reduce((campaigns, lead) => {
  //   const campaign = lead.campaign;
  //   if (campaign && !campaigns.find((c) => c.id === campaign.id)) {
  //     campaigns.push(campaign);
  //   }
  //   return campaigns;
  // }, []);

  const handleBulkAssign = async () => {
    if (!selectedAssigneeId || selectedLeadIds.length === 0) return;

    setIsAssigning(true);
    try {
      const result = await assignLeads({
        leadIds: selectedLeadIds,
        assignToId: selectedAssigneeId,
        orgId: orgId,
      });

      if (result.success) {
        setRowSelection({});
        setSelectedAssigneeId("");
        toast.success(`${selectedLeadIds.length} leads assigned successfully`);
      } else {
        console.error("Assignment failed:", result.error);
        toast.error("Failed to assign leads");
      }
    } catch (error) {
      console.error("Assignment failed:", error);
      toast.error("Something went wrong");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedLeadIds.length === 0) return;

    setIsAssigning(true);
    try {
      const result = await unassignLeads({
        leadIds: selectedLeadIds,
        orgId: orgId,
      });

      if (result.success) {
        setRowSelection({});
        toast.success(
          `${selectedLeadIds.length} leads unassigned successfully`
        );
      } else {
        console.error("Unassignment failed:", result.error);
        toast.error("Failed to unassign leads");
      }
    } catch (error) {
      console.error("Unassignment failed:", error);
      toast.error("Something went wrong");
    } finally {
      setIsAssigning(false);
    }
  };

  const filtersApplied =
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    assignmentFilter !== "all";

  return (
    <>
      <DeleteLeadsDialog
        lead={currentLead}
        onDelete={async (id, orgId) => {
          await deleteLead(id, orgId); // wait
          toast.success("Lead deleted"); // show toast after success
        }}
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        orgId={orgId}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Leads Management</CardTitle>
              <CardDescription>
                Filter and manage your sales leads
              </CardDescription>
            </div>
            <div>
              <AdminOrAboveGate>
                <ImportLeadsDialog
                  campaigns={teamCampaigns}
                  orgId={orgId}
                  importLeads={importLeads}
                />
              </AdminOrAboveGate>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            {/* Search bar */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={assignmentFilter}
                onValueChange={setAssignmentFilter}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {teamCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Assignment Section */}
            {hasPermission("lead.assign") && (
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/25 justify-evenly flex-wrap">
                <span className="w-20 text-sm font-medium text-left shrink-0 ">
                  {selectedLeadIds.length} selected
                </span>

                {/* 1. Pick TEAM */}
                <Select
                  value={selectedTeamId}
                  onValueChange={(teamId) => {
                    setSelectedTeamId(teamId);
                    setSelectedAssigneeId(""); // reset member
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 2. Pick MEMBER inside that team */}
                <Select
                  value={selectedAssigneeId}
                  onValueChange={setSelectedAssigneeId}
                  disabled={!selectedTeamId}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams
                      ?.find((t) => t.id === selectedTeamId)
                      ?.members.map(({ user }) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            {user.imageUrl && (
                              <img
                                src={user.imageUrl}
                                alt={`${user.firstname} ${user.lastname}`}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span>
                              {user.firstname} {user.lastname}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleBulkAssign}
                  disabled={!selectedAssigneeId || isAssigning}
                  size="sm"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBulkUnassign}
                  disabled={isAssigning}
                  variant="outline"
                  size="sm"
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unassign
                </Button>
                <BatchAssignDialog
                  leads={leads}
                  members={members}
                  onAssign={assignLeads}
                />

                <Button
                  onClick={() => setRowSelection({})}
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          {table.getState().pagination.pageSize > 10 && (
            <div className="flex justify-between ">
              <div className="p-1 self-end text-xs text-muted-foreground flex items-end">
                Showing {table.getRowModel().rows.length} of{" "}
                {filteredData.length} leads
              </div>

              <div className="flex justify-between  mb-1  space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2 ">
                  <p className="text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-80 text-center"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {searchTerm || filtersApplied
                            ? "No matching leads found"
                            : "No leads available"}
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          {searchTerm || filtersApplied
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by adding your first lead"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
