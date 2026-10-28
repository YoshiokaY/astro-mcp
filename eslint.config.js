import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "src/**/*.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 既存コードに多数あるため段階的に型付けする
      "@typescript-eslint/no-explicit-any": "warn",
      // シグネチャ維持のための未使用引数は _ プレフィックスで許可
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
