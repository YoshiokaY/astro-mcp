/**
 * UIパターン汎用ジェネレーター
 * コンテンツデータとUIパターンを受け取り、適切なマークアップを生成
 */

import { getContainerClass, getButtonClass } from '../utils/astroDevClasses.js';

export type UIPattern =
	| 'tab' // タブUI(開発環境のTab.ts連携)
	| 'accordion' // アコーディオンUI(Accordion.ts連携)
	| 'grid' // グリッドレイアウト
	| 'carousel' // カルーセル
	| 'list' // シンプルリスト
	| 'modal'; // モーダルギャラリー(Modal.ts連携)

export interface UIPatternConfig {
	pattern: UIPattern;
	data: Record<string, any>;
	components?: string[];
	options?: {
		columns?: number; // グリッドのカラム数
		gap?: string; // アイテム間の余白
		autoplay?: boolean; // カルーセルの自動再生
		openFirst?: boolean; // アコーディオン初期表示
		hasImage?: boolean; // 画像表示有無
	};
}

/**
 * UIパターンに基づいてマークアップを生成
 */
export function generateUIPattern(config: UIPatternConfig): string {
	switch (config.pattern) {
		case 'tab':
			return generateTabUI(config);
		case 'accordion':
			return generateAccordionUI(config);
		case 'grid':
			return generateGridUI(config);
		case 'carousel':
			return generateCarouselUI(config);
		case 'list':
			return generateListUI(config);
		case 'modal':
			return generateModalUI(config);
		default:
			return generateFallbackBlock(config);
	}
}

/**
 * タブUI生成(開発環境のTab.ts連携)
 */
function generateTabUI(_config: UIPatternConfig): string {
	return `---
interface Props {
	data: {
		ttl: string;
		items: {
			name: string;
			content: any;
		}[];
	};
}

const { data } = Astro.props;
---

<section class="c_tab">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<ul class="c_tab_list">
			{
				data.items.map((item, i) => (
					<li>
						<button
							type="button"
							class={i === 0 ? "-open" : ""}
							aria-pressed={i === 0 ? "true" : "false"}
							tabindex={i === 0 ? "-1" : "0"}
							set:html={item.name}
						/>
					</li>
				))
			}
		</ul>
		{
			data.items.map((item, i) => (
				<div
					class="c_tab_content"
					hidden={i !== 0}
					tabindex="-1"
				>
					<!-- コンテンツはプロジェクト固有で実装 -->
					<Fragment set:html={item.content} />
				</div>
			))
		}
	</div>
</section>
`;
}

/**
 * アコーディオンUI生成(開発環境のAccordion.ts連携)
 */
function generateAccordionUI(config: UIPatternConfig): string {
	const { options = {} } = config;
	const { openFirst = true } = options;

	return `---
interface Props {
	data: {
		ttl: string;
		items: {
			ttl: string;
			content: string;
		}[];
	};
}

const { data } = Astro.props;
---

<section class="accordion_section">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<div class="accordion_list">
			{
				data.items.map((item, i) => (
					<details
						class={"c_pull accordion_item" + (${openFirst} && i === 0 ? " -open" : "")}
						open={${openFirst} && i === 0}
					>
						<summary class="c_pull_ttl accordion_item_ttl">
							<span class="accordion_item_ttl_text" set:html={item.ttl} />
						</summary>
						<div class="c_pull_content accordion_item_content">
							<div class="accordion_item_content_text" set:html={item.content} />
						</div>
					</details>
				))
			}
		</div>
	</div>
</section>
`;
}

/**
 * グリッドUI生成
 */
function generateGridUI(config: UIPatternConfig): string {
	const { options = {} } = config;
	const { columns = 3, gap = '2.4rem', hasImage = true } = options;

	return `---
import Picture from "@/components/Picture.astro";

interface Props {
	data: {
		ttl: string;
		items: {
			ttl: string;
			desc?: string;
			${hasImage ? 'img?: string;' : ''}
			link?: string;
		}[];
	};
	imgPath?: string;
}

const { data, imgPath = '' } = Astro.props;
---

<section class="grid_section">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<ul class="grid_list" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
			{
				data.items.map((item) => (
					<li class="grid_item">
						${
							hasImage
								? `
						{item.img && (
							<div class="grid_item_img">
								<Picture src={imgPath + item.img} alt={item.ttl} />
							</div>
						)}
						`
								: ''
						}
						<div class="grid_item_body">
							<h3 class="grid_item_ttl" set:html={item.ttl} />
							{item.desc && <p class="grid_item_desc" set:html={item.desc} />}
						</div>
					</li>
				))
			}
		</ul>
	</div>
</section>
`;
}

/**
 * カルーセルUI生成
 */
function generateCarouselUI(config: UIPatternConfig): string {
	const { options = {} } = config;
	const { autoplay = false } = options;

	return `---
import Picture from "@/components/Picture.astro";

/**
 * カルーセルセクション
 * Swiper.js等のライブラリと組み合わせて使用
 */
interface Props {
	data: {
		ttl: string;
		items: {
			ttl: string;
			desc?: string;
			img?: string;
		}[];
	};
	imgPath?: string;
}

const { data, imgPath = '' } = Astro.props;
---

<section class="carousel_section">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<div class="swiper carousel_swiper" data-autoplay="${autoplay}">
			<div class="swiper-wrapper">
				{
					data.items.map((item) => (
						<div class="swiper-slide carousel_item">
							{item.img && (
								<div class="carousel_item_img">
									<Picture src={imgPath + item.img} alt={item.ttl} />
								</div>
							)}
							<div class="carousel_item_body">
								<h3 class="carousel_item_ttl" set:html={item.ttl} />
								{item.desc && <p class="carousel_item_desc" set:html={item.desc} />}
							</div>
						</div>
					))
				}
			</div>
			<div class="swiper-pagination"></div>
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
		</div>
	</div>
</section>
`;
}

/**
 * リストUI生成
 */
function generateListUI(_config: UIPatternConfig): string {
	return `---
interface Props {
	data: {
		ttl: string;
		items: {
			ttl: string;
			desc?: string;
		}[];
	};
}

const { data } = Astro.props;
---

<section class="list_section">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<ul class="list">
			{
				data.items.map((item) => (
					<li class="list_item">
						<h3 class="list_item_ttl" set:html={item.ttl} />
						{item.desc && <p class="list_item_desc" set:html={item.desc} />}
					</li>
				))
			}
		</ul>
	</div>
</section>
`;
}

/**
 * モーダルUI生成(開発環境のModal.ts連携)
 */
function generateModalUI(_config: UIPatternConfig): string {
	return `---
import Picture from "@/components/Picture.astro";

/**
 * モーダルギャラリーセクション
 * Modal.ts と連携(動画/画像/カスタムdialog対応)
 */
interface Props {
	data: {
		ttl: string;
		items: {
			ttl: string;
			desc?: string;
			thumbnail?: string;
			src: string;
			alt?: string;
			type?: 'video' | 'image' | 'dialog';
		}[];
	};
	imgPath?: string;
}

const { data, imgPath = '' } = Astro.props;
---

<section class="modal_section">
	<div class="contentInner">
		<h2 class="section_ttl" set:html={data.ttl} />
		<ul class="modal_list">
			{
				data.items.map((item) => (
					<li class="modal_item">
						<button
							type="button"
							class="c_modal_btn modal_card"
							data-src={item.src}
							data-alt={item.alt}
						>
							{item.thumbnail && (
								<span class="modal_thumbnail">
									<Picture src={imgPath + item.thumbnail} alt={item.alt || item.ttl} />
									{item.type === 'video' && (
										<span class="modal_play_icon">
											<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
												<circle cx="30" cy="30" r="30" fill="white" opacity="0.9" />
												<path d="M24 18L42 30L24 42V18Z" fill="#667eea" />
											</svg>
										</span>
									)}
								</span>
							)}
							<span class="modal_body">
								<h3 class="modal_ttl" set:html={item.ttl} />
								{item.desc && <p class="modal_desc" set:html={item.desc} />}
							</span>
						</button>
					</li>
				))
			}
		</ul>
	</div>
</section>
`;
}

/**
 * フォールバックブロック生成
 * サポート外のUIパターンが指定された場合、contentデータからinterfaceを推論し
 * section > .contentInner の外枠を保証した上で中身はAIに委ねる
 */
function generateFallbackBlock(config: UIPatternConfig): string {
	const { data } = config;
	const propsInterface = inferInterface(data);
	const hasImg = Object.keys(data).some(
		(k) => k.includes('img') || k === 'src',
	);
	const importLine = hasImg
		? 'import Picture from "@/components/Picture.astro";\n\n'
		: '';

	return `---
${importLine}/**
 * カスタムセクション
 * UIパターン: ${config.pattern}
 * デザインに合わせてコンテンツ部分を実装してください
 */
interface Props {
	data: {
${propsInterface}
	};${hasImg ? '\n\timgPath?: string;' : ''}
}

const { data${hasImg ? ', imgPath = ""' : ''} } = Astro.props;
---

<section class="${config.pattern}_section">
	<div class="contentInner">
		{/* TODO: デザインに合わせてコンテンツを実装 */}
		{/* data の構造は上記 Props interface を参照 */}
	</div>
</section>
`;
}

/**
 * contentデータからTypeScript interfaceのプロパティ定義を推論
 */
function inferInterface(
	data: Record<string, any>,
	indent: string = '\t\t',
): string {
	return Object.entries(data)
		.map(([key, value]) => {
			const type = inferType(value);
			return `${indent}${key}: ${type};`;
		})
		.join('\n');
}

function inferType(value: any): string {
	if (value === null || value === undefined) return 'any';
	if (typeof value === 'string') return 'string';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'boolean') return 'boolean';

	if (Array.isArray(value)) {
		if (value.length === 0) return 'any[]';
		const first = value[0];
		if (typeof first === 'object' && first !== null) {
			const itemProps = Object.entries(first)
				.map(([k, v]) => `\t\t\t${k}: ${inferType(v)};`)
				.join('\n');
			return `{\n${itemProps}\n\t\t}[]`;
		}
		return `${inferType(first)}[]`;
	}

	if (typeof value === 'object') {
		const objProps = Object.entries(value)
			.map(([k, v]) => `\t\t\t${k}: ${inferType(v)};`)
			.join('\n');
		return `{\n${objProps}\n\t\t}`;
	}

	return 'any';
}
