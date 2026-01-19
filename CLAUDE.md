# Astro Generator MCP - コード生成ガイドライン

このMCPを使用してコードを生成する際は、以下のルールに従ってください。

## リンク生成

- `target="_blank"` を使用する場合、`rel="noopener noreferrer"` は**不要**
- 2021年以降、すべてのモダンブラウザで `target="_blank"` に対して暗黙的に `noopener` の動作が適用される
- `noreferrer` はリファラー情報を隠す目的がある場合のみ使用

```astro
<!-- 正しい -->
<a href="https://example.com" target="_blank">外部リンク</a>

<!-- 不要 -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">外部リンク</a>
```

## テキスト出力

- テキストデータは `{data.ttl}` ではなく `set:html={data.ttl}` を使用
- HTMLタグ（`<br>`など）を含むテキストを正しくレンダリングするため

```astro
<!-- 正しい -->
<h2 class="section_ttl" set:html={data.ttl} />

<!-- 避ける -->
<h2 class="section_ttl">{data.ttl}</h2>
```

## 画像出力

- `<img>` タグではなく、カスタム `Picture` コンポーネントを使用

```astro
<!-- 正しい -->
import Picture from "@/components/Picture.astro";
<Picture src={imgPath + item.img} alt={item.ttl} />

<!-- 避ける -->
<img src={imgPath + item.img} alt={item.ttl} loading="lazy" />
```

## コンテンツ幅

- セクション単位で `.contentInner` でラップしてコンテンツ幅を制御

```astro
<section class="hero_section">
  <div class="contentInner">
    <!-- コンテンツ -->
  </div>
</section>
```
