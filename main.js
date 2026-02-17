const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ====================================
// ウィンドウ作成
// ====================================

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        minWidth: 900,
        minHeight: 700,
        title: '📰 新聞作成ツール - Newsletter Maker',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            // ローカル画像の読み込みを許可
            webSecurity: false,
        },
        // タイトルバーのカスタマイズ
        backgroundColor: '#667eea',
        show: false, // 準備完了後に表示
    });

    // index.html を読み込む
    win.loadFile('index.html');

    // 準備完了後に表示（フラッシュ防止）
    win.once('ready-to-show', () => {
        win.show();
    });

    // 開発時のみDevToolsを開く
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    }

    return win;
}

// ====================================
// アプリのイベントハンドリング
// ====================================

app.whenReady().then(() => {
    createWindow();

    // macOS: ドックアイコンクリック時にウィンドウを再作成
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 全ウィンドウが閉じたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ====================================
// IPC ハンドラー（レンダラーとの通信）
// ====================================

// PDF保存ダイアログ
ipcMain.handle('show-save-dialog', async (event, defaultFilename) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'PDFを保存',
        defaultPath: defaultFilename || 'newsletter.pdf',
        filters: [{ name: 'PDF ファイル', extensions: ['pdf'] }],
        buttonLabel: '保存',
    });

    if (canceled || !filePath) return null;
    return filePath;
});

// PDFファイルをディスクに保存
ipcMain.handle('save-pdf-buffer', async (event, filePath, base64Data) => {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        return { success: true, path: filePath };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// 保存したPDFをOSのデフォルトアプリで開く
ipcMain.handle('open-file', async (event, filePath) => {
    shell.openPath(filePath);
});

// アプリバージョン取得
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
