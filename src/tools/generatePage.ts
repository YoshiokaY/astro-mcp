import { generatePageTemplate } from "../templates/pageTemplates.js";
import { formatCode } from "../utils/formatter.js";

interface PageArgs {
  pageName: string;
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
}

/**
 * ページ生成ツール
 */
export async function generatePage(args: any) {
  const { pageName, pageData, sections } = args as PageArgs;

  try {
    // ページテンプレート生成
    const pageCode = generatePageTemplate({
      pageName,
      pageData,
      sections,
    });

    // コード整形
    const formatted = await formatCode(pageCode, "astro");

    return {
      content: [
        {
          type: "text",
          text: `✅ ページ「${pageName}」を生成しました\n\n\`\`\`astro\n${formatted}\n\`\`\`\n\n### 配置先\n- \`src/pages/${pageName}/index.astro\`\n\n### 必要なセクション\n${sections.map((s) => `- \`src/pages/_parts/_${pageName}/_${s}.astro\``).join("\n")}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`ページ生成エラー: ${error}`);
  }
}
