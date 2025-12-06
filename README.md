# Astro Generator MCP Server

データ駆動型Astroプロジェクトを自動生成するMCP（Model Context Protocol）サーバー

## 概要

このMCPサーバーは、デザインデータ、ワイヤーフレーム、コンテンツ資料から、Astroコンポーネント、セクション、ページテンプレートを自動生成します。

### 主な機能

- ✅ **コンポーネント生成**: Props定義から再利用可能なAstroコンポーネントを生成
- ✅ **セクション生成**: コンテンツデータから`_parts`配下のセクションを生成
- ✅ **ページ生成**: ページ構造全体を一括生成
- ✅ **スキーマ生成**: Excel/Markdown/JSONからTypeScript型定義を自動生成

## インストール

```bash
cd /Users/yoshioka.y/project/astro-generator-mcp
npm install
npm run build
```

## Claude Desktop設定

`~/Library/Application Support/Claude/claude_desktop_config.json` に以下を追加:

```json
{
  "mcpServers": {
    "astro-generator": {
      "command": "node",
      "args": ["/Users/yoshioka.y/project/astro-generator-mcp/dist/index.js"]
    }
  }
}
```

## 使い方

### 1. コンポーネント生成

**プロンプト例**:
```
ArticleCardコンポーネントを生成してください。

Props:
- ttl: タイトル（文字列）
- desc: 説明文（文字列）
- date: 投稿日（文字列）
- category: カテゴリ（文字列）
- img: 画像パス（文字列）
- imgAlt: 画像の代替テキスト（文字列）

デザイン:
- プライマリカラー: #0ea5e9
- レイアウト: grid
- フォントサイズ: 1.6rem
```

**実行されるMCPツール**:
```json
{
  "name": "generate-component",
  "arguments": {
    "componentName": "ArticleCard",
    "props": {
      "ttl": { "type": "string", "description": "タイトル" },
      "desc": { "type": "string", "description": "説明文" },
      "date": { "type": "string", "description": "投稿日" },
      "category": { "type": "string", "description": "カテゴリ" },
      "img": { "type": "string", "description": "画像パス" },
      "imgAlt": { "type": "string", "description": "画像の代替テキスト" }
    },
    "design": {
      "colors": { "primary": "#0ea5e9" },
      "layout": "grid",
      "typography": { "size": "1.6rem" }
    },
    "accessibility": true
  }
}
```

**出力**:
- `src/components/ArticleCard.astro`
- `src/scss/components/_c_article-card.scss`

---

### 2. セクション生成

**プロンプト例**:
```
sampleページ用のarticlesセクションを生成してください。

コンテンツ:
- タイトル: 最新記事
- 記事数: 4件
- 各記事にタイトル、説明文、投稿日、カテゴリ、画像が必要

使用コンポーネント:
- Picture
- SetTime
```

**実行されるMCPツール**:
```json
{
  "name": "generate-section",
  "arguments": {
    "sectionType": "articles",
    "pageName": "sample",
    "content": {
      "ttl": "最新記事",
      "items": []
    },
    "components": ["Picture", "SetTime"]
  }
}
```

**出力**:
- `src/pages/_parts/_sample/_articles.astro`

---

### 3. ページ全体生成

**プロンプト例**:
```
blogページを生成してください。

ページ情報:
- slug: blog
- タイトル: 技術ブログ
- 説明: Web開発に関する最新情報
- URL: /blog/

セクション構成:
1. hero（ヒーローセクション）
2. articles（記事一覧）
3. categories（カテゴリー）
4. qa（よくある質問）

パンくずリスト:
- ホーム > 技術ブログ
```

**実行されるMCPツール**:
```json
{
  "name": "generate-page",
  "arguments": {
    "pageName": "blog",
    "pageData": {
      "head": {
        "slug": "blog",
        "ttl": "技術ブログ",
        "description": "Web開発に関する最新情報",
        "url": "/blog/"
      },
      "breadcrumbs": [
        { "text": "ホーム", "link": "/" },
        { "text": "技術ブログ", "link": "/blog/" }
      ],
      "contents": {
        "hero": { "ttl": "Tech Blog", "subtitle": "最新の技術情報を発信" },
        "articles": { "ttl": "最新記事", "items": [] },
        "categories": { "ttl": "カテゴリー", "items": [] },
        "qa": { "ttl": "よくある質問", "items": [] }
      }
    },
    "sections": ["hero", "articles", "categories", "qa"]
  }
}
```

**出力**:
- `src/pages/blog/index.astro`

---

### 4. Excelからスキーマ生成

**プロンプト例**:
```
以下のExcelデータからPageData型を生成してください。

| セクション種類 | タイトル | 説明文 | 投稿日 | カテゴリ |
|--------------|---------|--------|--------|---------|
| articles | 記事1 | 説明1 | 2025-01-01 | フロントエンド |
| articles | 記事2 | 説明2 | 2025-01-02 | バックエンド |
```

**実行されるMCPツール**:
```json
{
  "name": "generate-schema",
  "arguments": {
    "sourceType": "excel",
    "sourceData": "/path/to/data.xlsx",
    "schemaName": "PageData"
  }
}
```

**出力**:
```typescript
export interface PageData {
  head: {
    slug: string;
    ttl: string;
    description: string;
    url: string;
  };
  contents: {
    articles: {
      ttl: string;
      items: {
        タイトル: string;
        説明文: string;
        投稿日: string;
        カテゴリ: string;
      }[];
    };
  };
}
```

---

## 実践ワークフロー例

### ケース1: デザインカンプからLP制作

```
1. デザインカンプのスクリーンショットをアップロード

「このデザインからヒーローセクションを生成してください」

2. MCPがセクションを生成

3. 「同じデザインで、特徴セクションも生成してください」

4. 「これらのセクションを組み合わせて、LPページ全体を生成してください」
```

---

### ケース2: Excelコンテンツ資料から自動生成

```
1. Excelファイルのパスを指定

「このExcelからブログページのデータ構造を生成してください」

2. スキーマ生成

3. 「生成されたスキーマに基づいて、ページ全体を生成してください」
```

---

## 開発

### ビルド

```bash
npm run build
```

### 開発モード（ウォッチ）

```bash
npm run dev
```

### MCP Inspector（デバッグ）

```bash
npm run inspector
```

---

## プロジェクト構造

```
astro-generator-mcp/
├── src/
│   ├── index.ts                    # MCPサーバーエントリーポイント
│   ├── tools/                      # MCPツール実装
│   │   ├── generateComponent.ts
│   │   ├── generateSection.ts
│   │   ├── generatePage.ts
│   │   └── generateSchema.ts
│   ├── generators/                 # コード生成ロジック
│   │   ├── astroGenerator.ts
│   │   ├── scssGenerator.ts
│   │   └── typeGenerator.ts
│   ├── templates/                  # テンプレート
│   │   ├── sectionTemplates.ts
│   │   └── pageTemplates.ts
│   ├── parsers/                    # データパーサー
│   │   ├── excelParser.ts
│   │   └── markdownParser.ts
│   └── utils/                      # ユーティリティ
│       └── formatter.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## サポートするセクションタイプ

- `hero`: ヒーローセクション
- `articles`: 記事一覧
- `categories`: カテゴリー一覧
- `qa`: Q&A/FAQ
- `features`: 特徴・機能紹介
- `tech`: 技術スタック
- `concept`: コンセプト説明
- `videos`: 動画コンテンツ
- `custom`: カスタムセクション

---

## ロードマップ

### Phase 1: プロトタイプ（完了）
- [x] 基本的なMCPサーバー構築
- [x] コンポーネント生成機能
- [x] セクション生成機能
- [x] ページ生成機能
- [x] スキーマ生成機能

### Phase 2: 拡張機能（次期）
- [ ] Figma API連携（デザイントークン自動抽出）
- [ ] 画像OCR対応（デザインカンプ解析）
- [ ] レスポンシブSCSS自動生成
- [ ] アクセシビリティチェック機能

### Phase 3: AI強化（将来）
- [ ] 自然言語からの直接生成
- [ ] デザインシステム学習機能
- [ ] コンポーネントライブラリ管理

---

## ライセンス

MIT

---

## 貢献

Issue、Pull Requestを歓迎します。

---

## お問い合わせ

プロジェクトに関する質問は、GitHubのIssueでお願いします。
