// Noujoude — ESLint (flat config).
// Strictness here is a security baseline, not style preference:
// Technology & Security Standard §5 requires input validation on every
// untrusted boundary and §15 forbids frontend-only authorization.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/',
      'node_modules/',
      'coverage/',
      'src/generated/payload-types.ts',
      // Reference material and the original asset library are read-only inputs.
      // They are never linted, never formatted, and never modified by tooling.
      'reference/**',
      'Noujoude.photo/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      // Standard §2.2: "avoid `any`; type public boundaries and domain contracts".
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/\\beval\\b/]",
          message: 'Arbitrary code execution is prohibited (Master Spec G.7).',
        },
        {
          selector: "CallExpression[callee.property.name='innerHTML']",
          message: 'Use context-sensitive output encoding, not raw HTML assignment (Standard §5).',
        },
        {
          selector: 'ImportDeclaration[source.value=/^\\./] ImportSpecifier/imported.name=/default/',
          message: 'Prefer named exports at domain boundaries.',
        },
      ],

      // Secrets must never reach the client. Only NEXT_PUBLIC_* is client-safe.
      'no-restricted-properties': [
        'error',
        {
          object: 'process.env',
          property: /^(?!NEXT_PUBLIC_).*/,
          message:
            'Server-only environment variables must not be read from client code. See Standard §5 / §15.',
        },
      ],
    },
  },
  {
    // Server-only files may legitimately read non-prefixed environment variables.
    files: ['src/**/*.server.ts', 'src/**/*.service.ts', 'src/payload/**', 'src/lib/server/**', 'scripts/**'],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx'],
    rules: { 'no-restricted-properties': 'off' },
  },
);
