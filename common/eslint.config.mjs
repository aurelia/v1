import eslint from "@eslint/js";
// @if babel
import babelParser from "@babel/eslint-parser";
// @endif
// @if typescript
import tseslint from 'typescript-eslint';
import tsParser from "@typescript-eslint/parser";
// @endif
import globals from "globals";

export default [
  eslint.configs.recommended,
  // @if typescript
  ...tseslint.configs.recommended,
  // @endif
  {
    // @if typescript
    files: ["**/*.ts"],
    // @endif

    rules: {
      "no-unused-vars": 0,
      // @if typescript
      "@typescript-eslint/no-unused-vars": 0,
      "@typescript-eslint/no-explicit-any": 0,
      // @endif
      "no-prototype-builtins": 0,
      "no-console": 0,
      "getter-return": 0
    },

    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.nodeBuiltin,
        ...globals.browser,
        ...globals.node,
        // @if karma
        ...globals.jasmine,
        // @endif
        // @if jest
        ...globals.jest,
        // @endif
      },

      // @if babel
      parser: babelParser,
      // @endif
      // @if typescript
      parser: tsParser,
      // @endif
      ecmaVersion: 2019,
      sourceType: "module",
      parserOptions: {
        // @if babel
        ecmaFeatures: {
          legacyDecorators: true
        },
        // @endif
        // @if typescript
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
        // @endif
      },
    },
  }
];
