/**
 * プロンプト解析ユーティリティ
 * 自然言語からUIパターンとコンテンツタイプを抽出
 */

import type { UIPattern } from '../templates/uiPatterns.js';

export interface ParsedSectionIntent {
	contentType: string;
	uiPattern: UIPattern;
	confidence: number; // 0-1の信頼度
}

export interface ParsedPageIntent {
	pageType: 'top' | 'lower';
	confidence: number; // 0-1の信頼度
}

/**
 * プロンプトからセクション意図を解析
 */
export function parseSectionIntent(prompt: string): ParsedSectionIntent {
	const normalizedPrompt = prompt.toLowerCase();

	// UIパターンキーワード検出
	const uiPattern = detectUIPattern(normalizedPrompt);

	// コンテンツタイプ検出
	const contentType = detectContentType(normalizedPrompt);

	// 信頼度計算
	const confidence = calculateConfidence(normalizedPrompt, uiPattern, contentType);

	return {
		contentType,
		uiPattern,
		confidence,
	};
}

/**
 * UIパターンキーワード検出
 */
function detectUIPattern(prompt: string): UIPattern {
	const patterns: Record<string, UIPattern> = {
		タブ: 'tab',
		tab: 'tab',
		アコーディオン: 'accordion',
		accordion: 'accordion',
		グリッド: 'grid',
		grid: 'grid',
		カード: 'grid',
		card: 'grid',
		カルーセル: 'carousel',
		carousel: 'carousel',
		スライダー: 'carousel',
		slider: 'carousel',
		リスト: 'list',
		list: 'list',
		モーダル: 'modal',
		modal: 'modal',
		ギャラリー: 'modal',
		gallery: 'modal',
	};

	for (const [keyword, pattern] of Object.entries(patterns)) {
		if (prompt.includes(keyword)) {
			return pattern;
		}
	}

	// デフォルト: グリッド
	return 'grid';
}

/**
 * コンテンツタイプ検出
 */
function detectContentType(prompt: string): string {
	const contentTypes: Record<string, string> = {
		記事: 'articles',
		article: 'articles',
		ブログ: 'articles',
		blog: 'articles',
		カテゴリ: 'categories',
		category: 'categories',
		カテゴリー: 'categories',
		categories: 'categories',
		'q&a': 'qa',
		qa: 'qa',
		質問: 'qa',
		faq: 'qa',
		機能: 'features',
		feature: 'features',
		技術: 'tech',
		tech: 'tech',
		technology: 'tech',
		動画: 'videos',
		video: 'videos',
		画像: 'gallery',
		image: 'gallery',
		ギャラリー: 'gallery',
		gallery: 'gallery',
	};

	for (const [keyword, type] of Object.entries(contentTypes)) {
		if (prompt.includes(keyword)) {
			return type;
		}
	}

	// デフォルト: カスタム
	return 'custom';
}

/**
 * 信頼度計算
 */
function calculateConfidence(
	prompt: string,
	uiPattern: UIPattern,
	contentType: string
): number {
	let confidence = 0.5; // 基準値

	// UIパターンのキーワードがあれば +0.3
	if (prompt.includes('タブ') || prompt.includes('tab')) confidence += 0.3;
	if (prompt.includes('アコーディオン') || prompt.includes('accordion')) confidence += 0.3;
	if (prompt.includes('グリッド') || prompt.includes('grid')) confidence += 0.3;
	if (prompt.includes('カード') || prompt.includes('card')) confidence += 0.3;
	if (prompt.includes('カルーセル') || prompt.includes('carousel')) confidence += 0.3;
	if (prompt.includes('スライダー') || prompt.includes('slider')) confidence += 0.3;
	if (prompt.includes('リスト') || prompt.includes('list')) confidence += 0.3;
	if (prompt.includes('モーダル') || prompt.includes('modal')) confidence += 0.3;
	if (prompt.includes('ギャラリー') || prompt.includes('gallery')) confidence += 0.3;

	// コンテンツタイプのキーワードがあれば +0.2
	if (contentType !== 'custom') confidence += 0.2;

	return Math.min(confidence, 1.0);
}

/**
 * プロンプト例と期待される結果のテスト用サンプル
 */
export const PROMPT_EXAMPLES = {
	記事一覧をカード形式で表示: {
		contentType: 'articles',
		uiPattern: 'grid',
		confidence: 0.8,
	},
	カテゴリをタブで表示: {
		contentType: 'categories',
		uiPattern: 'tab',
		confidence: 1.0,
	},
	'Q&Aをアコーディオン形式で': {
		contentType: 'qa',
		uiPattern: 'accordion',
		confidence: 1.0,
	},
	技術スタックをグリッドで: {
		contentType: 'tech',
		uiPattern: 'grid',
		confidence: 1.0,
	},
	動画ギャラリーをモーダルで: {
		contentType: 'videos',
		uiPattern: 'modal',
		confidence: 1.0,
	},
	記事をカルーセルで表示: {
		contentType: 'articles',
		uiPattern: 'carousel',
		confidence: 1.0,
	},
};

/**
 * プロンプトからページタイプ（トップ/下層）を判定
 */
export function parsePageIntent(
	prompt: string,
	pageName?: string
): ParsedPageIntent {
	const normalizedPrompt = prompt.toLowerCase();
	let confidence = 0.5;

	// 下層ページキーワード
	const lowerKeywords = [
		'下層',
		'サブ',
		'詳細',
		'子ページ',
		'about',
		'service',
		'contact',
		'company',
		'news',
		'blog',
		'products',
		'recruit',
	];

	// トップページキーワード
	const topKeywords = ['トップ', 'ホーム', 'top', 'home', 'index', 'メイン'];

	// プロンプトから判定
	const hasLowerKeyword = lowerKeywords.some((k) => normalizedPrompt.includes(k));
	const hasTopKeyword = topKeywords.some((k) => normalizedPrompt.includes(k));

	// ページ名から判定（補助的）
	const isTopPageName = pageName === 'top' || pageName === 'index' || pageName === 'home';

	// 判定ロジック
	if (hasTopKeyword || isTopPageName) {
		confidence = hasTopKeyword ? 0.9 : 0.7;
		return { pageType: 'top', confidence };
	}

	if (hasLowerKeyword) {
		confidence = 0.9;
		return { pageType: 'lower', confidence };
	}

	// デフォルト: ページ名がtop/index/home以外は下層と判定
	if (pageName && !isTopPageName) {
		confidence = 0.6;
		return { pageType: 'lower', confidence };
	}

	// 完全にわからない場合はトップページとする
	return { pageType: 'top', confidence: 0.3 };
}
