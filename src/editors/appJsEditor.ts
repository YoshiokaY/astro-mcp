/**
 * app.js エディター
 * UIパターンに応じて必要なスクリプトを自動登録
 */

import type { UIPattern } from '../templates/uiPatterns.js';

/**
 * UIパターンから必要なスクリプトクラス名を取得
 */
export function getRequiredScripts(pattern: UIPattern): string[] {
	const scriptMap: Record<UIPattern, string[]> = {
		tab: ['Tab'],
		accordion: ['Accordion'],
		modal: ['Modal'],
		carousel: [], // カルーセルは外部ライブラリ（Swiper等）を使用
		grid: [],
		list: [],
	};

	return scriptMap[pattern] || [];
}

/**
 * app.js にスクリプトを追加
 * @param originalContent 既存のapp.jsの内容
 * @param scripts 追加するスクリプトクラス名の配列
 * @returns 更新後のapp.jsの内容
 */
export function updateAppJs(
	originalContent: string,
	scripts: string[]
): string {
	if (scripts.length === 0) return originalContent;

	const lines = originalContent.split('\n');
	const importLines: string[] = [];
	const initLines: string[] = [];
	let loadListenerIndex = -1;

	// 既存のimport文とnew呼び出しを解析
	const existingImports = new Set<string>();
	const existingInits = new Set<string>();

	lines.forEach((line, index) => {
		// import文の検出
		const importMatch = line.match(/import\s+{\s*(\w+)\s*}\s+from/);
		if (importMatch) {
			existingImports.add(importMatch[1]);
		}

		// new呼び出しの検出
		const initMatch = line.match(/new\s+(\w+)\(\)/);
		if (initMatch) {
			existingInits.add(initMatch[1]);
		}

		// window.addEventListener("load") の検出
		if (line.includes('window.addEventListener("load"')) {
			loadListenerIndex = index;
		}
	});

	// 追加が必要なスクリプトをフィルタリング
	const scriptsToAdd = scripts.filter(
		(script) => !existingImports.has(script) && !existingInits.has(script)
	);

	if (scriptsToAdd.length === 0) {
		// すべて既に登録済み
		return originalContent;
	}

	// 新しいimport文を生成
	scriptsToAdd.forEach((script) => {
		importLines.push(`import { ${script} } from "./class/${script}.ts";`);
		initLines.push(`  new ${script}();`);
	});

	// app.jsの構造を解析して適切な位置に挿入
	let result = originalContent;

	// 1. import文の追加
	// findLastIndex相当の処理（ES2023未満でも動作）
	let lastImportIndex = -1;
	for (let i = lines.length - 1; i >= 0; i--) {
		if (lines[i].match(/^import\s+/)) {
			lastImportIndex = i;
			break;
		}
	}
	if (lastImportIndex !== -1) {
		// 既存のimport文の後に追加
		const before = lines.slice(0, lastImportIndex + 1).join('\n');
		const after = lines.slice(lastImportIndex + 1).join('\n');
		result = before + '\n' + importLines.join('\n') + '\n' + after;
	} else {
		// import文がない場合は先頭に追加
		result = importLines.join('\n') + '\n' + originalContent;
	}

	// 2. new呼び出しの追加
	if (loadListenerIndex !== -1) {
		// window.addEventListener("load") ブロック内に追加
		const updatedLines = result.split('\n');
		const loadListenerLineInUpdated = updatedLines.findIndex((line) =>
			line.includes('window.addEventListener("load"')
		);

		if (loadListenerLineInUpdated !== -1) {
			// 最後のnew呼び出しの後に追加
			let lastInitIndex = loadListenerLineInUpdated;
			for (let i = loadListenerLineInUpdated + 1; i < updatedLines.length; i++) {
				if (updatedLines[i].includes('new ')) {
					lastInitIndex = i;
				}
				if (updatedLines[i].includes('});')) {
					break;
				}
			}

			const before = updatedLines.slice(0, lastInitIndex + 1).join('\n');
			const after = updatedLines.slice(lastInitIndex + 1).join('\n');
			result = before + '\n' + initLines.join('\n') + '\n' + after;
		}
	}

	return result;
}

/**
 * app.js の更新が必要かチェック
 */
export function needsAppJsUpdate(
	originalContent: string,
	pattern: UIPattern
): boolean {
	const requiredScripts = getRequiredScripts(pattern);
	if (requiredScripts.length === 0) return false;

	// すべてのスクリプトが既に登録されているかチェック
	return requiredScripts.some((script) => {
		const importPattern = new RegExp(
			`import\\s+{\\s*${script}\\s*}\\s+from`
		);
		const initPattern = new RegExp(`new\\s+${script}\\(\\)`);
		return (
			!importPattern.test(originalContent) || !initPattern.test(originalContent)
		);
	});
}
