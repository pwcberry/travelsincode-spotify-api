import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import mochaPlugin from "eslint-plugin-mocha";

export default defineConfig([
  globalIgnores(["node_modules"]),
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  mochaPlugin.configs.flat.recommended,
  {
    rules: {
      "mocha/no-mocha-arrows": "off",
    },
  },
]);
