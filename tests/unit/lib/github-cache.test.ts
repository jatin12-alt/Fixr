import { GitHubCache } from '@/lib/github-cache';

// Mock setTimeout/ clearTimeout for testing
jest.useFakeTimers();

describe('GitHub Cache', () => {
  let cache: GitHubCache;
  
  beforeEach(() => {
    cache = new GitHubCache({
      ttl: 60000, // 1 minute
      maxSize: 100,
    });
  });
  
  afterEach(() => {
    cache.clear();
    jest.clearAllTimers();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve values', () => {
      const key = 'user:123:repos';
      const data = [{ id: 1, name: 'test-repo' }];
      
      cache.set(key, data);
      const retrieved = cache.get(key);
      
      expect(retrieved).toEqual(data);
    });

    it('should return undefined for non-existent keys', () => {
      const result = cache.get('non-existent-key');
      expect(result).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      const key = 'user:123:repos';
      const initialData = [{ id: 1, name: 'test-repo' }];
      const newData = [{ id: 2, name: 'new-repo' }];
      
      cache.set(key, initialData);
      cache.set(key, newData);
      
      const retrieved = cache.get(key);
      expect(retrieved).toEqual(newData);
    });

    it('should delete specific keys', () => {
      const key1 = 'user:123:repos';
      const key2 = 'user:123:orgs';
      
      cache.set(key1, [{ id: 1 }]);
      cache.set(key2, [{ id: 2 }]);
      
      cache.delete(key1);
      
      expect(cache.get(key1)).toBeUndefined();
      expect(cache.get(key2)).toEqual([{ id: 2 }]);
    });

    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });

    it('should check if key exists', () => {
      const key = 'test-key';
      
      expect(cache.has(key)).toBe(false);
      
      cache.set(key, 'value');
      
      expect(cache.has(key)).toBe(true);
      
      cache.delete(key);
      
      expect(cache.has(key)).toBe(false);
    });
  });

  describe('TTL Expiration', () => {
    it('should expire items after TTL', () => {
      const key = 'test-key';
      const data = 'test-data';
      
      cache.set(key, data);
      expect(cache.get(key)).toBe(data);
      
      // Fast-forward time beyond TTL
      jest.advanceTimersByTime(61000);
      
      expect(cache.get(key)).toBeUndefined();
    });

    it('should not expire items before TTL', () => {
      const key = 'test-key';
      const data = 'test-data';
      
      cache.set(key, data);
      
      // Fast-forward time but not beyond TTL
      jest.advanceTimersByTime(30000);
      
      expect(cache.get(key)).toBe(data);
    });

    it('should handle different TTLs for different items', () => {
      const cacheWithCustomTTL = new GitHubCache({ ttl: 30000 });
      const key1 = 'key1';
      const key2 = 'key2';
      
      cacheWithCustomTTL.set(key1, 'value1');
      
      // Wait 20 seconds
      jest.advanceTimersByTime(20000);
      
      // Set second item
      cacheWithCustomTTL.set(key2, 'value2');
      
      // Wait another 20 seconds (total 40 seconds)
      jest.advanceTimersByTime(20000);
      
      // First item should be expired (30s TTL)
      expect(cacheWithCustomTTL.get(key1)).toBeUndefined();
      
      // Second item should still be valid (only 20s old)
      expect(cacheWithCustomTTL.get(key2)).toBe('value2');
    });

    it('should clean up expired items automatically', () => {
      const cache = new GitHubCache({ ttl: 1000, cleanupInterval: 500 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      
      // Fast-forward beyond TTL
      jest.advanceTimersByTime(1500);
      
      // Cleanup should have run
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('Max Size Limit', () => {
    it('should evict oldest items when max size is reached', () => {
      const cache = new GitHubCache({ maxSize: 3 });
      
      // Fill cache to max capacity
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      
      // Add one more item (should evict key1)
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBeUndefined(); // Evicted
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update access time on get', () => {
      const cache = new GitHubCache({ maxSize: 2 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Access key1 to update its access time
      cache.get('key1');
      
      // Add key3 (should evict key2, not key1)
      cache.set('key3', 'value3');
      
      expect(cache.get('key1')).toBe('value1'); // Still there
      expect(cache.get('key2')).toBeUndefined(); // Evicted
      expect(cache.get('key3')).toBe('value3');
    });

    it('should handle maxSize of 1', () => {
      const cache = new GitHubCache({ maxSize: 1 });
      
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      cache.set('key2', 'value2');
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent set operations', async () => {
      const promises = [];
      
      // Create 100 concurrent set operations
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              cache.set(`key${i}`, `value${i}`);
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all(promises);
      
      // Verify all items are stored
      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should handle concurrent get operations', async () => {
      cache.set('shared-key', 'shared-value');
      
      const promises = [];
      
      // Create 100 concurrent get operations
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve(cache.get('shared-key') || '');
            }, Math.random() * 10);
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // All operations should return the same value
      results.forEach(result => {
        expect(result).toBe('shared-value');
      });
    });

    it('should handle mixed concurrent operations', async () => {
      const promises = [];
      
      // Mix of set, get, and delete operations
      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              cache.set(`key${i}`, `value${i}`);
              resolve();
            }, Math.random() * 10);
          })
        );
        
        promises.push(
          new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve(cache.get(`key${i - 1}`) || '');
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all(promises);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const key = 'test-key';
      const data = 'test-data';
      
      // Initial stats
      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      
      // Miss
      cache.get(key);
      stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0);
      
      // Set data
      cache.set(key, data);
      
      // Hit
      cache.get(key);
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      
      // Another hit
      cache.get(key);
      stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('should track cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('nonexistent');
      
      let stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      
      cache.resetStats();
      
      stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined keys gracefully', () => {
      expect(() => {
        cache.set(null as any, 'value');
      }).toThrow('Key cannot be null or undefined');
      
      expect(() => {
        cache.set(undefined as any, 'value');
      }).toThrow('Key cannot be null or undefined');
      
      expect(() => {
        cache.get(null as any);
      }).toThrow('Key cannot be null or undefined');
      
      expect(() => {
        cache.delete(null as any);
      }).toThrow('Key cannot be null or undefined');
    });

    it('should handle empty string keys', () => {
      const key = '';
      const value = 'test-value';
      
      cache.set(key, value);
      expect(cache.get(key)).toBe(value);
    });

    it('should handle circular references in values', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      expect(() => {
        cache.set('circular', circular);
      }).not.toThrow();
      
      const retrieved = cache.get('circular');
      expect(retrieved).toEqual(circular);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of operations efficiently', () => {
      const startTime = performance.now();
      
      // Perform 10,000 operations
      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      for (let i = 0; i < 10000; i++) {
        cache.get(`key${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large values efficiently', () => {
      const largeValue = 'x'.repeat(1000000); // 1MB string
      
      const startTime = performance.now();
      cache.set('large-key', largeValue);
      const retrieved = cache.get('large-key');
      const endTime = performance.now();
      
      expect(retrieved).toBe(largeValue);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate by pattern', () => {
      cache.set('user:123:repos', 'repos-data');
      cache.set('user:123:orgs', 'orgs-data');
      cache.set('user:456:repos', 'other-repos');
      cache.set('system:config', 'config-data');
      
      // Invalidate all user:123 data
      cache.invalidatePattern('user:123:*');
      
      expect(cache.get('user:123:repos')).toBeUndefined();
      expect(cache.get('user:123:orgs')).toBeUndefined();
      expect(cache.get('user:456:repos')).toBe('other-repos');
      expect(cache.get('system:config')).toBe('config-data');
    });

    it('should handle invalid patterns', () => {
      cache.set('test-key', 'test-value');
      
      // Should not throw
      expect(() => {
        cache.invalidatePattern('invalid-pattern[');
      }).not.toThrow();
      
      // Should not affect existing data
      expect(cache.get('test-key')).toBe('test-value');
    });
  });
});
