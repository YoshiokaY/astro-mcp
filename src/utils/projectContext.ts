import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * generate-* ツール実行時にレスポンスへ自動注入するプロジェクト規約を取得
 * get-project-context の完全版とは異なり、生成に直接関わる最小限の情報のみ返す
 */
export function getGenerationContext(projectRoot: string): string {
  const sections: string[] = [];

  // 1. コーディング規約の読み込み
  const rules = readProjectRules(projectRoot);
  if (rules) {
    sections.push(rules);
  }

  // 2. SCSS変数の要約
  const scssVars = readScssVariablesSummary(projectRoot);
  if (scssVars) {
    sections.push(`### SCSS変数\n${scssVars}`);
  }

  if (sections.length === 0) return "";

  return `\n\n---\n### プロジェクト規約（自動注入）\n${sections.join("\n\n")}`;
}

/**
 * ai-context.md または .cursorrules からプロジェクト規約を読み込む
 */
function readProjectRules(projectRoot: string): string | null {
  const files = ["ai-context.md", ".cursorrules"];

  for (const file of files) {
    const filePath = resolve(projectRoot, file);
    if (existsSync(filePath)) {
      try {
        return readFileSync(filePath, "utf-8")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * _variables.scss からカラー・レイアウト変数の要約を抽出
 */
function readScssVariablesSummary(projectRoot: string): string | null {
  const filePath = resolve(
    projectRoot,
    "src/scss/abstracts/_variables.scss"
  );

  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines: string[] = [];

    // カラー変数
    const colors = content.match(/\$color-[\w-]+:\s*[^;]+;/g);
    if (colors) {
      lines.push(...colors.map((m) => m.trim()));
    }

    // レイアウト変数
    const layoutVars = ["$brakePoint", "$containerSize", "$containerPadding"];
    for (const v of layoutVars) {
      const match = content.match(new RegExp(`\\${v}:\\s*[^;]+;`));
      if (match) lines.push(match[0].trim());
    }

    return lines.length > 0 ? lines.join("\n") : null;
  } catch {
    return null;
  }
}
