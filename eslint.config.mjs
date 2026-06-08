import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores
    "coverage/**",
    "node_modules/**",
    "public/sw.js",
    "*.test.ts",
    "*.test.tsx",
    "*.spec.ts",
    "*.spec.tsx",
    "prisma/seed*.ts",
    "prisma/create-admin.ts",
    // Scripts (use CommonJS for simplicity)
    "scripts/**",
    "*.js",
    "check-admin.js",
    "create-admin.js",
    "sync-admin-server.js",
    "update-admin-password.js",
  ]),
]);

export default eslintConfig;
