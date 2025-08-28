// config/navigation.js


import { CreditCard } from "lucide-react";
import {
  Home,
  Users,
  PhoneOutgoing,
  Settings,
  Folder,
  Trophy,
  Handshake,
  Megaphone
} from "lucide-react";
import { PiStudent } from "react-icons/pi";
import { tierCheck } from "../services/tier-check";


// Define navigation with required permissions
export const navigation = [
  {
    name: "Dashboard",
    href: "/home",
    icon: Home,
    tier: null, // always visible
    permissions: [],
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
    tier: null,
    permissions: ["campaign.update"],
  },
  {
    name: "Teams",
    href: "/teams",
    icon: Handshake,
    tier: null,
    permissions: ["team.read"],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    tier: null,
    permissions: ["lead.create"],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: Folder,
    tier: null,
    permissions: [],
  },
  {
    name: "Training",
    href: "/training",
    icon: PiStudent,
    tier: null, // only PRO and above
    permissions: ["training.read", "training.access"],
  },
  {
    name: "Dialer",
    href: "/dialer",
    icon: PhoneOutgoing,
    tier: null, 
    permissions: ["call.create", "call.read"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    tier: null,
    permissions: [],
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    tier: null,
    permissions: ["organization.update"],
  },
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

// ✅ Main filter function
export const getNavigation = ({ userPermissions, orgTier }) => {
  return navigation.filter((item) => {
    const hasTierAccess = !item.tier || tierCheck.isAtLeast(orgTier, item.tier);
    const hasUserPermission =
      !item.permissions?.length ||
      item.permissions.some((p) => hasPermission(userPermissions, p));

    return hasTierAccess && hasUserPermission;
  });
};

export default getPermissionBasedNavigation;
