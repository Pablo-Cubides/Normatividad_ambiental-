import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/*.old.tsx',
      '**/*.old.ts',
      '.next/**',
      'node_modules/**',
      'out/**',
      '.vercel/**',
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;