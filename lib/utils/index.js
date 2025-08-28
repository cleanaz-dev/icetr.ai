//lib/utils/index.js

import {
  Crown,
  Shield,
  UserRoundCog,
  User,
  UserCheck,
  Phone,
  ContactRound,
  Megaphone,
  BookOpen,
  AlertTriangle,
  Info,
  Bell,
  ShieldAlert,
  Target,
  MessageCircle,
  Award,
} from "lucide-react";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Shuffles the elements of an array in place using the Fisher-Yates algorithm.
 *
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} The shuffled array.
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Combines a first name and last name into a full name string.
 *
 * @param {string} firstname - The first name.
 * @param {string} lastname - The last name.
 * @returns {string} The full name in "Firstname Lastname" format.
 */
export function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Returns the first enabled integration of a given type with a valid URI.
 * @param {Object} publicIntegrations - The full publicIntegrations object from context.
 * @param {string} type - Integration type key (e.g., 'calendlyIntegrations', 'twilioIntegrations')
 * @returns {Object|null} The matched integration or null if none found.
 */
export function getPublicIntegrationData(publicIntegrations, type) {
  if (!publicIntegrations || !publicIntegrations[type]) return null;
  return (
    publicIntegrations[type].find(
      (integration) => integration.enabled && integration.orgUri
    ) || null
  );
}

/**
 * Filters an integration object to only include fields
 * that are marked as public based on the included `publicFields` array.
 *
 * @param {Object} integration - The full integration object fetched from Prisma,
 *   expected to include a `publicFields` property which is an array of objects
 *   each having a `fieldName` string.
 *
 * @returns {Object} A new object containing only the fields
 *   listed in `integration.publicFields`.
 */
export function filterPublicFields(integration) {
  if (
    !integration ||
    !Array.isArray(integration.publicFields) ||
    integration.publicFields.length === 0
  ) {
    // No public fields defined; return empty object or you can return entire object
    return {};
  }

  // Extract the list of allowed public field names
  const allowedFields = integration.publicFields.map((f) => f.fieldName);

  // Filter the integration object entries to only those allowed
  return Object.fromEntries(
    Object.entries(integration).filter(([key]) => allowedFields.includes(key))
  );
}

/**
 * Get role icon with appropriate color
 * @param {string} role - User role
 * @returns {JSX.Element} Role icon component
 */
export const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return <Crown className="w-4 h-4 text-purple-500" />; // Purple for highest authority
    case "admin":
      return <Shield className="w-4 h-4 text-amber-500" />; // Amber for admin
    case "manager":
      return <UserRoundCog className="w-4 h-4 text-green-500" />; // Green for manager
    case "agent":
      return <User className="w-4 h-4 text-blue-500" />; // Blue for agent
    default:
      return <UserCheck className="w-4 h-4 text-gray-500" />; // Gray for unknown
  }
};

/**
 * Get role display name with proper formatting
 * @param {string} role - User role
 * @returns {string} Formatted role name
 */
export const getRoleDisplayName = (role) => {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "agent":
      return "Agent";
    default:
      return role || "Unknown";
  }
};

/**
 * Get campaign type icon and label
 * @param {string} type - Campaign type
 * @returns {JSX.Element} Campaign type component
 */
export const getCampaignType = (type) => {
  switch (type?.toUpperCase()) {
    case "CALLS":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="size-3 text-primary" />
          Calls
        </div>
      );
    case "FORMS":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ContactRound className="size-3 text-primary" />
          Forms
        </div>
      );
    case "EMAIL":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="size-3 text-primary" />
          Email
        </div>
      );
    case "SMS":
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3 text-primary" />
          SMS
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="capitalize">{type?.toLowerCase() || "Unknown"}</span>
        </div>
      );
  }
};

/**
 * Get campaign status badge
 * @param {string} status - Campaign status
 * @returns {JSX.Element} Status badge component
 */
export const getCampaignStatusBadge = (status) => {
  const baseClasses =
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";

  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return (
        <span
          className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}
        >
          Active
        </span>
      );
    case "PAUSED":
      return (
        <span
          className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}
        >
          Paused
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
        >
          Completed
        </span>
      );
    case "DRAFT":
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}
        >
          Draft
        </span>
      );
    default:
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}
        >
          {status || "Unknown"}
        </span>
      );
  }
};

/**
 * Get user avatar fallback initials
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @returns {string} Avatar initials
 */
export const getAvatarInitials = (firstname, lastname) => {
  const firstInitial = firstname?.[0]?.toUpperCase() || "";
  const lastInitial = lastname?.[0]?.toUpperCase() || "";
  return firstInitial + lastInitial || "U";
};

/**
 * Filters an integration object to only include its public fields
 * when publicFields is an array of strings.
 *
 * @param {Object} integration
 * @param {string[]} integration.publicFields
 * @returns {Object}
 */
export function filterPublicIntegrationQuery(integration) {
  if (!integration || !integration.publicFields) return {};

  const result = {};
  for (const field of integration.publicFields) {
    // field.fieldName is the actual field name, not field itself
    const fieldName = field.fieldName;
    if (fieldName in integration) {
      result[fieldName] = integration[fieldName];
    }
  }
  return result;
}



/**
 * Returns configuration details (icon component, color, and text decoration)
 * for a given broadcast type. Useful for rendering consistent UI elements
 * depending on the broadcast's category.
 *
 * @param {string} type - The type of broadcast (e.g., "announcement", "alert", "training", "general", "system", "campaign").
 * @returns {Object} The configuration object for the broadcast type.
 * @returns {React.ComponentType} return.icon - The Lucide icon component to use.
 * @returns {string} return.iconColor - Tailwind CSS color class for the icon.
 * @returns {string} return.decoration - Tailwind CSS text decoration class for styling.
 *
 * @example
 * const config = getBroadcastConfig("alert");
 * // config.icon -> AlertTriangle component
 * // config.iconColor -> "text-red-600"
 * // config.decoration -> "underline decoration-red-500"
 */
export const getBroadcastConfig = (type) => {
  switch (type?.toLowerCase()) {
    case "announcement":
      return {
        icon: Megaphone,
        iconColor: "text-blue-600",
        decoration: "underline decoration-blue-500",
      };
    case "alert":
      return {
        icon: AlertTriangle,
        iconColor: "text-red-600",
        decoration: "underline decoration-red-500",
      };
    case "training":
      return {
        icon: BookOpen,
        iconColor: "text-green-600",
        decoration: "underline decoration-green-500",
      };
    case "general":
      return {
        icon: Info,
        iconColor: "text-gray-600",
        decoration: "underline decoration-gray-500",
      };
    case "system":
      return {
        icon: ShieldAlert,
        iconColor: "text-amber-500",
        decoration: "underline decoration-amber-500",
      };
    case "campaign":
      return {
        icon: Target,
        iconColor: "text-blue-600",
        decoration: "underline decoration-blue-500",
      };
    default:
      return {
        icon: Bell,
        iconColor: "text-gray-600",
        decoration: "underline decoration-gray-500",
      };
  }
};
