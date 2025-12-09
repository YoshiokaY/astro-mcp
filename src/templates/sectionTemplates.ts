import { generateUIPattern, type UIPattern } from './uiPatterns.js';

interface SectionConfig {
	type: string;
	uiPattern?: UIPattern; // 新規追加: UIパターン指定
	pageName: string;
	content: Record<string, any>;
	components: string[];
}

/**
 * セクションテンプレート生成
 */
export function generateSectionTemplate(config: SectionConfig): string {
	const { type, uiPattern, content, components } = config;

	// UIパターンが指定されている場合は汎用ジェネレーターを使用
	if (uiPattern) {
		return generateUIPattern({
			pattern: uiPattern,
			data: content,
			components,
			options: extractUIOptions(content),
		});
	}

	// 後方互換性: 従来の固定パターン
	switch (type) {
		case 'hero':
			return generateHeroSection(content, components);
		case 'articles':
			return generateUIPattern({
				pattern: 'grid',
				data: content,
				components,
				options: extractUIOptions(content),
			});
		case 'categories':
			return generateUIPattern({
				pattern: 'tab',
				data: content,
				components,
				options: extractUIOptions(content),
			});
		case 'qa':
			return generateUIPattern({
				pattern: 'accordion',
				data: content,
				components,
				options: extractUIOptions(content),
			});
		case 'modal':
		case 'gallery':
		case 'videos':
			return generateUIPattern({
				pattern: 'modal',
				data: content,
				components,
				options: extractUIOptions(content),
			});
		case 'features':
			return generateFeaturesSection(content, components);
		case 'tech':
			return generateTechSection(content, components);
		case 'concept':
			return generateConceptSection(content, components);
		default:
			return generateCustomSection(type, content, components);
	}
}

/**
 * コンテンツからUIオプションを抽出
 */
function extractUIOptions(content: any): any {
	return {
		columns: content.columns || 3,
		gap: content.gap || '2.4rem',
		autoplay: content.autoplay || false,
		openFirst: content.openFirst !== false,
		hasImage: content.hasImage !== false,
	};
}

function generateHeroSection(
	content: Record<string, any>,
	components: string[]
): string {
	return `---
/**
 * ヒーローセクションコンポーネント
 */
interface Props {
	hero: {
		ttl: string;
		subtitle?: string;
		desc?: string;
	};
}

const { hero } = Astro.props;
---

<section class="hero_section">
	<div class="hero_content">
		<h1 class="hero_ttl" set:html={hero.ttl} />
		{hero.subtitle && <p class="hero_subtitle" set:html={hero.subtitle} />}
		{hero.desc && <p class="hero_desc" set:html={hero.desc} />}
	</div>
</section>
`;
}

function generateFeaturesSection(
	content: Record<string, any>,
	components: string[]
): string {
	return `---
/**
 * 特徴セクションコンポーネント
 */
interface Props {
	features: {
		ttl: string;
		items: string[];
	};
}

const { features } = Astro.props;
---

<section class="features_section">
	<h2 class="section_ttl" set:html={features.ttl} />
	<ul class="feature_list">
		{features.items.map((item) => (
			<li class="feature_item" set:html={item} />
		))}
	</ul>
</section>
`;
}

function generateTechSection(
	content: Record<string, any>,
	components: string[]
): string {
	return `---
/**
 * 技術スタックセクションコンポーネント
 */
interface Props {
	tech: {
		ttl: string;
		desc?: string;
		items: {
			name: string;
			desc: string;
		}[];
	};
}

const { tech } = Astro.props;
---

<section class="tech_section">
	<h2 class="section_ttl" set:html={tech.ttl} />
	{tech.desc && <p class="section_desc" set:html={tech.desc} />}
	<ul class="tech_list">
		{
			tech.items.map((item) => (
				<li class="tech_item">
					<h3 class="tech_name">{item.name}</h3>
					<p class="tech_desc" set:html={item.desc} />
				</li>
			))
		}
	</ul>
</section>
`;
}

function generateConceptSection(
	content: Record<string, any>,
	components: string[]
): string {
	return `---
/**
 * コンセプトセクションコンポーネント
 */
interface Props {
	concept: {
		ttl: string;
		desc: string;
	};
}

const { concept } = Astro.props;
---

<section class="concept_section">
	<h2 class="section_ttl" set:html={concept.ttl} />
	<p class="section_desc" set:html={concept.desc} />
</section>
`;
}

function generateCustomSection(
	type: string,
	content: Record<string, any>,
	components: string[]
): string {
	return `---
/**
 * ${type} セクションコンポーネント
 */
interface Props {
	${type}: {
		ttl: string;
		items?: any[];
	};
}

const { ${type} } = Astro.props;
---

<section class="${type}_section">
	<h2 class="section_ttl" set:html={${type}.ttl} />
	{/* カスタムコンテンツをここに追加 */}
</section>
`;
}
