---
name: drag-and-drop-file-upload
description: Drag-and-drop file upload specialist covering drop zone UI/UX, multi-file handling, validation, visual feedback, mobile fallbacks, and accessibility. Use when implementing intuitive file upload interfaces, especially for photo/image uploads in web applications.
version: 1.0.0
tags: drag-and-drop, file-upload, dropzone, images, validation, accessibility, mobile, ux
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Drag-and-Drop File Upload Expert

## When to Use

このスキルは以下の状況で使用してください：

- **写真アップロード機能**を実装したい
- **ドラッグ&ドロップ**で直感的な操作を実現したい
- **複数ファイルの同時アップロード**に対応したい
- **ファイル形式のバリデーション**（JPEG, PNG のみなど）をしたい
- **ドロップゾーンの視覚的フィードバック**を実装したい
- **モバイルでの代替UI**（ファイル選択ボタン）を提供したい
- **高齢者向けのシンプルなUI**を設計したい

## Core Concepts & Rules

### 🎯 ドラッグ&ドロップの基本

#### 必須イベント

```javascript
element.addEventListener('dragenter', handleDragEnter); // ドロップゾーンに入った
element.addEventListener('dragover', handleDragOver);   // ドロップゾーン上を移動中
element.addEventListener('dragleave', handleDragLeave); // ドロップゾーンから出た
element.addEventListener('drop', handleDrop);           // ファイルをドロップした
```

#### 重要な設定

```javascript
function handleDragOver(e) {
  // デフォルト動作を防止（ブラウザでファイルを開く動作を止める）
  e.preventDefault();
  e.stopPropagation();

  // ドロップを許可
  e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
  // デフォルト動作を防止
  e.preventDefault();
  e.stopPropagation();

  // ファイルを取得
  const files = Array.from(e.dataTransfer.files);
}
```

### 🎨 視覚的フィードバック

```css
/* 通常状態 */
.dropzone {
  border: 2px dashed #ccc;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

/* ドラッグ中 */
.dropzone.drag-over {
  border-color: #0066cc;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

/* アクティブ状態 */
.dropzone.active {
  border-color: #28a745;
  background-color: #d4edda;
}

/* エラー状態 */
.dropzone.error {
  border-color: #dc3545;
  background-color: #f8d7da;
}
```

### ✅ ファイルバリデーション

```javascript
/**
 * 画像ファイルのバリデーション
 */
function validateImageFile(file) {
  const errors = [];

  // 1. ファイル形式チェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`${file.name}: 対応していない形式です（JPEG, PNG, GIF, WebP のみ）`);
  }

  // 2. ファイルサイズチェック（10MB以下）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`${file.name}: ファイルサイズが大きすぎます（最大10MB）`);
  }

  // 3. ファイル名チェック（オプション）
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(file.name)) {
    errors.push(`${file.name}: ファイル名に使用できない文字が含まれています`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 📱 モバイル対応

モバイルではドラッグ&ドロップが使えないため、代替UIを提供します。

```javascript
// モバイル判定
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// モバイルの場合はファイル選択UIを表示
if (isMobileDevice()) {
  dropzone.style.display = 'none';
  fileInputButton.style.display = 'block';
}
```

## Code Patterns / Examples

### Pattern 1: 基本的なドロップゾーン

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ファイルアップロード</title>
  <style>
    .dropzone {
      width: 100%;
      min-height: 200px;
      border: 3px dashed #ccc;
      border-radius: 8px;
      background-color: #fafafa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dropzone:hover {
      border-color: #999;
      background-color: #f0f0f0;
    }

    .dropzone.drag-over {
      border-color: #0066cc;
      background-color: #e3f2fd;
      transform: scale(1.02);
    }

    .dropzone-icon {
      font-size: 64px;
      color: #999;
      margin-bottom: 16px;
    }

    .dropzone-text {
      font-size: 18px;
      color: #666;
    }

    .dropzone-hint {
      font-size: 14px;
      color: #999;
      margin-top: 8px;
    }

    .file-input {
      display: none;
    }
  </style>
</head>
<body>
  <div class="dropzone" id="dropzone">
    <div class="dropzone-icon">📁</div>
    <p class="dropzone-text">写真をここに置いてください</p>
    <p class="dropzone-hint">または、クリックしてファイルを選択</p>
  </div>

  <input type="file" class="file-input" id="fileInput" multiple accept="image/*">

  <script>
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');

    // ドラッグ&ドロップイベント
    dropzone.addEventListener('dragenter', handleDragEnter);
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);

    // クリックでファイル選択
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // ファイル選択イベント
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });

    function handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    }

    function handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }

    function handleFiles(files) {
      console.log('Selected files:', files);

      // ファイル処理
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          console.log('Image file:', file.name);
          // 画像処理...
        }
      });
    }
  </script>
</body>
</html>
```

### Pattern 2: バリデーション付きドロップゾーン

```javascript
/**
 * バリデーション機能付きドロップゾーン
 */
class FileDropzone {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.fileInput = document.getElementById(options.fileInputId || 'fileInput');

    this.options = {
      allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png'],
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: options.maxFiles || 20,
      onFilesSelected: options.onFilesSelected || null,
      onError: options.onError || null
    };

    this.files = [];

    this._init();
  }

  _init() {
    // ドラッグ&ドロップイベント
    this.element.addEventListener('dragenter', (e) => this._handleDragEnter(e));
    this.element.addEventListener('dragover', (e) => this._handleDragOver(e));
    this.element.addEventListener('dragleave', (e) => this._handleDragLeave(e));
    this.element.addEventListener('drop', (e) => this._handleDrop(e));

    // クリックイベント
    this.element.addEventListener('click', () => {
      this.fileInput.click();
    });

    // ファイル選択イベント
    this.fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this._processFiles(files);
    });
  }

  _handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.element.classList.add('drag-over');
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }

  _handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.element.classList.remove('drag-over');
  }

  _handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.element.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    this._processFiles(files);
  }

  _processFiles(files) {
    const validFiles = [];
    const errors = [];

    // ファイル数チェック
    if (this.files.length + files.length > this.options.maxFiles) {
      errors.push(`最大${this.options.maxFiles}枚までアップロードできます`);

      if (this.options.onError) {
        this.options.onError(errors);
      }

      return;
    }

    // 各ファイルをバリデーション
    files.forEach(file => {
      const validation = this._validateFile(file);

      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(...validation.errors);
      }
    });

    // エラーがあれば通知
    if (errors.length > 0 && this.options.onError) {
      this.options.onError(errors);
    }

    // 有効なファイルを追加
    if (validFiles.length > 0) {
      this.files.push(...validFiles);

      if (this.options.onFilesSelected) {
        this.options.onFilesSelected(validFiles);
      }
    }
  }

  _validateFile(file) {
    const errors = [];

    // ファイル形式チェック
    if (!this.options.allowedTypes.includes(file.type)) {
      const allowedNames = this.options.allowedTypes
        .map(t => t.split('/')[1].toUpperCase())
        .join(', ');

      errors.push(`${file.name}: 対応していない形式です（${allowedNames}のみ）`);
    }

    // ファイルサイズチェック
    if (file.size > this.options.maxFileSize) {
      const maxMB = (this.options.maxFileSize / 1024 / 1024).toFixed(1);
      errors.push(`${file.name}: ファイルサイズが大きすぎます（最大${maxMB}MB）`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clear() {
    this.files = [];
    this.fileInput.value = '';
  }

  getFiles() {
    return this.files;
  }
}

// 使用例
const dropzone = new FileDropzone('dropzone', {
  fileInputId: 'fileInput',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 20,

  onFilesSelected: (files) => {
    console.log('Selected files:', files);
    files.forEach(file => {
      displayPhoto(file);
    });
  },

  onError: (errors) => {
    console.error('Errors:', errors);
    alert(errors.join('\n'));
  }
});
```

### Pattern 3: プレビュー機能付き

```javascript
/**
 * プレビュー機能付きドロップゾーン
 */
class PhotoDropzone extends FileDropzone {
  constructor(elementId, previewContainerId, options = {}) {
    super(elementId, options);
    this.previewContainer = document.getElementById(previewContainerId);
  }

  _processFiles(files) {
    super._processFiles(files);

    // 選択されたファイルをプレビュー表示
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this._createPreview(file);
      }
    });
  }

  _createPreview(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      // プレビュー要素を作成
      const previewDiv = document.createElement('div');
      previewDiv.className = 'photo-preview';

      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = file.name;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '×';
      removeBtn.onclick = () => {
        previewDiv.remove();
        this._removeFile(file);
      };

      previewDiv.appendChild(img);
      previewDiv.appendChild(removeBtn);

      this.previewContainer.appendChild(previewDiv);
    };

    reader.readAsDataURL(file);
  }

  _removeFile(file) {
    this.files = this.files.filter(f => f !== file);
  }

  clear() {
    super.clear();
    this.previewContainer.innerHTML = '';
  }
}
```

```css
/* プレビュースタイル */
.preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.photo-preview {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.photo-preview .remove-btn:hover {
  background-color: rgb(220, 53, 69);
}
```

### Pattern 4: 高齢者向けシンプルUI

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>写真を選ぶ</title>
  <style>
    .upload-area {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
      text-align: center;
    }

    /* 大きなドロップゾーン */
    .dropzone {
      min-height: 300px;
      border: 4px dashed #0066cc;
      border-radius: 16px;
      background-color: #f8f9fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dropzone:hover {
      background-color: #e3f2fd;
      transform: scale(1.02);
    }

    .dropzone.drag-over {
      border-color: #28a745;
      background-color: #d4edda;
    }

    /* 大きなアイコン */
    .dropzone-icon {
      font-size: 100px;
      margin-bottom: 24px;
    }

    /* 大きな文字 */
    .dropzone-text {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0 0 16px;
      line-height: 1.5;
    }

    .dropzone-hint {
      font-size: 20px;
      color: #666;
      margin: 0;
    }

    /* 代替ボタン（モバイル用） */
    .upload-button {
      display: none;
      min-width: 280px;
      min-height: 80px;
      padding: 20px 40px;
      font-size: 24px;
      font-weight: 700;
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-button:hover {
      background-color: #0052a3;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .dropzone {
        display: none;
      }

      .upload-button {
        display: block;
        margin: 0 auto;
      }
    }
  </style>
</head>
<body>
  <div class="upload-area">
    <!-- デスクトップ: ドロップゾーン -->
    <div class="dropzone" id="dropzone">
      <div class="dropzone-icon">📷</div>
      <p class="dropzone-text">写真を置いてください</p>
      <p class="dropzone-hint">または、ここを押して選んでください</p>
    </div>

    <!-- モバイル: 大きなボタン -->
    <button class="upload-button" onclick="document.getElementById('fileInput').click()">
      写真を選ぶ
    </button>

    <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
  </div>

  <script>
    // FileDropzone クラスを使用
    const dropzone = new PhotoDropzone('dropzone', 'preview-container', {
      allowedTypes: ['image/jpeg', 'image/png'],
      maxFiles: 20,

      onFilesSelected: (files) => {
        console.log(`${files.length}枚の写真を選びました`);
      },

      onError: (errors) => {
        alert(errors.join('\n'));
      }
    });
  </script>
</body>
</html>
```

### Pattern 5: プログレス表示付きアップロード

```javascript
/**
 * アップロード進捗表示機能
 */
class ProgressiveUploader {
  constructor(dropzoneId, options = {}) {
    this.dropzone = new PhotoDropzone(dropzoneId, 'preview-container', options);
    this.uploadQueue = [];
    this.onUploadComplete = options.onUploadComplete || null;
  }

  async uploadFiles() {
    const files = this.dropzone.getFiles();

    if (files.length === 0) {
      alert('写真が選択されていません');
      return;
    }

    // プログレスバー表示
    this._showProgress();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 進捗更新
      this._updateProgress(i + 1, files.length, file.name);

      // ファイルをアップロード（または処理）
      await this._processFile(file);

      // 短い待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 完了
    this._hideProgress();

    if (this.onUploadComplete) {
      this.onUploadComplete(files);
    }
  }

  async _processFile(file) {
    // 実際のアップロード処理
    // ここでは画像リサイズを実行
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        // 画像処理...
        resolve();
      };

      reader.readAsDataURL(file);
    });
  }

  _showProgress() {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'upload-progress';
    progressDiv.className = 'upload-progress';
    progressDiv.innerHTML = `
      <div class="progress-content">
        <p class="progress-message">処理中...</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <p class="progress-text">0 / 0</p>
      </div>
    `;

    document.body.appendChild(progressDiv);
  }

  _updateProgress(current, total, fileName) {
    const percent = Math.round((current / total) * 100);

    document.querySelector('.progress-message').textContent =
      `処理中: ${fileName}`;
    document.querySelector('.progress-fill').style.width = `${percent}%`;
    document.querySelector('.progress-text').textContent =
      `${current} / ${total}`;
  }

  _hideProgress() {
    const progressDiv = document.getElementById('upload-progress');
    if (progressDiv) {
      progressDiv.remove();
    }
  }
}
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. デフォルト動作を止めない

```javascript
// ❌ BAD: ブラウザがファイルを開いてしまう
element.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
});

// ✅ GOOD: preventDefault で防ぐ
element.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer.files;
});
```

#### 2. バリデーションをしない

```javascript
// ❌ BAD: 全てのファイルを受け入れる
const files = e.dataTransfer.files;
files.forEach(file => uploadFile(file));

// ✅ GOOD: 画像のみ受け入れる
const files = Array.from(e.dataTransfer.files);
const imageFiles = files.filter(f => f.type.startsWith('image/'));
imageFiles.forEach(file => uploadFile(file));
```

#### 3. モバイルで使えない

```html
<!-- ❌ BAD: モバイルで操作できない -->
<div class="dropzone">写真をドロップ</div>

<!-- ✅ GOOD: ボタンも提供 -->
<div class="dropzone">写真をドロップ、またはクリック</div>
<input type="file" id="fileInput" multiple>
```

## Integration with Other Skills

### 🖼️ canvas-image-processing-expert との連携

```javascript
// ファイル選択後に自動リサイズ
dropzone.options.onFilesSelected = async (files) => {
  for (let file of files) {
    // リサイズ（1200×900）
    const resized = await resizeImage(file, 1200, 900, 0.9);

    // 表示
    displayPhoto(resized);
  }
};
```

### 🎨 senior-friendly-ui-expert との連携

```javascript
// 高齢者向けの大きなドロップゾーン
const dropzone = new PhotoDropzone('dropzone', 'preview', {
  // 平易な日本語でエラー表示
  onError: (errors) => {
    const message = errors.join('\n\n').replace('JPEG', 'ジェーペグ');
    showToast(message, 'error', 5000);
  }
});
```

## Resources

- **Drag and Drop API**: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- **File API**: https://developer.mozilla.org/en-US/docs/Web/API/File
- **DataTransfer**: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (Intuitive Photo Upload)
