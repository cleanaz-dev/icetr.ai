// lib/hooks/usePermissions.js
import { usePermissionContext } from '@/context/PermissionProvider';

export const usePermissions = () => {
  const { permissions, role, loading } = usePermissionContext();
  
  const hasPermission = (permissionName) => {
    return permissions.some(p => p.name === permissionName);
  };
  
  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some(name => hasPermission(name));
  };
  
  return { hasPermission, hasAnyPermission, permissions, role, loading };
};
