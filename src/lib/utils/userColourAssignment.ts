/**
 * User Color Assignment Utility
 *
 * Provides consistent color assignment for on-call users in calendar views.
 * Colours are pastel tones that work well in both light and dark modes with
 * sufficient contrast for text readability.
 *
 * Separation of Concerns:
 * - Logic layer: Color assignment algorithm
 * - No UI dependencies: Pure functions
 * - Testable: Deterministic color mapping
 */

/**
 * Pastel color palette optimized for both light and dark modes
 * Each color provides sufficient contrast for readable text
 *
 * Colours selected to:
 * - Be visually distinct from each other
 * - Work well with both white and black text
 * - Provide pleasant, non-jarring appearance
 * - Maintain accessibility standards
 */
export const USER_COLOR_PALETTE = [
  // Pastel Blue
  {
    background: '#90CAF9', // Light blue that works in both modes
    border: '#64B5F6',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Green
  {
    background: '#A5D6A7', // Light green
    border: '#81C784',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Purple
  {
    background: '#CE93D8', // Light purple
    border: '#BA68C8',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Orange
  {
    background: '#FFCC80', // Light orange
    border: '#FFB74D',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Pink
  {
    background: '#F48FB1', // Light pink
    border: '#EC407A',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Cyan
  {
    background: '#80DEEA', // Light cyan
    border: '#4DD0E1',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Lime
  {
    background: '#DCE775', // Light lime
    border: '#D4E157',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Teal
  {
    background: '#80CBC4', // Light teal
    border: '#4DB6AC',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Amber
  {
    background: '#FFE082', // Light amber
    border: '#FFD54F',
    textColor: '#111827', // High-contrast text for AA readability
  },
  // Pastel Indigo
  {
    background: '#9FA8DA', // Light indigo
    border: '#7986CB',
    textColor: '#111827', // High-contrast text for AA readability
  },
] as const;

/**
 * Simple string hash function for consistent color assignment
 * Uses DJB2 algorithm - fast and produces well-distributed hashes
 *
 * @param str - String to hash (typically user ID or email)
 * @returns Positive integer hash value
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Ensure positive number
  return Math.abs(hash);
}

/**
 * Interface for color assignment result
 */
export interface UserColor {
  background: string;
  border: string;
  textColor: string;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = hue / 60;
  const x = c * (1 - Math.abs((h % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 1) {
    r = c;
    g = x;
  } else if (h >= 1 && h < 2) {
    r = x;
    g = c;
  } else if (h >= 2 && h < 3) {
    g = c;
    b = x;
  } else if (h >= 3 && h < 4) {
    g = x;
    b = c;
  } else if (h >= 4 && h < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const m = l - c / 2;
  const toHex = (value: number): string => {
    const v = Math.round((value + m) * 255);
    return v.toString(16).padStart(2, '0').toUpperCase();
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function createGeneratedPastelColor(seed: number): UserColor {
  const hue = seed % 360;

  return {
    background: hslToHex(hue, 62, 78),
    border: hslToHex(hue, 62, 68),
    textColor: hslToHex(hue, 72, 24),
  };
}

/**
 * Assigns a consistent color to a user based on their identifier
 *
 * The same user ID/email will always get the same color, making it
 * easier to visually track a user across different time periods.
 *
 * @param userId - Unique identifier for the user (ID or email)
 * @returns UserColor object with background, border, and text colors
 *
 * @example
 * ```typescript
 * const color1 = getUserColor('user@example.com');
 * const color2 = getUserColor('user@example.com');
 * // color1 === color2 (same user always gets same color)
 * ```
 */
export function getUserColor(userId: string): UserColor {
  // Validate input
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    // Default to first color for invalid input
    return USER_COLOR_PALETTE[0];
  }

  // Hash the user ID and map to palette
  const hash = hashString(userId);
  const index = hash % USER_COLOR_PALETTE.length;

  return USER_COLOR_PALETTE[index];
}

/**
 * Gets a color for a user using their ID or email as fallback
 * Prefers email for consistency if both are provided
 *
 * @param userId - User's unique ID
 * @param userEmail - User's email (optional)
 * @returns UserColor object
 */
export function getUserColorWithFallback(
  userId: string | undefined,
  userEmail: string | undefined
): UserColor {
  // Prefer email for consistency (email is more stable than ID)
  const identifier = userEmail || userId || 'unknown';
  return getUserColor(identifier);
}

/**
 * Assigns colors to multiple users ensuring no collisions within the set
 * Uses hash-based initial assignment, then resolves conflicts sequentially
 *
 * @param userIdentifiers - Array of user identifiers (IDs or emails)
 * @returns Map of user identifier to assigned color
 *
 * @example
 * ```typescript
 * const users = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
 * const colorMap = assignUniqueColours(users);
 * // Each user gets a different color, no collisions
 * ```
 */
export function assignUniqueColours(userIdentifiers: string[]): Map<string, UserColor> {
  const validIdentifiers = Array.from(
    new Set(
      userIdentifiers.filter((identifier) => typeof identifier === 'string' && identifier.trim())
    )
  );

  const colorAssignments = new Map<string, UserColor>();
  const usedColorIndices = new Set<number>();
  const usedbackgroundColours = new Set<string>();

  // Track which users hash to the same color (collisions)
  const collisions: Array<{ identifier: string; preferredIndex: number }> = [];

  // First pass: assign colors based on hash, track collisions
  for (const identifier of validIdentifiers) {
    const hash = hashString(identifier);
    const preferredIndex = hash % USER_COLOR_PALETTE.length;

    // Check if this color is already used
    if (usedColorIndices.has(preferredIndex)) {
      // Collision detected - defer to second pass
      collisions.push({ identifier, preferredIndex });
    } else {
      // No collision - use the hash-based color
      usedColorIndices.add(preferredIndex);
      const color = USER_COLOR_PALETTE[preferredIndex];
      usedbackgroundColours.add(color.background);
      colorAssignments.set(identifier, color);
    }
  }

  // Second pass: resolve collisions by assigning next available color
  for (const { identifier, preferredIndex } of collisions) {
    // Find the first unused color
    for (let offset = 0; offset < USER_COLOR_PALETTE.length; offset++) {
      const index = (preferredIndex + offset) % USER_COLOR_PALETTE.length;
      if (!usedColorIndices.has(index)) {
        usedColorIndices.add(index);
        const color = USER_COLOR_PALETTE[index];
        usedbackgroundColours.add(color.background);
        colorAssignments.set(identifier, color);
        break;
      }
    }

    // If all base palette colors are used, generate a deterministic pastel color.
    if (!colorAssignments.has(identifier)) {
      const baseSeed = hashString(identifier);
      let candidate = createGeneratedPastelColor(baseSeed);
      let guard = 0;

      while (usedbackgroundColours.has(candidate.background) && guard < 360) {
        candidate = createGeneratedPastelColor(baseSeed + guard * 37);
        guard += 1;
      }

      usedbackgroundColours.add(candidate.background);
      colorAssignments.set(identifier, candidate);
    }
  }

  return colorAssignments;
}
