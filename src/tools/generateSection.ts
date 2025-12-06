import { generateSectionTemplate } from "../templates/sectionTemplates.js";
import { formatCode } from "../utils/formatter.js";

interface SectionArgs {
  sectionType: string;
  pageName: string;
  content: Record<string, any>;
  components?: string[];
}

/**
 * セクション生成ツール
 */
export async function generateSection(args: any) {
  const {
    sectionType,
    pageName,
    content,
    components = [],
  } = args as SectionArgs;

  try {
    // セクションテンプレート生成
    const sectionCode = generateSectionTemplate({
      type: sectionType,
      pageName,
      content,
      components,
    });

    // コード整形
    const formatted = await formatCode(sectionCode, "astro");

    return {
      content: [
        {
          type: "text",
          text: `✅ セクション「${sectionType}」を生成しました\n\n\`\`\`astro\n${formatted}\n\`\`\`\n\n### 配置先\n- \`src/pages/_parts/_${pageName}/_${sectionType}.astro\``,
        },
      ],
    };
  } catch (error) {
    throw new Error(`セクション生成エラー: ${error}`);
  }
}
