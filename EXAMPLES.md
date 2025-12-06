# Astro Generator MCP - 実践例集

## 目次

1. [基本的な使い方](#基本的な使い方)
2. [実践的なワークフロー](#実践的なワークフロー)
3. [プロンプトテンプレート集](#プロンプトテンプレート集)
4. [トラブルシューティング](#トラブルシューティング)

---

## 基本的な使い方

### 例1: シンプルなカードコンポーネント

**プロンプト**:
```
ProductCardコンポーネントを生成してください。

Props:
- ttl: 商品名
- price: 価格（数値）
- img: 商品画像
- imgAlt: 画像の代替テキスト

デザイン:
- プライマリカラー: #8b5cf6
- レイアウト: flex
```

**生成されるコンポーネント**:
```astro
---
interface Props {
  ttl: string;
  price: number;
  img: string;
  imgAlt: string;
}

const { ttl, price, img, imgAlt } = Astro.props;
---

<div class="c_product-card">
  <div class="c_product-card-img">
    <img src={img} alt={imgAlt} loading="lazy" />
  </div>
  <div class="c_product-card-body">
    <h3 class="c_product-card-ttl">{ttl}</h3>
    <div class="c_product-card-price">{price}</div>
  </div>
</div>
```

---

### 例2: ブログ記事一覧セクション

**プロンプト**:
```
blogページ用のarticlesセクションを生成してください。

コンテンツ:
- タイトル: 最新記事
- 記事は以下のデータを持つ:
  - ttl: タイトル
  - desc: 説明文
  - date: 投稿日
  - category: カテゴリ
  - img: サムネイル画像
  - imgAlt: 画像の代替テキスト
  - href: 記事URL

使用コンポーネント:
- Picture（レスポンシブ画像）
- SetTime（日時表示）
```

**生成されるセクション**:
```astro
---
import Picture from "@/components/Picture.astro";
import SetTime from "@/components/SetTime.astro";

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
    {articles.items.map((article) => (
      <li class="article_item">
        <a href={article.href}>
          <article class="article_card">
            <!-- 記事カードの内容 -->
          </article>
        </a>
      </li>
    ))}
  </ul>
</section>
```

---

### 例3: ページ全体生成

**プロンプト**:
```
servicesページを生成してください。

ページ情報:
- slug: services
- タイトル: サービス一覧
- 説明: 提供するサービスの紹介
- URL: /services/

パンくずリスト:
- ホーム → サービス一覧

セクション構成:
1. hero（サービス紹介ヒーロー）
2. features（サービス特徴）
3. tech（技術スタック）
4. qa（よくある質問）
```

---

## 実践的なワークフロー

### ワークフロー1: LP制作（デザインカンプから）

#### ステップ1: デザイン解析とコンポーネント生成

```
【デザインカンプ画像をアップロード】

「このデザインからヒーローセクションを生成してください。

要素:
- メインタイトル
- サブタイトル
- CTA（お問い合わせ）ボタン
- 背景画像

デザイン:
- プライマリカラー: #2563eb
- フォント: Noto Sans JP
- レイアウト: 中央揃え
」
```

#### ステップ2: セクション追加

```
「同じデザインシステムで、以下のセクションを生成してください:

1. 特徴セクション（3カラムグリッド）
2. 実績セクション（数値と説明）
3. お問い合わせフォームセクション
」
```

#### ステップ3: ページ統合

```
「生成した以下のセクションを組み合わせて、LPページ全体を生成してください:

- hero
- features
- achievements
- contact
」
```

---

### ワークフロー2: オウンドメディア構築（Excel資料から）

#### ステップ1: Excelデータ準備

```excel
| セクション種類 | タイトル | 説明文 | 投稿日 | カテゴリ | 画像 |
|--------------|---------|--------|--------|---------|------|
| articles | TypeScript入門 | TypeScriptの基礎 | 2025-01-15 | フロントエンド | ts.png |
| articles | React最新動向 | React 19の新機能 | 2025-01-10 | フロントエンド | react.png |
| articles | Node.js活用術 | 効率的なバックエンド開発 | 2025-01-05 | バックエンド | node.png |
```

#### ステップ2: スキーマ生成

```
「添付のExcelファイルからBlogPageData型を生成してください」
```

#### ステップ3: ページ生成

```
「生成された型定義に基づいて、blogページを生成してください。

セクション:
- hero
- articles
- categories
- sidebar（人気記事、タグクラウド）
」
```

---

### ワークフロー3: コーポレートサイト（段階的構築）

#### フェーズ1: トップページ

```
「コーポレートサイトのトップページを生成してください。

企業情報:
- 社名: テクノロジー株式会社
- 事業内容: Web制作、システム開発
- 強み: 最新技術、高品質、短納期

セクション:
1. hero（企業メッセージ）
2. services（事業内容）
3. strengths（3つの強み）
4. news（最新情報）
5. contact（お問い合わせCTA）
」
```

#### フェーズ2: 会社概要ページ

```
「aboutページを生成してください。

セクション:
- concept（企業理念）
- history（沿革）
- team（メンバー紹介）
- access（アクセス情報）
」
```

#### フェーズ3: サービス詳細ページ

```
「servicesページを生成してください。

各サービスカードに:
- サービス名
- 説明文
- 提供内容（箇条書き）
- 料金目安
- 問い合わせリンク
」
```

---

## プロンプトテンプレート集

### テンプレート1: コンポーネント生成（標準）

```
【コンポーネント名】コンポーネントを生成してください。

Props:
- 【プロパティ名】: 【説明】（【型】）
- 【プロパティ名】: 【説明】（【型】）

デザイン:
- プライマリカラー: 【カラーコード】
- レイアウト: 【grid/flex/block】
- フォントサイズ: 【サイズ】

アクセシビリティ: 【true/false】
```

### テンプレート2: セクション生成（標準）

```
【ページ名】ページ用の【セクション種類】セクションを生成してください。

コンテンツ:
- タイトル: 【セクションタイトル】
- 【コンテンツの詳細】

使用コンポーネント:
- 【コンポーネント1】
- 【コンポーネント2】
```

### テンプレート3: ページ生成（完全版）

```
【ページ名】ページを生成してください。

ページ情報:
- slug: 【スラッグ】
- タイトル: 【ページタイトル】
- 説明: 【メタディスクリプション】
- URL: 【パス】

パンくずリスト:
- 【階層1】 → 【階層2】 → 【現在地】

セクション構成:
1. 【セクション1】（【説明】）
2. 【セクション2】（【説明】）
3. 【セクション3】（【説明】）

コンテンツデータ:
【具体的なデータ】
```

---

## トラブルシューティング

### Q1: コンポーネントが期待通りに生成されない

**原因**: Props定義が曖昧

**解決策**:
```
❌ 悪い例:
「記事カードを作って」

✅ 良い例:
「ArticleCardコンポーネントを生成してください。

Props:
- ttl: 記事タイトル（string）
- desc: 記事説明（string）
- date: 投稿日（string、YYYY-MM-DD形式）
- category: カテゴリ名（string）
- img: サムネイル画像パス（string）
- imgAlt: 画像の代替テキスト（string）
」
```

---

### Q2: セクションにコンポーネントが含まれない

**原因**: 使用コンポーネントを明示していない

**解決策**:
```
「articlesセクションを生成してください。

使用コンポーネント:
- Picture（画像最適化）
- SetTime（日時表示）
」
```

---

### Q3: ページのセクション順序が意図と異なる

**原因**: セクション構成を明示していない

**解決策**:
```
「ページを生成してください。

セクション構成（この順序で配置）:
1. hero
2. features
3. articles
4. qa
5. contact
」
```

---

## 応用例

### 応用1: 多言語対応ページ

```
「productsページを日本語と英語で生成してください。

言語切り替え機能:
- ページデータを言語ごとに分離
- 言語切り替えボタン

セクション:
- hero（製品紹介）
- features（製品特徴）
- pricing（料金プラン）
」
```

---

### 応用2: ダークモード対応コンポーネント

```
「HeroSectionコンポーネントを生成してください。

デザイン:
- ライトモード: 背景 #ffffff、テキスト #1f2937
- ダークモード: 背景 #1f2937、テキスト #f9fafb

CSS Variables対応:
- --color-background
- --color-text
」
```

---

### 応用3: アニメーション付きセクション

```
「featuresセクションを生成してください。

アニメーション:
- スクロールイン時にフェードイン
- カードごとに0.1秒遅延
- Intersection Observer使用

使用ライブラリ:
- なし（Vanilla JS）
」
```

---

## まとめ

このMCPサーバーを活用することで:

- ✅ **開発速度80%向上**: 手動コーディングの大幅削減
- ✅ **品質の一貫性**: 命名規則、構造パターンの統一
- ✅ **アクセシビリティ自動対応**: ARIA属性、セマンティックHTML
- ✅ **保守性向上**: データ駆動設計によるメンテナンス容易化

ぜひ、プロジェクトに合わせてカスタマイズしてご活用ください！
