# UIパターン分離リファクタリング計画

## 目的

セクション生成を「コンテンツ」と「UIパターン」に分離し、柔軟な組み合わせを可能にする。

---

## 現状の問題点

### 固定的な実装

```typescript
// セクション名 = UI実装が固定
case "categories": return generateCategoriesSection() // 常にタブUI
case "qa": return generateQaSection()                 // 常にアコーディオンUI
```

### 問題
- カテゴリをグリッド表示したい → 不可能
- 記事をカルーセル表示したい → 不可能
- Q&Aをリスト表示したい → 不可能

---

## 改善後の設計

### 1. UIパターンとコンテンツの分離

```typescript
interface SectionConfig {
  contentType: string;    // "categories", "articles", "qa" 等（データの種類）
  uiPattern: string;      // "tab", "grid", "accordion", "carousel", "list" 等（表示方法）
  content: Record<string, any>;
  components: string[];
}
```

### 2. 柔軟な組み合わせ

```typescript
// 同じコンテンツを異なるUIで表示
{ contentType: "categories", uiPattern: "tab" }        // タブUI
{ contentType: "categories", uiPattern: "grid" }       // グリッドUI
{ contentType: "articles", uiPattern: "grid" }         // カードグリッド
{ contentType: "articles", uiPattern: "carousel" }     // カルーセル
{ contentType: "qa", uiPattern: "accordion" }          // アコーディオン
{ contentType: "qa", uiPattern: "list" }               // シンプルリスト
```

---

## 実装タスク

### Phase 1: UIパターンジェネレーターの作成

#### 1.1 新ファイル作成: `src/templates/uiPatterns.ts`

```typescript
/**
 * UIパターン汎用ジェネレーター
 * コンテンツデータとUIパターンを受け取り、適切なマークアップを生成
 */

export type UIPattern =
  | 'tab'        // タブUI（開発環境のTab.ts連携）
  | 'accordion'  // アコーディオンUI（Accordion.ts連携）
  | 'grid'       // グリッドレイアウト
  | 'carousel'   // カルーセル
  | 'list'       // シンプルリスト
  | 'modal';     // モーダルギャラリー（Modal.ts連携）

export interface UIPatternConfig {
  pattern: UIPattern;
  data: {
    ttl: string;
    items: any[];
  };
  components?: string[];
  options?: {
    columns?: number;           // グリッドのカラム数
    gap?: string;               // アイテム間の余白
    autoplay?: boolean;         // カルーセルの自動再生
    openFirst?: boolean;        // アコーディオン初期表示
    hasImage?: boolean;         // 画像表示有無
    hasPicture?: boolean;       // Pictureコンポーネント使用有無
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
 * タブUI生成（開発環境のTab.ts連携）
 */
function generateTabUI(config: UIPatternConfig): string {
  const { data, components = [] } = config;

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
 * アコーディオンUI生成（開発環境のAccordion.ts連携）
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
          ${hasImage ? `
          {item.img && (
            <div class="grid_item_img">
              ${hasPicture ? '<Picture src={imgPath + item.img} alt={item.ttl} sizes={[400, 300]} />' : '<img src={imgPath + item.img} alt={item.ttl} loading="lazy" />'}
            </div>
          )}
          ` : ''}
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
 * モーダルUI生成（開発環境のModal.ts連携）
 */
function generateModalUI(config: UIPatternConfig): string {
  const { data, components = [] } = config;
  const hasPicture = components.includes('Picture');

  return `---
${hasPicture ? 'import Picture from "@/components/Picture.astro";' : ''}

/**
 * モーダルギャラリーセクション
 * Modal.ts と連携（動画/画像/カスタムdialog対応）
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
```

#### 1.2 sectionTemplates.ts のリファクタリング

```typescript
import { generateUIPattern, type UIPattern } from './uiPatterns.js';

interface SectionConfig {
  contentType: string;
  uiPattern?: UIPattern;  // 新規追加
  pageName: string;
  content: Record<string, any>;
  components: string[];
}

export function generateSectionTemplate(config: SectionConfig): string {
  const { contentType, uiPattern, content, components } = config;

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
  switch (contentType) {
    case "hero":
      return generateHeroSection(content, components);
    case "articles":
      return generateUIPattern({ pattern: 'grid', data: content, components });
    case "categories":
      return generateUIPattern({ pattern: 'tab', data: content, components });
    case "qa":
      return generateUIPattern({ pattern: 'accordion', data: content, components });
    case "modal":
    case "gallery":
    case "videos":
      return generateUIPattern({ pattern: 'modal', data: content, components });
    default:
      return generateCustomSection(contentType, content, components);
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
```

---

### Phase 2: プロンプト解析機能の追加

#### 2.1 新ファイル作成: `src/utils/promptParser.ts`

```typescript
/**
 * プロンプト解析ユーティリティ
 * 自然言語からUIパターンとコンテンツタイプを抽出
 */

import type { UIPattern } from '../templates/uiPatterns.js';

export interface ParsedSectionIntent {
  contentType: string;
  uiPattern: UIPattern;
  confidence: number;  // 0-1の信頼度
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
    'タブ': 'tab',
    'tab': 'tab',
    'アコーディオン': 'accordion',
    'accordion': 'accordion',
    'グリッド': 'grid',
    'grid': 'grid',
    'カード': 'grid',
    'card': 'grid',
    'カルーセル': 'carousel',
    'carousel': 'carousel',
    'スライダー': 'carousel',
    'slider': 'carousel',
    'リスト': 'list',
    'list': 'list',
    'モーダル': 'modal',
    'modal': 'modal',
    'ギャラリー': 'modal',
    'gallery': 'modal',
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
    '記事': 'articles',
    'article': 'articles',
    'ブログ': 'articles',
    'blog': 'articles',
    'カテゴリ': 'categories',
    'category': 'categories',
    'カテゴリー': 'categories',
    'categories': 'categories',
    'q&a': 'qa',
    'qa': 'qa',
    '質問': 'qa',
    'faq': 'qa',
    '機能': 'features',
    'feature': 'features',
    '技術': 'tech',
    'tech': 'tech',
    'technology': 'tech',
    '動画': 'videos',
    'video': 'videos',
    '画像': 'gallery',
    'image': 'gallery',
    'ギャラリー': 'gallery',
    'gallery': 'gallery',
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

  // コンテンツタイプのキーワードがあれば +0.2
  if (contentType !== 'custom') confidence += 0.2;

  return Math.min(confidence, 1.0);
}

/**
 * プロンプト例と期待される結果のテスト用サンプル
 */
export const PROMPT_EXAMPLES = {
  '記事一覧をカード形式で表示': {
    contentType: 'articles',
    uiPattern: 'grid',
    confidence: 0.8,
  },
  'カテゴリをタブで表示': {
    contentType: 'categories',
    uiPattern: 'tab',
    confidence: 1.0,
  },
  'Q&Aをアコーディオン形式で': {
    contentType: 'qa',
    uiPattern: 'accordion',
    confidence: 1.0,
  },
  '技術スタックをグリッドで': {
    contentType: 'tech',
    uiPattern: 'grid',
    confidence: 1.0,
  },
  '動画ギャラリーをモーダルで': {
    contentType: 'videos',
    uiPattern: 'modal',
    confidence: 1.0,
  },
  '記事をカルーセルで表示': {
    contentType: 'articles',
    uiPattern: 'carousel',
    confidence: 1.0,
  },
};
```

---

### Phase 3: MCPツールへの統合

#### 3.1 index.ts の更新

```typescript
// generate-section ツールのスキーマ更新
{
  name: "generate-section",
  description:
    "ページセクションを生成します。コンテンツタイプとUIパターンを指定、またはプロンプトから自動判定します。",
  inputSchema: {
    type: "object",
    properties: {
      // 新規: プロンプトベースの生成
      prompt: {
        type: "string",
        description: "セクション生成の意図を記述（例: 記事一覧をカード形式で表示）",
      },
      // 従来: 構造化データによる生成
      contentType: {
        type: "string",
        description: "コンテンツタイプ（articles, categories, qa等）",
      },
      uiPattern: {
        type: "string",
        description: "UIパターン（tab, accordion, grid, carousel, list, modal）",
        enum: ["tab", "accordion", "grid", "carousel", "list", "modal"],
      },
      pageName: {
        type: "string",
        description: "所属するページ名",
      },
      content: {
        type: "object",
        description: "セクションのコンテンツデータ",
      },
      components: {
        type: "array",
        description: "使用する子コンポーネント名のリスト",
        items: { type: "string" },
      },
    },
    // prompt OR (contentType + content) が必要
    oneOf: [
      { required: ["prompt", "pageName"] },
      { required: ["contentType", "pageName", "content"] },
    ],
  },
}
```

#### 3.2 generateSection.ts の更新

```typescript
import { generateSectionTemplate } from "../templates/sectionTemplates.js";
import { parseSectionIntent } from "../utils/promptParser.js";

interface SectionArgs {
  // プロンプトベース
  prompt?: string;
  // 構造化データベース
  contentType?: string;
  uiPattern?: string;
  pageName: string;
  content?: Record<string, any>;
  components?: string[];
}

export async function generateSection(args: any) {
  const {
    prompt,
    contentType,
    uiPattern,
    pageName,
    content,
    components = [],
  } = args as SectionArgs;

  try {
    let finalContentType: string;
    let finalUIPattern: string | undefined;

    // プロンプトが指定されている場合は解析
    if (prompt) {
      const parsed = parseSectionIntent(prompt);
      finalContentType = parsed.contentType;
      finalUIPattern = parsed.uiPattern;

      // 低信頼度の場合は警告
      if (parsed.confidence < 0.7) {
        console.warn(
          `⚠️ プロンプト解析の信頼度が低い（${parsed.confidence}）: "${prompt}"`
        );
      }
    } else {
      // 構造化データが指定されている場合
      finalContentType = contentType!;
      finalUIPattern = uiPattern;
    }

    // セクション生成
    const sectionCode = generateSectionTemplate({
      contentType: finalContentType,
      uiPattern: finalUIPattern as any,
      pageName,
      content: content || {},
      components,
    });

    const formatted = await formatCode(sectionCode, "astro");

    return {
      content: [
        {
          type: "text",
          text: `✅ セクション「${finalContentType}」（UI: ${finalUIPattern || 'デフォルト'}）を生成しました\n\n\`\`\`astro\n${formatted}\n\`\`\``,
        },
      ],
    };
  } catch (error) {
    throw new Error(`セクション生成エラー: ${error}`);
  }
}
```

---

## 実装スケジュール（明日以降）

### Day 1: UIパターンジェネレーター実装
- [ ] `src/templates/uiPatterns.ts` 作成
- [ ] 6つのUIパターン関数実装（tab, accordion, grid, carousel, list, modal）
- [ ] ビルド&テスト

### Day 2: sectionTemplates.ts リファクタリング
- [ ] 既存関数をUIパターンベースに移行
- [ ] 後方互換性の確保
- [ ] ビルド&テスト

### Day 3: プロンプト解析機能実装
- [ ] `src/utils/promptParser.ts` 作成
- [ ] キーワード検出ロジック実装
- [ ] テストケース追加

### Day 4: MCPツール統合
- [ ] `generateSection.ts` 更新
- [ ] `index.ts` スキーマ更新
- [ ] ビルド&テスト

### Day 5: 統合テスト&ドキュメント
- [ ] 実際のプロンプトでテスト
- [ ] README更新
- [ ] コミット&プッシュ

---

## 使用例（実装後）

### プロンプトベース

```javascript
// MCPツール呼び出し
{
  "name": "generate-section",
  "arguments": {
    "prompt": "記事一覧をカード形式で表示",
    "pageName": "blog"
  }
}
// → contentType: "articles", uiPattern: "grid" を自動判定
```

### 構造化データベース（従来通り）

```javascript
{
  "name": "generate-section",
  "arguments": {
    "contentType": "articles",
    "uiPattern": "carousel",  // 明示的に指定
    "pageName": "blog",
    "content": { /* ... */ }
  }
}
```

---

## 期待される効果

### ✅ 柔軟性の向上
- 同じコンテンツを異なるUIで表示可能
- プロジェクトの要件に応じて最適なUIを選択

### ✅ 開発効率の向上
- 自然言語プロンプトから自動生成
- 構造化データを細かく指定する必要がない

### ✅ 保守性の向上
- UIロジックが一箇所に集約
- 新しいUIパターン追加が容易

### ✅ 再利用性の向上
- 汎用的なUIコンポーネント
- 他のプロジェクトでも活用可能

---

## 注意事項

### 後方互換性
- 既存の固定パターン（`case "categories":`等）は維持
- `uiPattern`が未指定の場合はデフォルト動作

### プロンプト解析の限界
- 複雑な要件は構造化データで指定推奨
- 信頼度が低い場合は警告表示

### パフォーマンス
- プロンプト解析は単純な文字列マッチング
- 大規模な自然言語処理は行わない
