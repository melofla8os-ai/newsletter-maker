---
name: offline-first-storage-expert
description: Offline-first storage specialist covering LocalStorage, IndexedDB, Electron Store, and data persistence strategies. Handles auto-save, backup/restore, quota management, and graceful degradation. Use when building offline-capable apps, implementing auto-save features, or storing large datasets in the browser.
version: 1.0.0
tags: offline, storage, localstorage, indexeddb, electron-store, persistence, auto-save, backup, quota
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Offline-First Storage Expert

## When to Use

このスキルは以下の状況で使用してください：

- **完全オフライン動作**のアプリケーションを作る
- **自動保存機能**を実装したい（ブラウザクラッシュ対策）
- **LocalStorage の 5MB 制限**を超える大量データを保存したい
- **画像データ（Base64）**を効率的に保存したい
- **Electron アプリ**でユーザー設定を永続化したい
- **データのバックアップ・復元**機能を実装したい
- **ストレージ容量不足**を検知してユーザーに通知したい

## Core Concepts & Rules

### 🗄️ ストレージの種類と使い分け

#### 1. LocalStorage

```javascript
// シンプルなKey-Valueストア
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();
```

**特徴**:
- ✅ シンプルで使いやすい
- ✅ 同期API（await 不要）
- ❌ 容量制限: 5MB〜10MB（ブラウザ依存）
- ❌ 文字列のみ（JSON.stringify 必須）
- ❌ パフォーマンス: 大量データは遅い

**推奨用途**:
- ユーザー設定（テーマ、言語など）
- 小さなフラグ（初回訪問、チュートリアル完了など）
- セッション情報

#### 2. IndexedDB

```javascript
// 非同期のNoSQLデータベース
const db = await openDB('myDatabase', 1);
await db.put('storeName', { id: 1, data: '...' });
const data = await db.get('storeName', 1);
```

**特徴**:
- ✅ 大容量: 数百MB〜数GB（ブラウザ依存）
- ✅ オブジェクトを直接保存可能
- ✅ インデックス・クエリ対応
- ❌ 複雑なAPI
- ❌ 非同期（async/await 必須）

**推奨用途**:
- 画像データ（Base64）
- 作成途中のドキュメント
- 過去の履歴データ
- オフラインキャッシュ

#### 3. Electron Store

```javascript
// Electron専用の永続化ストレージ
const Store = require('electron-store');
const store = new Store();

store.set('settings.theme', 'dark');
const theme = store.get('settings.theme');
```

**特徴**:
- ✅ Electron専用（Main/Rendererどちらでも使用可）
- ✅ JSONファイルで保存（可読性高い）
- ✅ デフォルト値、バリデーション対応
- ❌ ブラウザでは使えない

**推奨用途**:
- アプリ設定
- ウィンドウ位置・サイズ
- 最近使ったファイルパス

### 🎯 データ保存戦略

#### 小さいデータ（< 100KB）

```javascript
// LocalStorage で十分
const settings = {
  theme: 'light',
  language: 'ja',
  autoSave: true
};

localStorage.setItem('app-settings', JSON.stringify(settings));
```

#### 中規模データ（100KB 〜 5MB）

```javascript
// LocalStorage の上限付近
// エラーハンドリング必須
try {
  localStorage.setItem('large-data', JSON.stringify(largeObject));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    console.error('LocalStorage容量不足');
    // IndexedDB に移行
    await saveToIndexedDB(largeObject);
  }
}
```

#### 大規模データ（> 5MB）

```javascript
// IndexedDB を使用
import { openDB } from 'idb';

const db = await openDB('newsletter-db', 1, {
  upgrade(db) {
    db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
  }
});

await db.add('photos', {
  id: 1,
  dataURL: 'data:image/jpeg;base64,...', // 数MB
  timestamp: Date.now()
});
```

#### 画像データの保存戦略

```javascript
/**
 * 画像サイズに応じて保存先を選択
 */
async function savePhoto(photoData) {
  const sizeKB = (photoData.length * 3) / 4 / 1024; // Base64 → KB

  if (sizeKB < 500) {
    // 500KB未満: LocalStorage
    try {
      localStorage.setItem(`photo-${Date.now()}`, photoData);
      return { storage: 'localStorage', size: sizeKB };
    } catch (e) {
      // 失敗したらIndexedDBにフォールバック
    }
  }

  // 500KB以上 or LocalStorage失敗: IndexedDB
  const db = await openDB('photos-db', 1);
  await db.add('photos', {
    dataURL: photoData,
    timestamp: Date.now()
  });

  return { storage: 'IndexedDB', size: sizeKB };
}
```

### 💾 自動保存パターン

#### Debounce（入力停止後に保存）

```javascript
/**
 * ユーザーの入力が止まってから保存
 */
class AutoSaver {
  constructor(saveFunction, delay = 2000) {
    this.saveFunction = saveFunction;
    this.delay = delay;
    this.timeoutId = null;
  }

  trigger(data) {
    // 既存のタイマーをクリア
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // 新しいタイマーを設定
    this.timeoutId = setTimeout(() => {
      this.saveFunction(data);
      console.log('自動保存しました');
    }, this.delay);
  }

  forceSave(data) {
    // 即座に保存
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.saveFunction(data);
  }
}

// 使用例
const autoSaver = new AutoSaver((data) => {
  localStorage.setItem('draft', JSON.stringify(data));
}, 3000); // 3秒後に保存

// ユーザーが入力するたびに呼ぶ
document.getElementById('title').addEventListener('input', (e) => {
  autoSaver.trigger({ title: e.target.value });
});

// 明示的な保存ボタン
document.getElementById('save-btn').addEventListener('click', () => {
  autoSaver.forceSave({ title: document.getElementById('title').value });
});
```

#### 定期保存（一定間隔で保存）

```javascript
/**
 * 30秒ごとに自動保存
 */
class PeriodicSaver {
  constructor(saveFunction, interval = 30000) {
    this.saveFunction = saveFunction;
    this.interval = interval;
    this.intervalId = null;
  }

  start(getDataFunction) {
    this.intervalId = setInterval(() => {
      const data = getDataFunction();
      this.saveFunction(data);
      console.log('定期保存しました:', new Date().toLocaleTimeString());
    }, this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// 使用例
const periodicSaver = new PeriodicSaver((data) => {
  localStorage.setItem('auto-save', JSON.stringify(data));
}, 30000); // 30秒ごと

periodicSaver.start(() => {
  return {
    title: document.getElementById('title').value,
    photos: app.photos,
    timestamp: Date.now()
  };
});

// ページ離脱時に停止
window.addEventListener('beforeunload', () => {
  periodicSaver.stop();
});
```

## Code Patterns / Examples

### Pattern 1: LocalStorage ヘルパークラス

```javascript
/**
 * LocalStorage を安全に使うヘルパークラス
 */
class StorageHelper {
  /**
   * データを保存（エラーハンドリング付き）
   */
  static set(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('LocalStorage容量不足');
        this.cleanup(); // 古いデータを削除
        return false;
      }
      console.error('保存エラー:', e);
      return false;
    }
  }

  /**
   * データを取得
   */
  static get(key, defaultValue = null) {
    try {
      const jsonString = localStorage.getItem(key);
      if (jsonString === null) {
        return defaultValue;
      }
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('読み込みエラー:', e);
      return defaultValue;
    }
  }

  /**
   * データを削除
   */
  static remove(key) {
    localStorage.removeItem(key);
  }

  /**
   * 全データを削除
   */
  static clear() {
    localStorage.clear();
  }

  /**
   * 古いデータをクリーンアップ
   */
  static cleanup() {
    const keys = Object.keys(localStorage);
    const autoSaveKeys = keys.filter(k => k.startsWith('auto-save-'));

    // タイムスタンプ付きのキーをソート
    autoSaveKeys.sort();

    // 古い方から削除（最新5件を残す）
    const toDelete = autoSaveKeys.slice(0, -5);
    toDelete.forEach(key => localStorage.removeItem(key));

    console.log(`${toDelete.length}件の古いデータを削除しました`);
  }

  /**
   * 使用容量を取得（概算）
   */
  static getUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return {
      bytes: totalSize,
      kb: (totalSize / 1024).toFixed(2),
      mb: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
}

// 使用例
StorageHelper.set('user-settings', { theme: 'dark', lang: 'ja' });
const settings = StorageHelper.get('user-settings', { theme: 'light' });
console.log('使用容量:', StorageHelper.getUsage());
```

### Pattern 2: IndexedDB ラッパー（idb ライブラリ使用）

```javascript
/**
 * IndexedDB を簡単に使うラッパークラス
 * 依存: idb ライブラリ (https://github.com/jakearchibald/idb)
 */
import { openDB } from 'idb';

class NewsletterDB {
  constructor() {
    this.dbName = 'newsletter-maker-db';
    this.version = 1;
    this.db = null;
  }

  /**
   * データベースを初期化
   */
  async init() {
    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        // 写真ストア
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        // 下書きストア
        if (!db.objectStoreNames.contains('drafts')) {
          const draftStore = db.createObjectStore('drafts', {
            keyPath: 'id',
            autoIncrement: true
          });
          draftStore.createIndex('timestamp', 'timestamp');
        }

        // テンプレートストア
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      }
    });

    console.log('Database initialized');
  }

  /**
   * 写真を保存
   */
  async savePhoto(dataURL, metadata = {}) {
    const photo = {
      dataURL,
      metadata,
      timestamp: Date.now()
    };

    const id = await this.db.add('photos', photo);
    return id;
  }

  /**
   * 写真を取得
   */
  async getPhoto(id) {
    return await this.db.get('photos', id);
  }

  /**
   * 全ての写真を取得
   */
  async getAllPhotos() {
    return await this.db.getAll('photos');
  }

  /**
   * 写真を削除
   */
  async deletePhoto(id) {
    await this.db.delete('photos', id);
  }

  /**
   * 下書きを保存
   */
  async saveDraft(data) {
    const draft = {
      ...data,
      timestamp: Date.now()
    };

    const id = await this.db.put('drafts', draft);
    return id;
  }

  /**
   * 最新の下書きを取得
   */
  async getLatestDraft() {
    const tx = this.db.transaction('drafts', 'readonly');
    const index = tx.store.index('timestamp');
    const cursor = await index.openCursor(null, 'prev'); // 降順

    return cursor ? cursor.value : null;
  }

  /**
   * 全ての下書きを削除
   */
  async clearDrafts() {
    await this.db.clear('drafts');
  }

  /**
   * データベースサイズを取得（概算）
   */
  async getSize() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
      quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
      percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    };
  }
}

// 使用例
const db = new NewsletterDB();
await db.init();

// 写真を保存
const photoId = await db.savePhoto('data:image/jpeg;base64,...', {
  fileName: 'photo1.jpg',
  month: 7
});

// 下書きを自動保存
await db.saveDraft({
  title: '七夕の会',
  photos: [photoId],
  comments: '楽しかったです'
});

// 容量チェック
const size = await db.getSize();
console.log(`使用容量: ${size.usageMB}MB / ${size.quotaMB}MB (${size.percentUsed}%)`);
```

### Pattern 3: Electron Store の設定管理

```javascript
/**
 * Electron Store で設定を永続化
 * Main Process / Renderer Process 両方で使用可能
 */
const Store = require('electron-store');

class AppSettings {
  constructor() {
    this.store = new Store({
      defaults: {
        window: {
          width: 1200,
          height: 800,
          x: null,
          y: null
        },
        app: {
          theme: 'light',
          language: 'ja',
          autoSave: true,
          autoSaveInterval: 30000
        },
        recent: {
          files: [],
          maxFiles: 10
        }
      }
    });
  }

  /**
   * ウィンドウ位置を保存
   */
  saveWindowBounds(bounds) {
    this.store.set('window', bounds);
  }

  /**
   * ウィンドウ位置を取得
   */
  getWindowBounds() {
    return this.store.get('window');
  }

  /**
   * アプリ設定を取得
   */
  getAppSettings() {
    return this.store.get('app');
  }

  /**
   * アプリ設定を更新
   */
  updateAppSettings(settings) {
    this.store.set('app', {
      ...this.getAppSettings(),
      ...settings
    });
  }

  /**
   * 最近使ったファイルに追加
   */
  addRecentFile(filePath) {
    const recent = this.store.get('recent.files', []);

    // 重複を削除
    const filtered = recent.filter(f => f !== filePath);

    // 先頭に追加
    filtered.unshift(filePath);

    // 最大数を超えたら削除
    const maxFiles = this.store.get('recent.maxFiles', 10);
    const trimmed = filtered.slice(0, maxFiles);

    this.store.set('recent.files', trimmed);
  }

  /**
   * 最近使ったファイルを取得
   */
  getRecentFiles() {
    return this.store.get('recent.files', []);
  }

  /**
   * 全設定をリセット
   */
  reset() {
    this.store.clear();
  }
}

// 使用例（Main Process）
const settings = new AppSettings();

// ウィンドウ位置を復元
const bounds = settings.getWindowBounds();
const mainWindow = new BrowserWindow({
  width: bounds.width,
  height: bounds.height,
  x: bounds.x,
  y: bounds.y
});

// ウィンドウ移動/リサイズ時に保存
mainWindow.on('close', () => {
  settings.saveWindowBounds(mainWindow.getBounds());
});

// ファイルを開いたら履歴に追加
settings.addRecentFile('/path/to/newsletter.json');
```

### Pattern 4: バックアップ・復元機能

```javascript
/**
 * データのバックアップ・復元
 */
class BackupManager {
  /**
   * 全データをエクスポート
   */
  async exportBackup() {
    const backup = {
      version: '1.0',
      timestamp: Date.now(),
      localStorage: {},
      indexedDB: {}
    };

    // LocalStorage を全てエクスポート
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        backup.localStorage[key] = localStorage[key];
      }
    }

    // IndexedDB を全てエクスポート
    const db = new NewsletterDB();
    await db.init();

    backup.indexedDB.photos = await db.getAllPhotos();
    backup.indexedDB.drafts = await db.db.getAll('drafts');

    // JSON ファイルとしてダウンロード
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-backup-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    return backup;
  }

  /**
   * バックアップを復元
   */
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result);

          // LocalStorage を復元
          for (let key in backup.localStorage) {
            localStorage.setItem(key, backup.localStorage[key]);
          }

          // IndexedDB を復元
          const db = new NewsletterDB();
          await db.init();

          // 既存データをクリア
          await db.db.clear('photos');
          await db.db.clear('drafts');

          // データを復元
          for (let photo of backup.indexedDB.photos || []) {
            await db.db.add('photos', photo);
          }

          for (let draft of backup.indexedDB.drafts || []) {
            await db.db.add('drafts', draft);
          }

          console.log('バックアップを復元しました');
          resolve(backup);
        } catch (error) {
          console.error('復元エラー:', error);
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 自動バックアップ（定期実行）
   */
  startAutoBackup(intervalMs = 3600000) {
    // 1時間ごとにバックアップ
    setInterval(async () => {
      const backup = await this.exportBackup();
      console.log('自動バックアップ完了:', new Date().toLocaleTimeString());

      // Electron の場合はファイルとして保存
      if (window.electronAPI) {
        await window.electronAPI.saveBackup(JSON.stringify(backup));
      }
    }, intervalMs);
  }
}

// 使用例
const backupManager = new BackupManager();

// バックアップボタン
document.getElementById('export-btn').addEventListener('click', async () => {
  await backupManager.exportBackup();
  alert('バックアップをダウンロードしました');
});

// 復元ボタン
document.getElementById('import-btn').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await backupManager.importBackup(file);
    alert('バックアップを復元しました');
    location.reload();
  }
});
```

### Pattern 5: ストレージ容量監視

```javascript
/**
 * ストレージ容量を監視して警告
 */
class StorageMonitor {
  constructor(warningThreshold = 0.8) {
    this.warningThreshold = warningThreshold; // 80%で警告
  }

  /**
   * 容量チェック
   */
  async check() {
    if (!navigator.storage || !navigator.storage.estimate) {
      console.warn('Storage API not supported');
      return null;
    }

    const estimate = await navigator.storage.estimate();
    const percentUsed = estimate.usage / estimate.quota;

    const status = {
      usage: estimate.usage,
      quota: estimate.quota,
      usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
      quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
      percentUsed: (percentUsed * 100).toFixed(2),
      isWarning: percentUsed >= this.warningThreshold
    };

    if (status.isWarning) {
      this.showWarning(status);
    }

    return status;
  }

  /**
   * 警告を表示
   */
  showWarning(status) {
    const message = `
      ストレージ容量が不足しています。
      使用容量: ${status.usageMB}MB / ${status.quotaMB}MB (${status.percentUsed}%)

      古いデータを削除してください。
    `;

    console.warn(message);

    // UI に警告を表示
    if (window.showToast) {
      showToast(message, 'error', 5000);
    }
  }

  /**
   * 定期監視を開始
   */
  startMonitoring(intervalMs = 60000) {
    // 1分ごとにチェック
    setInterval(() => this.check(), intervalMs);
  }
}

// 使用例
const monitor = new StorageMonitor(0.8); // 80%で警告
await monitor.check();
monitor.startMonitoring(60000); // 1分ごと
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. エラーハンドリングなしで LocalStorage に保存

```javascript
// ❌ BAD: QuotaExceededError でクラッシュ
localStorage.setItem('data', JSON.stringify(largeData));

// ✅ GOOD: try-catch でエラーハンドリング
try {
  localStorage.setItem('data', JSON.stringify(largeData));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    console.error('容量不足');
    // フォールバック処理
  }
}
```

#### 2. 同期処理で IndexedDB を使う

```javascript
// ❌ BAD: IndexedDB は非同期API
const data = db.get('photos', 1); // undefined になる

// ✅ GOOD: async/await を使う
const data = await db.get('photos', 1);
```

#### 3. Base64 画像を LocalStorage に大量保存

```javascript
// ❌ BAD: すぐに5MB制限に達する
photos.forEach(photo => {
  localStorage.setItem(`photo-${photo.id}`, photo.dataURL);
});

// ✅ GOOD: IndexedDB に保存
const db = new NewsletterDB();
for (let photo of photos) {
  await db.savePhoto(photo.dataURL);
}
```

#### 4. 自動保存の頻度が高すぎる

```javascript
// ❌ BAD: 1文字入力するたびに保存（負荷大）
input.addEventListener('input', () => {
  localStorage.setItem('draft', input.value);
});

// ✅ GOOD: Debounce で保存頻度を制限
const autoSaver = new AutoSaver(data => {
  localStorage.setItem('draft', JSON.stringify(data));
}, 3000);

input.addEventListener('input', () => {
  autoSaver.trigger({ text: input.value });
});
```

## Integration with Other Skills

### 🖼️ canvas-image-processing-expert との連携

```javascript
// 画像をリサイズしてから保存（容量節約）
async function saveOptimizedPhoto(file) {
  // リサイズ（1200×900、品質0.85）
  const resized = await resizeImage(file, 1200, 900, 0.85);

  // IndexedDB に保存
  const db = new NewsletterDB();
  const id = await db.savePhoto(resized, {
    originalName: file.name,
    originalSize: file.size
  });

  return id;
}
```

### 🎨 senior-friendly-ui-expert との連携

```javascript
// 自動保存中のインジケーター表示
async function autoSaveWithFeedback(data) {
  LoadingIndicator.show('自動保存しています...');

  try {
    await db.saveDraft(data);
    LoadingIndicator.hide();
    showToast('自動保存しました', 'success', 2000);
  } catch (error) {
    LoadingIndicator.hide();
    showToast('保存に失敗しました', 'error', 3000);
  }
}
```

## Resources

- **LocalStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **idb library**: https://github.com/jakearchibald/idb
- **Electron Store**: https://github.com/sindresorhus/electron-store
- **Storage Quota**: https://web.dev/storage-for-the-web/

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (Offline-First Architecture)
