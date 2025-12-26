/**
 * URL sanitization utilities to prevent URL-based attacks
 */

/**
 * Sanitizes and validates URLs to prevent URL-based attacks
 *
 * @param url - URL string to sanitize
 * @param fallback - Fallback value if URL is invalid/unsafe (defaults to undefined)
 * @returns Sanitized URL or fallback value if invalid/unsafe
 *
 * @remarks
 * - Blocks dangerous protocols (javascript:, data:, file:, vbscript:, about:)
 * - Only allows http:, https:, and relative URLs starting with /
 * - Validates URL format using native URL constructor
 * - Case-insensitive protocol detection
 *
 * @example
 * ```typescript
 * // Valid URLs
 * sanitizeUrl('https://example.com'); // 'https://example.com'
 * sanitizeUrl('/relative/path'); // '/relative/path'
 *
 * // Blocked URLs
 * sanitizeUrl('javascript:alert("xss")'); // undefined
 * sanitizeUrl('data:text/html,<script>'); // undefined
 *
 * // With fallback
 * sanitizeUrl('invalid', '#'); // '#'
 * ```
 */
export function sanitizeUrl(url: string | undefined, fallback?: string): string | undefined {
  if (!url || url.trim() === '') return fallback;

  const trimmedUrl = url.trim();

  // Block dangerous protocols that can execute code
  const dangerousProtocols = /^(javascript|data|file|vbscript|about):/i;
  if (dangerousProtocols.test(trimmedUrl)) {
    return fallback;
  }

  // Allow only http(s) and relative URLs
  try {
    // If it starts with /, it's a relative URL - allow it
    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }

    // Otherwise, validate as absolute URL
    const urlObj = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return fallback;
    }

    return urlObj.toString();
  } catch {
    // Invalid URL format
    return fallback;
  }
}
