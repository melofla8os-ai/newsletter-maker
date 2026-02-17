// メインアプリケーション

class NewsletterApp {
    constructor() {
        this.selectedMonth = null;
        this.selectedLayoutType = null; // 選択されたレイアウトタイプ
        this.photos = [];
        this.eventTitle = '';
        this.eventDate = '';
        this.comment = '';
        this.currentTemplate = null;

        // セクションタイトル（レイアウトごとのデフォルト値）
        this.sectionTitles = {
            'mixed-sections': {
                section1: '午前の部',
                section2: '午後の部',
                section3: 'エンディング'
            },
            'magazine-3col': {
                section1: '活動①',
                section2: '活動②',
                section3: '活動③'
            }
        };

        // Undo履歴管理（最大5回）
        this.history = [];
        this.maxHistorySize = 5;

        // カスタマイズ設定
        this.customColors = null; // null = テンプレートのデフォルト使用
        this.customFontSizes = {
            titleFontSize: 26,
            commentFontSize: 11
        };

        this.init();
    }

    init() {
        this.loadFromLocalStorage(); // ローカルストレージから復元
        this.renderLayoutSelector(); // レイアウト選択UIを生成
        this.setupEventListeners();
        this.initCustomize(); // カスタマイズUI初期化
        this.updateProgress(); // 初期進捗状態を更新
        this.updateUndoButton(); // Undoボタンの初期状態を更新
        console.log('Newsletter Maker initialized!');
    }

    setupEventListeners() {
        // 月選択
        const monthSelect = document.getElementById('monthSelect');
        monthSelect.addEventListener('change', (e) => this.onMonthChange(e));

        // ファイル選択
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.onFileSelect(e));

        // ドラッグ&ドロップ
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => this.onDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.onDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.onDrop(e));

        // コメント生成
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.generateComment());

        // プレビュー
        const previewBtn = document.getElementById('previewBtn');
        previewBtn.addEventListener('click', () => this.showPreview());

        // 印刷
        const printBtn = document.getElementById('printBtn');
        printBtn.addEventListener('click', () => this.print());

        // PDF保存
        const pdfBtn = document.getElementById('pdfBtn');
        pdfBtn.addEventListener('click', () => this.savePDF());

        // タイトル・日付入力
        const eventTitle = document.getElementById('eventTitle');
        eventTitle.addEventListener('input', (e) => {
            this.eventTitle = e.target.value;
            this.updateProgress(); // 進捗更新
        });

        const eventDate = document.getElementById('eventDate');
        eventDate.addEventListener('change', (e) => {
            this.eventDate = e.target.value;
            this.updateProgress(); // 進捗更新
        });

        // コメント編集
        const commentText = document.getElementById('commentText');
        commentText.addEventListener('input', (e) => {
            this.comment = e.target.value;

            // コメント長チェック（200文字超過で警告）
            const warning = document.getElementById('commentLengthWarning');
            if (e.target.value.length > 200) {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        });
    }

    // 月選択時
    onMonthChange(e) {
        // 変更前の状態を履歴に保存
        if (this.selectedMonth !== null) {
            this.saveStateToHistory();
        }

        this.selectedMonth = parseInt(e.target.value);
        if (!this.selectedMonth) return;

        this.customColors = null; // 月変更時はカスタマイズをリセット
        this.currentTemplate = getTemplate(this.selectedMonth);
        commentGenerator.setTemplate(this.selectedMonth);
        this.updateProgress(); // 進捗更新

        // カスタマイズパネルを表示してカラーピッカーを同期
        const customizeStep = document.getElementById('customizeStep');
        if (customizeStep) customizeStep.style.display = 'block';
        this.syncColorPickersFromTemplate();

        // レイアウトが未選択なら、テンプレートのデフォルトレイアウトを設定
        if (!this.selectedLayoutType) {
            this.selectedLayoutType = this.currentTemplate.layoutType;
            this.updateLayoutSelector();
        }

        // デフォルトイベント名を設定
        const eventTitleInput = document.getElementById('eventTitle');
        if (!eventTitleInput.value) {
            eventTitleInput.value = this.currentTemplate.defaultEventName;
            this.eventTitle = this.currentTemplate.defaultEventName;
        }

        // 月変更後も現在のレイアウトに応じてステップ4.5の表示を更新
        this.showSectionTitleEditor(this.selectedLayoutType);

        this.saveToLocalStorage(); // 状態を保存
        console.log(`月選択: ${this.selectedMonth}月 - ${this.currentTemplate.name}`);
    }

    // ファイル選択時
    onFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addPhotos(files);
    }

    // ドラッグオーバー
    onDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    // ドラッグリーブ
    onDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    // ドロップ
    onDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        this.addPhotos(files);
    }

    // 写真追加
    addPhotos(files) {
        // 変更前の状態を履歴に保存
        if (this.photos.length > 0) {
            this.saveStateToHistory();
        }

        // 選択されたレイアウトの上限を取得（未選択なら20枚）
        const layout = LAYOUT_TEMPLATES[this.selectedLayoutType];
        const maxPhotos = layout?.photoSlots || 20;
        const remainingSlots = maxPhotos - this.photos.length;

        // 上限到達チェック
        if (remainingSlots === 0) {
            alert(`📸 写真の上限に達しています！\n\n現在のレイアウト: 最大${maxPhotos}枚\n\n【対処法】\n✅ ステップ2でレイアウトを変更する\n✅ 不要な写真の「×」ボタンで削除する`);
            return;
        }

        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photos.push({
                    file: file,
                    data: e.target.result,
                    name: file.name
                });
                this.renderPhotos();
            };
            reader.readAsDataURL(file);
        });

        if (files.length > remainingSlots) {
            alert(`現在のレイアウトは${maxPhotos}枚までです。\n${remainingSlots}枚のみ追加しました。`);
        }
    }

    // 写真削除
    removePhoto(index) {
        // 削除前の状態を履歴に保存
        this.saveStateToHistory();

        this.photos.splice(index, 1);
        this.renderPhotos();
    }

    // 写真表示
    renderPhotos() {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            const img = document.createElement('img');
            img.src = photo.data;
            img.alt = photo.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'photo-remove';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removePhoto(index);

            photoItem.appendChild(img);
            photoItem.appendChild(removeBtn);
            photoPreview.appendChild(photoItem);
        });

        // 写真枚数/上限を表示
        const layout = LAYOUT_TEMPLATES[this.selectedLayoutType];
        const maxPhotos = layout?.photoSlots || 20;
        console.log(`写真数: ${this.photos.length} / ${maxPhotos}`);

        // 写真数表示を更新（ステップ3のヘッダーに追加）
        this.updatePhotoCount();
    }

    // 写真枚数表示を更新
    updatePhotoCount() {
        const layout = LAYOUT_TEMPLATES[this.selectedLayoutType];
        const maxPhotos = layout?.photoSlots || 20;

        // 写真プレビューの親セクションを取得
        const photoSection = document.querySelector('#photoPreview').closest('.step-section');
        if (!photoSection) return;

        // 既存の枚数表示を削除
        const existingCount = photoSection.querySelector('.photo-count-display');
        if (existingCount) {
            existingCount.remove();
        }

        // 枚数表示を追加（写真が1枚以上ある場合のみ）
        if (this.photos.length > 0) {
            const countDisplay = document.createElement('div');
            countDisplay.className = 'photo-count-display';
            countDisplay.style.cssText = `
                margin-top: 15px;
                padding: 12px;
                background: ${this.photos.length >= maxPhotos ? '#ffe0e6' : '#e8f4ff'};
                border: 2px solid ${this.photos.length >= maxPhotos ? '#f5576c' : '#667eea'};
                border-radius: 8px;
                text-align: center;
                font-size: 1.1rem;
                font-weight: bold;
                color: ${this.photos.length >= maxPhotos ? '#f5576c' : '#667eea'};
            `;
            countDisplay.innerHTML = `📸 ${this.photos.length} / ${maxPhotos}枚`;

            photoSection.querySelector('#photoPreview').after(countDisplay);
        }

        this.saveToLocalStorage();
        this.updateProgress(); // 進捗更新
    }

    // コメント生成
    generateComment() {
        if (!this.selectedMonth) {
            alert('📅 月が選択されていません！\n\n【対処法】\n✅ ステップ1で月を選択してください\n（例: 1月 - 新年会）');
            return;
        }

        // コメント生成前の状態を履歴に保存
        if (this.comment) {
            this.saveStateToHistory();
        }

        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;

        this.comment = commentGenerator.generateComment(eventTitle, eventDate);

        // コメント表示
        const commentArea = document.getElementById('commentArea');
        const commentText = document.getElementById('commentText');

        commentArea.style.display = 'block';
        commentText.value = this.comment;

        this.updateProgress(); // 進捗更新
        console.log('コメント生成完了');
    }

    // プレビュー表示
    showPreview() {
        if (!this.selectedMonth) {
            alert('📅 月が選択されていません！\n\n【対処法】\n✅ ステップ1で月を選択してください');
            return;
        }

        if (this.photos.length === 0) {
            alert('📸 写真が追加されていません！\n\n【対処法】\n✅ ステップ3でファイルを選択\n✅ または写真をドラッグ&ドロップ');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = this.generatePreviewHTML();
        previewArea.classList.add('active');

        // 画像読み込み完了後にA4フィット確認（500ms待機）
        setTimeout(() => {
            this.checkAndAdjustA4Fit();
            // Quick編集ボタンを追加
            this.addQuickEditButtons();
            // 進捗更新
            this.updateProgress();
        }, 500);

        console.log('プレビュー表示');
    }

    /**
     * A4サイズに収まるかチェックし、必要なら自動調整
     */
    checkAndAdjustA4Fit() {
        const wrapper = document.querySelector('.preview-wrapper > div');
        if (!wrapper) return;

        // 実際のレンダリング高さを測定
        const actualHeightPx = wrapper.scrollHeight;
        const actualHeightMm = actualHeightPx * 0.264583; // 96 DPI: 1px = 0.264583mm
        const maxHeightMm = 287; // A4高さ (297mm) - パディング (10mm) ※余白を小さく

        console.log(`実際の高さ: ${actualHeightMm.toFixed(1)}mm (上限: ${maxHeightMm}mm)`);

        if (actualHeightMm > maxHeightMm) {
            // 縮小率を計算
            const scale = maxHeightMm / actualHeightMm;

            // zoom プロパティで縮小（レイアウトフローに影響するため余白が出ない）
            wrapper.style.zoom = scale;

            // 警告表示
            this.showA4OverflowWarning(actualHeightMm, scale);
        } else {
            // 縮小不要の場合はリセット
            wrapper.style.zoom = '';
            this.hideA4OverflowWarning();
        }
    }

    /**
     * A4オーバーフロー警告を表示
     */
    showA4OverflowWarning(actualHeight, scale) {
        let warning = document.getElementById('a4OverflowWarning');

        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'a4OverflowWarning';
            warning.style.cssText = `
                margin-top: 15px;
                padding: 15px;
                background: #fff3cd;
                border: 2px solid #ffc107;
                border-radius: 8px;
                color: #856404;
                font-size: 1rem;
                line-height: 1.6;
            `;

            const previewArea = document.getElementById('previewArea');
            previewArea.appendChild(warning);
        }

        warning.innerHTML = `
            ⚠️ <strong>コンテンツが自動で縮小されました</strong><br>
            実際の高さ: ${actualHeight.toFixed(0)}mm（A4上限: 287mm）<br>
            縮小率: ${(scale * 100).toFixed(1)}%<br>
            <small>💡 コメント文字数を減らすと、より大きく表示できます</small>
        `;
        warning.style.display = 'block';
    }

    /**
     * A4オーバーフロー警告を非表示
     */
    hideA4OverflowWarning() {
        const warning = document.getElementById('a4OverflowWarning');
        if (warning) {
            warning.style.display = 'none';
        }
    }

    // プレビューHTML生成 (レイアウトルーティング)
    generatePreviewHTML() {
        // 選択されたレイアウトタイプを使用（未選択ならテンプレートのデフォルト）
        const layoutType = this.selectedLayoutType || this.currentTemplate?.layoutType || 'grid-5x4';

        // LAYOUT_TEMPLATES から適切なジェネレーター関数を取得
        const layoutConfig = LAYOUT_TEMPLATES[layoutType];
        if (!layoutConfig) {
            console.error(`Unknown layout type: ${layoutType}`);
            return this.generateGrid5x4Layout(); // フォールバック
        }

        // ジェネレーター関数を呼び出し
        const generatorFuncName = layoutConfig.generator;
        if (typeof window[generatorFuncName] === 'function') {
            return window[generatorFuncName](this);
        } else {
            console.error(`Generator function not found: ${generatorFuncName}`);
            return this.generateGrid5x4Layout(); // フォールバック
        }
    }

    // 標準グリッド 5×4 レイアウト (既存レイアウトを維持)
    generateGrid5x4Layout() {
        const template = this.currentTemplate;
        const eventTitle = document.getElementById('eventTitle').value || 'イベント';
        const eventDate = document.getElementById('eventDate').value;
        const comment = document.getElementById('commentText').value || '';

        // 日付フォーマット
        let dateStr = '';
        if (eventDate) {
            const date = new Date(eventDate);
            dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }

        // 写真をグリッド表示(最大20枚)
        const displayPhotos = this.photos.slice(0, 20);

        let html = `
            <div class="preview-wrapper">
                <div style="
                    width: 210mm;
                    height: 297mm;
                    margin: 0 auto;
                    padding: 12mm;
                    background: ${template.colors.background};
                    border: 2px solid ${template.colors.primary};
                    box-sizing: border-box;
                    font-family: 'Yu Gothic', 'Meiryo', sans-serif;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                ">
                    <!-- ヘッダー -->
                    <div style="
                        text-align: center;
                        margin-bottom: 5mm;
                        padding: 6mm;
                        background: linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%);
                        color: white;
                        border-radius: 8px;
                        flex-shrink: 0;
                    ">
                        <h1 style="
                            font-size: 26pt;
                            margin: 0 0 3mm 0;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        ">${template.decorations[0]} ${eventTitle} ${template.decorations[0]}</h1>
                        ${dateStr ? `<p style="font-size: 14pt; margin: 0;">${dateStr}</p>` : ''}
                    </div>

                    <!-- 写真グリッド -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 3mm;
                        margin-bottom: 5mm;
                        flex-shrink: 0;
                    ">
                        ${displayPhotos.map(photo => `
                            <div style="
                                aspect-ratio: 1;
                                overflow: hidden;
                                border-radius: 6px;
                                border: 2px solid ${template.colors.primary};
                                position: relative;
                            ">
                                <img src="${photo.data}" style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                    object-position: center center;
                                ">
                            </div>
                        `).join('')}
                    </div>

                    <!-- コメント -->
                    ${comment ? `
                        <div data-role="comment-section" style="
                            padding: 5mm;
                            background: white;
                            border: 2px solid ${template.colors.secondary};
                            border-radius: 8px;
                            font-size: 11pt;
                            line-height: 1.6;
                            white-space: pre-wrap;
                            flex-shrink: 0;
                            overflow: hidden;
                            max-height: 45mm;
                        ">
                            ${comment}
                        </div>
                    ` : ''}

                    <!-- デコレーション -->
                    <div style="
                        text-align: center;
                        font-size: 28pt;
                        margin-top: auto;
                        padding-top: 3mm;
                        flex-shrink: 0;
                    ">
                        ${template.decorations.join(' ')}
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // 印刷
    print() {
        if (!this.selectedMonth || this.photos.length === 0) {
            alert('🖨️ 印刷できません！\n\n【対処法】\n✅ ステップ6で「プレビュー表示」ボタンをクリック\n✅ プレビューを確認してから印刷してください');
            return;
        }

        window.print();
    }

    // PDF保存
    async savePDF() {
        if (!this.selectedMonth || this.photos.length === 0) {
            alert('📄 PDF保存できません！\n\n【対処法】\n✅ ステップ6で「プレビュー表示」ボタンをクリック\n✅ プレビューを確認してからPDF保存してください');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        if (!previewArea.innerHTML) {
            alert('📄 PDF保存できません！\n\n【対処法】\n✅ ステップ6で「プレビュー表示」ボタンをクリックしてください');
            return;
        }

        try {
            // プレビューラッパー内の実際のA4コンテンツを取得（div）
            const wrapper = document.querySelector('.preview-wrapper > div');
            if (!wrapper) {
                alert('⚠️ プレビューが見つかりません！\n\n【対処法】\n✅ ページを再読み込みしてください\n✅ もう一度プレビュー表示してください');
                return;
            }

            // Quick編集ボタンを一時的に非表示（PDF出力に含めないため）
            const quickEditBtns = wrapper.querySelectorAll('.quick-edit-btn');
            quickEditBtns.forEach(btn => btn.style.display = 'none');

            // zoom を一時的にリセット（原寸でキャンバス化するため）
            const originalZoom = wrapper.style.zoom;
            wrapper.style.zoom = '';

            // 少し待ってからキャンバス化（レンダリング完了を待つ）
            await new Promise(resolve => setTimeout(resolve, 100));

            // html2canvasを使用してキャンバスに変換
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                windowWidth: wrapper.scrollWidth,
                windowHeight: wrapper.scrollHeight
            });

            // zoom を元に戻す
            wrapper.style.zoom = originalZoom;

            // Quick編集ボタンを再表示
            quickEditBtns.forEach(btn => btn.style.display = '');

            // jsPDFでPDF生成
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            
            // A4サイズに合わせて縮尺計算
            const pageWidth = 210;
            const pageHeight = 297;
            
            // キャンバスサイズからアスペクト比を計算して配置サイズを決定
            const canvasRatio = canvas.width / canvas.height;
            const pageRatio = pageWidth / pageHeight;
            
            let finalWidth, finalHeight;
            
            if (canvasRatio > pageRatio) {
                // 横幅に合わせる（高さは余る）
                finalWidth = pageWidth;
                finalHeight = pageWidth / canvasRatio;
            } else {
                // 高さ制限に合わせる（横幅は余るかもしれないが、基本A4縦なので横幅基準でOKなはずだが、念のため）
                // 通常は横幅210mmに合わせるが、高さがはみ出る場合は高さ基準に縮小
                const heightBasedWidth = pageHeight * canvasRatio;
                if (heightBasedWidth <= pageWidth) {
                    finalHeight = pageHeight;
                    finalWidth = heightBasedWidth;
                } else {
                    finalWidth = pageWidth;
                    finalHeight = pageWidth / canvasRatio;
                }
            }
            
            // 中央配置のためのオフセット
            const x = (pageWidth - finalWidth) / 2;
            const y = 0; // 上端合わせ

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

            // ファイル名生成
            const eventTitle = document.getElementById('eventTitle').value || 'newsletter';
            const date = new Date();
            const filename = `${eventTitle}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}.pdf`;

            // Electronアプリ: ネイティブ保存ダイアログを使用
            if (window.electronAPI) {
                const savePath = await window.electronAPI.showSaveDialog(filename);
                if (!savePath) return; // キャンセル

                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                const result = await window.electronAPI.savePdfBuffer(savePath, pdfBase64);

                if (result.success) {
                    // 保存したファイルをOSで開く
                    await window.electronAPI.openFile(savePath);
                    console.log('PDF保存完了 (Electron):', savePath);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // ブラウザ: 従来のダウンロード
                pdf.save(filename);
                console.log('PDF保存完了 (Browser):', filename);
            }
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('⚠️ PDF生成中にエラーが発生しました！\n\n【対処法】\n✅ ページを再読み込みしてください\n✅ 写真のサイズが大きすぎる場合は枚数を減らしてください\n✅ 別のブラウザ（Chrome推奨）で試してください\n\nエラー詳細: ' + error.message);
        }
    }

    // ==================================================
    // レイアウト選択機能
    // ==================================================

    /**
     * レイアウト選択UIを生成
     */
    renderLayoutSelector() {
        const layoutSelector = document.getElementById('layoutSelector');
        if (!layoutSelector) return;

        // レイアウト情報とアイコン
        const layoutInfo = {
            'grid-5x4': {
                icon: '🎯',
                desc: '写真を均等に並べる標準スタイル'
            },
            'magazine-2col': {
                icon: '📰',
                desc: '大きな写真1枚と小さな写真11枚'
            },
            'magazine-3col': {
                icon: '📑',
                desc: '3つのセクションに分けて表示'
            },
            'feature-spotlight': {
                icon: '⭐',
                desc: '目立つヒーロー写真と小さなグリッド'
            },
            'mixed-sections': {
                icon: '🎨',
                desc: '複数セクションを組み合わせたスタイル'
            }
        };

        // レイアウトカードを生成
        layoutSelector.innerHTML = Object.keys(LAYOUT_TEMPLATES).map(layoutType => {
            const layout = LAYOUT_TEMPLATES[layoutType];
            const info = layoutInfo[layoutType] || { icon: '📄', desc: '' };

            return `
                <div class="layout-card ${this.selectedLayoutType === layoutType ? 'selected' : ''}"
                     data-layout="${layoutType}"
                     onclick="app.onLayoutSelect('${layoutType}')">
                    <div class="layout-card-icon">${info.icon}</div>
                    <div class="layout-card-name">${layout.name}</div>
                    <div class="layout-card-desc">${info.desc}</div>
                    <div class="layout-card-info">📸 ${layout.photoSlots}枚まで</div>
                </div>
            `;
        }).join('');
    }

    /**
     * レイアウト選択時
     */
    onLayoutSelect(layoutType) {
        // レイアウト変更前の状態を履歴に保存
        if (this.selectedLayoutType !== null) {
            this.saveStateToHistory();
        }

        this.selectedLayoutType = layoutType;
        this.updateLayoutSelector();
        this.showSectionTitleEditor(layoutType); // セクションタイトル編集UIを表示
        this.saveToLocalStorage();
        this.updateProgress(); // 進捗更新

        const layout = LAYOUT_TEMPLATES[layoutType];
        console.log(`レイアウト選択: ${layout.name} (${layout.photoSlots}枚)`);

        // 写真枚数チェック（多すぎる場合は警告）
        if (this.photos.length > layout.photoSlots) {
            alert(`⚠️ 写真が多すぎます！\n\n現在: ${this.photos.length}枚\n上限: ${layout.photoSlots}枚\n\n${this.photos.length - layout.photoSlots}枚削除してください。`);
        }

        // 写真枚数表示を更新
        if (this.photos.length > 0) {
            this.updatePhotoCount();
        }

        // プレビューが既に表示されている場合は自動更新
        const previewArea = document.getElementById('previewArea');
        if (previewArea && previewArea.innerHTML && this.currentTemplate && this.photos.length > 0) {
            this.showPreview();
        }
    }

    /**
     * レイアウト選択状態を更新
     */
    updateLayoutSelector() {
        const cards = document.querySelectorAll('.layout-card');
        cards.forEach(card => {
            const layoutType = card.getAttribute('data-layout');
            if (layoutType === this.selectedLayoutType) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    /**
     * LocalStorageに保存
     */
    saveToLocalStorage() {
        try {
            const state = {
                selectedMonth: this.selectedMonth,
                selectedLayoutType: this.selectedLayoutType,
                sectionTitles: this.sectionTitles,
                eventTitle: this.eventTitle,
                eventDate: this.eventDate,
                comment: this.comment,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('newsletter_maker_state', JSON.stringify(state));
            console.log('状態を保存しました');
        } catch (error) {
            console.error('LocalStorage保存エラー:', error);
        }
    }

    /**
     * LocalStorageから復元
     */
    loadFromLocalStorage() {
        try {
            const stateJson = localStorage.getItem('newsletter_maker_state');
            if (!stateJson) return;

            const state = JSON.parse(stateJson);

            // 1日以上前のデータは無視（古すぎる可能性）
            const savedAt = new Date(state.savedAt);
            const now = new Date();
            const hoursDiff = (now - savedAt) / (1000 * 60 * 60);
            if (hoursDiff > 24) {
                console.log('保存データが古いためスキップ');
                return;
            }

            // 状態を復元
            if (state.selectedLayoutType) {
                this.selectedLayoutType = state.selectedLayoutType;
            }

            if (state.sectionTitles) {
                this.sectionTitles = state.sectionTitles;
            }

            console.log('状態を復元しました');
        } catch (error) {
            console.error('LocalStorage読み込みエラー:', error);
        }
    }

    /**
     * セクションタイトル編集UIを表示
     */
    showSectionTitleEditor(layoutType) {
        const step = document.getElementById('sectionTitleStep');
        const container = document.getElementById('sectionTitleInputs');

        // セクションタイトルが編集可能なレイアウトのみ表示
        const editableLayouts = ['mixed-sections', 'magazine-3col'];

        if (!editableLayouts.includes(layoutType)) {
            step.style.display = 'none';
            return;
        }

        step.style.display = 'block';
        const titles = this.sectionTitles[layoutType];

        // 入力フィールドを生成
        container.innerHTML = Object.keys(titles).map((key, index) => `
            <div class="input-group">
                <label for="${key}" style="font-size: 1.1rem;">セクション${index + 1}:</label>
                <input type="text"
                       id="${key}"
                       value="${titles[key]}"
                       placeholder="例: ゲームタイム"
                       style="font-size: 1.1rem; padding: 15px; width: 100%; max-width: 500px;">
            </div>
        `).join('');

        // イベントリスナーを追加
        Object.keys(titles).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.sectionTitles[layoutType][key] = e.target.value;
                    this.saveToLocalStorage();

                    // プレビューが表示されている場合は自動更新
                    const previewArea = document.getElementById('previewArea');
                    if (previewArea && previewArea.innerHTML && this.currentTemplate && this.photos.length > 0) {
                        this.showPreview();
                    }
                });
            }
        });
    }

    /**
     * Quick編集ボタンをプレビューに追加
     */
    addQuickEditButtons() {
        const wrapper = document.querySelector('.preview-wrapper > div');
        if (!wrapper) return;

        // ヘッダー部分に編集ボタンを追加
        const header = wrapper.querySelector('div[style*="linear-gradient"]');
        if (header && !header.querySelector('.quick-edit-btn')) {
            const editBtn = this.createEditButton('eventTitle', 'タイトル・日付を編集');
            editBtn.style.cssText = `
                position: absolute;
                top: 5mm;
                right: 5mm;
                z-index: 10;
            `;
            header.style.position = 'relative';
            header.appendChild(editBtn);
        }

        // コメントセクションに編集ボタンを追加
        const commentSection = wrapper.querySelector('div[data-role="comment-section"]');
        if (commentSection && !commentSection.querySelector('.quick-edit-btn')) {
            const editBtn = this.createEditButton('commentText', 'コメントを編集');
            editBtn.style.cssText = `
                position: absolute;
                top: 3mm;
                right: 3mm;
                z-index: 10;
            `;
            commentSection.style.position = 'relative';
            commentSection.appendChild(editBtn);
        }

        // セクションタイトル編集ボタン（該当レイアウトのみ）
        const layoutType = this.selectedLayoutType || this.currentTemplate?.layoutType;
        if (layoutType === 'mixed-sections' || layoutType === 'magazine-3col') {
            const sectionHeaders = wrapper.querySelectorAll('.section-title');
            sectionHeaders.forEach((header, index) => {
                if (!header.querySelector('.quick-edit-btn')) {
                    const editBtn = this.createEditButton('sectionTitleInputs', `セクション${index + 1}を編集`, true);
                    editBtn.style.cssText = `
                        position: absolute;
                        top: 1mm;
                        right: 1mm;
                        z-index: 10;
                        font-size: 10pt;
                        padding: 3px 8px;
                    `;
                    header.style.position = 'relative';
                    header.appendChild(editBtn);
                }
            });
        }

        console.log('Quick編集ボタンを追加しました');
    }

    /**
     * 編集ボタン要素を作成
     */
    createEditButton(targetId, label = '編集', isSmall = false) {
        const btn = document.createElement('button');
        btn.className = 'quick-edit-btn';
        btn.innerHTML = `✏️ ${label}`;
        btn.dataset.target = targetId;
        btn.style.cssText = `
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            border: 2px solid #4CAF50;
            border-radius: 6px;
            padding: ${isSmall ? '6px 12px' : '10px 20px'};
            font-size: ${isSmall ? '12pt' : '14pt'};
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s;
        `;

        // ホバー効果
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#4CAF50';
            btn.style.color = 'white';
            btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(255, 255, 255, 0.95)';
            btn.style.color = '#333';
            btn.style.transform = 'scale(1)';
        });

        // クリックイベント
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.scrollToInput(targetId);
        });

        return btn;
    }

    /**
     * 指定された入力欄にスムーズスクロール
     */
    scrollToInput(targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            console.warn(`Target element not found: ${targetId}`);
            return;
        }

        // スムーズスクロール
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // 少し待ってからフォーカス（スクロール完了を待つ）
        setTimeout(() => {
            if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                targetElement.focus();
                // テキストエリアの場合は末尾にカーソル移動
                if (targetElement.tagName === 'TEXTAREA') {
                    targetElement.setSelectionRange(targetElement.value.length, targetElement.value.length);
                }
            } else {
                // セクション全体の場合は最初の入力欄にフォーカス
                const firstInput = targetElement.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }

            // ハイライト効果
            const originalBg = targetElement.style.background;
            targetElement.style.background = '#ffffcc';
            setTimeout(() => {
                targetElement.style.background = originalBg;
            }, 1500);
        }, 600);

        console.log(`Scrolled to: ${targetId}`);
    }

    /**
     * 進捗状態を更新
     */
    updateProgress() {
        // 各ステップの完了状態をチェック
        const steps = [
            { id: 1, completed: this.selectedMonth !== null },                           // ステップ1: 月選択
            { id: 2, completed: this.selectedLayoutType !== null },                       // ステップ2: レイアウト選択
            { id: 3, completed: this.photos.length > 0 },                                 // ステップ3: 写真アップロード
            { id: 4, completed: this.eventTitle && this.eventTitle.trim() !== '' },      // ステップ4: タイトル入力
            { id: 5, completed: this.comment && this.comment.trim() !== '' },            // ステップ5: コメント生成
            { id: 6, completed: document.getElementById('previewArea').innerHTML !== '' } // ステップ6: プレビュー表示
        ];

        // 完了したステップ数をカウント
        const completedCount = steps.filter(step => step.completed).length;
        const totalSteps = steps.length;
        const progressPercentage = Math.round((completedCount / totalSteps) * 100);

        // 進捗バーを更新
        const progressFill = document.getElementById('progressFill');
        const progressPercentageText = document.getElementById('progressPercentage');

        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }

        if (progressPercentageText) {
            progressPercentageText.textContent = `${progressPercentage}%`;
        }

        // 各ステップの表示を更新
        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`.progress-step[data-step="${step.id}"]`);
            if (stepElement) {
                // 完了状態をリセット
                stepElement.classList.remove('completed', 'current');

                if (step.completed) {
                    // 完了済み
                    stepElement.classList.add('completed');
                } else if (index === 0 || steps[index - 1].completed) {
                    // 次に実行すべきステップ（前のステップが完了している、または最初のステップ）
                    stepElement.classList.add('current');
                }
            }
        });

        console.log(`進捗: ${completedCount}/${totalSteps} (${progressPercentage}%)`);
    }

    /**
     * 現在の状態を履歴に保存
     */
    saveStateToHistory() {
        // 現在の状態をコピー
        const currentState = {
            selectedMonth: this.selectedMonth,
            selectedLayoutType: this.selectedLayoutType,
            photos: JSON.parse(JSON.stringify(this.photos)), // ディープコピー
            eventTitle: this.eventTitle,
            eventDate: this.eventDate,
            comment: this.comment,
            sectionTitles: JSON.parse(JSON.stringify(this.sectionTitles)),
            timestamp: Date.now()
        };

        // 履歴に追加
        this.history.push(currentState);

        // 最大サイズを超えたら古いものを削除
        if (this.history.length > this.maxHistorySize) {
            this.history.shift(); // 最も古い履歴を削除
        }

        // Undoボタンの状態を更新
        this.updateUndoButton();

        console.log(`履歴保存: ${this.history.length}/${this.maxHistorySize}`);
    }

    /**
     * Undo: 前の状態に戻す
     */
    undo() {
        if (this.history.length === 0) {
            alert('⏮️ これ以上戻せません！\n\n履歴がありません。');
            return;
        }

        // 最後の履歴を取り出す
        const previousState = this.history.pop();

        // 状態を復元
        this.selectedMonth = previousState.selectedMonth;
        this.selectedLayoutType = previousState.selectedLayoutType;
        this.photos = previousState.photos;
        this.eventTitle = previousState.eventTitle;
        this.eventDate = previousState.eventDate;
        this.comment = previousState.comment;
        this.sectionTitles = previousState.sectionTitles;

        // UIを更新
        this.restoreUI();

        // Undoボタンの状態を更新
        this.updateUndoButton();

        console.log(`Undo実行: 残り履歴${this.history.length}件`);
    }

    /**
     * UIを現在の状態に復元
     */
    restoreUI() {
        // 月選択
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.value = this.selectedMonth || '';
            if (this.selectedMonth) {
                this.currentTemplate = getTemplate(this.selectedMonth);
            }
        }

        // レイアウト選択
        this.updateLayoutSelector();

        // 写真
        this.renderPhotos();

        // タイトル・日付
        const eventTitleInput = document.getElementById('eventTitle');
        const eventDateInput = document.getElementById('eventDate');
        if (eventTitleInput) eventTitleInput.value = this.eventTitle || '';
        if (eventDateInput) eventDateInput.value = this.eventDate || '';

        // コメント
        const commentText = document.getElementById('commentText');
        if (commentText) {
            commentText.value = this.comment || '';
            const commentArea = document.getElementById('commentArea');
            if (this.comment && commentArea) {
                commentArea.style.display = 'block';
            }
        }

        // セクションタイトル編集UI
        if (this.selectedLayoutType) {
            this.showSectionTitleEditor(this.selectedLayoutType);
        }

        // 進捗更新
        this.updateProgress();

        // LocalStorageにも保存
        this.saveToLocalStorage();
    }

    // ====================================
    // テンプレートカスタマイズ機能
    // ====================================

    /**
     * カスタマイズUIの初期化
     */
    initCustomize() {
        // プリセット定義
        const presets = [
            { name: '🌸 春', primary: '#FF69B4', secondary: '#FFB6C1', background: '#FFF0F5' },
            { name: '🌿 夏', primary: '#228B22', secondary: '#90EE90', background: '#F0FFF0' },
            { name: '🍁 秋', primary: '#FF6347', secondary: '#FFD700', background: '#FFF8DC' },
            { name: '❄️ 冬', primary: '#4169E1', secondary: '#87CEEB', background: '#F0F8FF' },
            { name: '🎌 和風', primary: '#DC143C', secondary: '#FFD700', background: '#FFF8DC' },
            { name: '💜 パープル', primary: '#9370DB', secondary: '#DDA0DD', background: '#F8F0FF' },
        ];

        const presetGrid = document.getElementById('presetGrid');
        if (presetGrid) {
            presetGrid.innerHTML = presets.map((p, i) => `
                <button class="preset-btn" data-preset="${i}"
                    style="background: linear-gradient(135deg, ${p.primary}, ${p.secondary});"
                    onclick="app.applyPreset(${i})">${p.name}</button>
            `).join('');
        }
        this._presets = presets;

        // スライダーのリアルタイム表示
        const titleSlider = document.getElementById('titleFontSize');
        const commentSlider = document.getElementById('commentFontSize');
        if (titleSlider) {
            titleSlider.addEventListener('input', (e) => {
                document.getElementById('titleFontVal').textContent = e.target.value;
                this.customFontSizes.titleFontSize = parseInt(e.target.value);
            });
        }
        if (commentSlider) {
            commentSlider.addEventListener('input', (e) => {
                document.getElementById('commentFontVal').textContent = e.target.value;
                this.customFontSizes.commentFontSize = parseInt(e.target.value);
            });
        }

        // カラーピッカーのリアルタイム同期
        ['customPrimary', 'customSecondary', 'customBackground'].forEach(id => {
            const picker = document.getElementById(id);
            if (picker) {
                picker.addEventListener('input', () => this.syncColorPreviews());
            }
        });

        // ボタンのイベント
        document.getElementById('applyCustomizeBtn')?.addEventListener('click', () => this.applyCustomize());
        document.getElementById('resetCustomizeBtn')?.addEventListener('click', () => this.resetCustomize());

        // 月が選択されていれば初期カラーを設定
        if (this.currentTemplate) {
            this.syncColorPickersFromTemplate();
        }
    }

    /**
     * テンプレートのカラーをカラーピッカーに反映
     */
    syncColorPickersFromTemplate() {
        const template = this.currentTemplate;
        if (!template) return;

        const colors = this.customColors || template.colors;

        const primary = document.getElementById('customPrimary');
        const secondary = document.getElementById('customSecondary');
        const background = document.getElementById('customBackground');

        if (primary) primary.value = this.toHex(colors.primary);
        if (secondary) secondary.value = this.toHex(colors.secondary);
        if (background) background.value = this.toHex(colors.background);

        this.syncColorPreviews();
    }

    /**
     * カラープレビュー円を更新
     */
    syncColorPreviews() {
        const ids = [
            ['customPrimary', 'primaryPreview'],
            ['customSecondary', 'secondaryPreview'],
            ['customBackground', 'backgroundPreview'],
        ];
        ids.forEach(([pickerId, previewId]) => {
            const val = document.getElementById(pickerId)?.value;
            const preview = document.getElementById(previewId);
            if (val && preview) preview.style.background = val;
        });
    }

    /**
     * プリセットを適用
     */
    applyPreset(index) {
        const preset = this._presets[index];
        if (!preset) return;

        document.getElementById('customPrimary').value = preset.primary;
        document.getElementById('customSecondary').value = preset.secondary;
        document.getElementById('customBackground').value = preset.background;
        this.syncColorPreviews();

        // アクティブ表示
        document.querySelectorAll('.preset-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }

    /**
     * カスタマイズを適用してプレビューを更新
     */
    applyCustomize() {
        this.customColors = {
            primary: document.getElementById('customPrimary')?.value || this.currentTemplate?.colors.primary,
            secondary: document.getElementById('customSecondary')?.value || this.currentTemplate?.colors.secondary,
            background: document.getElementById('customBackground')?.value || this.currentTemplate?.colors.background,
        };

        // テンプレートに上書き適用（一時的）
        if (this.currentTemplate) {
            this.currentTemplate.colors = { ...this.customColors };
        }

        // フォントサイズをLayoutに反映（layouts.jsのgenerateHeader用にグローバル変数として渡す）
        window._customFontSizes = this.customFontSizes;

        this.saveToLocalStorage();

        // プレビューが表示中なら自動更新
        const previewArea = document.getElementById('previewArea');
        if (previewArea?.innerHTML && this.photos.length > 0) {
            this.showPreview();
        }

        console.log('カスタマイズ適用:', this.customColors);
    }

    /**
     * カスタマイズをリセット（テンプレートのデフォルトに戻す）
     */
    resetCustomize() {
        this.customColors = null;
        window._customFontSizes = null;

        // テンプレートのデフォルトカラーを復元
        if (this.selectedMonth) {
            this.currentTemplate = getTemplate(this.selectedMonth);
            this.syncColorPickersFromTemplate();
        }

        // スライダーをデフォルトに戻す
        const titleSlider = document.getElementById('titleFontSize');
        const commentSlider = document.getElementById('commentFontSize');
        if (titleSlider) { titleSlider.value = 26; document.getElementById('titleFontVal').textContent = '26'; }
        if (commentSlider) { commentSlider.value = 11; document.getElementById('commentFontVal').textContent = '11'; }
        this.customFontSizes = { titleFontSize: 26, commentFontSize: 11 };

        // プリセットのアクティブを解除
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

        this.saveToLocalStorage();

        // プレビューが表示中なら自動更新
        const previewArea = document.getElementById('previewArea');
        if (previewArea?.innerHTML && this.photos.length > 0) {
            this.showPreview();
        }

        console.log('カスタマイズをリセット');
    }

    /**
     * CSSカラー値を #RRGGBB 形式に変換
     */
    toHex(color) {
        if (!color) return '#ffffff';
        if (color.startsWith('#') && color.length === 7) return color;
        // rgb(r,g,b) 形式を変換
        const m = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (m) {
            return '#' + [m[1], m[2], m[3]].map(v => parseInt(v).toString(16).padStart(2, '0')).join('');
        }
        return color;
    }

    /**
     * Undoボタンの有効/無効を更新
     */
    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        const undoCount = document.getElementById('undoCount');

        if (undoBtn) {
            if (this.history.length === 0) {
                undoBtn.disabled = true;
                undoBtn.style.opacity = '0.5';
                undoBtn.style.cursor = 'not-allowed';
            } else {
                undoBtn.disabled = false;
                undoBtn.style.opacity = '1';
                undoBtn.style.cursor = 'pointer';
            }
        }

        if (undoCount) {
            undoCount.textContent = this.history.length > 0 ? `(${this.history.length})` : '';
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NewsletterApp();
});
