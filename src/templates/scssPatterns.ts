/**
 * UIパターンに対応するSCSSテンプレート生成
 * astro-devプロジェクトのmixin・命名規則に準拠
 */

import type { UIPattern } from './uiPatterns.js';

export interface ScssPatternConfig {
	pattern: UIPattern;
	pageName: string;
	sectionName: string;
	options?: {
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
}

/**
 * UIパターンに基づいてSCSSを生成
 */
export function generateScssPattern(config: ScssPatternConfig): string {
	switch (config.pattern) {
		case 'tab':
			return generateTabScss(config);
		case 'accordion':
			return generateAccordionScss(config);
		case 'grid':
			return generateGridScss(config);
		case 'carousel':
			return generateCarouselScss(config);
		case 'list':
			return generateListScss(config);
		case 'modal':
			return generateModalScss(config);
		default:
			return generateDefaultScss(config);
	}
}

/**
 * タブUI用SCSS
 * 注: タブのスタイルは _c_tab.scss で定義済み、追加スタイルのみ記述
 */
function generateTabScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {} } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(タブUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	// タブリストのカスタマイズ（必要に応じて）
	.c_tab_list {
		display: flex;
		gap: 0.8rem;
		justify-content: center;
		margin-bottom: 3.2rem;

		@include mq() {
			gap: 1.6rem;
			margin-bottom: 4rem;
		}

		li button {
			padding: 1.2rem 2.4rem;
			@include fontsize(16, 14);
			font-weight: bold;
			color: $color-txt;
			background-color: $color-bg;
			border: 0.2rem solid $color-prime;
			border-radius: 0.4rem;
			cursor: pointer;
			transition: $easing;

			@include mq() {
				padding: 1.6rem 3.2rem;
			}

			@include hover() {
				background-color: rgba($color-prime, 0.1);
			}

			// アクティブ状態は c_tab.scss で定義済み
		}
	}

	// タブコンテンツのカスタマイズ
	.c_tab_content {
		padding: 3.2rem 0;

		@include mq() {
			padding: 4rem 0;
		}
	}
}
`;
}

/**
 * アコーディオンUI用SCSS
 * 注: アコーディオンのスタイルは _c_accordion.scss で定義済み、追加スタイルのみ記述
 */
function generateAccordionScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {} } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(アコーディオンUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.accordion_list {
		display: grid;
		gap: ${spacing.itemGap || '1.6rem'};
	}

	.accordion_item {
		background: $color-bg;
		border: 0.1rem solid rgba($color-prime, 0.2);
		border-radius: 0.8rem;

		// タイトル部分のカスタマイズ（必要に応じて）
		&_ttl {
			padding: 2rem 5rem 2rem 2rem;
			@include fontsize(18, 16);
			font-weight: bold;
			color: $color-txt;

			@include mq() {
				padding: 2.4rem 6rem 2.4rem 2.4rem;
			}

			@include hover() {
				background-color: rgba($color-prime, 0.05);
			}

			&_text {
				display: block;
			}
		}

		// コンテンツ部分のカスタマイズ
		&_content {
			&_text {
				padding: 0 2rem 2rem;
				@include fontsize(16, 14);
				line-height: 1.8;
				color: $color-txt;

				@include mq() {
					padding: 0 2.4rem 2.4rem;
				}
			}
		}
	}
}
`;
}

/**
 * グリッドUI用SCSS
 */
function generateGridScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { columns = 3, spacing = {}, hasImage = true } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(グリッドUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.grid_list {
		display: grid;
		grid-template-columns: 1fr;
		gap: ${spacing.itemGap || '2.4rem'};

		@include mq() {
			grid-template-columns: repeat(${columns}, 1fr);
		}
	}

	.grid_item {
		background: $color-bg;
		border: 0.1rem solid rgba($color-prime, 0.2);
		border-radius: 0.8rem;
		overflow: hidden;
		transition: $easing;

		@include hover() {
			transform: translateY(-0.4rem);
			box-shadow: 0 0.8rem 2.4rem rgba($color-prime, 0.15);
		}

		${
			hasImage
				? `&_img {
			aspect-ratio: 16 / 9;
			overflow: hidden;
			background-color: rgba($color-prime, 0.05);

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}`
				: ''
		}

		&_body {
			padding: 2rem;

			@include mq() {
				padding: 2.4rem;
			}
		}

		&_ttl {
			margin-bottom: 0.8rem;
			@include fontsize(18, 16);
			font-weight: bold;
			color: $color-txt;
		}

		&_desc {
			@include fontsize(14, 13);
			line-height: 1.6;
			color: rgba($color-txt, 0.7);
		}
	}
}
`;
}

/**
 * カルーセルUI用SCSS
 */
function generateCarouselScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {} } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(カルーセルUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.carousel_swiper {
		overflow: hidden;

		.swiper-button-prev,
		.swiper-button-next {
			color: $color-prime;

			@include hover() {
				opacity: 0.7;
			}
		}

		.swiper-pagination-bullet {
			background: $color-prime;

			&-active {
				background: $color-second;
			}
		}
	}

	.carousel_item {
		&_img {
			aspect-ratio: 16 / 9;
			overflow: hidden;
			background-color: rgba($color-prime, 0.05);

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		&_body {
			padding: 2rem;

			@include mq() {
				padding: 2.4rem;
			}
		}

		&_ttl {
			margin-bottom: 0.8rem;
			@include fontsize(18, 16);
			font-weight: bold;
			color: $color-txt;
		}

		&_desc {
			@include fontsize(14, 13);
			line-height: 1.6;
			color: rgba($color-txt, 0.7);
		}
	}
}
`;
}

/**
 * リストUI用SCSS
 */
function generateListScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {} } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(リストUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.list {
		display: grid;
		gap: ${spacing.itemGap || '1.6rem'};
	}

	.list_item {
		padding: 2rem;
		background: $color-bg;
		border-left: 0.4rem solid $color-prime;
		border-radius: 0.4rem;
		transition: $easing;

		@include mq() {
			padding: 2.4rem;
		}

		@include hover() {
			background-color: rgba($color-prime, 0.05);
			transform: translateX(0.4rem);
		}

		&_ttl {
			margin-bottom: 0.8rem;
			@include fontsize(16, 15);
			font-weight: bold;
			color: $color-txt;
		}

		&_desc {
			@include fontsize(14, 13);
			line-height: 1.6;
			color: rgba($color-txt, 0.7);
		}
	}
}
`;
}

/**
 * モーダルUI用SCSS
 * 注: モーダル基本スタイルは _c_modal.scss で定義済み、追加スタイルのみ記述
 */
function generateModalScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {}, columns = 3 } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション(モーダルUI)
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;
		text-align: center;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.modal_list {
		display: grid;
		grid-template-columns: 1fr;
		gap: ${spacing.itemGap || '2.4rem'};

		@include mq() {
			grid-template-columns: repeat(${columns}, 1fr);
		}
	}

	.modal_item {
		.c_modal_btn {
			width: 100%;
			text-align: left;
			background: $color-bg;
			border: 0.1rem solid rgba($color-prime, 0.2);
			border-radius: 0.8rem;
			overflow: hidden;
			transition: $easing;

			@include hover() {
				transform: translateY(-0.4rem);
				box-shadow: 0 0.8rem 2.4rem rgba($color-prime, 0.15);
			}
		}
	}

	.modal_thumbnail {
		position: relative;
		display: block;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background-color: rgba($color-prime, 0.05);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.modal_play_icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;

		svg {
			filter: drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.3));
		}
	}

	.modal_body {
		display: block;
		padding: 2rem;

		@include mq() {
			padding: 2.4rem;
		}
	}

	.modal_ttl {
		margin-bottom: 0.8rem;
		@include fontsize(18, 16);
		font-weight: bold;
		color: $color-txt;
	}

	.modal_desc {
		@include fontsize(14, 13);
		line-height: 1.6;
		color: rgba($color-txt, 0.7);
	}
}
`;
}

/**
 * デフォルトSCSS（カスタムセクション用）
 */
function generateDefaultScss(config: ScssPatternConfig): string {
	const { pageName, sectionName, options = {} } = config;
	const { spacing = {} } = options;

	return `// ================================================
// ${pageName}ページ - ${sectionName}セクション
// ================================================

.${sectionName}_section {
	padding: ${spacing.sectionPadding || '6rem 0'};

	@include mq() {
		padding: ${spacing.sectionPadding || '8rem 0'};
	}

	.section_ttl {
		margin-bottom: 3.2rem;
		@include fontsize(24, 20);
		font-weight: bold;
		color: $color-prime;

		@include mq() {
			margin-bottom: 4rem;
		}
	}

	.section_desc {
		@include fontsize(16, 14);
		line-height: 1.8;
		color: $color-txt;
	}
}
`;
}
