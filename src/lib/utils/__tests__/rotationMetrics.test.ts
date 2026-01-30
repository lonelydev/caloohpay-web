/**
 * Unit tests for rotation metrics utility functions
 */

import { describe, it, expect } from '@jest/globals';
import { getRotationMetrics } from '../rotationMetrics';
import type { OnCallEntry } from '@/lib/types';

describe('rotationMetrics', () => {
  describe('getRotationMetrics', () => {
    it('should return empty metrics for no on-calls', () => {
      const result = getRotationMetrics([]);
      expect(result).toEqual({});
    });

    it('should calculate metrics for a single user with one shift', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Alice' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z', // 7 days = 1 week
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result).toHaveProperty('user1');
      expect(result.user1.userName).toBe('Alice');
      expect(result.user1.shiftHistory).toHaveLength(1);
      expect(result.user1.shiftHistory[0].durationWeeks).toBe(1);
      expect(result.user1.gapHistory).toHaveLength(0); // No next shift, so no gap
      expect(result.user1.averageRest).toBe(0); // No gaps to average
    });

    it('should calculate gaps between shifts correctly', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Bob' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z', // 7 days
        },
        {
          user: { id: 'user1', summary: 'Bob' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-22T00:00:00Z', // 14 days gap (2 weeks)
          end: '2024-01-29T00:00:00Z', // 7 days
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result.user1.shiftHistory).toHaveLength(2);
      expect(result.user1.gapHistory).toHaveLength(1);
      expect(result.user1.gapHistory[0].gapDurationWeeks).toBe(2);
      expect(result.user1.averageRest).toBe(2);
    });

    it('should sort shifts by start time', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Charlie' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-15T00:00:00Z', // Second shift chronologically
          end: '2024-01-22T00:00:00Z',
        },
        {
          user: { id: 'user1', summary: 'Charlie' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z', // First shift chronologically
          end: '2024-01-08T00:00:00Z',
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      // Verify shifts are sorted correctly
      expect(result.user1.shiftHistory[0].start).toBe('2024-01-01T00:00:00Z');
      expect(result.user1.shiftHistory[1].start).toBe('2024-01-15T00:00:00Z');
      
      // Gap should be calculated from first shift end to second shift start
      expect(result.user1.gapHistory[0].gapDurationWeeks).toBe(1); // 7 days gap
    });

    it('should handle multiple users correctly', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Diana' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z',
        },
        {
          user: { id: 'user2', summary: 'Eve' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-08T00:00:00Z',
          end: '2024-01-15T00:00:00Z',
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('user1');
      expect(result).toHaveProperty('user2');
      expect(result.user1.userName).toBe('Diana');
      expect(result.user2.userName).toBe('Eve');
      expect(result.user1.shiftHistory).toHaveLength(1);
      expect(result.user2.shiftHistory).toHaveLength(1);
    });

    it('should calculate average rest from multiple gaps', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Frank' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z', // Week 1
        },
        {
          user: { id: 'user1', summary: 'Frank' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-15T00:00:00Z', // 1 week gap
          end: '2024-01-22T00:00:00Z', // Week 2
        },
        {
          user: { id: 'user1', summary: 'Frank' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-02-05T00:00:00Z', // 2 week gap
          end: '2024-02-12T00:00:00Z', // Week 3
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result.user1.gapHistory).toHaveLength(2);
      expect(result.user1.gapHistory[0].gapDurationWeeks).toBe(1);
      expect(result.user1.gapHistory[1].gapDurationWeeks).toBe(2);
      expect(result.user1.averageRest).toBe(1.5); // (1 + 2) / 2
    });

    it('should detect back-to-back shifts (zero gap)', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Grace' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z',
        },
        {
          user: { id: 'user1', summary: 'Grace' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-08T00:00:00Z', // Starts exactly when previous ends
          end: '2024-01-15T00:00:00Z',
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result.user1.gapHistory).toHaveLength(1);
      expect(result.user1.gapHistory[0].gapDurationWeeks).toBe(0); // Back-to-back
      expect(result.user1.averageRest).toBe(0);
    });

    it('should handle fractional week durations', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', summary: 'Henry' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-04T12:00:00Z', // 3.5 days = 0.5 weeks
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result.user1.shiftHistory[0].durationWeeks).toBe(0.5);
    });

    it('should use user.name as fallback when summary is missing', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: 'user1', name: 'Ivy Fallback' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-08T00:00:00Z',
        },
      ];

      const result = getRotationMetrics(oncalls);
      
      expect(result.user1.userName).toBe('Ivy Fallback');
    });
  });
});
