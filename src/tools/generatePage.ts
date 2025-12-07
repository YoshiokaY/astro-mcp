import { generatePageTemplate } from "../templates/pageTemplates.js";
import { formatCode } from "../utils/formatter.js";
import { parsePageIntent } from "../utils/promptParser.js";
import {
  type HeadConfig,
  type MenuItem,
  updateCommonAstro,
} from "../editors/commonEditor.js";
import {
  type ScssVariablesConfig,
  updateScssVariables,
} from "../editors/scssVariablesEditor.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

interface PageArgs {
  pageName: string;
  prompt?: string; // プロンプトベースのページタイプ判定用
  pageData: {
    head: {
      slug: string;
      ttl: string;
      description: string;
      url: string;
    };
    breadcrumbs?: Array<{ text: string; link: string }>;
    contents: Record<string, any>;
  };
  sections: string[];
  // サイト設定更新オプション
  siteConfig?: {
    head?: HeadConfig;
    menu?: MenuItem[];
  };
  scssConfig?: ScssVariablesConfig;
  // プロジェクトルートパス（デフォルト: カレントディレクトリ）
  projectRoot?: string;
}

/**
 * ページ生成ツール（サイト設定更新統合版）
 */
export async function generatePage(args: any) {
  const {
    pageName,
    prompt,
    pageData,
    sections,
    siteConfig,
    scssConfig,
    projectRoot = process.cwd(),
  } = args as PageArgs;

  try {
    const updateLogs: string[] = [];

    // ページタイプ自動判定
    let pageType: 'top' | 'lower' | undefined;
    if (prompt) {
      const parsed = parsePageIntent(prompt, pageName);
      pageType = parsed.pageType;

      if (parsed.confidence < 0.7) {
        updateLogs.push(
          `⚠️ ページタイプ判定の信頼度が低い（${parsed.confidence}）: "${prompt}"`
        );
      }
    }

    // 1. Common.astro の更新（サイト設定が指定されている場合）
    if (siteConfig) {
      const commonPath = resolve(projectRoot, "src/layouts/Common.astro");

      if (existsSync(commonPath)) {
        const originalContent = readFileSync(commonPath, "utf-8");
        const updatedContent = updateCommonAstro(originalContent, siteConfig);

        writeFileSync(commonPath, updatedContent, "utf-8");
        updateLogs.push("✅ Common.astro を更新しました");

        if (siteConfig.head) {
          const updatedFields = Object.keys(siteConfig.head).join(", ");
          updateLogs.push(`  - head: ${updatedFields}`);
        }
        if (siteConfig.menu) {
          updateLogs.push(`  - menu: ${siteConfig.menu.length}項目`);
        }
      } else {
        updateLogs.push(
          `⚠️ Common.astro が見つかりません: ${commonPath}`
        );
      }
    }

    // 2. _variables.scss の更新（SCSS設定が指定されている場合）
    if (scssConfig) {
      const scssPath = resolve(
        projectRoot,
        "src/scss/abstracts/_variables.scss"
      );

      if (existsSync(scssPath)) {
        const originalContent = readFileSync(scssPath, "utf-8");
        const updatedContent = updateScssVariables(originalContent, scssConfig);

        writeFileSync(scssPath, updatedContent, "utf-8");
        updateLogs.push("✅ _variables.scss を更新しました");

        if (scssConfig.colors) {
          const updatedColors = Object.keys(scssConfig.colors).join(", ");
          updateLogs.push(`  - colors: ${updatedColors}`);
        }
        if (scssConfig.layout) {
          const updatedLayout = Object.keys(scssConfig.layout).join(", ");
          updateLogs.push(`  - layout: ${updatedLayout}`);
        }
        if (scssConfig.fontSizes) {
          const updatedFonts = Object.keys(scssConfig.fontSizes).join(", ");
          updateLogs.push(`  - fontSizes: ${updatedFonts}`);
        }
      } else {
        updateLogs.push(
          `⚠️ _variables.scss が見つかりません: ${scssPath}`
        );
      }
    }

    // 3. ページテンプレート生成
    const pageCode = generatePageTemplate({
      pageName,
      pageType,
      pageData,
      sections,
    });

    // コード整形
    const formatted = await formatCode(pageCode, "astro");

    // 結果メッセージの構築
    const updateSection =
      updateLogs.length > 0
        ? `### サイト設定更新\n${updateLogs.join("\n")}\n\n`
        : "";

    return {
      content: [
        {
          type: "text",
          text: `${updateSection}### ページ生成\n✅ ページ「${pageName}」を生成しました\n\n\`\`\`astro\n${formatted}\n\`\`\`\n\n### 配置先\n- \`src/pages/${pageName}/index.astro\`\n\n### 必要なセクション\n${sections.map((s) => `- \`src/pages/_parts/_${pageName}/_${s}.astro\``).join("\n")}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`ページ生成エラー: ${error}`);
  }
}
