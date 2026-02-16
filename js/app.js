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

        this.init();
    }

    init() {
        this.loadFromLocalStorage(); // ローカルストレージから復元
        this.renderLayoutSelector(); // レイアウト選択UIを生成
        this.setupEventListeners();
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
        });

        const eventDate = document.getElementById('eventDate');
        eventDate.addEventListener('change', (e) => {
            this.eventDate = e.target.value;
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
        this.selectedMonth = parseInt(e.target.value);
        if (!this.selectedMonth) return;

        this.currentTemplate = getTemplate(this.selectedMonth);
        commentGenerator.setTemplate(this.selectedMonth);

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
        // 選択されたレイアウトの上限を取得（未選択なら20枚）
        const layout = LAYOUT_TEMPLATES[this.selectedLayoutType];
        const maxPhotos = layout?.photoSlots || 20;
        const remainingSlots = maxPhotos - this.photos.length;

        // 上限到達チェック
        if (remainingSlots === 0) {
            alert(`現在のレイアウトは${maxPhotos}枚までです。\n\nレイアウトを変更するか、不要な写真を削除してください。`);
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
    }

    // コメント生成
    generateComment() {
        if (!this.selectedMonth) {
            alert('まず月を選択してください!');
            return;
        }

        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;

        this.comment = commentGenerator.generateComment(eventTitle, eventDate);

        // コメント表示
        const commentArea = document.getElementById('commentArea');
        const commentText = document.getElementById('commentText');

        commentArea.style.display = 'block';
        commentText.value = this.comment;

        console.log('コメント生成完了');
    }

    // プレビュー表示
    showPreview() {
        if (!this.selectedMonth) {
            alert('まず月を選択してください!');
            return;
        }

        if (this.photos.length === 0) {
            alert('写真を追加してください!');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = this.generatePreviewHTML();
        previewArea.classList.add('active');

        // 画像読み込み完了後にA4フィット確認（500ms待機）
        setTimeout(() => {
            this.checkAndAdjustA4Fit();
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

            // CSS transformで縮小
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.transformOrigin = 'top center';

            // 警告表示
            this.showA4OverflowWarning(actualHeightMm, scale);
        } else {
            // 縮小不要の場合はリセット
            wrapper.style.transform = 'scale(1)';
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
                        <div style="
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
            alert('プレビューを表示してから印刷してください!');
            return;
        }

        window.print();
    }

    // PDF保存
    async savePDF() {
        if (!this.selectedMonth || this.photos.length === 0) {
            alert('プレビューを表示してからPDF保存してください!');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        if (!previewArea.innerHTML) {
            alert('プレビューを表示してからPDF保存してください!');
            return;
        }

        try {
            // プレビューラッパーを取得
            const wrapper = document.querySelector('.preview-wrapper');
            if (!wrapper) {
                alert('プレビューが見つかりません!');
                return;
            }

            // スケーリングを一時的に無効化
            const originalTransform = wrapper.style.transform;
            wrapper.style.transform = 'scale(1)';

            // 少し待ってからキャンバス化（レンダリング完了を待つ）
            await new Promise(resolve => setTimeout(resolve, 100));

            // html2canvasを使用してキャンバスに変換
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null
            });

            // スケーリングを元に戻す
            wrapper.style.transform = originalTransform;

            // jsPDFでPDF生成
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

            // ファイル名生成
            const eventTitle = document.getElementById('eventTitle').value || 'newsletter';
            const date = new Date();
            const filename = `${eventTitle}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}.pdf`;

            pdf.save(filename);

            console.log('PDF保存完了');
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('PDF生成中にエラーが発生しました。');
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
        this.selectedLayoutType = layoutType;
        this.updateLayoutSelector();
        this.showSectionTitleEditor(layoutType); // セクションタイトル編集UIを表示
        this.saveToLocalStorage();

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
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NewsletterApp();
});
