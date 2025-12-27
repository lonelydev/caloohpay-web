/**
 * Tests for URL sanitization in calendarUtils
 */

import { transformToCalendarEvents } from '@/lib/utils/calendarUtils';
import type { ScheduleEntry, User } from '@/lib/types';

describe('URL Sanitization', () => {
  const timezone = 'America/New_York';

  describe('html_url sanitization', () => {
    it('should allow valid https URLs', () => {
      const validUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'https://example.pagerduty.com/users/user-1',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: validUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBe(
        'https://example.pagerduty.com/users/user-1'
      );
    });

    it('should allow valid http URLs', () => {
      const validUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'http://example.com/users/user-1',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: validUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBe('http://example.com/users/user-1');
    });

    it('should allow relative URLs', () => {
      const validUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: '/users/user-1',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: validUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBe('/users/user-1');
    });

    it('should block javascript: protocol URLs', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'javascript:alert("XSS")',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should block data: protocol URLs', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'data:text/html,<script>alert("XSS")</script>',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should block file: protocol URLs', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'file:///etc/passwd',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should block vbscript: protocol URLs', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'vbscript:msgbox("XSS")',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should block about: protocol URLs', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'about:blank',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should handle undefined html_url', () => {
      const userWithoutUrl: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: userWithoutUrl,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should handle empty string html_url', () => {
      const userWithEmptyUrl: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: '',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: userWithEmptyUrl,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should handle whitespace-only html_url', () => {
      const userWithWhitespaceUrl: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: '   ',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: userWithWhitespaceUrl,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should block invalid URL formats', () => {
      const userWithInvalidUrl: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'not-a-valid-url',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: userWithInvalidUrl,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });

    it('should normalize valid URLs', () => {
      const userWithTrailingSlash: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'https://example.com/users/user-1/',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: userWithTrailingSlash,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      // URL constructor normalizes the URL
      expect(events[0].extendedProps.user.html_url).toBe('https://example.com/users/user-1/');
    });

    it('should be case-insensitive for dangerous protocols', () => {
      const maliciousUser: User = {
        id: 'user-1',
        summary: 'Test User',
        name: 'Test User',
        html_url: 'JaVaScRiPt:alert("XSS")',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.user.html_url).toBeUndefined();
    });
  });
});
