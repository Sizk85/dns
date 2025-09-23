import { SessionUser } from './auth';

export type Role = 'user' | 'admin' | 'owner';

export interface Permission {
  viewDNS: boolean;
  createDNS: boolean;
  editDNS: boolean;
  deleteDNS: boolean;
  manageBlacklist: boolean;
  viewUsers: boolean;
  manageUsers: boolean;
}

export function getPermissions(role: Role): Permission {
  const permissions: Record<Role, Permission> = {
    user: {
      viewDNS: true,
      createDNS: true, // Can be restricted by policy
      editDNS: true,   // Can be restricted by policy  
      deleteDNS: false,
      manageBlacklist: false,
      viewUsers: false,
      manageUsers: false,
    },
    admin: {
      viewDNS: true,
      createDNS: true,
      editDNS: true,
      deleteDNS: true,
      manageBlacklist: true,
      viewUsers: false,
      manageUsers: false,
    },
    owner: {
      viewDNS: true,
      createDNS: true,
      editDNS: true,
      deleteDNS: true,
      manageBlacklist: true,
      viewUsers: true,
      manageUsers: true,
    },
  };

  return permissions[role];
}

export function hasPermission(user: SessionUser | null, permission: keyof Permission): boolean {
  if (!user) return false;
  return getPermissions(user.role)[permission];
}

export function requireRole(user: SessionUser | null, minRole: Role): boolean {
  if (!user) return false;
  
  const roleHierarchy: Record<Role, number> = {
    user: 1,
    admin: 2,
    owner: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[minRole];
}

export function canManageUser(actor: SessionUser | null, targetRole: Role): boolean {
  if (!actor || actor.role !== 'owner') return false;
  
  // Owner can manage user and admin roles, but not other owners
  return targetRole !== 'owner';
}

// Error helpers
export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export function assertPermission(user: SessionUser | null, permission: keyof Permission): void {
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError();
  }
}

export function assertRole(user: SessionUser | null, minRole: Role): void {
  if (!requireRole(user, minRole)) {
    throw new AuthorizationError();
  }
}
