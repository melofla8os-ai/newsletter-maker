---
name: senior-friendly-ui-expert
description: UI/UX specialist for elderly users and care facility staff. Enforces accessibility standards including minimum touch targets (44px+), high contrast ratios (4.5:1+), plain Japanese instead of katakana jargon, and clear user feedback. Use when building applications for senior citizens or low-tech-literacy users.
version: 1.0.0
tags: accessibility, senior-friendly, ui-ux, wcag, contrast, touch-targets, plain-language, elderly, nursing-home
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Senior-Friendly UI Expert

## When to Use

このスキルは以下の状況で使用してください：

- **高齢者施設スタッフ**向けのアプリケーションを開発する
- **高齢者自身**が使用する UI を設計する
- **ITリテラシーが低いユーザー**向けのインターフェースを作る
- **タブレット・タッチデバイス**での操作を想定している
- **印刷物**と併用するアプリケーション（新聞・チラシ作成ツールなど）
- **WCAG 2.1 AA/AAA 準拠**が必要なプロジェクト
- **アクセシビリティ監査**で指摘を受けた UI を修正する

## Core Concepts & Rules

### 🎯 高齢者向け UI の 5 大原則

#### 1. **大きく、押しやすく**

```
最小タッチターゲット: 44×44px（WCAG 2.1 AA）
推奨サイズ: 60×60px 以上（高齢者向け）
理想サイズ: 80×80px 以上（タブレット）
```

**根拠**:
- 高齢者の指先の震え（本態性振戦）を考慮
- 老眼による視力低下で正確なタップが困難
- タブレットでは誤タップを防ぐため余白が重要

#### 2. **はっきり、読みやすく**

```
コントラスト比: 4.5:1 以上（WCAG 2.1 AA）
推奨: 7:1 以上（WCAG 2.1 AAA）
フォントサイズ: 最小 16px、推奨 18px 以上
```

**禁止事項**:
- ❌ 淡いグレー文字（`#999`, `#ccc` など）
- ❌ 背景色と近い文字色
- ❌ 細字フォント（font-weight: 300 以下）
- ❌ 12px 以下の文字サイズ

#### 3. **わかりやすい言葉で**

```
カタカナ IT 用語 → 平易な日本語に変換
専門用語 → 日常的な言葉に言い換え
短く、明確な指示文
```

**用語変換表（後述）を必ず使用すること**

#### 4. **今、何が起きているか見せる**

```
処理中: 大きなインジケーター + テキスト表示
成功: 緑色のチェックマーク + 「完了しました」
エラー: 赤色の警告 + 「もう一度お試しください」
```

**フィードバックのルール**:
- 0.5秒以上かかる処理は必ずローディング表示
- 成功・失敗は視覚的（色 + アイコン）+ テキストで通知
- エラーメッセージは「何が起きたか」「どうすればいいか」を明記

#### 5. **元に戻せる安心感**

```
重要な操作: 必ず確認ダイアログを表示
削除操作: 「本当に削除しますか？」を必ず表示
取り消し機能: 可能な限り実装（Undo/Redo）
```

### 📐 具体的な数値基準

#### タッチターゲット（ボタン・リンク）

| 要素 | 最小サイズ | 推奨サイズ | 理想サイズ |
|------|----------|----------|----------|
| ボタン | 44×44px | 60×60px | 80×80px |
| リンク | 44×24px | 60×30px | 80×40px |
| アイコンボタン | 48×48px | 64×64px | 80×80px |
| チェックボックス | 24×24px | 32×32px | 40×40px |
| ラジオボタン | 24×24px | 32×32px | 40×40px |

#### フォントサイズ

| 要素 | 最小 | 推奨 | 理想 |
|------|-----|-----|-----|
| 本文 | 16px | 18px | 20px |
| ボタンテキスト | 16px | 18px | 20px |
| 見出し | 20px | 24px | 28px |
| 説明文 | 14px | 16px | 18px |

#### コントラスト比（WCAG 2.1 基準）

| レベル | 通常テキスト | 大きいテキスト | 推奨用途 |
|--------|------------|--------------|---------|
| AA | 4.5:1 | 3:1 | 一般的なWebサイト |
| AAA | 7:1 | 4.5:1 | 高齢者・視覚障害者向け |

**大きいテキスト**: 18px 以上（太字は 14px 以上）

#### 余白・間隔

```css
/* ボタン間の最小間隔 */
gap: 16px; /* 最小 */
gap: 24px; /* 推奨 */

/* タップ可能領域の余白 */
padding: 12px 24px; /* 最小 */
padding: 16px 32px; /* 推奨 */

/* セクション間の余白 */
margin-bottom: 24px; /* 最小 */
margin-bottom: 32px; /* 推奨 */
```

## Code Patterns / Examples

### Pattern 1: 高齢者向けボタンの実装

```html
<!-- ❌ BAD: 小さい、読みにくい、カタカナ語 -->
<button style="padding: 8px 12px; font-size: 14px; color: #999;">
  プレビュー
</button>

<!-- ✅ GOOD: 大きい、読みやすい、平易な日本語 -->
<button class="senior-button primary">
  仕上がりを見る
</button>
```

```css
/* 高齢者向けボタンの基本スタイル */
.senior-button {
  /* サイズ */
  min-width: 180px;
  min-height: 60px;
  padding: 16px 32px;

  /* フォント */
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;

  /* 視認性 */
  border: 3px solid transparent;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  /* インタラクション */
  cursor: pointer;
  transition: all 0.2s ease;

  /* アクセシビリティ */
  -webkit-tap-highlight-color: transparent;
}

/* プライマリボタン（主要操作） */
.senior-button.primary {
  background-color: #0066cc;
  color: #ffffff;
  border-color: #0052a3;
}

.senior-button.primary:hover {
  background-color: #0052a3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.senior-button.primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* セカンダリボタン（補助操作） */
.senior-button.secondary {
  background-color: #f0f0f0;
  color: #333333;
  border-color: #cccccc;
}

/* 危険な操作ボタン（削除など） */
.senior-button.danger {
  background-color: #dc3545;
  color: #ffffff;
  border-color: #bd2130;
}

/* 無効化状態 */
.senior-button:disabled {
  background-color: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}
```

### Pattern 2: コントラスト比計算ツール

```javascript
/**
 * 2つの色のコントラスト比を計算（WCAG 2.1 準拠）
 * @param {string} color1 - 色1（例: "#ffffff"）
 * @param {string} color2 - 色2（例: "#0066cc"）
 * @returns {number} コントラスト比（1 〜 21）
 */
function calculateContrastRatio(color1, color2) {
  // Hex を RGB に変換
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // 相対輝度を計算
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  // コントラスト比を計算
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Hex を RGB に変換
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 相対輝度を計算（WCAG 2.1 仕様）
 */
function getRelativeLuminance(rgb) {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * コントラスト比が基準を満たしているかチェック
 */
function checkContrastCompliance(ratio, fontSize, isBold = false) {
  const isLargeText = (fontSize >= 18) || (fontSize >= 14 && isBold);

  return {
    AA: isLargeText ? ratio >= 3 : ratio >= 4.5,
    AAA: isLargeText ? ratio >= 4.5 : ratio >= 7,
    ratio: ratio.toFixed(2),
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA (Large)' : 'Fail'
  };
}

// 使用例
const bgColor = '#ffffff';
const textColor = '#0066cc';
const ratio = calculateContrastRatio(bgColor, textColor);
const compliance = checkContrastCompliance(ratio, 18, false);

console.log(`コントラスト比: ${compliance.ratio}:1`);
console.log(`AA 準拠: ${compliance.AA ? '✅' : '❌'}`);
console.log(`AAA 準拠: ${compliance.AAA ? '✅' : '❌'}`);
```

### Pattern 3: カタカナ IT 用語の自動変換

```javascript
/**
 * カタカナ IT 用語を平易な日本語に変換
 */
const TERM_DICTIONARY = {
  // ファイル操作
  'アップロード': '写真を選ぶ',
  'ダウンロード': '保存する',
  'ドラッグ＆ドロップ': '写真を置く',
  'ドラッグアンドドロップ': '写真を置く',

  // UI 用語
  'プレビュー': '仕上がりを見る',
  'クリック': '押す',
  'タップ': '押す',
  'スワイプ': 'なぞる',
  'スクロール': 'めくる',
  'ズーム': '拡大する',

  // 操作
  'キャンセル': '取り消し',
  'リセット': 'やり直し',
  'デフォルト': '初期設定',
  'カスタマイズ': '好みに変える',

  // 状態
  'ローディング': '読み込み中',
  'エラー': '問題が発生',
  'サクセス': '完了',

  // データ
  'テンプレート': 'ひな形',
  'フォーマット': '形式',
  'ファイル': '書類',
  'フォルダ': 'まとめ',

  // 印刷
  'レイアウト': '配置',
  'マージン': '余白',
  'オリエンテーション': '向き',

  // その他
  'セレクト': '選ぶ',
  'チェック': '確認',
  'オプション': '選択肢',
  'デバイス': '機器',
  'アカウント': '利用者情報'
};

/**
 * テキスト内のカタカナ IT 用語を変換
 * @param {string} text - 変換前のテキスト
 * @returns {string} 変換後のテキスト
 */
function convertToPlainJapanese(text) {
  let result = text;

  for (const [katakana, plain] of Object.entries(TERM_DICTIONARY)) {
    const regex = new RegExp(katakana, 'g');
    result = result.replace(regex, plain);
  }

  return result;
}

/**
 * DOM 内の全テキストを変換
 */
function convertPageToPlainJapanese() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    const converted = convertToPlainJapanese(node.textContent);
    if (converted !== node.textContent) {
      node.textContent = converted;
    }
  });
}

// 使用例
const originalText = '写真をアップロードして、プレビューを確認してください';
const plainText = convertToPlainJapanese(originalText);
console.log(plainText); // '写真を選んで、仕上がりを見るを確認してください'
```

### Pattern 4: 処理中インジケーター（大きく、わかりやすく）

```html
<!-- 処理中オーバーレイ -->
<div id="loadingOverlay" class="loading-overlay" style="display: none;">
  <div class="loading-content">
    <!-- スピナー -->
    <div class="spinner"></div>

    <!-- メッセージ -->
    <p class="loading-message">保存しています...</p>

    <!-- プログレスバー（オプション） -->
    <div class="progress-bar">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <p class="progress-text">0 / 10</p>
  </div>
</div>
```

```css
/* 処理中オーバーレイ */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  min-width: 320px;
}

/* スピナー（大きめ） */
.spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border: 8px solid #e0e0e0;
  border-top: 8px solid #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* メッセージ（大きく、読みやすく） */
.loading-message {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 16px;
}

/* プログレスバー */
.progress-bar {
  width: 100%;
  height: 24px;
  background-color: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background-color: #0066cc;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 18px;
  color: #666666;
  margin: 0;
}
```

```javascript
/**
 * 処理中インジケーターの表示/非表示
 */
const LoadingIndicator = {
  show(message = '処理中...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = overlay.querySelector('.loading-message');
    messageEl.textContent = message;
    overlay.style.display = 'flex';
  },

  hide() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';
  },

  updateProgress(current, total) {
    const overlay = document.getElementById('loadingOverlay');
    const progressFill = overlay.querySelector('.progress-fill');
    const progressText = overlay.querySelector('.progress-text');

    const percent = Math.round((current / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${current} / ${total}`;
  }
};

// 使用例
async function saveNewsletter() {
  LoadingIndicator.show('保存しています...');

  try {
    await generatePDF();
    LoadingIndicator.hide();
    showSuccessMessage('保存が完了しました');
  } catch (error) {
    LoadingIndicator.hide();
    showErrorMessage('保存に失敗しました。もう一度お試しください。');
  }
}
```

### Pattern 5: 確認ダイアログ（大きく、わかりやすく）

```html
<!-- 確認ダイアログ -->
<div id="confirmDialog" class="dialog-overlay" style="display: none;">
  <div class="dialog-content">
    <!-- アイコン -->
    <div class="dialog-icon warning">⚠️</div>

    <!-- メッセージ -->
    <h2 class="dialog-title">本当に削除しますか？</h2>
    <p class="dialog-message">
      削除すると元に戻せません。<br>
      よろしいですか？
    </p>

    <!-- ボタン -->
    <div class="dialog-buttons">
      <button class="senior-button secondary" onclick="closeConfirmDialog()">
        やめる
      </button>
      <button class="senior-button danger" onclick="confirmDelete()">
        削除する
      </button>
    </div>
  </div>
</div>
```

```css
/* ダイアログオーバーレイ */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 48px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* アイコン */
.dialog-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.dialog-icon.warning {
  color: #ff9800;
}

.dialog-icon.error {
  color: #dc3545;
}

.dialog-icon.success {
  color: #28a745;
}

/* タイトル */
.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 16px;
}

/* メッセージ */
.dialog-message {
  font-size: 18px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 32px;
}

/* ボタン配置 */
.dialog-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.dialog-buttons .senior-button {
  flex: 1;
  max-width: 200px;
}
```

```javascript
/**
 * 確認ダイアログの表示
 */
function showConfirmDialog(title, message, onConfirm, onCancel = null) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const titleEl = dialog.querySelector('.dialog-title');
    const messageEl = dialog.querySelector('.dialog-message');

    titleEl.textContent = title;
    messageEl.innerHTML = message;

    dialog.style.display = 'flex';

    // 確認ボタンのイベント
    window.confirmDelete = () => {
      dialog.style.display = 'none';
      if (onConfirm) onConfirm();
      resolve(true);
    };

    // キャンセルボタンのイベント
    window.closeConfirmDialog = () => {
      dialog.style.display = 'none';
      if (onCancel) onCancel();
      resolve(false);
    };
  });
}

// 使用例
async function deletePhoto(photoId) {
  const confirmed = await showConfirmDialog(
    '本当に削除しますか？',
    '削除すると元に戻せません。<br>よろしいですか？',
    () => {
      // 削除処理
      console.log('削除実行');
    }
  );

  if (confirmed) {
    console.log('ユーザーが削除を確認しました');
  }
}
```

### Pattern 6: 成功・エラーメッセージ（トースト通知）

```html
<!-- トースト通知コンテナ -->
<div id="toastContainer" class="toast-container"></div>
```

```css
/* トースト通知 */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toast {
  min-width: 320px;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 成功 */
.toast.success {
  background-color: #28a745;
  color: #ffffff;
}

/* エラー */
.toast.error {
  background-color: #dc3545;
  color: #ffffff;
}

/* 情報 */
.toast.info {
  background-color: #0066cc;
  color: #ffffff;
}

/* アイコン */
.toast-icon {
  font-size: 32px;
  flex-shrink: 0;
}

/* メッセージ */
.toast-message {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}
```

```javascript
/**
 * トースト通知を表示
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 使用例
function showSuccessMessage(message) {
  showToast(message, 'success', 3000);
}

function showErrorMessage(message) {
  showToast(message, 'error', 5000); // エラーは長めに表示
}

function showInfoMessage(message) {
  showToast(message, 'info', 3000);
}
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. 小さいボタン（44px 未満）

```html
<!-- ❌ BAD: タップしにくい -->
<button style="padding: 4px 8px; font-size: 12px;">
  保存
</button>

<!-- ✅ GOOD: 大きくてタップしやすい -->
<button class="senior-button primary">
  保存する
</button>
```

#### 2. 淡い色・低コントラスト

```css
/* ❌ BAD: コントラスト比 2.5:1（基準未満） */
.text {
  color: #999999;
  background-color: #ffffff;
}

/* ✅ GOOD: コントラスト比 7:1（AAA 準拠） */
.text {
  color: #333333;
  background-color: #ffffff;
}
```

#### 3. カタカナ IT 用語を多用

```html
<!-- ❌ BAD -->
<p>ファイルをドラッグ＆ドロップしてアップロードしてください</p>

<!-- ✅ GOOD -->
<p>写真をこの場所に置いてください</p>
```

#### 4. フィードバックなし

```javascript
// ❌ BAD: 何も表示せずに処理
async function saveData() {
  await fetch('/api/save', { method: 'POST' });
}

// ✅ GOOD: 処理中とエラーを表示
async function saveData() {
  LoadingIndicator.show('保存しています...');
  try {
    await fetch('/api/save', { method: 'POST' });
    LoadingIndicator.hide();
    showSuccessMessage('保存が完了しました');
  } catch (error) {
    LoadingIndicator.hide();
    showErrorMessage('保存に失敗しました。もう一度お試しください。');
  }
}
```

#### 5. 細かい文字

```css
/* ❌ BAD: 14px 以下 */
.text {
  font-size: 12px;
}

/* ✅ GOOD: 16px 以上 */
.text {
  font-size: 18px;
}
```

#### 6. 確認なしの重要操作

```javascript
// ❌ BAD: 削除をすぐ実行
function deletePhoto(id) {
  photos.splice(id, 1);
}

// ✅ GOOD: 確認ダイアログを表示
async function deletePhoto(id) {
  const confirmed = await showConfirmDialog(
    '本当に削除しますか？',
    '削除すると元に戻せません。'
  );

  if (confirmed) {
    photos.splice(id, 1);
  }
}
```

## Integration with Other Skills

### 🎨 color-palette-generator との連携

```javascript
// color-palette-generator のコントラスト計算を使用
import { calculateContrastRatio } from './color-palette-generator.js';

/**
 * 高齢者向けに安全な色の組み合わせを検証
 */
function validateSeniorFriendlyColors(bgColor, textColor) {
  const ratio = calculateContrastRatio(bgColor, textColor);

  // 高齢者向けは AAA 基準（7:1）を推奨
  if (ratio < 7) {
    console.warn(`コントラスト比が不足: ${ratio.toFixed(2)}:1（推奨: 7:1 以上）`);
    return false;
  }

  return true;
}
```

### 🖼️ canvas-image-processing-expert との連携

```javascript
// 画像処理時の進捗表示
async function processImagesWithFeedback(files) {
  LoadingIndicator.show('写真を準備しています...');

  for (let i = 0; i < files.length; i++) {
    LoadingIndicator.updateProgress(i + 1, files.length);
    await resizeImage(files[i], 1200, 900, 0.9);
  }

  LoadingIndicator.hide();
  showSuccessMessage('写真の準備ができました');
}
```

## Quick Reference: カタカナ IT 用語変換表

| カタカナ | 平易な日本語 |
|---------|------------|
| アップロード | 写真を選ぶ |
| ダウンロード | 保存する |
| ドラッグ＆ドロップ | 写真を置く |
| プレビュー | 仕上がりを見る |
| クリック / タップ | 押す |
| スワイプ | なぞる |
| スクロール | めくる |
| ズーム | 拡大する |
| キャンセル | 取り消し |
| リセット | やり直し |
| デフォルト | 初期設定 |
| カスタマイズ | 好みに変える |
| ローディング | 読み込み中 |
| エラー | 問題が発生 |
| テンプレート | ひな形 |
| ファイル | 書類 |
| フォルダ | まとめ |
| レイアウト | 配置 |
| マージン | 余白 |
| セレクト | 選ぶ |

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **高齢者向けUI設計**: https://www.nngroup.com/articles/usability-for-senior-citizens/
- **総務省アクセシビリティガイドライン**: https://www.soumu.go.jp/main_sosiki/joho_tsusin/b_free/guideline.html

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (Elderly Care Facilities)
