interface SectionConfig {
  type: string;
  pageName: string;
  content: Record<string, any>;
  components: string[];
}

/**
 * セクションテンプレート生成
 */
export function generateSectionTemplate(config: SectionConfig): string {
  const { type, pageName, content, components } = config;

  // セクション種類に応じたテンプレート選択
  switch (type) {
    case "hero":
      return generateHeroSection(content, components);
    case "articles":
      return generateArticlesSection(content, components);
    case "categories":
      return generateCategoriesSection(content, components);
    case "qa":
      return generateQaSection(content, components);
    case "features":
      return generateFeaturesSection(content, components);
    case "tech":
      return generateTechSection(content, components);
    case "concept":
      return generateConceptSection(content, components);
    case "videos":
      return generateVideosSection(content, components);
    default:
      return generateCustomSection(type, content, components);
  }
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

function generateArticlesSection(
  content: Record<string, any>,
  components: string[]
): string {
  const hasPicture = components.includes("Picture");
  const hasSetTime = components.includes("SetTime");

  const imports = [];
  if (hasPicture) imports.push('import Picture from "@/components/Picture.astro";');
  if (hasSetTime) imports.push('import SetTime from "@/components/SetTime.astro";');

  return `---
${imports.join("\n")}

/**
 * 記事一覧セクションコンポーネント
 */
interface Props {
  articles: {
    ttl: string;
    items: {
      href: string;
      ttl: string;
      desc: string;
      date: string;
      category: string;
      img: string;
      imgAlt: string;
    }[];
  };
  imgPath: string;
}

const { articles, imgPath } = Astro.props;
---

<section class="articles_section">
  <h2 class="section_ttl" set:html={articles.ttl} />
  <ul class="article_list">
    {
      articles.items.map((article) => (
        <li class="article_item">
          <a href={article.href}>
            <article class="article_card">
              <div class="article_card_img">
                ${hasPicture ? '<Picture src={imgPath + article.img} alt={article.imgAlt} sizes={[800, 450]} lazy={false} />' : '<img src={imgPath + article.img} alt={article.imgAlt} loading="lazy" />'}
              </div>
              <div class="article_card_body">
                <div class="article_card_header">
                  <span class="article_card_category" set:html={article.category} />
                  ${hasSetTime ? "<SetTime time={article.date} />" : '<time class="article_card_date">{article.date}</time>'}
                </div>
                <h3 class="article_card_ttl" set:html={article.ttl} />
                <p class="article_card_desc" set:html={article.desc} />
              </div>
            </article>
          </a>
        </li>
      ))
    }
  </ul>
</section>
`;
}

function generateCategoriesSection(
  content: Record<string, any>,
  components: string[]
): string {
  return `---
/**
 * カテゴリーセクションコンポーネント
 * タブUIで実装（開発環境準拠）
 */
interface Props {
  categories: {
    ttl: string;
    items: {
      name: string;
      children: string[];
    }[];
  };
}

const { categories } = Astro.props;
---

<aside class="categories_section c_tab">
  <h2 class="section_ttl">{categories.ttl}</h2>
  <ul class="c_tab_list category_tab_list">
    {
      categories.items.map((category, i) => (
        <li>
          <button
            type="button"
            class={i === 0 ? "-open" : ""}
            aria-pressed={i === 0 ? "true" : "false"}
            tabindex={i === 0 ? "-1" : "0"}
          >
            {category.name}
          </button>
        </li>
      ))
    }
  </ul>
  {
    categories.items.map((category, i) => (
      <div
        class="c_tab_content category_tab_content"
        hidden={i !== 0}
        tabindex="-1"
      >
        <ul class="category_child_list">
          {category.children.map((child) => (
            <li class="category_child_item">{child}</li>
          ))}
        </ul>
      </div>
    ))
  }
</aside>
`;
}

function generateQaSection(
  content: Record<string, any>,
  components: string[]
): string {
  return `---
/**
 * Q&Aセクションコンポーネント
 */
interface Props {
  qa: {
    ttl: string;
    items: {
      q: string;
      a: string;
    }[];
  };
}

const { qa } = Astro.props;
---

<section class="qa_section">
  <h2 class="section_ttl" set:html={qa.ttl} />
  <dl class="qa_list">
    {
      qa.items.map((item, index) => (
        <>
          <dt class="qa_question">
            <span class="qa_label">Q</span>
            {item.q}
          </dt>
          <dd class="qa_answer">
            <span class="qa_label">A</span>
            {item.a}
          </dd>
        </>
      ))
    }
  </dl>
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

function generateVideosSection(
  content: Record<string, any>,
  components: string[]
): string {
  const hasPicture = components.includes("Picture");

  return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ""}

/**
 * 動画セクションコンポーネント
 */
interface Props {
  videos: {
    ttl: string;
    items: {
      ttl: string;
      desc: string;
      thumbnail: string;
      videoUrl: string;
    }[];
  };
  imgPath: string;
}

const { videos, imgPath } = Astro.props;
---

<section class="videos_section">
  <h2 class="section_ttl" set:html={videos.ttl} />
  <ul class="video_list">
    {
      videos.items.map((video) => (
        <li class="video_item">
          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
            <div class="video_item_thumbnail">
              ${hasPicture ? '<Picture src={imgPath + video.thumbnail} alt={video.ttl} sizes={[800, 450]} />' : '<img src={imgPath + video.thumbnail} alt={video.ttl} loading="lazy" />'}
            </div>
            <div class="video_item_body">
              <h3 class="video_item_ttl">{video.ttl}</h3>
              <p class="video_item_desc">{video.desc}</p>
            </div>
          </a>
        </li>
      ))
    }
  </ul>
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
