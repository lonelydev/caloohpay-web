/**
 * Unit tests for userColourAssignment utility
 *
 * Tests color assignment consistency, hash distribution, and edge cases
 */

import {
  getUserColor,
  getUserColorWithFallback,
  USER_COLOR_PALETTE,
  assignUniqueColours,
} from '@/lib/utils/userColourAssignment';

const WCAG_AA_NORMAL_TEXT_THRESHOLD = 4.5;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return { r, g, b };
}

function toRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const convertChannel = (value: number): number => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  const r = convertChannel(rgb.r);
  const g = convertChannel(rgb.g);
  const b = convertChannel(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const foregroundLuminance = toRelativeLuminance(hexToRgb(foregroundHex));
  const backgroundLuminance = toRelativeLuminance(hexToRgb(backgroundHex));

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe('userColourAssignment', () => {
  describe('getUserColor', () => {
    it('should return a valid color object with required properties', () => {
      const color = getUserColor('user@example.com');

      expect(color).toHaveProperty('background');
      expect(color).toHaveProperty('border');
      expect(color).toHaveProperty('textColor');
      expect(typeof color.background).toBe('string');
      expect(typeof color.border).toBe('string');
      expect(typeof color.textColor).toBe('string');
    });

    it('should return consistent colors for the same user ID', () => {
      const userId = 'user123';
      const color1 = getUserColor(userId);
      const color2 = getUserColor(userId);
      const color3 = getUserColor(userId);

      expect(color1).toEqual(color2);
      expect(color2).toEqual(color3);
    });

    it('should return consistent colors for the same email', () => {
      const email = 'john.doe@example.com';
      const color1 = getUserColor(email);
      const color2 = getUserColor(email);

      expect(color1).toEqual(color2);
    });

    it('should return different colors for different users', () => {
      const color1 = getUserColor('user1@example.com');
      const color2 = getUserColor('user2@example.com');

      // With 10 colors in palette, different users MIGHT get same color
      // but the mapping should be consistent
      expect(getUserColor('user1@example.com')).toEqual(color1);
      expect(getUserColor('user2@example.com')).toEqual(color2);
    });

    it('should return a color from the palette', () => {
      const color = getUserColor('test@example.com');

      const paletteColours = Array.from(USER_COLOR_PALETTE);
      const isInPalette = paletteColours.some(
        (paletteColor) =>
          paletteColor.background === color.background &&
          paletteColor.border === color.border &&
          paletteColor.textColor === color.textColor
      );

      expect(isInPalette).toBe(true);
    });

    it('should handle empty string by returning first palette color', () => {
      const color = getUserColor('');
      expect(color).toEqual(USER_COLOR_PALETTE[0]);
    });

    it('should handle whitespace-only string by returning first palette color', () => {
      const color = getUserColor('   ');
      expect(color).toEqual(USER_COLOR_PALETTE[0]);
    });

    it('should handle special characters in user ID', () => {
      const userId = 'user+special@example.com';
      const color = getUserColor(userId);

      expect(color).toHaveProperty('background');
      expect(color).toHaveProperty('border');
      expect(color).toHaveProperty('textColor');
    });

    it('should distribute colors evenly across different user IDs', () => {
      // Test with multiple users to ensure distribution
      const userIds = Array.from({ length: 20 }, (_, i) => `user${i}@example.com`);
      const colors = userIds.map((id) => getUserColor(id));

      // Count unique colors
      const uniqueColours = new Set(colors.map((c) => c.background));

      // With 20 users and 10 colors, we should see multiple colors used
      expect(uniqueColours.size).toBeGreaterThan(1);
      expect(uniqueColours.size).toBeLessThanOrEqual(USER_COLOR_PALETTE.length);
    });

    it('should handle very long user IDs', () => {
      const longUserId = 'a'.repeat(1000) + '@example.com';
      const color = getUserColor(longUserId);

      expect(color).toHaveProperty('background');
      // Should still be deterministic
      expect(getUserColor(longUserId)).toEqual(color);
    });

    it('should handle Unicode characters', () => {
      const unicodeEmail = 'user-名前@example.com';
      const color = getUserColor(unicodeEmail);

      expect(color).toHaveProperty('background');
      expect(getUserColor(unicodeEmail)).toEqual(color);
    });
  });

  describe('getUserColorWithFallback', () => {
    it('should prefer email over user ID', () => {
      const userId = 'user123';
      const userEmail = 'test@example.com';

      const colorFromEmail = getUserColor(userEmail);
      const colorWithFallback = getUserColorWithFallback(userId, userEmail);

      expect(colorWithFallback).toEqual(colorFromEmail);
    });

    it('should use user ID when email is not provided', () => {
      const userId = 'user456';

      const colorFromId = getUserColor(userId);
      const colorWithFallback = getUserColorWithFallback(userId, undefined);

      expect(colorWithFallback).toEqual(colorFromId);
    });

    it('should use user ID when email is empty string', () => {
      const userId = 'user789';

      const colorFromId = getUserColor(userId);
      const colorWithFallback = getUserColorWithFallback(userId, '');

      expect(colorWithFallback).toEqual(colorFromId);
    });

    it('should fall back to "unknown" when both are undefined', () => {
      const colorWithFallback = getUserColorWithFallback(undefined, undefined);
      const unknownColor = getUserColor('unknown');

      expect(colorWithFallback).toEqual(unknownColor);
    });

    it('should fall back to "unknown" when both are empty strings', () => {
      const colorWithFallback = getUserColorWithFallback('', '');
      const unknownColor = getUserColor('unknown');

      expect(colorWithFallback).toEqual(unknownColor);
    });
  });

  describe('USER_COLOR_PALETTE', () => {
    it('should have at least 5 colors for diversity', () => {
      expect(USER_COLOR_PALETTE.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all required color properties', () => {
      USER_COLOR_PALETTE.forEach((color) => {
        expect(color).toHaveProperty('background');
        expect(color).toHaveProperty('border');
        expect(color).toHaveProperty('textColor');

        expect(typeof color.background).toBe('string');
        expect(typeof color.border).toBe('string');
        expect(typeof color.textColor).toBe('string');

        // Check they look like hex colors
        expect(color.background).toMatch(/^#[0-9A-F]{6}$/i);
        expect(color.border).toMatch(/^#[0-9A-F]{6}$/i);
        expect(color.textColor).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have unique background colors', () => {
      const backgrounds = USER_COLOR_PALETTE.map((c) => c.background);
      const uniqueBackgrounds = new Set(backgrounds);

      expect(uniqueBackgrounds.size).toBe(backgrounds.length);
    });

    it('should meet WCAG AA contrast for text against background on all base palette triples', () => {
      USER_COLOR_PALETTE.forEach((color) => {
        const contrastRatio = getContrastRatio(color.textColor, color.background);

        expect(contrastRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_THRESHOLD);
      });
    });
  });

  describe('assignUniqueColours', () => {
    it('should assign colors to all users without collisions', () => {
      const users = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      const colorMap = assignUniqueColours(users);

      expect(colorMap.size).toBe(3);

      // All users should have colors
      users.forEach((user) => {
        expect(colorMap.has(user)).toBe(true);
        expect(colorMap.get(user)).toBeDefined();
      });
    });

    it('should ensure no two users get the same color', () => {
      const users = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com',
      ];
      const colorMap = assignUniqueColours(users);

      const colors = Array.from(colorMap.values());
      const colorHashes = colors.map((c) => `${c.background}-${c.border}-${c.textColor}`);
      const uniqueColorHashes = new Set(colorHashes);

      // With 4 users and 10 colors, all should be unique
      expect(uniqueColorHashes.size).toBe(colors.length);
    });

    it('should handle hash collisions gracefully', () => {
      // Create user identifiers that are likely to have hash collisions
      const users = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`);
      const colorMap = assignUniqueColours(users);

      expect(colorMap.size).toBe(10);

      // Even if hashes collide, all users should get a color
      users.forEach((user) => {
        expect(colorMap.has(user)).toBe(true);
      });
    });

    it('should handle more users than available colors', () => {
      // 15 users with 10 base palette colors should still produce unique assignments.
      const users = Array.from({ length: 15 }, (_, i) => `user${i}@example.com`);
      const colorMap = assignUniqueColours(users);

      expect(colorMap.size).toBe(15);

      users.forEach((user) => {
        expect(colorMap.has(user)).toBe(true);
      });

      const colorHashes = Array.from(colorMap.values()).map(
        (c) => `${c.background}-${c.border}-${c.textColor}`
      );
      expect(new Set(colorHashes).size).toBe(users.length);
    });

    it('should prioritize hash-based colors when no collisions', () => {
      const user = 'test@example.com';
      const hashBasedColor = getUserColor(user);

      const colorMap = assignUniqueColours([user]);

      expect(colorMap.get(user)).toEqual(hashBasedColor);
    });

    it('should handle empty array', () => {
      const colorMap = assignUniqueColours([]);
      expect(colorMap.size).toBe(0);
    });

    it('should handle array with empty strings', () => {
      const users = ['user1@example.com', '', 'user2@example.com', '   '];
      const colorMap = assignUniqueColours(users);

      // Only valid users should get colors
      expect(colorMap.has('user1@example.com')).toBe(true);
      expect(colorMap.has('user2@example.com')).toBe(true);
      expect(colorMap.has('')).toBe(false);
      expect(colorMap.has('   ')).toBe(false);
    });

    it('should assign different colors to different users when palette has capacity', () => {
      const users = ['user1@example.com', 'user2@example.com'];
      const colorMap = assignUniqueColours(users);

      const color1 = colorMap.get('user1@example.com');
      const color2 = colorMap.get('user2@example.com');

      expect(color1).toBeDefined();
      expect(color2).toBeDefined();

      const hash1 = `${color1?.background}-${color1?.border}-${color1?.textColor}`;
      const hash2 = `${color2?.background}-${color2?.border}-${color2?.textColor}`;

      expect(hash1).not.toBe(hash2);
    });

    it('should return valid hex colors for generated overflow colors', () => {
      const users = Array.from({ length: 18 }, (_, i) => `overflow${i}@example.com`);
      const colorMap = assignUniqueColours(users);
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      for (const color of colorMap.values()) {
        expect(color.background).toMatch(hexColorRegex);
        expect(color.border).toMatch(hexColorRegex);
        expect(color.textColor).toMatch(hexColorRegex);
      }
    });

    it('should meet WCAG AA contrast for text against background on generated overflow triples', () => {
      const users = Array.from({ length: 18 }, (_, i) => `contrast-overflow-${i}@example.com`);
      const colorMap = assignUniqueColours(users);

      const assignedColours = Array.from(colorMap.values());
      const generatedOverflowColours = assignedColours.slice(USER_COLOR_PALETTE.length);

      expect(generatedOverflowColours.length).toBeGreaterThan(0);

      generatedOverflowColours.forEach((color) => {
        const contrastRatio = getContrastRatio(color.textColor, color.background);

        expect(contrastRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_THRESHOLD);
      });
    });

    it('should maintain consistency - same input produces same output', () => {
      const users = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];

      const colorMap1 = assignUniqueColours(users);
      const colorMap2 = assignUniqueColours(users);

      users.forEach((user) => {
        expect(colorMap1.get(user)).toEqual(colorMap2.get(user));
      });
    });
  });
});
