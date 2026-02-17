const { contextBridge, ipcRenderer } = require('electron');

// ====================================
// セキュアなAPIをレンダラーに公開
// contextIsolation で安全にブリッジ
// ====================================

contextBridge.exposeInMainWorld('electronAPI', {
    // Electronで動いているか判定
    isElectron: true,

    // PDF保存ダイアログを表示してパスを取得
    showSaveDialog: (defaultFilename) =>
        ipcRenderer.invoke('show-save-dialog', defaultFilename),

    // PDFバッファをファイルに保存
    savePdfBuffer: (filePath, base64Data) =>
        ipcRenderer.invoke('save-pdf-buffer', filePath, base64Data),

    // 保存したファイルをOSで開く
    openFile: (filePath) =>
        ipcRenderer.invoke('open-file', filePath),

    // アプリバージョン取得
    getAppVersion: () =>
        ipcRenderer.invoke('get-app-version'),
});
