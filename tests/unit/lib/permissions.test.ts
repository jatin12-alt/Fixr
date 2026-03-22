import { hasPermission, canPerformAction, getRoleLevel, TeamRole } from '@/lib/permissions';

describe('Team Permissions', () => {
  describe('getRoleLevel', () => {
    it('should return correct levels for all roles', () => {
      expect(getRoleLevel(TeamRole.OWNER)).toBe(100);
      expect(getRoleLevel(TeamRole.ADMIN)).toBe(80);
      expect(getRoleLevel(TeamRole.MEMBER)).toBe(50);
      expect(getRoleLevel(TeamRole.VIEWER)).toBe(20);
    });

    it('should handle invalid roles', () => {
      expect(() => getRoleLevel('INVALID' as TeamRole)).toThrow('Invalid team role');
    });
  });

  describe('hasPermission', () => {
    const testCases = [
      // OWNER can do everything
      { role: TeamRole.OWNER, requiredRole: TeamRole.OWNER, expected: true },
      { role: TeamRole.OWNER, requiredRole: TeamRole.ADMIN, expected: true },
      { role: TeamRole.OWNER, requiredRole: TeamRole.MEMBER, expected: true },
      { role: TeamRole.OWNER, requiredRole: TeamRole.VIEWER, expected: true },
      
      // ADMIN can do admin and below
      { role: TeamRole.ADMIN, requiredRole: TeamRole.OWNER, expected: false },
      { role: TeamRole.ADMIN, requiredRole: TeamRole.ADMIN, expected: true },
      { role: TeamRole.ADMIN, requiredRole: TeamRole.MEMBER, expected: true },
      { role: TeamRole.ADMIN, requiredRole: TeamRole.VIEWER, expected: true },
      
      // MEMBER can do member and viewer actions
      { role: TeamRole.MEMBER, requiredRole: TeamRole.OWNER, expected: false },
      { role: TeamRole.MEMBER, requiredRole: TeamRole.ADMIN, expected: false },
      { role: TeamRole.MEMBER, requiredRole: TeamRole.MEMBER, expected: true },
      { role: TeamRole.MEMBER, requiredRole: TeamRole.VIEWER, expected: true },
      
      // VIEWER can only do viewer actions
      { role: TeamRole.VIEWER, requiredRole: TeamRole.OWNER, expected: false },
      { role: TeamRole.VIEWER, requiredRole: TeamRole.ADMIN, expected: false },
      { role: TeamRole.VIEWER, requiredRole: TeamRole.MEMBER, expected: false },
      { role: TeamRole.VIEWER, requiredRole: TeamRole.VIEWER, expected: true },
    ];

    testCases.forEach(({ role, requiredRole, expected }) => {
      it(`should return ${expected} for ${role} trying to access ${requiredRole} actions`, () => {
        expect(hasPermission(role, requiredRole)).toBe(expected);
      });
    });
  });

  describe('canPerformAction', () => {
    const mockTeamMember = {
      id: '1',
      userId: 'user1',
      teamId: 'team1',
      role: TeamRole.MEMBER,
      joinedAt: new Date(),
    };

    describe('Repository Management', () => {
      it('should allow OWNER to manage repositories', () => {
        const ownerMember = { ...mockTeamMember, role: TeamRole.OWNER };
        expect(canPerformAction(ownerMember, 'MANAGE_REPOSITORIES')).toBe(true);
      });

      it('should allow ADMIN to manage repositories', () => {
        const adminMember = { ...mockTeamMember, role: TeamRole.ADMIN };
        expect(canPerformAction(adminMember, 'MANAGE_REPOSITORIES')).toBe(true);
      });

      it('should allow MEMBER to manage repositories', () => {
        expect(canPerformAction(mockTeamMember, 'MANAGE_REPOSITORIES')).toBe(true);
      });

      it('should not allow VIEWER to manage repositories', () => {
        const viewerMember = { ...mockTeamMember, role: TeamRole.VIEWER };
        expect(canPerformAction(viewerMember, 'MANAGE_REPOSITORIES')).toBe(false);
      });
    });

    describe('Team Management', () => {
      it('should allow OWNER to manage team', () => {
        const ownerMember = { ...mockTeamMember, role: TeamRole.OWNER };
        expect(canPerformAction(ownerMember, 'MANAGE_TEAM')).toBe(true);
      });

      it('should allow ADMIN to manage team', () => {
        const adminMember = { ...mockTeamMember, role: TeamRole.ADMIN };
        expect(canPerformAction(adminMember, 'MANAGE_TEAM')).toBe(true);
      });

      it('should not allow MEMBER to manage team', () => {
        expect(canPerformAction(mockTeamMember, 'MANAGE_TEAM')).toBe(false);
      });

      it('should not allow VIEWER to manage team', () => {
        const viewerMember = { ...mockTeamMember, role: TeamRole.VIEWER };
        expect(canPerformAction(viewerMember, 'MANAGE_TEAM')).toBe(false);
      });
    });

    describe('Invite Management', () => {
      it('should allow OWNER to manage invites', () => {
        const ownerMember = { ...mockTeamMember, role: TeamRole.OWNER };
        expect(canPerformAction(ownerMember, 'MANAGE_INVITES')).toBe(true);
      });

      it('should allow ADMIN to manage invites', () => {
        const adminMember = { ...mockTeamMember, role: TeamRole.ADMIN };
        expect(canPerformAction(adminMember, 'MANAGE_INVITES')).toBe(true);
      });

      it('should not allow MEMBER to manage invites', () => {
        expect(canPerformAction(mockTeamMember, 'MANAGE_INVITES')).toBe(false);
      });

      it('should not allow VIEWER to manage invites', () => {
        const viewerMember = { ...mockTeamMember, role: TeamRole.VIEWER };
        expect(canPerformAction(viewerMember, 'MANAGE_INVITES')).toBe(false);
      });
    });

    describe('View Analytics', () => {
      it('should allow all roles to view analytics', () => {
        const roles = [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.MEMBER, TeamRole.VIEWER];
        
        roles.forEach(role => {
          const member = { ...mockTeamMember, role };
          expect(canPerformAction(member, 'VIEW_ANALYTICS')).toBe(true);
        });
      });
    });

    describe('View Pipelines', () => {
      it('should allow all roles to view pipelines', () => {
        const roles = [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.MEMBER, TeamRole.VIEWER];
        
        roles.forEach(role => {
          const member = { ...mockTeamMember, role };
          expect(canPerformAction(member, 'VIEW_PIPELINES')).toBe(true);
        });
      });
    });

    describe('Delete Team', () => {
      it('should only allow OWNER to delete team', () => {
        const ownerMember = { ...mockTeamMember, role: TeamRole.OWNER };
        expect(canPerformAction(ownerMember, 'DELETE_TEAM')).toBe(true);

        const otherRoles = [TeamRole.ADMIN, TeamRole.MEMBER, TeamRole.VIEWER];
        otherRoles.forEach(role => {
          const member = { ...mockTeamMember, role };
          expect(canPerformAction(member, 'DELETE_TEAM')).toBe(false);
        });
      });
    });

    describe('Invalid Actions', () => {
      it('should throw error for invalid action', () => {
        expect(() => {
          canPerformAction(mockTeamMember, 'INVALID_ACTION' as any);
        }).toThrow('Invalid action: INVALID_ACTION');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null team member', () => {
      expect(() => {
        canPerformAction(null as any, 'VIEW_ANALYTICS');
      }).toThrow('Team member is required');
    });

    it('should handle undefined role', () => {
      const invalidMember = { ...mockTeamMember, role: undefined };
      expect(() => {
        canPerformAction(invalidMember, 'VIEW_ANALYTICS');
      }).toThrow('Invalid team role');
    });

    it('should handle null role', () => {
      const invalidMember = { ...mockTeamMember, role: null };
      expect(() => {
        canPerformAction(invalidMember, 'VIEW_ANALYTICS');
      }).toThrow('Invalid team role');
    });

    it('should handle invalid role string', () => {
      const invalidMember = { ...mockTeamMember, role: 'INVALID_ROLE' as any };
      expect(() => {
        canPerformAction(invalidMember, 'VIEW_ANALYTICS');
      }).toThrow('Invalid team role');
    });
  });

  describe('Permission Consistency', () => {
    it('should maintain hierarchical permission structure', () => {
      // OWNER > ADMIN > MEMBER > VIEWER
      
      // Actions that require OWNER
      const ownerActions = ['DELETE_TEAM'];
      
      // Actions that require ADMIN
      const adminActions = ['MANAGE_TEAM', 'MANAGE_INVITES'];
      
      // Actions that require MEMBER
      const memberActions = ['MANAGE_REPOSITORIES'];
      
      // Actions that require VIEWER
      const viewerActions = ['VIEW_ANALYTICS', 'VIEW_PIPELINES'];
      
      // Test hierarchy
      ownerActions.forEach(action => {
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.OWNER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.ADMIN }, action as any)).toBe(false);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.MEMBER }, action as any)).toBe(false);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.VIEWER }, action as any)).toBe(false);
      });
      
      adminActions.forEach(action => {
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.OWNER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.ADMIN }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.MEMBER }, action as any)).toBe(false);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.VIEWER }, action as any)).toBe(false);
      });
      
      memberActions.forEach(action => {
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.OWNER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.ADMIN }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.MEMBER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.VIEWER }, action as any)).toBe(false);
      });
      
      viewerActions.forEach(action => {
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.OWNER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.ADMIN }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.MEMBER }, action as any)).toBe(true);
        expect(canPerformAction({ ...mockTeamMember, role: TeamRole.VIEWER }, action as any)).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large number of permission checks efficiently', () => {
      const startTime = performance.now();
      
      // Perform 10,000 permission checks
      for (let i = 0; i < 10000; i++) {
        canPerformAction(mockTeamMember, 'VIEW_ANALYTICS');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
