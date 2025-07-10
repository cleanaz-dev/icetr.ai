"use client"
import { useState, useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

const ITEMS_PER_PAGE = 50

export function LeadAssignmentComponent({ 
  leads, 
  members, 
  selectedLeadIds, 
  setSelectedLeadIds, 
  selectedUserId, 
  setSelectedUserId 
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignmentFilter, setAssignmentFilter] = useState('all')

  // Get unique filter options
  const regions = useMemo(() => 
    [...new Set(leads.map(lead => lead.region).filter(Boolean))], 
    [leads]
  )
  const industries = useMemo(() => 
    [...new Set(leads.map(lead => lead.industry).filter(Boolean))], 
    [leads]
  )
  const statuses = useMemo(() => 
    [...new Set(leads.map(lead => lead.status).filter(Boolean))], 
    [leads]
  )

  // Filter and search logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRegion = regionFilter === 'all' || lead.region === regionFilter
      const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesAssignment = assignmentFilter === 'all' || 
        (assignmentFilter === 'unassigned' && !lead.assignedUser) ||
        (assignmentFilter === 'assigned' && lead.assignedUser)

      return matchesSearch && matchesRegion && matchesIndustry && matchesStatus && matchesAssignment
    })
  }, [leads, searchTerm, regionFilter, industryFilter, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Selection logic
  const currentPageLeadIds = paginatedLeads.map(lead => lead.id)
  const allCurrentPageSelected = currentPageLeadIds.every(id => selectedLeadIds.includes(id))
  const someCurrentPageSelected = currentPageLeadIds.some(id => selectedLeadIds.includes(id))

  const handleSelectAllCurrentPage = (checked) => {
    if (checked) {
      setSelectedLeadIds(prev => [...new Set([...prev, ...currentPageLeadIds])])
    } else {
      setSelectedLeadIds(prev => prev.filter(id => !currentPageLeadIds.includes(id)))
    }
  }

  const handleLeadToggle = (leadId, checked) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, leadId])
    } else {
      setSelectedLeadIds(prev => prev.filter(id => id !== leadId))
    }
  }

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredLeads.map(lead => lead.id)
    setSelectedLeadIds(prev => [...new Set([...prev, ...allFilteredIds])])
  }

  const clearSelection = () => {
    setSelectedLeadIds([])
  }

  // Reset page when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1)
    switch (filterType) {
      case 'region':
        setRegionFilter(value)
        break
      case 'industry':
        setIndustryFilter(value)
        break
      case 'status':
        setStatusFilter(value)
        break
      case 'assignment':
        setAssignmentFilter(value)
        break
    }
  }

  return (
    <div className="space-y-4 flex-1 min-h-0">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by phone, company, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
          <Select value={assignmentFilter} onValueChange={(value) => handleFilterChange('assignment', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={regionFilter} onValueChange={(value) => handleFilterChange('region', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={(value) => handleFilterChange('industry', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing {paginatedLeads.length} of {filteredLeads.length} leads
          {selectedLeadIds.length > 0 && (
            <span className="ml-2 font-medium">
              • {selectedLeadIds.length} selected
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllFiltered}
            disabled={filteredLeads.length === 0}
          >
            Select All Filtered ({filteredLeads.length})
          </Button>
          {selectedLeadIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allCurrentPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
                  }}
                  onCheckedChange={handleSelectAllCurrentPage}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-48">Company</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeadIds.includes(lead.id)}
                    onCheckedChange={(checked) => handleLeadToggle(lead.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{lead.phoneNumber}</div>
                    {lead.email && (
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-48">
                  <div className="truncate" title={lead.company || '-'}>
                    {lead.company || '-'}
                  </div>
                </TableCell>
                <TableCell>{lead.region || '-'}</TableCell>
                <TableCell>{lead.industry || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.assignedUser ? (
                    <Badge variant="outline" className="text-xs">
                      {lead.assignedUser.firstname} {lead.assignedUser.lastname}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Assign to:</label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a team member" />
          </SelectTrigger>
          <SelectContent>
            {members?.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                <div className="flex items-center space-x-2">
                  {member.imageUrl && (
                    <img
                      src={member.imageUrl}
                      alt={`${member.firstname} ${member.lastname}`}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>
                    {member.firstname} {member.lastname}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignment Summary */}
      <div className="p-3 bg-muted rounded-md min-h-[60px] flex flex-col justify-center">
        {selectedUserId && selectedLeadIds.length > 0 ? (
          <>
            <div className="text-sm">
              <span className="font-medium">Assigning to:</span> {
                members?.find(m => m.id === selectedUserId)?.firstname
              } {
                members?.find(m => m.id === selectedUserId)?.lastname
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''} will be assigned
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a user and leads to assign
          </div>
        )}
      </div>
    </div>
  )
}