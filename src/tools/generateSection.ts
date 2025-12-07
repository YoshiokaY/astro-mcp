import { generateSectionTemplate } from '../templates/sectionTemplates.js';
import { formatCode } from '../utils/formatter.js';
import { parseSectionIntent } from '../utils/promptParser.js';

interface SectionArgs {
	// プロンプトベース
	prompt?: string;
	// 構造化データベース
	sectionType?: string;
	uiPattern?: string;
	pageName: string;
	content?: Record<string, any>;
	components?: string[];
}

/**
 * セクション生成ツール
 */
export async function generateSection(args: any) {
	const {
		prompt,
		sectionType,
		uiPattern,
		pageName,
		content,
		components = [],
	} = args as SectionArgs;

	try {
		let finalSectionType: string;
		let finalUIPattern: string | undefined;

		// プロンプトが指定されている場合は解析
		if (prompt) {
			const parsed = parseSectionIntent(prompt);
			finalSectionType = parsed.contentType;
			finalUIPattern = parsed.uiPattern;

			// 低信頼度の場合は警告
			if (parsed.confidence < 0.7) {
				console.warn(
					`⚠️ プロンプト解析の信頼度が低い（${parsed.confidence}）: "${prompt}"`
				);
			}
		} else {
			// 構造化データが指定されている場合
			finalSectionType = sectionType!;
			finalUIPattern = uiPattern;
		}

		// セクションテンプレート生成
		const sectionCode = generateSectionTemplate({
			type: finalSectionType,
			uiPattern: finalUIPattern as any,
			pageName,
			content: content || {},
			components,
		});

		// コード整形
		const formatted = await formatCode(sectionCode, 'astro');

		return {
			content: [
				{
					type: 'text',
					text: `✅ セクション「${finalSectionType}」（UI: ${finalUIPattern || 'デフォルト'}）を生成しました\n\n\`\`\`astro\n${formatted}\n\`\`\`\n\n### 配置先\n- \`src/pages/_parts/_${pageName}/_${finalSectionType}.astro\``,
				},
			],
		};
	} catch (error) {
		throw new Error(`セクション生成エラー: ${error}`);
	}
}
