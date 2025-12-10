import { generateSectionTemplate } from '../templates/sectionTemplates.js';
import { formatCode } from '../utils/formatter.js';
import { parseSectionIntent } from '../utils/promptParser.js';
import { generateScssPattern } from '../templates/scssPatterns.js';
import type { UIPattern } from '../templates/uiPatterns.js';
import {
	getRequiredScripts,
	updateAppJs,
	needsAppJsUpdate,
} from '../editors/appJsEditor.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface SectionArgs {
	// プロンプトベース
	prompt?: string;
	// 構造化データベース
	sectionType?: string;
	uiPattern?: string;
	pageName: string;
	content?: Record<string, any>;
	components?: string[];
	// SCSS生成オプション
	generateScss?: boolean; // デフォルト: true
	scssOptions?: {
		colors?: {
			primary?: string;
			secondary?: string;
			text?: string;
		};
		spacing?: {
			sectionPadding?: string;
			itemGap?: string;
		};
		columns?: number;
		hasImage?: boolean;
	};
	// プロジェクトルート
	projectRoot?: string;
}

/**
 * セクション生成ツール（SCSS生成・app.js更新統合版）
 */
export async function generateSection(args: any) {
	const {
		prompt,
		sectionType,
		uiPattern,
		pageName,
		content,
		components = [],
		generateScss = true,
		scssOptions = {},
		projectRoot = process.cwd(),
	} = args as SectionArgs;

	try {
		const updateLogs: string[] = [];
		let finalSectionType: string;
		let finalUIPattern: string | undefined;

		// プロンプトが指定されている場合は解析
		if (prompt) {
			const parsed = parseSectionIntent(prompt);
			finalSectionType = parsed.contentType;
			finalUIPattern = parsed.uiPattern;

			// 低信頼度の場合は警告
			if (parsed.confidence < 0.7) {
				updateLogs.push(
					`⚠️ プロンプト解析の信頼度が低い（${parsed.confidence}）: "${prompt}"`
				);
			}
		} else {
			// 構造化データが指定されている場合
			finalSectionType = sectionType!;
			finalUIPattern = uiPattern;
		}

		// 1. app.js の更新（UIパターンにスクリプトが必要な場合）
		if (finalUIPattern) {
			const appJsPath = resolve(projectRoot, 'src/js/app.js');

			if (existsSync(appJsPath)) {
				const originalContent = readFileSync(appJsPath, 'utf-8');

				if (needsAppJsUpdate(originalContent, finalUIPattern as UIPattern)) {
					const requiredScripts = getRequiredScripts(
						finalUIPattern as UIPattern
					);
					const updatedContent = updateAppJs(originalContent, requiredScripts);

					writeFileSync(appJsPath, updatedContent, 'utf-8');
					updateLogs.push(
						`✅ app.js を更新しました（追加: ${requiredScripts.join(', ')}）`
					);
				} else {
					updateLogs.push(
						`ℹ️ app.js は既に必要なスクリプトが登録済みです`
					);
				}
			} else {
				updateLogs.push(`⚠️ app.js が見つかりません: ${appJsPath}`);
			}
		}

		// 2. セクションテンプレート生成
		const sectionCode = generateSectionTemplate({
			type: finalSectionType,
			uiPattern: finalUIPattern as any,
			pageName,
			content: content || {},
			components,
		});

		// コード整形
		const formattedAstro = await formatCode(sectionCode, 'astro');

		// 3. SCSS生成（オプション）
		let scssCode = '';
		if (generateScss && finalUIPattern) {
			scssCode = generateScssPattern({
				pattern: finalUIPattern as UIPattern,
				pageName,
				sectionName: finalSectionType,
				options: scssOptions,
			});

			updateLogs.push(
				`✅ SCSSファイルを生成しました（配置先: src/scss/pages/_${pageName}.scss）`
			);
		}

		// 結果メッセージの構築
		const updateSection =
			updateLogs.length > 0
				? `### プロジェクト更新\n${updateLogs.join('\n')}\n\n`
				: '';

		let resultText = `${updateSection}### セクション生成\n✅ セクション「${finalSectionType}」（UI: ${finalUIPattern || 'デフォルト'}）を生成しました\n\n#### Astroコンポーネント\n\`\`\`astro\n${formattedAstro}\n\`\`\`\n\n**配置先**: \`src/pages/_parts/_${pageName}/_${finalSectionType}.astro\``;

		if (scssCode) {
			resultText += `\n\n#### SCSSファイル\n\`\`\`scss\n${scssCode}\n\`\`\`\n\n**配置先**: \`src/scss/pages/_${pageName}.scss\`\n\n**注意**: 既存の \`_${pageName}.scss\` がある場合は、生成されたSCSSを追記してください。`;
		}

		return {
			content: [
				{
					type: 'text',
					text: resultText,
				},
			],
		};
	} catch (error) {
		throw new Error(`セクション生成エラー: ${error}`);
	}
}
