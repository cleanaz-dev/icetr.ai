import { Badge } from '@/components/ui/badge';
import { statusOptions } from '@/lib/constants/leads';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

/**
 * Returns a JSX badge element for a given status string.
 *
 * @param {string} status
 * @returns {JSX.Element}
 */
export function getStatusBadge(status) {
  const statusConfig = statusOptions.find((s) => s.value === status);

  return (
    <Badge
      variant="secondary"
      className={`${statusConfig?.color || 'bg-gray-400'} text-white`}
    >
      {statusConfig?.label || 'Unknown'}
    </Badge>
  );
}


export const UserDisplay = ({ user }) => {
    // ← Add destructuring here
    if (!user) return "Unassigned";

    // Create initials from first and last name
    const initials = `${user.firstname?.[0] || ""}${
      user.lastname?.[0] || ""
    }`.toUpperCase();

    return (
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage
            src={user.imageUrl}
            alt={`${user.firstname} ${user.lastname}`}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span>
          {user.firstname} {user.lastname}
        </span>
      </div>
    );
  };
