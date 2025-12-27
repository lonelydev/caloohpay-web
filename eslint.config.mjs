import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  globalIgnores([
    // Build outputs
    ".next/**",
    "out/**",
    "build/**",
    // Type definitions
    "next-env.d.ts",
    // Test coverage
    "coverage/**",
    // Dependencies
    "node_modules/**",
    // Playwright
    "playwright-report/**",
    "test-results/**"
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
      "tests/**/*.{ts,tsx,js,jsx}"
    ],
    rules: {
      // Enforce using the '@/tests/utils' alias for test helpers
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../../**/tests/utils/**',
                '../**/tests/utils/**',
                './tests/utils/**',
                'tests/utils/**'
              ],
              message: 'Use alias @/tests/utils for test helpers',
            },
          ],
          paths: [
            {
              name: '@/tests/utils/authMock',
              message: 'Import from @/tests/utils (barrel) instead of specific file',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
