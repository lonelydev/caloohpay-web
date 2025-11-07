import { OnCallUser } from '../OnCallUser';
import { OnCallPeriod } from '../OnCallPeriod';

describe('OnCallUser', () => {
  describe('constructor', () => {
    it('should create a user with required fields', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
      ];

      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.id).toBe('user1');
      expect(user.name).toBe('John Doe');
      expect(user.periods).toEqual(periods);
      expect(user.email).toBeUndefined();
    });

    it('should create a user with optional email', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
      ];

      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      expect(user.id).toBe('user1');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should create a user with empty periods array', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.periods).toEqual([]);
    });

    it('should create a user with multiple periods', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
        new OnCallPeriod(new Date('2024-01-20T00:00:00Z'), new Date('2024-01-21T00:00:00Z'), 'UTC'),
      ];

      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.periods).toHaveLength(2);
    });
  });

  describe('getTotalOohWeekdays', () => {
    it('should return 0 for user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.getTotalOohWeekdays()).toBe(0);
    });

    it('should count weekdays from single period', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-18T23:59:59Z'), // Thursday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekdays()).toBe(4); // Mon, Tue, Wed, Thu
    });

    it('should sum weekdays from multiple periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-16T23:59:59Z'), // Tuesday
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-17T00:00:00Z'), // Wednesday
          new Date('2024-01-18T23:59:59Z'), // Thursday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekdays()).toBe(4); // 2 + 2
    });

    it('should not count non-OOH periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday (OOH)
          new Date('2024-01-16T23:59:59Z'), // Tuesday
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-17T09:00:00Z'), // Wednesday 9 AM (not OOH)
          new Date('2024-01-17T10:00:00Z'), // Wednesday 10 AM
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekdays()).toBe(2); // Only Mon, Tue (not Wed)
    });

    it('should not count weekend days', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekdays()).toBe(4); // Mon-Thu only, not Fri-Sun
    });
  });

  describe('getTotalOohWeekends', () => {
    it('should return 0 for user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.getTotalOohWeekends()).toBe(0);
    });

    it('should count weekend days from single period', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-19T00:00:00Z'), // Friday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekends()).toBe(3); // Fri, Sat, Sun
    });

    it('should sum weekend days from multiple periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-19T00:00:00Z'), // Friday
          new Date('2024-01-19T23:59:59Z'), // Friday
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-20T00:00:00Z'), // Saturday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekends()).toBe(3); // 1 + 2
    });

    it('should not count weekdays', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalOohWeekends()).toBe(3); // Fri-Sun only, not Mon-Thu
    });
  });

  describe('getOnCallPeriods', () => {
    it('should return all periods', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
        new OnCallPeriod(
          new Date('2024-01-17T09:00:00Z'), // Not OOH
          new Date('2024-01-17T10:00:00Z'),
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const allPeriods = user.getOnCallPeriods();

      expect(allPeriods).toHaveLength(2);
      expect(allPeriods).toEqual(periods);
    });

    it('should return empty array for user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.getOnCallPeriods()).toEqual([]);
    });
  });

  describe('getOohPeriods', () => {
    it('should filter out non-OOH periods', () => {
      const oohPeriod = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // OOH (multi-day)
        new Date('2024-01-16T23:59:59Z'),
        'UTC'
      );
      const nonOohPeriod = new OnCallPeriod(
        new Date('2024-01-17T09:00:00Z'), // Not OOH
        new Date('2024-01-17T10:00:00Z'),
        'UTC'
      );

      const user = new OnCallUser('user1', 'John Doe', [oohPeriod, nonOohPeriod]);

      const oohPeriods = user.getOohPeriods();

      expect(oohPeriods).toHaveLength(1);
      expect(oohPeriods[0]).toBe(oohPeriod);
    });

    it('should return all periods if all are OOH', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
        new OnCallPeriod(new Date('2024-01-20T00:00:00Z'), new Date('2024-01-21T00:00:00Z'), 'UTC'),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const oohPeriods = user.getOohPeriods();

      expect(oohPeriods).toHaveLength(2);
    });

    it('should return empty array if no periods are OOH', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T09:00:00Z'), new Date('2024-01-15T10:00:00Z'), 'UTC'),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const oohPeriods = user.getOohPeriods();

      expect(oohPeriods).toEqual([]);
    });

    it('should return empty array for user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.getOohPeriods()).toEqual([]);
    });
  });

  describe('getTotalDurationHours', () => {
    it('should return 0 for user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      expect(user.getTotalDurationHours()).toBe(0);
    });

    it('should calculate total duration from single period', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T09:00:00Z'),
          new Date('2024-01-15T17:00:00Z'), // 8 hours
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalDurationHours()).toBe(8);
    });

    it('should sum durations from multiple periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T09:00:00Z'),
          new Date('2024-01-15T17:00:00Z'), // 8 hours
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-16T09:00:00Z'),
          new Date('2024-01-16T13:00:00Z'), // 4 hours
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalDurationHours()).toBe(12);
    });

    it('should include both OOH and non-OOH periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // 24 hours (OOH)
          new Date('2024-01-16T00:00:00Z'),
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-17T09:00:00Z'), // 1 hour (not OOH)
          new Date('2024-01-17T10:00:00Z'),
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      expect(user.getTotalDurationHours()).toBe(25);
    });
  });

  describe('toJSON', () => {
    it('should serialize user with all fields', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-15T23:59:59Z'), // Monday (same day)
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const json = user.toJSON();

      expect(json.id).toBe('user1');
      expect(json.name).toBe('John Doe');
      expect(json.email).toBe('john@example.com');
      expect(json.totalOohWeekdays).toBe(1); // Monday
      expect(json.totalOohWeekends).toBe(0);
      expect(json.periods).toHaveLength(1);
    });

    it('should include period details in JSON', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-16T23:59:59Z'), // Tuesday (multi-day, OOH)
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const json = user.toJSON();

      expect(json.periods[0].start).toBe('2024-01-15T00:00:00.000Z');
      expect(json.periods[0].end).toBe('2024-01-16T23:59:59.000Z');
      expect(json.periods[0].timezone).toBe('UTC');
      expect(json.periods[0].isOoh).toBe(true);
      expect(json.periods[0].weekdayCount).toBe(2); // Mon, Tue
      expect(json.periods[0].weekendCount).toBe(0);
    });

    it('should handle user without email', () => {
      const periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T00:00:00Z'), 'UTC'),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const json = user.toJSON();

      expect(json.email).toBeUndefined();
    });

    it('should handle user with no periods', () => {
      const user = new OnCallUser('user1', 'John Doe', []);

      const json = user.toJSON();

      expect(json.totalOohWeekdays).toBe(0);
      expect(json.totalOohWeekends).toBe(0);
      expect(json.periods).toEqual([]);
    });

    it('should aggregate totals from multiple periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday-Tuesday (2 weekdays)
          new Date('2024-01-16T23:59:59Z'),
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-19T00:00:00Z'), // Friday-Sunday (3 weekend days)
          new Date('2024-01-21T23:59:59Z'),
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const json = user.toJSON();

      expect(json.totalOohWeekdays).toBe(2);
      expect(json.totalOohWeekends).toBe(3);
      expect(json.periods).toHaveLength(2);
    });
  });
});
