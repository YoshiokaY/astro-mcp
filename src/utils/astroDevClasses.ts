/**
 * astro-dev汎用CSSクラス定義
 * 生成コンポーネントで使用する標準クラス
 */

export interface AstroDevClasses {
	// レイアウト
	container: string;
	pcOnly: string;
	spOnly: string;

	// アクセシビリティ
	screenReaderOnly: string;
	skipLink: string;

	// コンポーネント
	button: string;

	// アニメーション
	scrollAnimation: {
		base: string;
		up: string;
		down: string;
		right: string;
		left: string;
		scale: string;
		active: string;
		each: string;
	};

	// iframe
	frameWrapper: string;
}

export const astroDevClasses: AstroDevClasses = {
	container: 'contentInner',
	pcOnly: 'pcOnly',
	spOnly: 'spOnly',
	screenReaderOnly: 'txtHidden',
	skipLink: 'skipLink',
	button: 'c_btn',
	scrollAnimation: {
		base: 'scrollIn',
		up: '-up',
		down: '-down',
		right: '-right',
		left: '-left',
		scale: '-scale',
		active: '-active',
		each: '-each',
	},
	frameWrapper: 'frameWrapper',
};

/**
 * ボタンクラスを生成
 */
export function getButtonClass(customClass?: string): string {
	return customClass
		? `${astroDevClasses.button} ${customClass}`
		: astroDevClasses.button;
}

/**
 * スクロールアニメーションクラスを生成
 */
export function getScrollAnimationClass(
	direction?: 'up' | 'down' | 'right' | 'left' | 'scale',
	each = false
): string {
	const classes = [astroDevClasses.scrollAnimation.base];

	if (direction) {
		classes.push(astroDevClasses.scrollAnimation[direction]);
	}

	if (each) {
		classes.push(astroDevClasses.scrollAnimation.each);
	}

	return classes.join(' ');
}

/**
 * スクリーンリーダー用テキストを生成
 */
export function generateScreenReaderText(text: string): string {
	return `<span class="${astroDevClasses.screenReaderOnly}">${text}</span>`;
}

/**
 * コンテナクラスを取得
 */
export function getContainerClass(): string {
	return astroDevClasses.container;
}
