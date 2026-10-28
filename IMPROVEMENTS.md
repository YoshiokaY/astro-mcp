# astro-mcp 改善内容

## 概要

astro-devプロジェクトでの実際の使用経験から判明した課題を解決し、より適切なコード生成ができるよう改善しました。

## 解決した課題

### 1. ❌ タブ・アコーディオンのスクリプトが独自実装されていた

**問題点**:
- astro-devプロジェクトには`Tab.ts`、`Accordion.ts`などの既存スクリプトがあるにも関わらず、生成されたコードは独自の実装になっていた

**解決策**:
- `src/editors/appJsEditor.ts` を新規作成
- UIパターンから必要なスクリプトを自動判定し、`app.js`に自動登録する機能を実装
- セクション生成時に自動的に`app.js`を更新

**使用例**:
```typescript
// タブUIを生成すると、自動的にapp.jsに以下が追加される
import { Tab } from "./class/Tab.ts";

window.addEventListener("load", () => {
  new Tab();
});
```

### 2. ❌ hover/メディアクエリがmixin未使用

**問題点**:
- 生成されたSCSSで`@media`や`:hover`を直接記述しており、astro-devの`@include mq()`、`@include hover()`を使っていなかった

**解決策**:
- `src/templates/scssPatterns.ts` を新規作成
- UIパターンごとにastro-devのmixinを使用したSCSSテンプレートを実装
- `@include mq()`、`@include hover()`、`@include fontsize()`を適切に使用

**生成例**:
```scss
// ❌ 改善前
.grid_item {
  &:hover {
    transform: translateY(-0.4rem);
  }

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// ✅ 改善後
.grid_item {
  @include hover() {
    transform: translateY(-0.4rem);
  }

  @include mq() {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 3. ❌ .contentInnerが二重設定

**問題点**:
- ページテンプレート（index.astro）とセクションコンポーネント（_parts）の両方で`.contentInner`が記述され、コンテナ幅が二重に制約されていた

**解決策**:
- UIパターン生成時の`useContainer`オプションでコンテナ使用を制御可能に
- デフォルトは`true`（各セクションで`.contentInner`を使用）
- ページテンプレート側で一括管理したい場合は`useContainer: false`を指定

**設計方針**:
```typescript
// セクションごとにコンテナを持つ（デフォルト、推奨）
generateSection({
  uiPattern: 'grid',
  // useContainer: true がデフォルト
});

// ページテンプレート側で一括管理する場合
generateSection({
  uiPattern: 'grid',
  options: {
    useContainer: false
  }
});
```

**生成例**:
```astro
<!-- useContainer: true（デフォルト） -->
<section class="grid_section">
  <div class="contentInner">
    <h2>タイトル</h2>
    <!-- コンテンツ -->
  </div>
</section>

<!-- useContainer: false -->
<section class="grid_section">
  <h2>タイトル</h2>
  <!-- コンテンツ -->
</section>
```

### 4. ❌ スタイルがAstroファイルに直接記述

**問題点**:
- Astroファイル内の`<style>`タグに直接スタイルが記述されていた
- プロジェクト規約では`src/scss/pages/_pagename.scss`に分離すべき

**解決策**:
- `generateSection`ツールでSCSSファイルも同時生成
- デフォルトで`generateScss: true`でSCSS生成を有効化
- 生成されたSCSSは`src/scss/pages/_${pageName}.scss`に配置するよう案内

**使用例**:
```typescript
// SCSS生成あり（デフォルト）
generateSection({
  pageName: 'recruit',
  uiPattern: 'accordion',
  generateScss: true, // デフォルト
  scssOptions: {
    spacing: {
      sectionPadding: '8rem 0',
      itemGap: '2rem'
    }
  }
});

// 結果: Astroコンポーネント + SCSSファイルの両方が生成される
```

## 新機能

### SCSS生成機能

各UIパターンに対応したSCSSテンプレートを自動生成:

- **タブUI**: `.c_tab`クラスを使用、タブリストのカスタマイズ
- **アコーディオンUI**: `.c_pull`クラスを使用、アコーディオンアイテムのスタイリング
- **グリッドUI**: レスポンシブグリッドレイアウト
- **カルーセルUI**: Swiper.js連携スタイル
- **リストUI**: シンプルなリストレイアウト
- **モーダルUI**: `.c_modal_btn`クラスを使用、ギャラリー表示

すべてのテンプレートで以下を遵守:
- `@include mq()` でメディアクエリ
- `@include hover()` でホバー効果
- `@include fontsize(pc, sp)` でフォントサイズ
- SCSS変数（`$color-prime`、`$color-txt`、`$easing`等）を使用

### app.js自動更新機能

UIパターンに応じて必要なスクリプトを自動判定・登録:

| UIパターン | 必要なスクリプト |
|-----------|-----------------|
| tab | Tab.ts |
| accordion | Accordion.ts |
| modal | Modal.ts |
| carousel | （外部ライブラリSwiper等） |
| grid | （不要） |
| list | （不要） |

### コンテナ制御機能

`useContainer`オプションでコンテナ使用を柔軟に制御:
- セクションごとに独立したコンテナ（デフォルト、推奨）
- ページ全体で一括管理

## 使用方法

### セクション生成（改善版）

```typescript
// 基本的な使用方法
generateSection({
  pageName: 'recruit',
  uiPattern: 'accordion',
  content: {
    ttl: 'よくある質問',
    items: [
      { ttl: '質問1', content: '回答1' },
      { ttl: '質問2', content: '回答2' }
    ]
  },
  // 以下はオプション（指定しなければデフォルト値が使用される）
  generateScss: true, // SCSS生成（デフォルト: true）
  scssOptions: {
    spacing: {
      sectionPadding: '6rem 0',
      itemGap: '1.6rem'
    },
    columns: 3, // グリッドの場合
    hasImage: true // 画像表示有無
  },
  projectRoot: '/path/to/astro-dev' // デフォルト: process.cwd()
});

// 結果:
// 1. Astroコンポーネント生成
// 2. SCSSファイル生成
// 3. app.js更新（必要なスクリプトが追加される）
```

### プロンプトベースの使用

```typescript
// プロンプトから自動判定
generateSection({
  prompt: 'Q&Aをアコーディオンで実装',
  pageName: 'recruit',
  content: { /* データ */ }
});

// UIパターンとセクションタイプを自動抽出:
// - uiPattern: 'accordion'
// - sectionType: 'qa'
```

## プロジェクト構造

### 新規追加ファイル

```
src/
├── editors/
│   └── appJsEditor.ts       # app.js自動更新機能
├── templates/
│   └── scssPatterns.ts      # UIパターン別SCSSテンプレート
└── tools/
    └── generateSection.ts   # 改善版セクション生成ツール
```

### 既存ファイルの改善

- `src/templates/uiPatterns.ts`: `useContainer`オプション対応
- `src/tools/generateSection.ts`: SCSS生成・app.js更新機能統合

## 今後の推奨事項

### 1. .contentInnerの使用方針

**推奨**: セクションごとにコンテナを持つ（デフォルト設定）

理由:
- セクションの独立性が高い
- 将来的にフルワイド背景などの対応が容易
- 既存のastro-devプロジェクトのパターンと一致

```astro
<!-- 推奨パターン -->
<section class="hero_section">
  <div class="contentInner">
    <!-- コンテンツ -->
  </div>
</section>

<section class="features_section">
  <div class="contentInner">
    <!-- コンテンツ -->
  </div>
</section>
```

### 2. SCSSファイルの管理

- ページごとに`src/scss/pages/_pagename.scss`を作成
- 生成されたSCSSは既存ファイルに追記
- ページ固有のスタイルのみ記述（共通スタイルはcomponents/に）

### 3. スクリプトの初期化

- `app.js`でグローバルに初期化（推奨）
- ページ固有の動作が必要な場合のみ、Astroファイル内で`<script>`タグを使用

## テスト方法

### 1. タブUIの生成テスト

```bash
# recruitページでタブUIを生成
# 期待結果:
# - Astroコンポーネントに .c_tab クラス使用
# - app.js に Tab.ts が追加
# - SCSS に @include mq(), @include hover() 使用
```

### 2. アコーディオンUIの生成テスト

```bash
# Q&Aセクションをアコーディオンで生成
# 期待結果:
# - Astroコンポーネントに .c_pull クラス使用
# - app.js に Accordion.ts が追加
# - SCSS に適切なmixin使用
```

### 3. コンテナ二重設定のテスト

```bash
# useContainer: false でセクション生成
# 期待結果:
# - セクションコンポーネントに .contentInner がない
# - ページテンプレート側で一括管理
```

## まとめ

これらの改善により、astro-devプロジェクトの既存コードパターンに準拠した、より適切なコード生成が可能になりました:

✅ astro-devの既存スクリプト（Tab.ts、Accordion.ts）を使用
✅ astro-devのmixin（`@include mq()`、`@include hover()`）を使用
✅ コンテナ二重設定を防止する柔軟な制御
✅ スタイルをSCSSファイルに分離

これにより、生成されたコードは手動で書いたコードと同等の品質になります。
