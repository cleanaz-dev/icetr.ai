"use server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, today } from "date-fns";
import { Truculenta } from "next/font/google";

export async function getAdminDashboardData(clerkId, orgId) {
  const query = await prisma.organization.findFirst({
    where: {
      id: orgId,
      users: {
        some: {
          clerkId: clerkId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      onboardingCompleted: true,
      campaigns: {
        select: {
          id: true,
          name: true,
          status: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      teams: {
        select: {
          id: true,
          name: true,
          broadcasts: true,
          manager: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              fullname: true,
              imageUrl: true,
            },
          },
          members: {
            select: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  imageUrl: true,
                  role: {
                    select: {
                      type: true,
                    },
                  },
                  teamMemberships: {
                    select: {
                      teamRole: true,
                    },
                  },
                  _count: {
                    select: {
                      call: true,
                      assignedLeads: true,
                      trainingSessions: true,
                      bookings: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return query;
}

export async function getAgentDashboardData(clerkId, orgId) {
  const user = await prisma.user.findFirst({
    where: {
      clerkId,
      orgId,
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      fullname: true,
      imageUrl: true,
      teamMemberships: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              members: {
                select: {
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                      imageUrl: true,
                      activities: {
                        select: {
                          id: true,
                          type: true,
                          content: true,
                          createdAt: true,
                          createdUser: {
                            select: {
                              id: true,
                              firstname: true,
                              lastname: true,
                              fullname: true,
                              imageUrl: true,
                            },
                          },
                        },
                        take: 5,
                      },
                      teamMemberships: {
                        select: {
                          teamRole: true,
                          teamId: true,
                        },
                      },
                      _count: {
                        select: {
                          assignedLeads: true,
                          bookings: true,
                        },
                      },
                    },
                  },
                },
              },
              manager: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  fullname: true,
                  imageUrl: true,
                },
              },
            },
          },
          teamRole: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          assignedLeads: true,
          call: {
            where: {
              createdAt: {
                gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Normalize team members
  const teamMembers = user.teamMemberships.flatMap((membership) =>
    membership.team.members.map((m) => {
      const role =
        m.user.teamMemberships.find((tm) => tm.teamId === membership.team.id)
          ?.teamRole || "MEMBER";

      return {
        id: m.user.id,
        firstname: m.user.firstname,
        lastname: m.user.lastname,
        imageUrl: m.user.imageUrl,
        teamRole: role,
        assignedLeadsCount: m.user._count?.assignedLeads || 0,
        bookingsCount: m.user._count?.bookings || 0,
      };
    })
  );

  // Flatten all activities from all team members into one array
  const teamActivities = user.teamMemberships.flatMap((membership) =>
    membership.team.members.flatMap((m) => m.user.activities)
  );

  return {
    ...user,
    teamMembers,
    teamActivities,
  };
}

export async function getTeamAndMembersAnnouncements(clerkId, orgId) {
  const query = await prisma.broadcast.findMany({
    where: {
      teams: {
        some: {
          organization: { id: orgId },
          members: {
            some: {
              user: {
                clerkId: clerkId,
              },
            },
          },
        },
      },
    },
  });
  return query;
}
