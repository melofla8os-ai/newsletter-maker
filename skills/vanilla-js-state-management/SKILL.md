---
name: vanilla-js-state-management
description: State management specialist for Vanilla JavaScript applications without frameworks. Covers Observer pattern, Pub/Sub messaging, reactive state, undo/redo implementation, and singleton patterns. Use when building complex apps without React/Vue/Angular or when framework overhead is undesirable.
version: 1.0.0
tags: vanilla-js, state-management, observer, pubsub, reactive, undo-redo, singleton, no-framework
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Vanilla JS State Management Expert

## When to Use

このスキルは以下の状況で使用してください：

- **React/Vue/Angular を使わない**プロジェクトで状態管理が必要
- **フレームワークのオーバーヘッド**を避けたい
- **既存の Vanilla JS アプリ**に状態管理を追加したい
- **Undo/Redo 機能**を実装したい
- **モジュール間の疎結合**を実現したい
- **データ変更を UI に自動反映**させたい
- **軽量で高速**なアプリケーションを作りたい

## Core Concepts & Rules

### 🎯 状態管理の基本パターン

#### 1. Observer Pattern（監視者パターン）

データが変更されたときに、登録された関数を自動実行します。

```javascript
class Observable {
  constructor(value) {
    this._value = value;
    this._observers = [];
  }

  // 値を取得
  get value() {
    return this._value;
  }

  // 値を設定（監視者に通知）
  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._notify();
    }
  }

  // 監視者を登録
  subscribe(callback) {
    this._observers.push(callback);

    // 登録解除関数を返す
    return () => {
      this._observers = this._observers.filter(obs => obs !== callback);
    };
  }

  // 全ての監視者に通知
  _notify() {
    this._observers.forEach(callback => callback(this._value));
  }
}

// 使用例
const count = new Observable(0);

// UI を更新する関数を登録
count.subscribe((value) => {
  document.getElementById('count').textContent = value;
});

// 値を変更すると自動的に UI が更新される
count.value = 10; // 画面に "10" が表示される
```

#### 2. Pub/Sub Pattern（発行/購読パターン）

イベントベースでモジュール間を疎結合にします。

```javascript
class EventBus {
  constructor() {
    this._events = {};
  }

  // イベントを購読
  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);

    // 購読解除関数を返す
    return () => this.off(event, callback);
  }

  // イベントを発行
  emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach(callback => callback(data));
    }
  }

  // 購読解除
  off(event, callback) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(cb => cb !== callback);
    }
  }
}

// グローバルなイベントバス
const eventBus = new EventBus();

// 使用例
// モジュールA: 写真追加時にイベント発行
eventBus.emit('photo:added', { id: 1, url: '...' });

// モジュールB: イベントを受信してUIを更新
eventBus.on('photo:added', (photo) => {
  console.log('写真が追加されました:', photo);
  updatePhotoGrid();
});
```

#### 3. Reactive State（リアクティブな状態）

Proxy を使って、データ変更を自動検知します。

```javascript
function createReactiveState(initialState, onChange) {
  return new Proxy(initialState, {
    set(target, property, value) {
      const oldValue = target[property];

      // 値が変更された場合のみ通知
      if (oldValue !== value) {
        target[property] = value;
        onChange(property, value, oldValue);
      }

      return true;
    }
  });
}

// 使用例
const state = createReactiveState(
  { count: 0, name: 'John' },
  (property, newValue, oldValue) => {
    console.log(`${property} changed: ${oldValue} → ${newValue}`);
  }
);

state.count = 10; // "count changed: 0 → 10"
state.name = 'Jane'; // "name changed: John → Jane"
```

### 🏗️ Singleton Pattern（シングルトン）

アプリ全体で1つのインスタンスを共有します。

```javascript
class AppState {
  constructor() {
    if (AppState.instance) {
      return AppState.instance;
    }

    this.data = {
      photos: [],
      title: '',
      comments: ''
    };

    AppState.instance = this;
  }

  // 状態を取得
  get(key) {
    return this.data[key];
  }

  // 状態を設定
  set(key, value) {
    this.data[key] = value;
  }
}

// どこから呼んでも同じインスタンス
const state1 = new AppState();
const state2 = new AppState();

console.log(state1 === state2); // true
```

### ⏮️ Undo/Redo パターン

履歴を保持して元に戻す・やり直す機能を実装します。

```javascript
class History {
  constructor(maxSize = 50) {
    this.past = [];
    this.present = null;
    this.future = [];
    this.maxSize = maxSize;
  }

  // 新しい状態を記録
  push(state) {
    // 現在の状態を過去に追加
    if (this.present !== null) {
      this.past.push(this.present);

      // 履歴サイズ制限
      if (this.past.length > this.maxSize) {
        this.past.shift();
      }
    }

    // 新しい状態を現在に設定
    this.present = state;

    // 未来をクリア（新しい操作で分岐した）
    this.future = [];
  }

  // 元に戻す
  undo() {
    if (this.past.length === 0) {
      return null;
    }

    // 現在を未来に移動
    this.future.unshift(this.present);

    // 過去から取り出して現在に設定
    this.present = this.past.pop();

    return this.present;
  }

  // やり直す
  redo() {
    if (this.future.length === 0) {
      return null;
    }

    // 現在を過去に移動
    this.past.push(this.present);

    // 未来から取り出して現在に設定
    this.present = this.future.shift();

    return this.present;
  }

  // Undo/Redo可能か
  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }
}
```

## Code Patterns / Examples

### Pattern 1: シンプルな Store クラス

```javascript
/**
 * シンプルで使いやすい Store
 */
class Store {
  constructor(initialState = {}) {
    this._state = initialState;
    this._listeners = [];
  }

  /**
   * 状態を取得
   */
  getState() {
    return this._state;
  }

  /**
   * 状態を更新
   */
  setState(updates) {
    // 新しい状態を作成（イミュータブル）
    this._state = {
      ...this._state,
      ...updates
    };

    // リスナーに通知
    this._notify();
  }

  /**
   * リスナーを登録
   */
  subscribe(listener) {
    this._listeners.push(listener);

    // 購読解除関数を返す
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * 全てのリスナーに通知
   */
  _notify() {
    this._listeners.forEach(listener => listener(this._state));
  }
}

// 使用例
const store = new Store({
  photos: [],
  title: '',
  month: 1
});

// UI を更新する関数を登録
store.subscribe((state) => {
  console.log('State updated:', state);
  updateUI(state);
});

// 状態を更新
store.setState({ title: '七夕の会' });
store.setState({ photos: [...store.getState().photos, newPhoto] });
```

### Pattern 2: Redux風のアクションベース Store

```javascript
/**
 * Redux風の状態管理
 */
class ActionStore {
  constructor(reducer, initialState = {}) {
    this._reducer = reducer;
    this._state = initialState;
    this._listeners = [];
  }

  getState() {
    return this._state;
  }

  dispatch(action) {
    // Reducer で新しい状態を計算
    this._state = this._reducer(this._state, action);

    // リスナーに通知
    this._listeners.forEach(listener => listener(this._state));

    return action;
  }

  subscribe(listener) {
    this._listeners.push(listener);

    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
}

// Reducer 関数（状態遷移ロジック）
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [...state.photos, action.payload]
      };

    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(p => p.id !== action.payload.id)
      };

    case 'SET_TITLE':
      return {
        ...state,
        title: action.payload
      };

    default:
      return state;
  }
}

// 使用例
const store = new ActionStore(appReducer, {
  photos: [],
  title: '',
  comments: ''
});

// UI 更新
store.subscribe((state) => {
  document.getElementById('title').value = state.title;
  renderPhotoGrid(state.photos);
});

// アクションを発行
store.dispatch({
  type: 'SET_TITLE',
  payload: '七夕の会'
});

store.dispatch({
  type: 'ADD_PHOTO',
  payload: { id: 1, url: 'photo1.jpg' }
});
```

### Pattern 3: Reactive State with Proxy

```javascript
/**
 * Proxy を使ったリアクティブな状態管理
 */
class ReactiveStore {
  constructor(initialState = {}) {
    this._listeners = {};

    // Proxy でラップして変更を検知
    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        const oldValue = target[property];

        // 値が変更された場合
        if (oldValue !== value) {
          target[property] = value;

          // 該当プロパティのリスナーに通知
          if (this._listeners[property]) {
            this._listeners[property].forEach(callback => {
              callback(value, oldValue);
            });
          }

          // 全体のリスナーに通知
          if (this._listeners['*']) {
            this._listeners['*'].forEach(callback => {
              callback(property, value, oldValue);
            });
          }
        }

        return true;
      }
    });
  }

  /**
   * 特定のプロパティを監視
   */
  watch(property, callback) {
    if (!this._listeners[property]) {
      this._listeners[property] = [];
    }

    this._listeners[property].push(callback);

    // 購読解除関数
    return () => {
      this._listeners[property] = this._listeners[property].filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * 全ての変更を監視
   */
  watchAll(callback) {
    if (!this._listeners['*']) {
      this._listeners['*'] = [];
    }

    this._listeners['*'].push(callback);

    return () => {
      this._listeners['*'] = this._listeners['*'].filter(cb => cb !== callback);
    };
  }
}

// 使用例
const store = new ReactiveStore({
  title: '',
  photos: [],
  month: 1
});

// タイトルの変更を監視
store.watch('title', (newValue, oldValue) => {
  console.log(`Title changed: ${oldValue} → ${newValue}`);
  document.getElementById('title-display').textContent = newValue;
});

// 写真配列の変更を監視
store.watch('photos', (newPhotos) => {
  console.log(`Photos count: ${newPhotos.length}`);
  renderPhotoGrid(newPhotos);
});

// 全ての変更を監視
store.watchAll((property, newValue) => {
  console.log(`Property "${property}" changed to:`, newValue);
  saveToLocalStorage(store.state);
});

// 状態を変更（自動的にリスナーが実行される）
store.state.title = '七夕の会';
store.state.photos = [...store.state.photos, newPhoto];
```

### Pattern 4: Undo/Redo 機能付き Store

```javascript
/**
 * Undo/Redo 機能を持つ Store
 */
class UndoableStore {
  constructor(initialState = {}) {
    this.history = new History();
    this.history.push(JSON.parse(JSON.stringify(initialState)));
    this._listeners = [];
  }

  getState() {
    return this.history.present;
  }

  setState(updates) {
    // 現在の状態に更新を適用
    const newState = {
      ...this.history.present,
      ...updates
    };

    // 履歴に追加
    this.history.push(JSON.parse(JSON.stringify(newState)));

    // リスナーに通知
    this._notify();
  }

  undo() {
    const state = this.history.undo();

    if (state) {
      this._notify();
      return state;
    }

    return null;
  }

  redo() {
    const state = this.history.redo();

    if (state) {
      this._notify();
      return state;
    }

    return null;
  }

  canUndo() {
    return this.history.canUndo();
  }

  canRedo() {
    return this.history.canRedo();
  }

  subscribe(listener) {
    this._listeners.push(listener);

    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this._listeners.forEach(listener => listener(this.getState()));
  }
}

// 使用例
const store = new UndoableStore({
  photos: [],
  title: ''
});

// UI 更新
store.subscribe((state) => {
  renderApp(state);
  updateUndoRedoButtons();
});

// Undo/Redoボタンの状態を更新
function updateUndoRedoButtons() {
  document.getElementById('undo-btn').disabled = !store.canUndo();
  document.getElementById('redo-btn').disabled = !store.canRedo();
}

// イベント登録
document.getElementById('undo-btn').addEventListener('click', () => {
  store.undo();
});

document.getElementById('redo-btn').addEventListener('click', () => {
  store.redo();
});

// 状態変更（履歴に記録される）
store.setState({ title: '七夕の会' });
store.setState({ photos: [...store.getState().photos, photo1] });
```

### Pattern 5: EventBus でモジュール間通信

```javascript
/**
 * グローバルなイベントバス
 */
class EventBus {
  constructor() {
    this._events = {};
  }

  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }

    this._events[event].push(callback);

    // 購読解除関数
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };

    this.on(event, wrapper);
  }

  emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(cb => cb !== callback);
    }
  }

  clear() {
    this._events = {};
  }
}

// グローバルインスタンス
const eventBus = new EventBus();

// 使用例: PhotoManager モジュール
class PhotoManager {
  addPhoto(photo) {
    this.photos.push(photo);

    // イベント発行
    eventBus.emit('photo:added', photo);
  }

  removePhoto(photoId) {
    this.photos = this.photos.filter(p => p.id !== photoId);

    // イベント発行
    eventBus.emit('photo:removed', { id: photoId });
  }
}

// 使用例: UIController モジュール
class UIController {
  constructor() {
    // イベント購読
    eventBus.on('photo:added', (photo) => {
      this.renderPhoto(photo);
    });

    eventBus.on('photo:removed', ({ id }) => {
      this.removePhotoElement(id);
    });
  }

  renderPhoto(photo) {
    // DOM操作
  }

  removePhotoElement(id) {
    // DOM操作
  }
}
```

### Pattern 6: Newsletter Maker 用の実践的な Store

```javascript
/**
 * Newsletter Maker 専用の状態管理
 */
class NewsletterStore {
  constructor() {
    this._state = {
      // 基本情報
      month: 1,
      title: '',
      date: '',
      layoutType: 'grid-5x4',

      // 写真
      photos: [],

      // コメント
      comments: '',

      // UI状態
      isGenerating: false,
      error: null
    };

    this._listeners = [];
    this.history = new History();
    this.history.push(this._cloneState());
  }

  getState() {
    return this._state;
  }

  /**
   * 月を変更
   */
  setMonth(month) {
    this._updateState({ month });
    eventBus.emit('month:changed', month);
  }

  /**
   * タイトルを変更
   */
  setTitle(title) {
    this._updateState({ title });
  }

  /**
   * 写真を追加
   */
  addPhoto(photo) {
    const photos = [...this._state.photos, photo];
    this._updateState({ photos });
    eventBus.emit('photo:added', photo);
  }

  /**
   * 写真を削除
   */
  removePhoto(photoId) {
    const photos = this._state.photos.filter(p => p.id !== photoId);
    this._updateState({ photos });
    eventBus.emit('photo:removed', photoId);
  }

  /**
   * コメントを設定
   */
  setComments(comments) {
    this._updateState({ comments });
  }

  /**
   * エラーを設定
   */
  setError(error) {
    this._updateState({ error });
  }

  /**
   * 状態を更新（内部メソッド）
   */
  _updateState(updates) {
    this._state = {
      ...this._state,
      ...updates
    };

    // 履歴に記録（UI状態は除く）
    if (!updates.hasOwnProperty('isGenerating') && !updates.hasOwnProperty('error')) {
      this.history.push(this._cloneState());
    }

    // リスナーに通知
    this._notify();
  }

  /**
   * 状態のクローン
   */
  _cloneState() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Undo
   */
  undo() {
    const state = this.history.undo();
    if (state) {
      this._state = state;
      this._notify();
    }
  }

  /**
   * Redo
   */
  redo() {
    const state = this.history.redo();
    if (state) {
      this._state = state;
      this._notify();
    }
  }

  subscribe(listener) {
    this._listeners.push(listener);

    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this._listeners.forEach(listener => listener(this._state));
  }
}

// グローバルインスタンス
const store = new NewsletterStore();

// UI 更新
store.subscribe((state) => {
  // タイトル表示
  document.getElementById('title-display').textContent = state.title;

  // 写真グリッド
  renderPhotoGrid(state.photos);

  // Undo/Redoボタン
  document.getElementById('undo-btn').disabled = !store.history.canUndo();
  document.getElementById('redo-btn').disabled = !store.history.canRedo();
});
```

## Anti-Patterns

### ❌ 絶対にやってはいけないこと

#### 1. 状態を直接変更する

```javascript
// ❌ BAD: 直接変更（リスナーに通知されない）
store._state.photos.push(newPhoto);

// ✅ GOOD: setState経由で変更
store.setState({ photos: [...store.getState().photos, newPhoto] });
```

#### 2. 購読解除しない

```javascript
// ❌ BAD: メモリリーク
function MyComponent() {
  store.subscribe(() => {
    // コンポーネント破棄後も実行され続ける
  });
}

// ✅ GOOD: 購読解除
function MyComponent() {
  const unsubscribe = store.subscribe(() => {
    // ...
  });

  // クリーンアップ
  onDestroy(() => {
    unsubscribe();
  });
}
```

#### 3. Undo/Redo で参照を保持

```javascript
// ❌ BAD: 参照をそのまま保存（変更が反映される）
this.history.push(this._state);

// ✅ GOOD: ディープクローン
this.history.push(JSON.parse(JSON.stringify(this._state)));
```

## Integration with Other Skills

### 💾 offline-first-storage-expert との連携

```javascript
// 状態変更時に自動保存
store.subscribe((state) => {
  // LocalStorage に保存
  StorageHelper.set('app-state', state);
});

// アプリ起動時に復元
const savedState = StorageHelper.get('app-state');
if (savedState) {
  store.setState(savedState);
}
```

## Resources

- **Observer Pattern**: https://refactoring.guru/design-patterns/observer
- **Pub/Sub Pattern**: https://davidwalsh.name/pubsub-javascript
- **Proxy MDN**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (State Management without Frameworks)
