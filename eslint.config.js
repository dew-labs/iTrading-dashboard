import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      indent: ["error", 2],
      quotes: ["error", "single"],
      semi: ["error", "never"],
      camelcase: ["error", { properties: "never" }],
      "comma-dangle": ["error", "never"],
      "space-before-function-paren": ["error", "always"],
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": "error",
      "eol-last": "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "computed-property-spacing": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "block-spacing": "error",
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "comma-spacing": ["error", { before: false, after: true }],
      "comma-style": ["error", "last"],
      "func-call-spacing": ["error", "never"],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "new-cap": ["error", { newIsCap: true, capIsNew: false }],
      "new-parens": "error",
      "no-array-constructor": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "no-new-object": "error",
      "no-tabs": "error",
      "no-unneeded-ternary": "error",
      "no-whitespace-before-property": "error",
      "operator-linebreak": ["error", "after", { overrides: { "?": "before", ":": "before" } }],
      "padded-blocks": ["error", "never"],
      "rest-spread-spacing": ["error", "never"],
      "semi-spacing": ["error", { before: false, after: true }],
      "space-before-blocks": "error",
      "spaced-comment": ["error", "always", { exceptions: ["-", "*"] }],
      "template-curly-spacing": "error",
      "yield-star-spacing": ["error", "after"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "no-duplicate-imports": "error",
    },
  }
);
