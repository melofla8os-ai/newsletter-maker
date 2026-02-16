---
name: a4-print-layout-expert
description: A4 print layout specialist for designing pixel-perfect 210×297mm documents optimized for printing. Covers safe areas, page breaks, @media print CSS, ink-saving techniques, and layout patterns for newsletters, flyers, and reports. Use when creating print-ready documents or optimizing web content for physical printing.
version: 1.0.0
tags: a4, print, layout, css, media-print, page-break, safe-area, newsletter, printing
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# A4 Print Layout Expert

## When to Use

このスキルは以下の状況で使用してください：

- **A4サイズの印刷物**をブラウザで作成する（新聞・チラシ・報告書など）
- **Web to Print**（HTML/CSSから印刷物を生成）を実装する
- **PDF生成**の前段階としてレイアウトを最適化する
- **印刷プレビュー**と実際の印刷結果を一致させたい
- **ページ分割**を制御したい（見出しが途中で切れないようにする）
- **インク節約**を考慮したレイアウトを設計したい
- **複数ページ**の印刷物を作成する

## Core Concepts & Rules

### 📏 A4サイズの基本仕様

#### 物理サイズ

```
A4サイズ（ISO 216規格）:
- 幅: 210mm
- 高さ: 297mm
- アスペクト比: 1:√2 (≈ 1:1.414)
```

#### CSS での指定

```css
@page {
  size: A4 portrait; /* 縦向き */
  margin: 0; /* ブラウザのデフォルトマージンを削除 */
}

.a4-page {
  width: 210mm;
  height: 297mm;
  padding: 0;
  margin: 0 auto; /* 画面中央に配置 */
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* プレビュー用 */
}

/* 横向き */
@page {
  size: A4 landscape;
}

.a4-page.landscape {
  width: 297mm;
  height: 210mm;
}
```

### 🎯 Safe Area（安全領域）

プリンターには**物理的な印字不可能領域**があります。

```
標準的な Safe Area マージン:
- 上下左右: 最低 5mm
- 推奨: 10mm（余裕を持たせる）
- 重要な情報: 15mm 以上内側に配置
```

```css
.a4-page {
  width: 210mm;
  height: 297mm;

  /* Safe Area を確保 */
  padding: 10mm; /* 上下左右 10mm */
  box-sizing: border-box;
}

/* 重要な要素（タイトル・本文）はさらに内側に */
.a4-page .content {
  padding: 5mm; /* 合計 15mm のマージン */
}
```

### 📄 @media print の活用

印刷時のみ適用されるスタイルを定義します。

```css
/* 画面表示用 */
.a4-page {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  margin: 20px auto;
}

/* 印刷時のみ適用 */
@media print {
  /* ページサイズを厳密に指定 */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* 不要な要素を非表示 */
  .no-print,
  button,
  .controls,
  .toolbar {
    display: none !important;
  }

  /* 影を削除（インク節約） */
  .a4-page {
    box-shadow: none;
    margin: 0;
  }

  /* 背景色を削除（インク節約） */
  .a4-page {
    background-color: white !important;
  }

  /* リンクの色を変更 */
  a {
    color: black !important;
    text-decoration: underline;
  }

  /* ページ分割を制御 */
  h1, h2, h3 {
    page-break-after: avoid; /* 見出し直後で改ページしない */
  }

  img {
    page-break-inside: avoid; /* 画像の途中で改ページしない */
  }
}
```

### 🚫 ページ分割の制御

```css
/* ページ分割を禁止 */
.no-page-break {
  page-break-inside: avoid;
  break-inside: avoid; /* 新しいプロパティ */
}

/* ここで必ず改ページ */
.page-break-before {
  page-break-before: always;
  break-before: page;
}

.page-break-after {
  page-break-after: always;
  break-after: page;
}

/* セクション全体を1ページに収める */
.section {
  page-break-inside: avoid;
  min-height: 0; /* Safari対策 */
}
```

### 💡 インク節約テクニック

```css
/* 1. 背景色を削除 */
@media print {
  body, .a4-page {
    background-color: white !important;
    background-image: none !important;
  }
}

/* 2. 影・装飾を削除 */
@media print {
  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

/* 3. 色を薄く（グレースケール推奨） */
@media print {
  .decorative-element {
    filter: grayscale(100%);
  }

  /* カラーを薄いグレーに変換 */
  .background-accent {
    background-color: #f5f5f5 !important;
  }
}

/* 4. 不要な画像を非表示 */
@media print {
  .decorative-image,
  .banner-ad {
    display: none !important;
  }
}
```

## Code Patterns / Examples

### Pattern 1: 基本的なA4ページテンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>A4印刷テンプレート</title>
  <style>
    /* 画面表示用の共通スタイル */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
      background-color: #e0e0e0;
      padding: 20px;
    }

    /* A4ページコンテナ */
    .a4-page {
      width: 210mm;
      height: 297mm;
      padding: 15mm; /* Safe Area */
      margin: 0 auto 20px;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    }

    /* ヘッダー */
    .page-header {
      text-align: center;
      padding-bottom: 5mm;
      border-bottom: 2px solid #333;
      margin-bottom: 5mm;
    }

    .page-header h1 {
      font-size: 24pt;
      font-weight: bold;
      color: #333;
    }

    .page-header .date {
      font-size: 12pt;
      color: #666;
      margin-top: 2mm;
    }

    /* 本文エリア */
    .content {
      font-size: 12pt;
      line-height: 1.8;
      color: #333;
    }

    /* フッター */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 15mm;
      right: 15mm;
      text-align: center;
      font-size: 10pt;
      color: #999;
      padding-top: 3mm;
      border-top: 1px solid #ccc;
    }

    /* 印刷時の最適化 */
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        background-color: white;
        padding: 0;
      }

      .a4-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }

      /* 最後のページは改ページしない */
      .a4-page:last-child {
        page-break-after: auto;
      }

      /* 不要な要素を非表示 */
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- 印刷ボタン（画面表示のみ） -->
  <div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">
      印刷する
    </button>
  </div>

  <!-- A4ページ -->
  <div class="a4-page">
    <!-- ヘッダー -->
    <header class="page-header">
      <h1>サンプル新聞</h1>
      <p class="date">2026年2月16日 発行</p>
    </header>

    <!-- 本文 -->
    <main class="content">
      <p>ここに本文が入ります。A4サイズ（210mm × 297mm）に最適化されています。</p>
      <p>Safe Area（15mm）を確保しているため、印刷時に文字が切れる心配がありません。</p>
    </main>

    <!-- フッター -->
    <footer class="page-footer">
      <p>発行: サンプル施設 | ページ 1</p>
    </footer>
  </div>
</body>
</html>
```

### Pattern 2: 複数ページの印刷物

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>複数ページ印刷</title>
  <style>
    .a4-page {
      width: 210mm;
      height: 297mm;
      padding: 15mm;
      margin: 0 auto 20px;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }

      .a4-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always; /* 各ページ後に改ページ */
      }

      .a4-page:last-child {
        page-break-after: auto; /* 最後のページは改ページしない */
      }
    }

    /* ページ番号 */
    .page-number {
      position: absolute;
      bottom: 10mm;
      right: 15mm;
      font-size: 10pt;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- ページ1 -->
  <div class="a4-page">
    <h1>ページ1</h1>
    <p>最初のページの内容...</p>
    <div class="page-number">1 / 3</div>
  </div>

  <!-- ページ2 -->
  <div class="a4-page">
    <h1>ページ2</h1>
    <p>2ページ目の内容...</p>
    <div class="page-number">2 / 3</div>
  </div>

  <!-- ページ3 -->
  <div class="a4-page">
    <h1>ページ3</h1>
    <p>最後のページの内容...</p>
    <div class="page-number">3 / 3</div>
  </div>
</body>
</html>
```

### Pattern 3: グリッドレイアウト（Newsletter Maker風）

```css
/* A4ページ内の写真グリッド */
.a4-page {
  width: 210mm;
  height: 297mm;
  padding: 10mm;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ヘッダー（タイトル） */
.header {
  height: 25mm;
  margin-bottom: 5mm;
  text-align: center;
  flex-shrink: 0;
}

/* 写真グリッドエリア */
.photo-grid-area {
  flex: 1; /* 残りのスペースを全て使用 */
  min-height: 0; /* Flexbox収縮を許可 */
  margin-bottom: 5mm;
}

/* 5×4グリッド（20枚） */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 3mm;
  height: 100%;
}

.photo-slot {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  overflow: hidden;
  position: relative;
}

.photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* コメント欄 */
.comment-section {
  height: 30mm;
  border: 1px solid #ccc;
  padding: 3mm;
  font-size: 10pt;
  line-height: 1.6;
  flex-shrink: 0;
}

/* 印刷時 */
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  .a4-page {
    margin: 0;
    box-shadow: none;
  }

  .photo-slot {
    border-color: #999; /* 薄いボーダーでインク節約 */
  }
}
```

### Pattern 4: Safe Area のビジュアルガイド（開発用）

```html
<style>
  /* Safe Area のガイドライン（開発時のみ表示） */
  .safe-area-guide {
    position: absolute;
    pointer-events: none;
    z-index: 9999;
  }

  /* 危険エリア（赤） */
  .safe-area-guide .danger-zone {
    position: absolute;
    border: 2px dashed red;
  }

  .safe-area-guide .danger-zone.top {
    top: 0;
    left: 0;
    right: 0;
    height: 5mm;
  }

  .safe-area-guide .danger-zone.bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 5mm;
  }

  .safe-area-guide .danger-zone.left {
    top: 0;
    bottom: 0;
    left: 0;
    width: 5mm;
  }

  .safe-area-guide .danger-zone.right {
    top: 0;
    bottom: 0;
    right: 0;
    width: 5mm;
  }

  /* Safe Area（緑） */
  .safe-area-guide .safe-zone {
    position: absolute;
    top: 10mm;
    left: 10mm;
    right: 10mm;
    bottom: 10mm;
    border: 2px dashed green;
  }

  /* 印刷時は非表示 */
  @media print {
    .safe-area-guide {
      display: none !important;
    }
  }
</style>

<div class="a4-page">
  <!-- Safe Area ガイド（開発用） -->
  <div class="safe-area-guide">
    <div class="danger-zone top"></div>
    <div class="danger-zone bottom"></div>
    <div class="danger-zone left"></div>
    <div class="danger-zone right"></div>
    <div class="safe-zone"></div>
  </div>

  <!-- 実際のコンテンツ -->
  <div class="content">
    ...
  </div>
</div>
```

### Pattern 5: ページ分割制御の実例

```html
<style>
  /* セクションは必ず1ページに収める */
  .section {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 10mm;
  }

  /* 見出しと本文を分割しない */
  h2 {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* 画像を分割しない */
  .photo-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 強制改ページ */
  .new-page {
    page-break-before: always;
    break-before: page;
  }
</style>

<div class="a4-page">
  <!-- セクション1: 1ページに収まる -->
  <div class="section">
    <h2>活動報告1</h2>
    <p>本文...</p>
    <div class="photo-block">
      <img src="photo1.jpg" alt="写真1">
    </div>
  </div>

  <!-- セクション2: ここで改ページ -->
  <div class="section new-page">
    <h2>活動報告2</h2>
    <p>本文...</p>
  </div>
</div>
```

### Pattern 6: JavaScript でのページ分割計算

```javascript
/**
 * コンテンツをA4ページに自動分割
 */
class A4PageBreaker {
  constructor() {
    this.A4_HEIGHT_MM = 297;
    this.SAFE_AREA_MM = 15;
    this.CONTENT_HEIGHT_MM = this.A4_HEIGHT_MM - (this.SAFE_AREA_MM * 2);
  }

  /**
   * mm を px に変換（96dpi基準）
   */
  mmToPx(mm) {
    return (mm * 96) / 25.4;
  }

  /**
   * 要素の高さを取得（mm）
   */
  getElementHeightMm(element) {
    const heightPx = element.offsetHeight;
    return (heightPx * 25.4) / 96;
  }

  /**
   * コンテンツを自動ページ分割
   */
  breakIntoPages(contentElements) {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;

    contentElements.forEach((element) => {
      const elementHeight = this.getElementHeightMm(element);

      // 現在のページに収まるか？
      if (currentHeight + elementHeight <= this.CONTENT_HEIGHT_MM) {
        currentPage.push(element);
        currentHeight += elementHeight;
      } else {
        // 新しいページを作成
        if (currentPage.length > 0) {
          pages.push(currentPage);
        }
        currentPage = [element];
        currentHeight = elementHeight;
      }
    });

    // 最後のページを追加
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  /**
   * ページHTMLを生成
   */
  generatePages(pages) {
    const container = document.createElement('div');

    pages.forEach((pageElements, index) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'a4-page';

      pageElements.forEach((element) => {
        pageDiv.appendChild(element.cloneNode(true));
      });

      // ページ番号
      const pageNumber = document.createElement('div');
      pageNumber.className = 'page-number';
      pageNumber.textContent = `${index + 1} / ${pages.length}`;
      pageDiv.appendChild(pageNumber);

      container.appendChild(pageDiv);
    });

    return container;
  }
}

// 使用例
const breaker = new A4PageBreaker();
const contentElements = Array.from(document.querySelectorAll('.section'));
const pages = breaker.breakIntoPages(contentElements);
const pagesHTML = breaker.generatePages(pages);

document.getElementById('output').appendChild(pagesHTML);
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. px でサイズ指定する

```css
/* ❌ BAD: px は画面解像度に依存 */
.a4-page {
  width: 794px; /* 96dpi での 210mm だが、他の解像度では異なる */
  height: 1123px;
}

/* ✅ GOOD: mm で指定 */
.a4-page {
  width: 210mm;
  height: 297mm;
}
```

#### 2. Safe Area を考慮しない

```css
/* ❌ BAD: ページ端まで要素を配置 */
.a4-page {
  padding: 0; /* 切れる可能性大 */
}

/* ✅ GOOD: Safe Area を確保 */
.a4-page {
  padding: 10mm; /* 最低 5mm、推奨 10mm */
}
```

#### 3. @media print を使わない

```css
/* ❌ BAD: 画面表示と印刷で同じスタイル */
.a4-page {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 印刷時も影が出る */
}

/* ✅ GOOD: 印刷時は影を削除 */
@media print {
  .a4-page {
    box-shadow: none;
  }
}
```

#### 4. ページ分割を制御しない

```html
<!-- ❌ BAD: 見出しと本文が分断される -->
<h2>活動報告</h2>
<p>本文が次のページに...</p>

<!-- ✅ GOOD: セクションとして1つにまとめる -->
<div style="page-break-inside: avoid;">
  <h2>活動報告</h2>
  <p>本文...</p>
</div>
```

#### 5. 濃い背景色を使う

```css
/* ❌ BAD: インク大量消費 */
.header {
  background-color: #000000;
  color: white;
}

/* ✅ GOOD: 薄い色 or 枠線のみ */
.header {
  border-bottom: 2px solid #333;
  color: #333;
}
```

#### 6. フォントサイズを相対指定のみ

```css
/* ❌ BAD: 印刷時にサイズが変わる可能性 */
.content {
  font-size: 1rem; /* ブラウザ設定に依存 */
}

/* ✅ GOOD: pt で絶対指定 */
.content {
  font-size: 12pt; /* 印刷業界標準 */
}
```

## Integration with Other Skills

### 🎨 senior-friendly-ui-expert との連携

```css
/* 高齢者向け + 印刷最適化 */
.a4-page .content {
  /* 大きめのフォント（senior-friendly） */
  font-size: 14pt;
  line-height: 2.0;

  /* 高コントラスト（senior-friendly） */
  color: #000000;
  background-color: #ffffff;

  /* Safe Area（a4-print-layout） */
  padding: 15mm;
}
```

### 📊 color-palette-generator との連携

```javascript
// 印刷用にコントラスト比を検証
import { calculateContrastRatio } from './color-palette-generator.js';

function validatePrintColors(bgColor, textColor) {
  const ratio = calculateContrastRatio(bgColor, textColor);

  // 印刷物は AAA 基準（7:1）を推奨
  if (ratio < 7) {
    console.warn('印刷には不適切なコントラスト比:', ratio);
    return false;
  }

  return true;
}
```

### 🖼️ canvas-image-processing-expert との連携

```javascript
// 印刷用に画像を最適化
async function optimizeImageForPrint(file) {
  // A4サイズの1/5（グリッド用）を想定
  const targetWidth = (210 / 5) * 3.78; // mm → px (96dpi)
  const targetHeight = (297 / 4) * 3.78;

  // 高品質でリサイズ（印刷用は 0.95 推奨）
  const optimized = await resizeImage(file, targetWidth, targetHeight, 0.95);

  return optimized;
}
```

## Quick Reference

### 📐 A4サイズ早見表

| 単位 | 幅 | 高さ |
|------|-----|-----|
| mm | 210 | 297 |
| cm | 21.0 | 29.7 |
| inch | 8.27 | 11.69 |
| px (96dpi) | 794 | 1123 |
| px (150dpi) | 1240 | 1754 |
| px (300dpi) | 2480 | 3508 |

### 🎯 Safe Area マージン推奨値

| 用途 | マージン |
|------|---------|
| 最低限 | 5mm |
| 標準 | 10mm |
| 安全 | 15mm |
| 余裕あり | 20mm |

### 📄 フォントサイズ推奨値（印刷）

| 要素 | サイズ |
|------|--------|
| 見出し | 18pt 〜 24pt |
| 本文 | 10pt 〜 12pt |
| キャプション | 8pt 〜 10pt |
| 高齢者向け本文 | 14pt 〜 16pt |

## Resources

- **CSS Paged Media**: https://www.w3.org/TR/css-page-3/
- **@media print guide**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print
- **ISO 216 (A4 standard)**: https://en.wikipedia.org/wiki/ISO_216
- **Print CSS Best Practices**: https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (Print-Optimized Layouts)
