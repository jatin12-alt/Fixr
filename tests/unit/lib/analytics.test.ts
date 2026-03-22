import { getOverallStats, getPipelineTrend, getErrorBreakdown } from '@/lib/analytics';

// Mock data
const mockPipelineData = [
  {
    id: '1',
    status: 'success',
    duration: 120,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    repositoryId: 'repo1',
  },
  {
    id: '2',
    status: 'failure',
    duration: 180,
    createdAt: new Date('2024-01-15T11:00:00Z'),
    repositoryId: 'repo1',
  },
  {
    id: '3',
    status: 'success',
    duration: 90,
    createdAt: new Date('2024-01-15T12:00:00Z'),
    repositoryId: 'repo2',
  },
  {
    id: '4',
    status: 'failure',
    duration: 240,
    createdAt: new Date('2024-01-14T10:00:00Z'),
    repositoryId: 'repo2',
  },
];

describe('Analytics Library', () => {
  describe('getOverallStats', () => {
    it('should calculate correct overall statistics', () => {
      const stats = getOverallStats(mockPipelineData);
      
      expect(stats.totalPipelines).toBe(4);
      expect(stats.successfulPipelines).toBe(2);
      expect(stats.failedPipelines).toBe(2);
      expect(stats.successRate).toBe(50);
      expect(stats.averageDuration).toBe(157.5); // (120 + 180 + 90 + 240) / 4
    });

    it('should handle empty data', () => {
      const stats = getOverallStats([]);
      
      expect(stats.totalPipelines).toBe(0);
      expect(stats.successfulPipelines).toBe(0);
      expect(stats.failedPipelines).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });

    it('should handle all successful pipelines', () => {
      const successOnlyData = mockPipelineData.filter(p => p.status === 'success');
      const stats = getOverallStats(successOnlyData);
      
      expect(stats.totalPipelines).toBe(2);
      expect(stats.successRate).toBe(100);
      expect(stats.failedPipelines).toBe(0);
    });

    it('should handle all failed pipelines', () => {
      const failureOnlyData = mockPipelineData.filter(p => p.status === 'failure');
      const stats = getOverallStats(failureOnlyData);
      
      expect(stats.totalPipelines).toBe(2);
      expect(stats.successRate).toBe(0);
      expect(stats.successfulPipelines).toBe(0);
    });

    it('should handle zero duration gracefully', () => {
      const dataWithZeroDuration = [
        ...mockPipelineData,
        {
          id: '5',
          status: 'success',
          duration: 0,
          createdAt: new Date('2024-01-15T13:00:00Z'),
          repositoryId: 'repo1',
        },
      ];
      
      const stats = getOverallStats(dataWithZeroDuration);
      expect(stats.averageDuration).toBe(126); // (120 + 180 + 90 + 240 + 0) / 5
    });
  });

  describe('getPipelineTrend', () => {
    it('should calculate daily trend correctly', () => {
      const startDate = new Date('2024-01-14');
      const endDate = new Date('2024-01-15');
      const trend = getPipelineTrend(mockPipelineData, 'daily', startDate, endDate);
      
      expect(trend).toHaveLength(2);
      
      // Check Jan 14 data
      const jan14 = trend.find(t => t.date === '2024-01-14');
      expect(jan14).toBeDefined();
      expect(jan14?.successful).toBe(0);
      expect(jan14?.failed).toBe(1);
      expect(jan14?.total).toBe(1);
      
      // Check Jan 15 data
      const jan15 = trend.find(t => t.date === '2024-01-15');
      expect(jan15).toBeDefined();
      expect(jan15?.successful).toBe(2);
      expect(jan15?.failed).toBe(1);
      expect(jan15?.total).toBe(3);
    });

    it('should calculate weekly trend correctly', () => {
      const startDate = new Date('2024-01-08');
      const endDate = new Date('2024-01-15');
      const trend = getPipelineTrend(mockPipelineData, 'weekly', startDate, endDate);
      
      expect(trend.length).toBeGreaterThan(0);
      
      // Should group by week
      trend.forEach(week => {
        expect(week.date).toMatch(/^\d{4}-W\d{2}$/); // Format: 2024-W02
        expect(typeof week.successful).toBe('number');
        expect(typeof week.failed).toBe('number');
        expect(typeof week.total).toBe('number');
      });
    });

    it('should calculate monthly trend correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const trend = getPipelineTrend(mockPipelineData, 'monthly', startDate, endDate);
      
      expect(trend).toHaveLength(1);
      
      const january = trend[0];
      expect(january.date).toBe('2024-01');
      expect(january.successful).toBe(2);
      expect(january.failed).toBe(2);
      expect(january.total).toBe(4);
    });

    it('should handle date range with no data', () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');
      const trend = getPipelineTrend(mockPipelineData, 'daily', startDate, endDate);
      
      expect(trend).toHaveLength(28); // All days in February
      trend.forEach(day => {
        expect(day.successful).toBe(0);
        expect(day.failed).toBe(0);
        expect(day.total).toBe(0);
      });
    });

    it('should handle invalid date range', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-14'); // End before start
      const trend = getPipelineTrend(mockPipelineData, 'daily', startDate, endDate);
      
      expect(trend).toHaveLength(0);
    });

    it('should handle future dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const trend = getPipelineTrend(mockPipelineData, 'monthly', startDate, endDate);
      
      expect(trend.length).toBe(12);
      
      // Only January should have data
      const january = trend.find(t => t.date === '2024-01');
      expect(january?.total).toBe(4);
      
      // Other months should be empty
      const february = trend.find(t => t.date === '2024-02');
      expect(february?.total).toBe(0);
    });
  });

  describe('getErrorBreakdown', () => {
    it('should calculate error breakdown correctly', () => {
      const mockErrorData = [
        {
          id: '1',
          type: 'test_failure',
          message: 'Unit tests failed',
          pipelineId: '1',
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          id: '2',
          type: 'test_failure',
          message: 'Integration tests failed',
          pipelineId: '2',
          createdAt: new Date('2024-01-15T11:00:00Z'),
        },
        {
          id: '3',
          type: 'build_error',
          message: 'Compilation failed',
          pipelineId: '3',
          createdAt: new Date('2024-01-15T12:00:00Z'),
        },
        {
          id: '4',
          type: 'timeout',
          message: 'Pipeline timed out',
          pipelineId: '4',
          createdAt: new Date('2024-01-15T13:00:00Z'),
        },
      ];
      
      const breakdown = getErrorBreakdown(mockErrorData);
      
      expect(breakdown).toHaveLength(3);
      
      const testFailure = breakdown.find(e => e.type === 'test_failure');
      expect(testFailure).toBeDefined();
      expect(testFailure?.count).toBe(2);
      expect(testFailure?.percentage).toBe(50);
      
      const buildError = breakdown.find(e => e.type === 'build_error');
      expect(buildError).toBeDefined();
      expect(buildError?.count).toBe(1);
      expect(buildError?.percentage).toBe(25);
      
      const timeout = breakdown.find(e => e.type === 'timeout');
      expect(timeout).toBeDefined();
      expect(timeout?.count).toBe(1);
      expect(timeout?.percentage).toBe(25);
    });

    it('should handle empty error data', () => {
      const breakdown = getErrorBreakdown([]);
      
      expect(breakdown).toHaveLength(0);
    });

    it('should sort by count descending', () => {
      const mockErrorData = [
        { type: 'rare_error', id: '1' },
        { type: 'common_error', id: '2' },
        { type: 'common_error', id: '3' },
        { type: 'common_error', id: '4' },
        { type: 'medium_error', id: '5' },
        { type: 'medium_error', id: '6' },
      ];
      
      const breakdown = getErrorBreakdown(mockErrorData);
      
      expect(breakdown[0].type).toBe('common_error');
      expect(breakdown[0].count).toBe(3);
      expect(breakdown[1].type).toBe('medium_error');
      expect(breakdown[1].count).toBe(2);
      expect(breakdown[2].type).toBe('rare_error');
      expect(breakdown[2].count).toBe(1);
    });

    it('should calculate percentages correctly', () => {
      const mockErrorData = [
        { type: 'error_a', id: '1' },
        { type: 'error_a', id: '2' },
        { type: 'error_a', id: '3' },
        { type: 'error_b', id: '4' },
        { type: 'error_b', id: '5' },
        { type: 'error_c', id: '6' },
        { type: 'error_c', id: '7' },
        { type: 'error_c', id: '8' },
        { type: 'error_c', id: '9' },
        { type: 'error_c', id: '10' },
      ];
      
      const breakdown = getErrorBreakdown(mockErrorData);
      
      const errorA = breakdown.find(e => e.type === 'error_a');
      expect(errorA?.percentage).toBe(30);
      
      const errorB = breakdown.find(e => e.type === 'error_b');
      expect(errorB?.percentage).toBe(20);
      
      const errorC = breakdown.find(e => e.type === 'error_c');
      expect(errorC?.percentage).toBe(50);
      
      // Percentages should sum to 100
      const totalPercentage = breakdown.reduce((sum, e) => sum + e.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('should handle unknown error types', () => {
      const mockErrorData = [
        { type: null, id: '1' },
        { type: undefined, id: '2' },
        { type: '', id: '3' },
        { type: 'known_error', id: '4' },
      ];
      
      const breakdown = getErrorBreakdown(mockErrorData);
      
      // Should group unknown types
      const unknownError = breakdown.find(e => e.type === 'unknown');
      expect(unknownError).toBeDefined();
      expect(unknownError?.count).toBe(3);
      
      const knownError = breakdown.find(e => e.type === 'known_error');
      expect(knownError).toBeDefined();
      expect(knownError?.count).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined pipeline data', () => {
      const invalidData = [null, undefined, mockPipelineData[0]];
      
      expect(() => {
        getOverallStats(invalidData as any);
      }).not.toThrow();
    });

    it('should handle missing properties in pipeline data', () => {
      const incompleteData = [
        { id: '1', status: 'success' }, // missing duration, createdAt, repositoryId
        { id: '2', duration: 100 }, // missing status, createdAt, repositoryId
        mockPipelineData[0],
      ];
      
      expect(() => {
        getOverallStats(incompleteData as any);
      }).not.toThrow();
    });

    it('should handle very large datasets', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i.toString(),
        status: i % 2 === 0 ? 'success' : 'failure',
        duration: Math.random() * 300,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        repositoryId: `repo${i % 10}`,
      }));
      
      const startTime = performance.now();
      const stats = getOverallStats(largeDataset);
      const endTime = performance.now();
      
      expect(stats.totalPipelines).toBe(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
