import eslint from '@eslint/js';
import tsESlintParser from '@typescript-eslint/parser';
import reactESlint from 'eslint-plugin-react';
import reactHooksESlint from 'eslint-plugin-react-hooks';
import reactRefreshESlint from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tsESlint from 'typescript-eslint';
import { fixupPluginRules } from '@eslint/compat';

/** @type { import("eslint").Linter.Config[] } */
export default tsESlint.config(
  {
    ...eslint.configs.recommended,
    ignores: [
      'dist',
      'eslint.config.js',
      'postcss.config.js',
      'vite.config.ts',
      'tailwind.config.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'dist',
      'eslint.config.js',
      'postcss.config.js',
      'vite.config.ts',
      'tailwind.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        browser: 'readonly',
      },
      parser: tsESlintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    extends: [
      ...tsESlint.configs.recommendedTypeChecked,
      ...tsESlint.configs.strictTypeChecked,
    ],
    plugins: {
      react: reactESlint,
      'react-hooks': fixupPluginRules(reactHooksESlint),
      'react-refresh': reactRefreshESlint,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactESlint.configs.recommended.rules,
      ...reactESlint.configs['jsx-runtime'].rules,
      ...reactHooksESlint.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // Packages `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            ['^(@|components)(/.*|$)'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.?(css)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        {
          allowNumber: true,
        },
      ],
    },
  },
);
