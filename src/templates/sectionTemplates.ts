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
    case "modal":
    case "gallery":
    case "videos":
      return generateModalSection(content, components);
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
 * アコーディオンセクションコンポーネント
 * 汎用的なアコーディオンUI（開発環境準拠）
 * 用途: Q&A、FAQ、利用規約、製品仕様、沿革など
 */
interface Props {
  qa: {
    ttl: string;
    items: {
      ttl: string;
      content: string;
    }[];
  };
}

const { qa } = Astro.props;
---

<section class="qa_section">
  <h2 class="section_ttl">{qa.ttl}</h2>
  <div class="accordion_list">
    {
      qa.items.map((item, i) => (
        <details
          class={"c_pull accordion_item" + (i === 0 ? " -open" : "")}
          open={i === 0}
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

function generateModalSection(
  content: Record<string, any>,
  components: string[]
): string {
  const hasPicture = components.includes("Picture");

  return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ""}

/**
 * モーダルセクションコンポーネント（開発環境準拠）
 * 用途: 動画ギャラリー、画像ギャラリー、カスタムダイアログ
 *
 * @remarks
 * Modal.ts が自動判定:
 * - YouTube URL → iframe モーダル
 * - 画像パス → 画像モーダル
 * - aria-controls → カスタムダイアログ
 */
interface Props {
  modal: {
    ttl: string;
    items: {
      ttl: string;
      desc?: string;
      thumbnail?: string;
      src: string;
      alt?: string;
      type?: 'video' | 'image' | 'dialog';
      dialogId?: string;
    }[];
    /**
     * カスタムダイアログ要素（type='dialog' の場合）
     */
    dialogs?: {
      id: string;
      content: string;
    }[];
  };
  imgPath?: string;
}

const { modal, imgPath = '' } = Astro.props;
---

<section class="modal_section">
  <h2 class="section_ttl">{modal.ttl}</h2>
  <ul class="modal_list">
    {
      modal.items.map((item) => (
        <li class="modal_item">
          <button
            type="button"
            class="c_modal_btn modal_card"
            data-src={item.type !== 'dialog' ? item.src : undefined}
            data-alt={item.alt}
            aria-controls={item.type === 'dialog' ? item.dialogId : undefined}
          >
            {item.thumbnail && (
              <span class="modal_thumbnail">
                ${hasPicture ? '<Picture src={imgPath + item.thumbnail} alt={item.alt || item.ttl} sizes={[800, 450]} />' : '<img src={imgPath + item.thumbnail} alt={item.alt || item.ttl} loading="lazy" />'}
                {item.type === 'video' && (
                  <span class="modal_play_icon">
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 60 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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

  {
    modal.dialogs &&
      modal.dialogs.map((dialog) => (
        <dialog id={dialog.id} class="c_modal">
          <div class="c_modal_content" tabindex="-1">
            <div set:html={dialog.content} />
            <button class="c_modal_close">
              <span class="txtHidden">モーダルウィンドウを閉じる</span>
            </button>
          </div>
        </dialog>
      ))
  }
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
