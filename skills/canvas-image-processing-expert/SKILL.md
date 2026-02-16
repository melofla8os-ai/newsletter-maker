---
name: canvas-image-processing-expert
description: Browser Canvas API specialist for high-resolution image resizing, compression, and memory-safe processing. Use when handling user-uploaded photos, preventing memory issues, solving html2canvas CORS/quality problems, or optimizing images for print/PDF generation.
version: 1.0.0
tags: canvas, image-processing, resize, compression, memory-management, cors, html2canvas, performance
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Canvas Image Processing Expert

## When to Use

このスキルは以下の状況で使用してください：

- **スマホ撮影の高解像度画像**をアップロード前にブラウザでリサイズ・圧縮したい
- **メモリ不足エラー**（`Out of Memory`）を回避したい（特にモバイル）
- **html2canvas使用時**の画像が白くなる（CORS）、画質が悪い問題を解決したい
- **PDF生成時**に画像サイズを最適化して処理速度を向上させたい
- **Canvas オブジェクトのメモリリーク**を防止したい
- **複数画像の一括処理**でブラウザをクラッシュさせずに処理したい

## Core Concepts & Rules

### 🎯 Canvas API の基本原則

1. **Canvas はメモリを大量消費する**
   - Canvas のサイズ = `width × height × 4 bytes`（RGBA）
   - 4000×3000px の画像 = 約 48MB のメモリ
   - モバイルブラウザは 100MB 程度でクラッシュする可能性

2. **使い終わったら必ず破棄する**
   ```javascript
   // ❌ BAD: Canvas を放置するとメモリリーク
   function processImage(file) {
     const canvas = document.createElement('canvas');
     // ... 処理 ...
     return canvas.toDataURL(); // canvas が残り続ける
   }

   // ✅ GOOD: 明示的にクリアする
   function processImage(file) {
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     // ... 処理 ...
     const result = canvas.toDataURL();

     // メモリ解放
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     canvas.width = 0;
     canvas.height = 0;

     return result;
   }
   ```

3. **CORS を意識する**
   - 外部ドメインの画像を Canvas に描画すると `tainted` 状態になる
   - `tainted` な Canvas から `toDataURL()` を呼ぶと SecurityError
   - **解決策**: 画像に `crossOrigin = "anonymous"` を設定

4. **画質と圧縮率のトレードオフ**
   - `toDataURL('image/jpeg', quality)` の `quality` は 0.0 〜 1.0
   - 推奨値：
     - **写真**: 0.85 〜 0.92（バランス型）
     - **印刷用**: 0.92 〜 0.95（高品質）
     - **サムネイル**: 0.70 〜 0.80（軽量）

### 🛡️ メモリ管理の鉄則

1. **巨大画像は段階的にリサイズ**
   - 一度に 50% 以上縮小すると画質が荒れる
   - 複数回に分けて縮小する（例: 4000px → 2000px → 1000px）

2. **同時処理数を制限**
   - 10枚の画像を同時処理すると Out of Memory
   - Promise キューで逐次処理する

3. **Canvas を DOM に追加しない**
   - `document.createElement('canvas')` で作成したら DOM には追加しない
   - メモリ内で処理して結果だけ返す

## Code Patterns / Examples

### Pattern 1: 高解像度画像の安全なリサイズ

```javascript
/**
 * 画像を指定サイズにリサイズし、JPEG圧縮して返す
 * @param {File} file - 画像ファイル（input type="file" から取得）
 * @param {number} maxWidth - 最大幅（px）
 * @param {number} maxHeight - 最大高さ（px）
 * @param {number} quality - JPEG品質（0.0 〜 1.0）デフォルト 0.9
 * @returns {Promise<string>} Base64エンコードされた画像データURL
 */
async function resizeImage(file, maxWidth, maxHeight, quality = 0.9) {
  return new Promise((resolve, reject) => {
    // 1. FileReader で画像を読み込む
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('ファイル読み込みエラー'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('画像形式エラー'));

      img.onload = () => {
        try {
          // 2. アスペクト比を維持してリサイズ計算
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          // 3. Canvas にリサイズして描画
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          // 画質向上のため imageSmoothingQuality を高品質に設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height);

          // 4. JPEG 圧縮して Base64 取得
          const result = canvas.toDataURL('image/jpeg', quality);

          // 5. メモリ解放
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 0;
          canvas.height = 0;

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// 使用例
const fileInput = document.getElementById('photoInput');
fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    // スマホ写真（4000×3000）を 1200×900 にリサイズ、品質 0.9
    const resizedDataURL = await resizeImage(file, 1200, 900, 0.9);

    // img タグに表示 or データとして保存
    document.getElementById('preview').src = resizedDataURL;
  }
});
```

### Pattern 2: 巨大画像の段階的リサイズ（メモリ安全版）

```javascript
/**
 * 巨大画像を段階的にリサイズして画質を保つ
 * @param {HTMLImageElement} img - 元画像
 * @param {number} targetWidth - 目標幅
 * @param {number} targetHeight - 目標高さ
 * @returns {string} リサイズ後の画像データURL
 */
function progressiveResize(img, targetWidth, targetHeight) {
  let currentWidth = img.width;
  let currentHeight = img.height;

  // Canvas を使い回す（メモリ効率化）
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 元画像を Canvas に描画
  canvas.width = currentWidth;
  canvas.height = currentHeight;
  ctx.drawImage(img, 0, 0);

  // 50% ずつ縮小していく
  while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
    currentWidth = Math.floor(currentWidth / 2);
    currentHeight = Math.floor(currentHeight / 2);

    // 一時 Canvas を作成
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = currentWidth;
    tempCanvas.height = currentHeight;

    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(canvas, 0, 0, currentWidth, currentHeight);

    // メインCanvasを更新
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(tempCanvas, 0, 0);

    // 一時Canvasを破棄
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCanvas.width = 0;
    tempCanvas.height = 0;
  }

  // 最終サイズに調整
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;

  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  const result = finalCanvas.toDataURL('image/jpeg', 0.92);

  // 全てのCanvasを破棄
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;

  finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCanvas.width = 0;
  finalCanvas.height = 0;

  return result;
}
```

### Pattern 3: html2canvas の CORS エラー回避

```javascript
/**
 * CORS エラーを回避して html2canvas で画像を含む HTML を Canvas 化
 * @param {HTMLElement} element - キャプチャ対象の要素
 * @returns {Promise<HTMLCanvasElement>}
 */
async function captureElementWithImages(element) {
  // 1. 要素内の全ての img タグを取得
  const images = element.querySelectorAll('img');

  // 2. 画像を Base64 に変換してインライン化（CORS 回避）
  const imagePromises = Array.from(images).map(async (img) => {
    // 外部URLの画像の場合
    if (img.src.startsWith('http') && !img.src.startsWith(window.location.origin)) {
      try {
        // Fetch API で画像を取得
        const response = await fetch(img.src, { mode: 'cors' });
        const blob = await response.blob();

        // Blob を Base64 に変換
        const dataURL = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // img.src を Base64 に置き換え
        img.dataset.originalSrc = img.src;
        img.src = dataURL;
      } catch (error) {
        console.warn('画像の読み込み失敗:', img.src, error);
      }
    }
  });

  await Promise.all(imagePromises);

  // 3. html2canvas でキャプチャ
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 2, // 高解像度化（印刷用）
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 0,
    removeContainer: true
  });

  // 4. 元の src に戻す（オプション）
  images.forEach((img) => {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
      delete img.dataset.originalSrc;
    }
  });

  return canvas;
}

// 使用例（PDF 生成）
async function generatePDF() {
  const element = document.getElementById('preview-area');

  // Canvas 化
  const canvas = await captureElementWithImages(element);

  // PDF 生成
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  pdf.save('newsletter.pdf');

  // Canvas を破棄
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
}
```

### Pattern 4: 複数画像の逐次処理（メモリリーク防止）

```javascript
/**
 * 複数画像を逐次処理してメモリリークを防ぐ
 * @param {File[]} files - 画像ファイル配列
 * @param {Function} onProgress - 進捗コールバック
 * @returns {Promise<string[]>} リサイズ済み画像のDataURL配列
 */
async function processImagesSequentially(files, onProgress = null) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 進捗通知
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name
      });
    }

    try {
      // 1枚ずつ処理（同時処理しない）
      const resized = await resizeImage(file, 1200, 900, 0.9);
      results.push(resized);

      // 処理後にガベージコレクションを促す（微妙だが一応）
      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`画像処理エラー: ${file.name}`, error);
      results.push(null); // エラー時は null を追加
    }
  }

  return results;
}

// 使用例
const fileInput = document.getElementById('photoInput');
fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);

  // プログレスバー表示
  const progressBar = document.getElementById('progress');
  progressBar.style.display = 'block';

  const resizedImages = await processImagesSequentially(files, (progress) => {
    const percent = Math.round((progress.current / progress.total) * 100);
    progressBar.querySelector('.bar').style.width = `${percent}%`;
    progressBar.querySelector('.text').textContent =
      `処理中: ${progress.current} / ${progress.total} (${progress.fileName})`;
  });

  progressBar.style.display = 'none';

  // 結果を使用
  console.log(`${resizedImages.length} 枚の画像を処理しました`);
});
```

### Pattern 5: Canvas のメモリ完全解放

```javascript
/**
 * Canvas オブジェクトのメモリを完全に解放
 * @param {HTMLCanvasElement} canvas - 破棄する Canvas
 */
function destroyCanvas(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // 1. Canvas をクリア
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 2. サイズを 0 に（メモリ解放を促す）
  canvas.width = 0;
  canvas.height = 0;

  // 3. DOM から削除（もし追加されていたら）
  if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  // 4. イベントリスナーをクリア（もしあれば）
  const clone = canvas.cloneNode(false);
  if (canvas.parentNode) {
    canvas.parentNode.replaceChild(clone, canvas);
  }
}

// 使用例
class ImageProcessor {
  constructor() {
    this.canvases = [];
  }

  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.canvases.push(canvas);
    return canvas;
  }

  cleanup() {
    // 全ての Canvas を破棄
    this.canvases.forEach(destroyCanvas);
    this.canvases = [];
  }

  async processImage(file) {
    const canvas = this.createCanvas(1200, 900);
    // ... 処理 ...
    return canvas.toDataURL();
  }
}

// 使用後に必ずクリーンアップ
const processor = new ImageProcessor();
await processor.processImage(file);
processor.cleanup(); // 重要！
```

### Pattern 6: html2canvas の画質改善

```javascript
/**
 * html2canvas の画質を最大限に改善して PDF 生成
 * @param {HTMLElement} element - キャプチャ対象
 * @returns {Promise<void>}
 */
async function generateHighQualityPDF(element) {
  // 1. html2canvas で高品質キャプチャ
  const canvas = await html2canvas(element, {
    scale: 3,              // 3倍解像度（印刷用）
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,

    // 画質向上のための追加設定
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,

    // フォントレンダリング改善
    letterRendering: true,

    // 画像品質
    imageTimeout: 0,
    removeContainer: true,

    // Canvas のスムージング
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(element.id);
      if (clonedElement) {
        clonedElement.style.transform = 'scale(1)';
      }
    }
  });

  // 2. Canvas から高品質 JPEG 取得
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // 3. PDF に埋め込み
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // A4 サイズに合わせて配置
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save('newsletter.pdf');

  // 4. Canvas を破棄
  destroyCanvas(canvas);
}
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. Canvas を使い回さずに毎回作成する（メモリリーク）

```javascript
// ❌ BAD: ループ内で Canvas を作成し続ける
for (let i = 0; i < 100; i++) {
  const canvas = document.createElement('canvas');
  canvas.width = 4000;
  canvas.height = 3000;
  // ... 処理 ...
  // 破棄せずに次のループへ → メモリリーク
}

// ✅ GOOD: Canvas を再利用する
const canvas = document.createElement('canvas');
for (let i = 0; i < 100; i++) {
  canvas.width = 4000;
  canvas.height = 3000;
  const ctx = canvas.getContext('2d');
  // ... 処理 ...
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
// 最後に破棄
destroyCanvas(canvas);
```

#### 2. 巨大画像を一度にリサイズする

```javascript
// ❌ BAD: 4000px → 200px を一気に縮小（画質が荒れる）
ctx.drawImage(img, 0, 0, 200, 150);

// ✅ GOOD: 段階的に縮小
// 4000px → 2000px → 1000px → 500px → 200px
```

#### 3. CORS を無視して外部画像を扱う

```javascript
// ❌ BAD: 外部画像を直接 Canvas に描画
const img = new Image();
img.src = 'https://example.com/photo.jpg'; // CORS エラー
img.onload = () => {
  ctx.drawImage(img, 0, 0);
  canvas.toDataURL(); // SecurityError!
};

// ✅ GOOD: crossOrigin を設定
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://example.com/photo.jpg';
```

#### 4. 同時に複数画像を処理する（メモリ不足）

```javascript
// ❌ BAD: Promise.all で一斉処理
const promises = files.map(file => resizeImage(file));
await Promise.all(promises); // Out of Memory!

// ✅ GOOD: 逐次処理
for (const file of files) {
  await resizeImage(file);
}
```

#### 5. toDataURL の品質パラメータを指定しない

```javascript
// ❌ BAD: 品質指定なし（デフォルト 0.92 だが明示すべき）
const dataURL = canvas.toDataURL('image/jpeg');

// ✅ GOOD: 明示的に品質を指定
const dataURL = canvas.toDataURL('image/jpeg', 0.90);
```

#### 6. FileReader の結果を再利用する

```javascript
// ❌ BAD: FileReader の結果を配列に溜め込む
const results = [];
for (const file of files) {
  const reader = new FileReader();
  reader.onload = (e) => {
    results.push(e.target.result); // メモリリーク
  };
  reader.readAsDataURL(file);
}

// ✅ GOOD: 処理後すぐに使う
for (const file of files) {
  const dataURL = await readFileAsDataURL(file);
  await processImage(dataURL);
  // dataURL はすぐにスコープから外れる
}
```

## Integration with Other Skills

### 🎨 color-palette-generator との連携

```javascript
// Canvas で画像の主要色を抽出
function extractDominantColor(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount)
  };
}
```

### 🖥️ moai-framework-electron との連携

```javascript
// Electron Main Process でファイル保存
// Preload script
contextBridge.exposeInMainWorld('electronAPI', {
  saveImage: (dataURL, fileName) => ipcRenderer.invoke('save-image', dataURL, fileName)
});

// Main process
ipcMain.handle('save-image', async (event, dataURL, fileName) => {
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const savePath = path.join(app.getPath('pictures'), 'NewsletterMaker', fileName);
  await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
  await fs.promises.writeFile(savePath, buffer);

  return savePath;
});
```

## Performance Tips

### 📊 メモリ使用量の目安

| 画像サイズ | メモリ使用量 | 推奨デバイス |
|-----------|------------|------------|
| 800×600 | 約 2MB | モバイル OK |
| 1200×900 | 約 4.5MB | モバイル OK |
| 2000×1500 | 約 12MB | PC 推奨 |
| 4000×3000 | 約 48MB | PC のみ |

### ⚡ 最適化チェックリスト

- [ ] Canvas サイズは必要最小限に
- [ ] 使用後は必ず `destroyCanvas()` で破棄
- [ ] 複数画像は逐次処理（同時処理しない）
- [ ] 巨大画像は段階的にリサイズ
- [ ] `imageSmoothingQuality = 'high'` で画質向上
- [ ] JPEG 品質は 0.85 〜 0.95 の範囲で指定
- [ ] html2canvas は `scale: 2` or `3` で高解像度化
- [ ] CORS エラーは `crossOrigin = 'anonymous'` で回避

## Resources

- **MDN Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **html2canvas**: https://html2canvas.hertzen.com/
- **jsPDF**: https://github.com/parallax/jsPDF
- **Image Compression**: https://imagecompressor.com/blog/image-compression-techniques/

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project
