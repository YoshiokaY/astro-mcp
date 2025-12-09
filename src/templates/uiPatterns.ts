/**
 * UIパターン汎用ジェネレーター
 * コンテンツデータとUIパターンを受け取り、適切なマークアップを生成
 */

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
		hasPicture?: boolean; // Pictureコンポーネント使用有無
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
			throw new Error(`Unknown UI pattern: ${config.pattern}`);
	}
}

/**
 * タブUI生成(開発環境のTab.ts連携)
 */
function generateTabUI(config: UIPatternConfig): string {
	const { data } = config;

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
	<h2 class="section_ttl">{data.ttl}</h2>
	<ul class="c_tab_list">
		{
			data.items.map((item, i) => (
				<li>
					<button
						type="button"
						class={i === 0 ? "-open" : ""}
						aria-pressed={i === 0 ? "true" : "false"}
						tabindex={i === 0 ? "-1" : "0"}
					>
						{item.name}
					</button>
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
				{item.content}
			</div>
		))
	}
</section>
`;
}

/**
 * アコーディオンUI生成(開発環境のAccordion.ts連携)
 */
function generateAccordionUI(config: UIPatternConfig): string {
	const { data, options = {} } = config;
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
	<h2 class="section_ttl">{data.ttl}</h2>
	<div class="accordion_list">
		{
			data.items.map((item, i) => (
				<details
					class={"c_pull accordion_item" + (${openFirst} && i === 0 ? " -open" : "")}
					open={${openFirst} && i === 0}
				>
					<summary class="c_pull_ttl accordion_item_ttl">
						<span class="accordion_item_ttl_text">{item.ttl}</span>
					</summary>
					<div class="c_pull_content accordion_item_content">
						<div class="accordion_item_content_text" set:html={item.content} />
					</div>
				</details>
			))
		}
	</div>
</section>
`;
}

/**
 * グリッドUI生成
 */
function generateGridUI(config: UIPatternConfig): string {
	const { data, options = {}, components = [] } = config;
	const { columns = 3, gap = '2.4rem', hasImage = true } = options;
	const hasPicture = components.includes('Picture');

	return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ''}

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
	<h2 class="section_ttl">{data.ttl}</h2>
	<ul class="grid_list" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
		{
			data.items.map((item) => (
				<li class="grid_item">
					${
						hasImage
							? `
					{item.img && (
						<div class="grid_item_img">
							${hasPicture ? '<Picture src={imgPath + item.img} alt={item.ttl} sizes={[400, 300]} />' : '<img src={imgPath + item.img} alt={item.ttl} loading="lazy" />'}
						</div>
					)}
					`
							: ''
					}
					<div class="grid_item_body">
						<h3 class="grid_item_ttl">{item.ttl}</h3>
						{item.desc && <p class="grid_item_desc">{item.desc}</p>}
					</div>
				</li>
			))
		}
	</ul>
</section>
`;
}

/**
 * カルーセルUI生成
 */
function generateCarouselUI(config: UIPatternConfig): string {
	const { data, options = {}, components = [] } = config;
	const { autoplay = false } = options;
	const hasPicture = components.includes('Picture');

	return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ''}

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
	<h2 class="section_ttl">{data.ttl}</h2>
	<div class="swiper carousel_swiper" data-autoplay="${autoplay}">
		<div class="swiper-wrapper">
			{
				data.items.map((item) => (
					<div class="swiper-slide carousel_item">
						{item.img && (
							<div class="carousel_item_img">
								${hasPicture ? '<Picture src={imgPath + item.img} alt={item.ttl} sizes={[800, 600]} />' : '<img src={imgPath + item.img} alt={item.ttl} loading="lazy" />'}
							</div>
						)}
						<div class="carousel_item_body">
							<h3 class="carousel_item_ttl">{item.ttl}</h3>
							{item.desc && <p class="carousel_item_desc">{item.desc}</p>}
						</div>
					</div>
				))
			}
		</div>
		<div class="swiper-pagination"></div>
		<div class="swiper-button-prev"></div>
		<div class="swiper-button-next"></div>
	</div>
</section>
`;
}

/**
 * リストUI生成
 */
function generateListUI(config: UIPatternConfig): string {
	const { data } = config;

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
	<h2 class="section_ttl">{data.ttl}</h2>
	<ul class="list">
		{
			data.items.map((item) => (
				<li class="list_item">
					<h3 class="list_item_ttl">{item.ttl}</h3>
					{item.desc && <p class="list_item_desc">{item.desc}</p>}
				</li>
			))
		}
	</ul>
</section>
`;
}

/**
 * モーダルUI生成(開発環境のModal.ts連携)
 */
function generateModalUI(config: UIPatternConfig): string {
	const { data, components = [] } = config;
	const hasPicture = components.includes('Picture');

	return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ''}

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
	<h2 class="section_ttl">{data.ttl}</h2>
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
								${hasPicture ? '<Picture src={imgPath + item.thumbnail} alt={item.alt || item.ttl} sizes={[800, 450]} />' : '<img src={imgPath + item.thumbnail} alt={item.alt || item.ttl} loading="lazy" />'}
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
							<h3 class="modal_ttl">{item.ttl}</h3>
							{item.desc && <p class="modal_desc">{item.desc}</p>}
						</span>
					</button>
				</li>
			))
		}
	</ul>
</section>
`;
}
