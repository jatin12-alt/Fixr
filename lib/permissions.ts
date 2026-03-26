import { TeamRole } from '@/lib/db'

export const roleHierarchy: Record<TeamRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  MEMBER: 50,
  VIEWER: 20,
}

export const rolePermissions: Record<TeamRole, {
  canManageTeam: boolean
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canManageRepos: boolean
  canViewAnalytics: boolean
  canManageSettings: boolean
  canViewAuditLogs: boolean
}> = {
  OWNER: {
    canManageTeam: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canManageRepos: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canViewAuditLogs: true,
  },
  ADMIN: {
    canManageTeam: false,
    canInviteMembers: true,
    canRemoveMembers: true,
    canManageRepos: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canViewAuditLogs: true,
  },
  MEMBER: {
    canManageTeam: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRepos: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canViewAuditLogs: false,
  },
  VIEWER: {
    canManageTeam: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canManageRepos: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canViewAuditLogs: false,
  },
}

export function canPerformAction(
  userRole: TeamRole,
  requiredRole: TeamRole
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function hasPermission(
  userRole: TeamRole,
  permission: keyof typeof rolePermissions[TeamRole]
): boolean {
  return rolePermissions[userRole][permission]
}

export function getRoleLabel(role: TeamRole): string {
  const labels: Record<TeamRole, string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MEMBER: 'Member',
    VIEWER: 'Viewer',
  }
  return labels[role]
}

export function getRoleDescription(role: TeamRole): string {
  const descriptions: Record<TeamRole, string> = {
    OWNER: 'Full control over team and all resources',
    ADMIN: 'Can manage members, repositories, and view analytics',
    MEMBER: 'Can manage repositories and view analytics',
    VIEWER: 'Read-only access to team analytics and repositories',
  }
  return descriptions[role]
}

export function canManageRole(
  managerRole: TeamRole,
  targetRole: TeamRole
): boolean {
  // Can't manage roles equal or higher than yours
  return roleHierarchy[managerRole] > roleHierarchy[targetRole]
}

export function canRemoveMember(
  removerRole: TeamRole,
  memberRole: TeamRole
): boolean {
  // Can't remove members with equal or higher role
  return roleHierarchy[removerRole] > roleHierarchy[memberRole]
}
