import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    rules: {
      // TypeScript specific
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": false,
        },
      ],

      // Disable base rule as it can report incorrect errors
      "no-unused-vars": "off",
      "no-undef": "off", // TypeScript handles this

      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  // Allow CommonJS require() in config files and scripts
  {
    files: ["**/*.config.{js,ts,mjs}", "scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off", // Allow console in scripts
    },
  },
  // Allow console in debug/monitor components
  {
    files: [
      "**/lcp-debugger.tsx",
      "**/performance-monitor.tsx",
      "**/rum-monitor.tsx",
      "**/timeline-performance-monitor.tsx",
      "**/create-renderer.ts",
      "**/webgl-renderer.ts",
      "**/*.worker.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.cache/**",
      "**/public/**",
    ],
  }
);

