// /lib/prisma/selects.js
/**
 * Reusable Prisma select objects to avoid repetition
 */

// Basic user profile fields (most common)
export const userProfileSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  imageUrl: true,
  role: {
    select: {
      type: true,
    },
  },
};

// Extended user profile with more details
export const userProfileExtendedSelect = {
  ...userProfileSelect,
  role: true,
  createdAt: true,
  lastActiveAt: true,
};

// Minimal user info (for dropdowns, etc.)
export const userMinimalSelect = {
  id: true,
  firstname: true,
  lastname: true,
  imageUrl: true,
};

// User with organization context
export const userWithOrgSelect = {
  ...userProfileSelect,
  organizations: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

export const teamWithTeamMembersSelect = {
  id: true,
  name: true,
  members: {
    select: {
      id: true,
      userId: true,
      teamRole: true,
      teamId: true,
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          fullname: true,
          email: true,
          imageUrl: true,
          role: {
            select: { type: true },
          },
          teamMemberships: {
            select: {
              id: true,
              teamId: true,
              teamRole: true,
            },
          },
          _count: {
            select: {
              assignedLeads: true,
            },
          },
        },
      },
    },
  },
};

// Team member with user info
export const teamMemberSelect = {
  id: true,
  firstname: true,
  lastname: true,
  fullname: true,
  email: true,
  imageUrl: true,
  role: {
    select: { type: true },
  },
  _count: {
    select: {
      assignedLeads: true,
    },
  },
  teamMemberships: {
    select: {
      id: true,
      teamId: true,
      teamRole: true,
    },
  },
  user: {
    select: {
      id: true,
    },
  },
};

// Team with full details
export const teamWithDetailsSelect = {
  id: true,
  name: true,
  createdAt: true,
  manager: {
    select: userProfileSelect,
  },
  members: {
    select: teamMemberSelect,
  },
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
};

// Lead with assigned user info
export const leadWithUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  assignedTo: {
    select: userProfileSelect,
  },
  createdBy: {
    select: userMinimalSelect,
  },
};

// Call with participants
export const callWithParticipantsSelect = {
  id: true,
  callSid: true,
  direction: true,
  status: true,
  duration: true,
  createdAt: true,
  lead: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  createdUser: {
    select: userProfileSelect,
  },
};

export const campaignSelect = {};

export const memberSelect = {
  id: true,
  teamId: true,
  user: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      fullname: true,
      imageUrl: true,
      _count: {
        select: {
          assignedLeads: true,
        },
      },
    },
  },
};


export const userSelect = {
  
}