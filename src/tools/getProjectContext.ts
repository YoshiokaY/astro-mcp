import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, relative } from "path";

interface ProjectContextArgs {
  projectRoot?: string;
}

/**
 * デフォルトのAstro開発規約（ai-context.md が見つからない場合のフォールバック）
 */
const DEFAULT_CONTEXT = `# Astro-dev プロジェクト規約

## ディレクトリ構造
- src/layouts/ - レイアウトテンプレート（Layout.astro, Common.astro）
- src/components/ - 再利用可能なコンポーネント
- src/pages/ - ページファイル（{pageName}/index.astro）
- src/pages/_parts/ - ページセクション（_{pageName}/_{section}.astro）
- src/scss/ - スタイルシート
  - abstracts/ - 変数・ミックスイン（_variables.scss, _mixins.scss）
  - components/ - コンポーネント用SCSS（_c_{name}.scss）
  - pages/ - ページ用SCSS（_{pageName}.scss）
- src/js/ - JavaScript（app.js がエントリーポイント）
- public/_assets/img/ - 画像ファイル

## コーディング規約
- テキスト出力: set:html={data.ttl} を使用（HTMLタグ対応のため）
- 画像: <img>ではなくPictureコンポーネントを使用
- コンテンツ幅: section > .contentInner でラップ
- Props: セクションコンポーネントは常に data で受け取る
- CSSクラス: スネークスタイル（.tech_card）、状態・子要素はケバブ（.tech_card-active）
- レスポンシブ: モバイルファースト、@include mq() でPC対応
- target="_blank": rel="noopener noreferrer" は不要（モダンブラウザで暗黙適用）

## データ駆動設計
- ページデータは const page = { head, breadcrumbs, contents } で定義
- セクションには data={page.contents.xxx} で渡す
- imgPath は "/_assets/img/" + page.head.slug + "/" で定義

## 使用可能なUIパターン
tab, accordion, grid, carousel, list, modal
（上記以外はフォールバックで自動生成）

## 技術スタック
- Astro（SSG）
- SCSS（Tailwind不使用）
- TypeScript
- カスタムmixin: @include mq(), @include hover(), @include fontsize()
`;

/**
 * プロジェクト構造をスキャンして返す
 */
function scanProjectStructure(projectRoot: string): Record<string, string[]> {
  const structure: Record<string, string[]> = {};

  const scanDir = (dir: string, key: string, depth: number = 1) => {
    const fullPath = resolve(projectRoot, dir);
    if (!existsSync(fullPath)) return;

    try {
      const entries = readdirSync(fullPath);
      structure[key] = entries
        .filter((e) => {
          // 不要なディレクトリ・ファイルを除外
          if (e.startsWith(".") || e === "node_modules") return false;
          if (depth === 0) return !statSync(resolve(fullPath, e)).isDirectory();
          return true;
        })
        .map((e) => {
          const entryPath = resolve(fullPath, e);
          const isDir = statSync(entryPath).isDirectory();
          return isDir ? `${e}/` : e;
        });
    } catch {
      // 読み込みエラーは無視
    }
  };

  scanDir("src/layouts", "layouts");
  scanDir("src/components", "components");
  scanDir("src/pages", "pages");
  scanDir("src/scss/abstracts", "scss/abstracts");
  scanDir("src/scss/components", "scss/components");
  scanDir("src/scss/pages", "scss/pages");
  scanDir("src/js", "js", 0);

  return structure;
}

/**
 * プロジェクトコンテキスト取得ツール
 */
export async function getProjectContext(args: any) {
  const { projectRoot = process.cwd() } = args as ProjectContextArgs;

  const sections: string[] = [];

  // 1. コーディング規約の読み込み（優先順位順）
  const contextFiles = ["ai-context.md", ".cursorrules"];
  let rulesSource = "";
  let rulesContent = "";

  for (const file of contextFiles) {
    const filePath = resolve(projectRoot, file);
    if (existsSync(filePath)) {
      try {
        rulesContent = readFileSync(filePath, "utf-8")
          .replace(/\n{3,}/g, "\n\n") // 3行以上の空行を2行に
          .trim();
        rulesSource = file;
        break;
      } catch {
        // 読み込みエラーは次のファイルへ
      }
    }
  }

  if (rulesContent) {
    sections.push(`## コーディング規約（${rulesSource} より）\n${rulesContent}`);
  } else {
    sections.push(DEFAULT_CONTEXT.trim());
  }

  // 2. プロジェクト構造のスキャン
  const structure = scanProjectStructure(projectRoot);

  if (Object.keys(structure).length > 0) {
    const structureLines = Object.entries(structure)
      .map(([dir, files]) => `### ${dir}\n${files.map((f) => `- ${f}`).join("\n")}`)
      .join("\n\n");
    sections.push(`## プロジェクト構造\n${structureLines}`);
  }

  // 3. SCSS変数の要約（存在する場合）
  const variablesPath = resolve(
    projectRoot,
    "src/scss/abstracts/_variables.scss"
  );
  if (existsSync(variablesPath)) {
    try {
      const varsContent = readFileSync(variablesPath, "utf-8");
      const summary = extractScssVariablesSummary(varsContent);
      if (summary) {
        sections.push(`## SCSS変数（_variables.scss）\n${summary}`);
      }
    } catch {
      // 読み込みエラーは無視
    }
  }

  return {
    content: [
      {
        type: "text",
        text: sections.join("\n\n---\n\n"),
      },
    ],
  };
}

/**
 * SCSS変数ファイルからカラー・レイアウト・フォントサイズの要約を抽出
 */
function extractScssVariablesSummary(content: string): string {
  const lines: string[] = [];

  // カラー変数
  const colorMatches = content.match(/\$color-[\w-]+:\s*[^;]+;/g);
  if (colorMatches) {
    lines.push(
      "### カラー",
      ...colorMatches.map((m) => `- ${m.trim()}`),
    );
  }

  // レイアウト変数
  const layoutVars = ["$brakePoint", "$containerSize", "$containerPadding"];
  const layoutMatches = layoutVars
    .map((v) => {
      const match = content.match(new RegExp(`\\${v}:\\s*[^;]+;`));
      return match ? `- ${match[0].trim()}` : null;
    })
    .filter(Boolean);

  if (layoutMatches.length > 0) {
    lines.push("### レイアウト", ...layoutMatches as string[]);
  }

  // フォントサイズ変数
  const fontMatches = content.match(/\$font-[\w-]+:\s*[^;]+;/g);
  if (fontMatches) {
    lines.push(
      "### フォントサイズ",
      ...fontMatches.map((m) => `- ${m.trim()}`),
    );
  }

  return lines.join("\n");
}
