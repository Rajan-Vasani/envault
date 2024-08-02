//import {fixupConfigRules, fixupPluginRules} from '@eslint/compat';
import {fixupConfigRules} from '@eslint/compat';
import pluginJs from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginReactCompiler from 'eslint-plugin-react-compiler';
//import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRecommended from 'eslint-plugin-react/configs/recommended.js';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
      },
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      'unused-imports': pluginUnusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...fixupConfigRules(pluginReactRecommended),
  {
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/no-unknown-property': ['error', {ignore: ['gs-w', 'gs-h', 'gs-x', 'gs-y']}],
      'react/jsx-curly-spacing': [
        'warn',
        {
          when: 'never',
          children: {
            when: 'never',
          },
        },
      ],
    },
  },
  // {
  //   plugins: {
  //     'react-hooks': fixupPluginRules(pluginReactHooks),
  //   },
  //   rules: {
  //     ...pluginReactHooks.configs.recommended.rules,
  //     'react-hooks/rules-of-hooks': 'error',
  //     'react-hooks/exhaustive-deps': 'warn',
  //   },
  // },
  {
    plugins: {
      'react-compiler': pluginReactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
    },
  },
  configPrettier,
];
