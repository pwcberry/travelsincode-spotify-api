import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import mochaPlugin from "eslint-plugin-mocha";

export default defineConfig([
  globalIgnores(["node_modules", ".pnp.cjs", ".pnp.loader.mjs"]),
  {
    files: ["lib/*.js", "test/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.node,
        td: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["public/assets/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  mochaPlugin.configs.recommended,
  {
    rules: {
      "mocha/no-mocha-arrows": "off",
    },
  },
]);
