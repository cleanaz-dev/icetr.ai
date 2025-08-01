// config/navigation.js
import { Hero } from "@/components/sections/Hero";
import { CreditCard } from "lucide-react";
import {
  Home,
  Users,
  PhoneOutgoing,
  Megaphone,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Folder,
  UsersRound,
  Trophy,
  Handshake,
} from "lucide-react";
import { permission } from "process";
import { PiStudent } from "react-icons/pi";

// Define navigation with required permissions
export const navigation = [
  {
    name: "Dashboard",
    href: "/home",
    icon: Home,
    permissions: [], // Everyone can see dashboard
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Trophy,
    permissions: ["campaign.update"],
  },
  {
    name: "Teams",
    href: "/teams",
    icon: Handshake,
    permissions: ["team.read"],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    permissions: ["lead.create"],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: Folder,
    permissions: [],
  },
  {
    name: "Training",
    href: "/training",
    icon: PiStudent,
    permissions: ["training.read", "training.access"], // Needs ANY of these
  },
  {
    name: "Dialer",
    href: "/dialer",
    icon: PhoneOutgoing,
    permissions: ["call.create", "call.read"], // Needs ANY of these
  },

  // {
  //   name: "Reports",
  //   href: "/reports",
  //   icon: BarChart3,
  //   permissions: ["reports.view"],
  // },
  // {
  //   name: "Analytics",
  //   href: "/analytics",
  //   icon: BarChart3,
  //   permissions: ["analytics.view"],
  // },

  // {
  //   name: "Documents",
  //   href: "/documents",
  //   icon: FileText,
  //   permissions: [], // Everyone can access documents (or add specific permissions)
  // },
  // {
  //   name: "Admin Panel",
  //   href: "/admin",
  //   icon: Shield,
  //   permissions: ["user.create", "organization.settings"], // Needs ANY of these
  // },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    permissions: [], // Everyone can access basic settings
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    permission: ["organization.update"]
  }
];

// Helper function to check if user has permission
const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.some(
    (userPerm) => userPerm.name === requiredPermission
  );
};

// Main filter function
export const getPermissionBasedNavigation = (userPermissions) => {
  return navigation.filter((item) => {
    // If no permissions required, show to everyone
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    // Check if user has ANY of the required permissions
    return item.permissions.some((permission) =>
      hasPermission(userPermissions, permission)
    );
  });
};

// Alternative: If you need ALL permissions (stricter check)
export const getStrictPermissionNavigation = (userPermissions) => {
  return navigation.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    // Check if user has ALL required permissions
    return item.permissions.every((permission) =>
      hasPermission(userPermissions, permission)
    );
  });
};

// For complex permission logic, you can add a custom checker
export const getAdvancedPermissionNavigation = (userPermissions, userRole) => {
  return navigation.filter((item) => {
    // Custom logic for specific items
    if (item.name === "Admin Panel") {
      // Admin panel requires specific role AND permissions
      return (
        (userRole === "Admin" || userRole === "SuperAdmin") &&
        item.permissions.some((perm) => hasPermission(userPermissions, perm))
      );
    }

    // Default permission check for other items
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }

    return item.permissions.some((permission) =>
      hasPermission(userPermissions, permission)
    );
  });
};

export default getPermissionBasedNavigation;
