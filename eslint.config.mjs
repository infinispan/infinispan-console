import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '**/*.config.js', '**/*.config.mjs']
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    plugins: {
      ...reactPlugin.configs.flat.recommended.plugins,
      'react-hooks': reactHooks
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-useless-assignment': 'off',
      'no-prototype-builtins': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/prop-types': 'off'
    }
  }
);
