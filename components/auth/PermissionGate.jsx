// components/PermissionGate.js
import { usePermissionContext } from '@/context/PermissionProvider';

const PermissionGate = ({ 
  permission,           // Single permission string
  permissions,          // Array of permissions (any)
  requireAll,          // Array of permissions (all required)
  role,                // Required role
  children,            // What to render if permission granted
  fallback = null,     // What to render if permission denied
  loading = null       // What to render while loading
}) => {
  const { permissions: userPermissions, role: userRole, loading: isLoading } = usePermissionContext();


  // Show loading state
  if (isLoading) {
    return loading;
  }

  // Helper function to check if user has a specific permission
  const hasPermission = (permissionName) => {
    return userPermissions.some(p => p.name === permissionName);
  };

// Updated to handle both string and array roles
  const hasRole = (requiredRole) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  };
  // Check role first if specified
  if (role && !hasRole(role)) {
    return fallback;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Check any of multiple permissions
  if (permissions && !permissions.some(p => hasPermission(p))) {
    return fallback;
  }

  // Check all permissions required
  if (requireAll && !requireAll.every(p => hasPermission(p))) {
    return fallback;
  }

  // All checks passed - render children
  return children;
};

export default PermissionGate;

// Optional: Export some common permission checks as named exports

export const SuperAdminGate = ({ children, fallback }) => (
  <PermissionGate role="SuperAdmin" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const AdminOrAboveGate = ({ children, fallback }) => (
  <PermissionGate 
    role={["SuperAdmin", "Admin"]} 
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const AdminGate = ({ children, fallback }) => (
  <PermissionGate role="Admin" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const ManagerOrAboveGate = ({ children, fallback }) => (
  <PermissionGate
    role={["SuperAdmin", "Admin", "Manager"]}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
)
