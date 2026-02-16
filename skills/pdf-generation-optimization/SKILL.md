---
name: pdf-generation-optimization
description: PDF generation optimization specialist for html2canvas + jsPDF. Covers memory-efficient PDF creation, multi-page generation, image compression, quality optimization, and file size reduction. Use when generating PDFs from HTML content, especially for print-ready documents with multiple images.
version: 1.0.0
tags: pdf, jspdf, html2canvas, optimization, compression, multi-page, print, file-size
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# PDF Generation Optimization Expert

## When to Use

このスキルは以下の状況で使用してください：

- **html2canvas + jsPDF** で PDF を生成している
- **PDF ファイルサイズ**が大きすぎる（10MB 以上）
- **複数ページ PDF** を生成したい
- **印刷品質**と**ファイルサイズ**のバランスを取りたい
- **メモリ不足エラー**（Out of Memory）を回避したい
- **生成速度**を改善したい
- **フォント埋め込み問題**を解決したい

## Core Concepts & Rules

### 📊 PDF 生成の基本原則

#### 1. 品質とサイズのトレードオフ

```
PDF サイズの決定要因:
1. 画像解像度（scale パラメータ）
2. JPEG 圧縮率（quality パラメータ）
3. ページ数
4. フォント埋め込み
```

**推奨設定**:

| 用途 | scale | quality | 想定サイズ（A4 1ページ） |
|------|-------|---------|----------------------|
| 画面表示用 | 1 | 0.7 | 200KB 〜 500KB |
| 一般印刷 | 2 | 0.85 | 1MB 〜 2MB |
| 高品質印刷 | 3 | 0.92 | 3MB 〜 5MB |
| プロ印刷 | 4 | 0.95 | 8MB 〜 12MB |

#### 2. メモリ管理

```javascript
// ❌ BAD: Canvas を破棄せずに次のページへ
for (let i = 0; i < 10; i++) {
  const canvas = await html2canvas(element);
  // メモリリーク
}

// ✅ GOOD: Canvas を明示的に破棄
for (let i = 0; i < 10; i++) {
  const canvas = await html2canvas(element);
  pdf.addImage(canvas.toDataURL(), 'JPEG', 0, 0, 210, 297);

  // Canvas を破棄
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}
```

#### 3. 画像圧縮戦略

```javascript
// 段階的な圧縮
const strategies = [
  { scale: 2, quality: 0.92 }, // まず試す（高品質）
  { scale: 2, quality: 0.85 }, // サイズ削減
  { scale: 1.5, quality: 0.85 }, // さらに削減
  { scale: 1, quality: 0.8 }  // 最終手段
];

for (let strategy of strategies) {
  const canvas = await html2canvas(element, { scale: strategy.scale });
  const dataURL = canvas.toDataURL('image/jpeg', strategy.quality);
  const sizeMB = (dataURL.length * 3 / 4) / 1024 / 1024;

  if (sizeMB < 2) {
    // 目標サイズ（2MB）以下なら採用
    break;
  }
}
```

### 🎯 html2canvas の最適化設定

```javascript
const canvas = await html2canvas(element, {
  // 解像度（1 = 96dpi, 2 = 192dpi, 3 = 288dpi）
  scale: 2,

  // CORS 対応
  useCORS: true,
  allowTaint: false,

  // 背景色
  backgroundColor: '#ffffff',

  // ログ出力（本番では false）
  logging: false,

  // 画像タイムアウト（0 = 無制限）
  imageTimeout: 0,

  // レンダリング後にコンテナを削除
  removeContainer: true,

  // ウィンドウサイズ（スクロール問題の回避）
  windowWidth: element.scrollWidth,
  windowHeight: element.scrollHeight,

  // フォントレンダリング改善
  letterRendering: true,

  // 外部 CSS を無視（インラインのみ使用）
  ignoreElements: (element) => {
    // 特定要素をスキップ
    return element.classList.contains('no-pdf');
  }
});
```

### 📄 jsPDF の最適化設定

```javascript
const pdf = new jsPDF({
  // ページサイズ
  format: 'a4',
  unit: 'mm',

  // 向き
  orientation: 'portrait', // or 'landscape'

  // 圧縮（ファイルサイズ削減）
  compress: true,

  // PDFバージョン
  putOnlyUsedFonts: true,
  floatPrecision: 16 // 座標の精度
});

// 画像追加時のオプション
pdf.addImage(
  imageData,
  'JPEG', // フォーマット
  0, 0, // x, y 座標
  210, 297, // 幅, 高さ
  undefined, // エイリアス（省略可）
  'FAST' // 圧縮モード: 'NONE', 'FAST', 'MEDIUM', 'SLOW'
);
```

## Code Patterns / Examples

### Pattern 1: 基本的な PDF 生成（1ページ）

```javascript
/**
 * シンプルな PDF 生成
 */
async function generateSimplePDF(elementId, fileName = 'document.pdf') {
  const element = document.getElementById(elementId);

  // 1. html2canvas で Canvas 化
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  // 2. Canvas から JPEG 取得（品質 0.85）
  const imgData = canvas.toDataURL('image/jpeg', 0.85);

  // 3. PDF 作成
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // 4. 画像を追加（A4サイズに合わせる）
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  // 5. 保存
  pdf.save(fileName);

  // 6. Canvas を破棄（メモリ解放）
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}

// 使用例
document.getElementById('generate-pdf').addEventListener('click', async () => {
  await generateSimplePDF('preview-area', 'newsletter.pdf');
});
```

### Pattern 2: ファイルサイズ最適化（自動調整）

```javascript
/**
 * 目標サイズ以下になるまで品質を調整
 */
async function generateOptimizedPDF(element, targetSizeMB = 3) {
  const strategies = [
    { scale: 3, quality: 0.95 }, // 最高品質
    { scale: 2, quality: 0.92 }, // 高品質
    { scale: 2, quality: 0.85 }, // バランス型
    { scale: 2, quality: 0.75 }, // 軽量
    { scale: 1.5, quality: 0.75 }, // さらに軽量
    { scale: 1, quality: 0.7 }  // 最軽量
  ];

  for (let i = 0; i < strategies.length; i++) {
    const { scale, quality } = strategies[i];

    console.log(`試行 ${i + 1}: scale=${scale}, quality=${quality}`);

    // Canvas 生成
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // JPEG 変換
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // サイズ計算（Base64 → バイト数）
    const sizeMB = (imgData.length * 3 / 4) / 1024 / 1024;

    console.log(`  → サイズ: ${sizeMB.toFixed(2)}MB`);

    // Canvas 破棄
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;

    // 目標サイズ以下なら採用
    if (sizeMB <= targetSizeMB) {
      console.log(`✅ 目標サイズ達成: ${sizeMB.toFixed(2)}MB`);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save('newsletter.pdf');

      return {
        success: true,
        scale,
        quality,
        sizeMB: sizeMB.toFixed(2)
      };
    }
  }

  // 全ての戦略で失敗
  console.error('❌ 目標サイズを達成できませんでした');
  return { success: false };
}

// 使用例
const result = await generateOptimizedPDF(
  document.getElementById('preview-area'),
  3 // 3MB以下
);

if (result.success) {
  alert(`PDF生成成功！サイズ: ${result.sizeMB}MB`);
} else {
  alert('サイズ削減に失敗しました');
}
```

### Pattern 3: 複数ページ PDF

```javascript
/**
 * 複数のページを1つのPDFにまとめる
 */
async function generateMultiPagePDF(pageElements, fileName = 'document.pdf') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < pageElements.length; i++) {
    const element = pageElements[i];

    console.log(`ページ ${i + 1} / ${pageElements.length} を処理中...`);

    // Canvas 化
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // JPEG 変換
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    // 2ページ目以降は新しいページを追加
    if (i > 0) {
      pdf.addPage();
    }

    // 画像を追加
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    // Canvas 破棄（メモリリーク防止）
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;

    // ガベージコレクションを促す
    if (i % 3 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 保存
  pdf.save(fileName);

  console.log(`✅ ${pageElements.length}ページのPDFを生成しました`);
}

// 使用例
const pages = document.querySelectorAll('.a4-page');
await generateMultiPagePDF(Array.from(pages), 'newsletter-all.pdf');
```

### Pattern 4: プログレスバー付き PDF 生成

```javascript
/**
 * 進捗表示付きPDF生成
 */
async function generatePDFWithProgress(
  elements,
  onProgress = null,
  fileName = 'document.pdf'
) {
  const totalPages = elements.length;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < totalPages; i++) {
    const element = elements[i];

    // 進捗通知
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalPages,
        percent: Math.round(((i + 1) / totalPages) * 100),
        step: 'キャプチャ中...'
      });
    }

    // Canvas 化
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // 進捗通知
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalPages,
        percent: Math.round(((i + 1) / totalPages) * 100),
        step: '画像変換中...'
      });
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    // Canvas 破棄
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;

    // 短い待機（ガベージコレクション）
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 進捗通知
  if (onProgress) {
    onProgress({
      current: totalPages,
      total: totalPages,
      percent: 100,
      step: '保存中...'
    });
  }

  pdf.save(fileName);

  // 完了通知
  if (onProgress) {
    onProgress({
      current: totalPages,
      total: totalPages,
      percent: 100,
      step: '完了！'
    });
  }
}

// 使用例（senior-friendly-ui-expert と連携）
const pages = document.querySelectorAll('.a4-page');

LoadingIndicator.show('PDF生成中...');

await generatePDFWithProgress(
  Array.from(pages),
  (progress) => {
    LoadingIndicator.updateProgress(progress.current, progress.total);
    console.log(`${progress.percent}% - ${progress.step}`);
  },
  'newsletter.pdf'
);

LoadingIndicator.hide();
showSuccessMessage('PDFを保存しました');
```

### Pattern 5: 高品質画像の事前最適化

```javascript
/**
 * 画像を事前にリサイズしてからPDF生成
 */
async function generatePDFWithOptimizedImages(element) {
  // 1. 要素内の全ての画像を取得
  const images = element.querySelectorAll('img');

  // 2. 画像を最適化（リサイズ＋圧縮）
  const optimizationPromises = Array.from(images).map(async (img) => {
    const originalSrc = img.src;

    // Base64 画像の場合のみ最適化
    if (originalSrc.startsWith('data:image')) {
      // Canvas でリサイズ
      const canvas = document.createElement('canvas');
      const maxWidth = 800; // A4の1/3程度
      const maxHeight = 600;

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 圧縮（品質 0.8）
      const optimizedSrc = canvas.toDataURL('image/jpeg', 0.8);

      // img.src を置き換え
      img.dataset.originalSrc = originalSrc;
      img.src = optimizedSrc;

      // Canvas 破棄
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    }
  });

  await Promise.all(optimizationPromises);

  // 3. PDF 生成
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.85);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save('newsletter.pdf');

  // 4. 元の画像に戻す
  images.forEach((img) => {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
      delete img.dataset.originalSrc;
    }
  });

  // Canvas 破棄
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}
```

### Pattern 6: メモリ効率的な大量ページ生成

```javascript
/**
 * メモリを節約しながら大量ページのPDFを生成
 */
async function generateLargePDFSafely(pageElements, fileName = 'large.pdf') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const batchSize = 3; // 3ページずつ処理

  for (let i = 0; i < pageElements.length; i += batchSize) {
    const batch = pageElements.slice(i, i + batchSize);

    console.log(`バッチ ${Math.floor(i / batchSize) + 1} 処理中...`);

    for (let j = 0; j < batch.length; j++) {
      const element = batch[j];
      const pageIndex = i + j;

      // Canvas 化
      const canvas = await html2canvas(element, {
        scale: 1.5, // メモリ節約のため低解像度
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Canvas 破棄
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    }

    // バッチ間で待機（ガベージコレクション）
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  pdf.save(fileName);
  console.log('✅ 大量ページPDF生成完了');
}
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. Canvas を破棄しない

```javascript
// ❌ BAD: メモリリーク
for (let i = 0; i < 10; i++) {
  const canvas = await html2canvas(element);
  pdf.addImage(canvas.toDataURL(), 'JPEG', 0, 0, 210, 297);
  // Canvas が残り続ける
}

// ✅ GOOD: 必ず破棄
for (let i = 0; i < 10; i++) {
  const canvas = await html2canvas(element);
  pdf.addImage(canvas.toDataURL(), 'JPEG', 0, 0, 210, 297);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}
```

#### 2. 高解像度＋高品質で生成

```javascript
// ❌ BAD: ファイルサイズ爆発
const canvas = await html2canvas(element, { scale: 4 });
const imgData = canvas.toDataURL('image/jpeg', 1.0);
// → 20MB以上になる

// ✅ GOOD: バランスの取れた設定
const canvas = await html2canvas(element, { scale: 2 });
const imgData = canvas.toDataURL('image/jpeg', 0.85);
// → 1〜2MB
```

#### 3. PNG で保存

```javascript
// ❌ BAD: PNG は圧縮されない
const imgData = canvas.toDataURL('image/png');
pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
// → 10MB以上

// ✅ GOOD: JPEG で圧縮
const imgData = canvas.toDataURL('image/jpeg', 0.85);
pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
// → 1〜2MB
```

#### 4. CORS 対策をしない

```javascript
// ❌ BAD: 外部画像でエラー
const canvas = await html2canvas(element);
// SecurityError: tainted canvas

// ✅ GOOD: useCORS を有効化
const canvas = await html2canvas(element, {
  useCORS: true,
  allowTaint: false
});
```

## Integration with Other Skills

### 🖼️ canvas-image-processing-expert との連携

```javascript
// 画像を事前リサイズしてからPDF生成
async function generateOptimizedPDF(photos) {
  // 1. 全ての写真をリサイズ（800×600）
  const resized = await Promise.all(
    photos.map(photo => resizeImage(photo, 800, 600, 0.85))
  );

  // 2. レイアウトに配置
  resized.forEach((dataURL, index) => {
    document.getElementById(`photo-${index}`).src = dataURL;
  });

  // 3. PDF 生成
  await generateSimplePDF('preview-area', 'newsletter.pdf');
}
```

### 🎨 a4-print-layout-expert との連携

```javascript
// A4レイアウトを正確にPDF化
const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,
  backgroundColor: '#ffffff',

  // A4サイズを厳密に指定
  width: element.offsetWidth,
  height: element.offsetHeight,

  // Safe Area を考慮
  windowWidth: 210 * 3.78, // mm → px
  windowHeight: 297 * 3.78
});
```

### 💾 offline-first-storage-expert との連携

```javascript
// 生成したPDFをIndexedDBに保存
async function savePDFToStorage(pdfBlob, metadata) {
  const db = new NewsletterDB();
  await db.init();

  // Blob を Base64 に変換
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(pdfBlob);
  });

  // IndexedDB に保存
  await db.db.add('pdfs', {
    dataURL: base64,
    metadata,
    timestamp: Date.now()
  });
}
```

## Quick Reference

### 📏 推奨設定一覧

| 用途 | scale | quality | 想定サイズ |
|------|-------|---------|----------|
| 画面表示 | 1 | 0.7 | 〜 500KB |
| 通常印刷 | 2 | 0.85 | 1〜2MB |
| 高品質 | 3 | 0.92 | 3〜5MB |

### 🚀 処理速度目安

| ページ数 | scale | 処理時間 |
|---------|-------|---------|
| 1ページ | 2 | 2〜3秒 |
| 5ページ | 2 | 10〜15秒 |
| 10ページ | 2 | 20〜30秒 |

## Resources

- **jsPDF Documentation**: https://github.com/parallax/jsPDF
- **html2canvas Documentation**: https://html2canvas.hertzen.com/
- **PDF Optimization Guide**: https://www.adobe.com/acrobat/hub/how-to-reduce-pdf-file-size.html

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (High-Quality PDF Generation)
